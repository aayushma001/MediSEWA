from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import update_session_auth_hash
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, HospitalSerializer, 
    DoctorProfileSerializer, PaymentMethodSerializer, NotificationSerializer,
    ChangePasswordSerializer, DoctorScheduleSerializer
)
from .models import Hospital, DoctorProfile, PaymentMethod, Notification, OTP, DoctorHospitalConnection, DoctorSchedule
import traceback
from django.utils import timezone
from datetime import datetime

def resolve_profile(entity_id, profile_model):
    """Helper to resolve profile from User ID, Profile ID, or Unique ID"""
    if not entity_id:
        return None
    
    # Try unique ID field based on model type
    unique_field = 'doctor_unique_id' if profile_model == DoctorProfile else 'hospital_unique_id'
    
    try:
        # 1. Try Profile PK
        return profile_model.objects.get(pk=entity_id)
    except (profile_model.DoesNotExist, ValueError):
        try:
            # 2. Try User ID
            return profile_model.objects.get(user_id=entity_id)
        except (profile_model.DoesNotExist, ValueError):
            try:
                # 3. Try Unique ID
                return profile_model.objects.get(**{unique_field: entity_id})
            except (profile_model.DoesNotExist, ValueError):
                return None

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    today = timezone.localtime().date()
    now_time = timezone.localtime().strftime('%H:%M')

    try:
        if user.user_type == 'doctor':
            doctor_profile = user.doctor_profile
            schedules = DoctorSchedule.objects.filter(doctor=doctor_profile)
            today_schedules = schedules.filter(date=today)

            appointments_today = 0
            completed_today = 0
            emergency_today = 0
            unique_patients = set()
            next_patient = None
            earliest_next_time = '23:59'

            # Calculate stats from all schedules
            for sch in schedules:
                for session in sch.session_data:
                    for slot in session.get('slots', []):
                        if slot.get('status') in ['booked', 'emergency']:
                            patient_name = slot.get('appointment', {}).get('patient_name')
                            if patient_name:
                                unique_patients.add(patient_name)
                            
                            if sch.date == today:
                                appointments_today += 1
                                if slot.get('status') == 'emergency':
                                    emergency_today += 1
                                
                                # Find next patient for today
                                slot_time = slot.get('time', '').split(' - ')[0]
                                if slot_time > now_time and slot_time < earliest_next_time:
                                    earliest_next_time = slot_time
                                    next_patient = {
                                        'name': patient_name,
                                        'time': slot.get('time'),
                                        'condition': slot.get('appointment', {}).get('patientCondition', 'General Checkup'),
                                        'status': slot.get('status').upper()
                                    }

            return Response({
                'appointments_today': appointments_today,
                'total_patients': len(unique_patients),
                'emergency_cases': emergency_today,
                'next_patient': next_patient,
                'all_time_appointments': sum(len([sl for se in s.session_data for sl in se.get('slots', []) if sl.get('status') in ['booked', 'emergency']]) for s in schedules)
            })

        elif user.user_type == 'hospital':
            hospital_profile = user.hospital_profile
            schedules = DoctorSchedule.objects.filter(hospital=hospital_profile)
            today_schedules = schedules.filter(date=today)

            appointments_today = 0
            unique_patients = set()
            
            for sch in schedules:
                for session in sch.session_data:
                    for slot in session.get('slots', []):
                        if slot.get('status') in ['booked', 'emergency']:
                            patient_name = slot.get('appointment', {}).get('patient_name')
                            if patient_name:
                                unique_patients.add(patient_name)
                            if sch.date == today:
                                appointments_today += 1

            return Response({
                'appointments_today': appointments_today,
                'total_patients': len(unique_patients),
                'active_doctors': DoctorProfile.objects.filter(hospital_connections__hospital=hospital_profile, hospital_connections__status='active').distinct().count(),
                'emergency_cases': sum(len([sl for se in s.session_data for sl in se.get('slots', []) if s.date == today and sl.get('status') == 'emergency']) for s in schedules)
            })

        return Response({
            'doctors': DoctorProfile.objects.count(),
            'hospitals': Hospital.objects.count(),
            'appointments': 0,
            'revenue': 0
        })

    except Exception as e:
        print("Error fetching dashboard stats:", str(e))
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    print("=== REGISTRATION DEBUG ===")
    print("Raw request data:", request.data)
    
    serializer = UserRegistrationSerializer(data=request.data)
    print("Serializer created with data:", serializer.initial_data)
    
    if serializer.is_valid():
        print("Serializer is valid, proceeding with user creation...")
        try:
            user = serializer.save()
            print(f"User created successfully: {user.email} ({user.user_type})")
            
            refresh = RefreshToken.for_user(user)
            
            # Get user profile data
            user_data = None
            if user.user_type == 'hospital':
                try:
                    hospital = Hospital.objects.get(user=user)
                    print("Hospital profile found and serialized")
                    user_data = HospitalSerializer(hospital).data
                except Hospital.DoesNotExist:
                    print("ERROR: Hospital profile not found after creation")
                    return Response({'error': 'Hospital profile not created'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            elif user.user_type == 'doctor':
                try:
                    profile = DoctorProfile.objects.get(user=user)
                    print("Doctor profile found and serialized")
                    user_data = DoctorProfileSerializer(profile).data
                except DoctorProfile.DoesNotExist:
                    print("ERROR: Doctor profile not found after creation")
                    return Response({'error': 'Doctor profile not created'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            else:
                # Patient or other types
                from .serializers import UserSerializer
                user_data = {'user': UserSerializer(user).data}
            
            print("Registration successful, returning response")
            
            # Send Welcome Email
            try:
                send_mail(
                    'Welcome to MediSEWA!',
                    f'Hi {user.username}, thanks for joining us!',
                    settings.EMAIL_HOST_USER,
                    [user.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Failed to send welcome email: {e}")

            return Response({
                'user': user_data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            error_details = traceback.format_exc()
            print("EXCEPTION during user creation:")
            print(error_details)
            return Response({
                'error': f'Registration failed: {str(e)}',
                'details': error_details if settings.DEBUG else "Please check server logs"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    print("SERIALIZER VALIDATION FAILED:")
    print("Errors:", serializer.errors)
    for field, errors in serializer.errors.items():
        print(f"  {field}: {errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    print("=== LOGIN DEBUG ===")
    print("Login request data:", request.data)
    
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        print("Login serializer is valid")
        user = serializer.validated_data['user']
        print(f"User authenticated: {user.email} ({user.user_type})")
        
        refresh = RefreshToken.for_user(user)
        
        # Get user profile data
        user_data = None
        if user.user_type == 'hospital':
            try:
                hospital = Hospital.objects.get(user=user)
                user_data = HospitalSerializer(hospital).data
                print("Hospital data serialized successfully")
            except Hospital.DoesNotExist:
                print("ERROR: Hospital profile not found")
                return Response({'error': 'Hospital profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        elif user.user_type == 'doctor':
            try:
                profile = DoctorProfile.objects.get(user=user)
                user_data = DoctorProfileSerializer(profile).data
                print("Doctor data serialized successfully")
            except DoctorProfile.DoesNotExist:
                print("ERROR: Doctor profile not found")
                return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        else:
             # Patient or other types
             from .serializers import UserSerializer
             user_data = {'user': UserSerializer(user).data}
        
        print("Login successful, returning response")
        
        # Send Login Notification
        try:
            send_mail(
                'New Login Detected',
                f'Hi {user.username}, a new login was detected on your account.',
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=True
            )
        except Exception as e:
            print(f"Failed to send login notification: {e}")

        return Response({
            'user': user_data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    
    print("Login validation errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_hospitals(request):
    try:
        hospitals = Hospital.objects.all()
        serializer = HospitalSerializer(hospitals, many=True)
        return Response(serializer.data)
    except Exception as e:
        print("Error fetching hospitals:", str(e))
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_doctors(request):
    try:
        doctors = DoctorProfile.objects.all()
        serializer = DoctorProfileSerializer(doctors, many=True)
        return Response(serializer.data)
    except Exception as e:
        print("Error fetching doctors:", str(e))
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    if user.user_type == 'doctor':
        try:
            profile = user.doctor_profile
            serializer = DoctorProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
            
    elif user.user_type == 'hospital':
        try:
            profile = user.hospital_profile
            serializer = HospitalSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Hospital.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'error': 'Invalid user type'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    if user.user_type == 'doctor':
        try:
            profile = user.doctor_profile
            serializer = DoctorProfileSerializer(profile)
            return Response(serializer.data)
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    elif user.user_type == 'hospital':
        try:
            profile = user.hospital_profile
            serializer = HospitalSerializer(profile)
            return Response(serializer.data)
        except Hospital.DoesNotExist:
            return Response({'error': 'Hospital profile not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        from .serializers import UserSerializer
        return Response({'user': UserSerializer(user).data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def connect_entities(request):
    user = request.user
    entity_id = request.data.get('id')

    if not entity_id:
        return Response({'error': 'ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    if user.user_type == 'hospital':
        try:
            doctor = DoctorProfile.objects.get(doctor_unique_id=entity_id)
            connection, created = DoctorHospitalConnection.objects.get_or_create(
                doctor=doctor,
                hospital=user.hospital_profile,
                defaults={'status': 'pending'}
            )
            if not created and connection.status == 'rejected':
                connection.status = 'pending'
                connection.save()
            return Response({'message': f'Connection request sent to Doctor {doctor.user.get_full_name()}', 'status': connection.status})
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor with this ID not found'}, status=status.HTTP_404_NOT_FOUND)

    elif user.user_type == 'doctor':
        try:
            hospital = Hospital.objects.get(hospital_unique_id=entity_id)
            connection, created = DoctorHospitalConnection.objects.get_or_create(
                doctor=user.doctor_profile,
                hospital=hospital,
                defaults={'status': 'active'} # If doctor initiates, it can be active or pending? User said "when he confirm then only admin can have access"
            )
            return Response({'message': f'Connected to Hospital {hospital.hospital_name} successfully', 'status': connection.status})
        except Hospital.DoesNotExist:
            return Response({'error': 'Hospital with this ID not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'error': 'Invalid user type'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_connection_status(request):
    user = request.user
    connection_id = request.data.get('id')
    new_status = request.data.get('status') # 'active' or 'rejected'

    if user.user_type != 'doctor':
        return Response({'error': 'Only doctors can confirm connections'}, status=status.HTTP_403_FORBIDDEN)

    try:
        connection = DoctorHospitalConnection.objects.get(id=connection_id, doctor=user.doctor_profile)
        connection.status = new_status
        connection.save()
        return Response({'message': f'Connection {new_status} successfully'})
    except DoctorHospitalConnection.DoesNotExist:
        return Response({'error': 'Connection request not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_schedules(request):
    try:
        user = request.user
        
        if request.method == 'GET':
            doctor_id = request.query_params.get('doctor_id')
            hospital_id = request.query_params.get('hospital_id')
            date_str = request.query_params.get('date')

            doctor_profile = resolve_profile(doctor_id, DoctorProfile)
            hospital_profile = resolve_profile(hospital_id, Hospital)
            
            # Special case for 'current' hospital
            if not hospital_profile and hospital_id == 'current' and user.user_type == 'hospital':
                try:
                    hospital_profile = user.hospital_profile
                except:
                    return Response({'error': 'Current user has no hospital profile'}, status=status.HTTP_400_BAD_REQUEST)

            filters = {'date': date_str} if date_str else {}
            if doctor_profile: filters['doctor'] = doctor_profile
            if hospital_profile: filters['hospital'] = hospital_profile

            if not filters:
                return Response({'error': 'Specify at least doctor, hospital, or date'}, status=status.HTTP_400_BAD_REQUEST)

            schedules = DoctorSchedule.objects.filter(**filters)
            return Response(DoctorScheduleSerializer(schedules, many=True).data)

        elif request.method == 'POST':
            doctor_id = request.data.get('doctor_id')
            hospital_id = request.data.get('hospital_id')
            date_str = request.data.get('date')
            session_data = request.data.get('session_data')

            if not all([doctor_id, hospital_id, date_str, session_data]):
                return Response({'error': 'Missing required fields: doctor_id, hospital_id, date, session_data'}, status=status.HTTP_400_BAD_REQUEST)

            doctor_profile = resolve_profile(doctor_id, DoctorProfile)
            hospital_profile = resolve_profile(hospital_id, Hospital)
            
            if not hospital_profile and hospital_id == 'current' and user.user_type == 'hospital':
                try:
                    hospital_profile = user.hospital_profile
                except:
                    return Response({'error': 'Current user has no hospital profile'}, status=status.HTTP_400_BAD_REQUEST)

            if not doctor_profile:
                return Response({'error': f'Doctor profile not found for ID: {doctor_id}'}, status=status.HTTP_404_NOT_FOUND)
            if not hospital_profile:
                return Response({'error': f'Hospital profile not found for ID: {hospital_id}'}, status=status.HTTP_404_NOT_FOUND)

            # Basic permission check
            if user.user_type == 'hospital':
                try:
                    if user.hospital_profile != hospital_profile:
                        return Response({'error': 'You can only manage schedules for your own hospital'}, status=status.HTTP_403_FORBIDDEN)
                except:
                    return Response({'error': 'Current user has no hospital profile to verify permission'}, status=status.HTTP_403_FORBIDDEN)
            elif user.user_type == 'doctor':
                try:
                    if user.doctor_profile != doctor_profile:
                        return Response({'error': 'You can only manage your own schedule'}, status=status.HTTP_403_FORBIDDEN)
                except:
                    return Response({'error': 'Current user has no doctor profile to verify permission'}, status=status.HTTP_403_FORBIDDEN)

            # Check connection status
            try:
                connection = DoctorHospitalConnection.objects.get(
                    doctor=doctor_profile, 
                    hospital=hospital_profile
                )
                if connection.status != 'active':
                    return Response({
                        'error': f'Connection status is "{connection.status}". It must be "active" to manage schedules.',
                        'connection_status': connection.status
                    }, status=status.HTTP_403_FORBIDDEN)
            except DoctorHospitalConnection.DoesNotExist:
                return Response({'error': 'No connection found between this doctor and hospital.'}, status=status.HTTP_403_FORBIDDEN)
            except DoctorHospitalConnection.MultipleObjectsReturned:
                 # If multiple, just pick active if it exists, or just allow (shouldn't happen with clean data)
                 pass

            schedule, created = DoctorSchedule.objects.update_or_create(
                doctor=doctor_profile,
                hospital=hospital_profile,
                date=date_str,
                defaults={'session_data': session_data}
            )
            return Response(DoctorScheduleSerializer(schedule).data)

    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"CRITICAL ERROR in manage_schedules: {str(e)}")
        print(error_trace)
        return Response({
            'error': f'Internal Server Error: {str(e)}',
            'detail': error_trace.split('\n')[-2] # Last non-empty line of traceback
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_connected_entities(request):
    user = request.user
    status_filter = request.query_params.get('status', 'active')
    
    if user.user_type == 'hospital':
        connections = DoctorHospitalConnection.objects.filter(hospital=user.hospital_profile, status=status_filter)
        doctors = [conn.doctor for conn in connections]
        # We might need the connection ID too for pending ones
        if status_filter == 'pending':
            data = []
            for conn in connections:
                d_data = DoctorProfileSerializer(conn.doctor).data
                d_data['connection_id'] = conn.id
                data.append(d_data)
            return Response(data)
        return Response(DoctorProfileSerializer(doctors, many=True).data)

    elif user.user_type == 'doctor':
        connections = DoctorHospitalConnection.objects.filter(doctor=user.doctor_profile, status=status_filter)
        hospitals = [conn.hospital for conn in connections]
        hospitals_data = []
        for conn in connections:
            h = conn.hospital
            h_data = HospitalSerializer(h).data
            h_data['connection_id'] = conn.id
            h_data['status'] = conn.status
            hospitals_data.append(h_data)
        return Response(hospitals_data)
    return Response([])

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def payment_methods(request, method_id=None):
    if request.method == 'GET':
        methods = PaymentMethod.objects.filter(user=request.user)
        serializer = PaymentMethodSerializer(methods, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PaymentMethodSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if not method_id:
            return Response({'error': 'Method ID required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            method = PaymentMethod.objects.get(id=method_id, user=request.user)
            method.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PaymentMethod.DoesNotExist:
            return Response({'error': 'Method not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def notifications(request):
    if request.method == 'GET':
        notifs = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifs, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Used to mark as read or create internal notification
        if 'mark_read' in request.data:
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
            return Response({'status': 'marked read'})
            
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_or_email = request.data.get('phone_or_email')
        if not phone_or_email:
            return Response({"error": "Phone or Email is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        otp_code = OTP.generate_otp()
        OTP.objects.create(phone_or_email=phone_or_email, otp_code=otp_code)
        
        subject = 'Verify your email for MediSEWA'
        message = f"Your verification code is: {otp_code}"
        try:
            send_mail(subject, message, settings.EMAIL_HOST_USER, [phone_or_email])
            return Response({"message": "OTP sent successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.data.get('old_password')):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.data.get('new_password'))
            user.save()
            update_session_auth_hash(request, user) # To keep the user logged in
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_or_email = request.data.get('phone_or_email')
        otp_code = request.data.get('otp_code')

        if not phone_or_email or not otp_code:
            return Response({"error": "Phone/Email and OTP code are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Check for latest OTP
            otp = OTP.objects.filter(phone_or_email=phone_or_email).order_by('-created_at').first()
            
            if not otp:
                return Response({"error": "No OTP found for this email"}, status=status.HTTP_400_BAD_REQUEST)
                
            if otp.otp_code != otp_code:
                return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
                
            # Ideally verify expiry here (e.g. 5 mins)
            
            return Response({"message": "OTP Verified Successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
