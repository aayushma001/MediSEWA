from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from django.contrib.auth import update_session_auth_hash
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    HospitalSerializer, DoctorProfileSerializer, PatientProfileSerializer,
    PaymentMethodSerializer, NotificationSerializer, ChangePasswordSerializer, 
    DoctorScheduleSerializer, AppointmentSerializer, DepartmentSerializer,
    MedicalReportSerializer
)
from .models import (
    Hospital, DoctorProfile, PatientProfile, PaymentMethod, Notification, OTP, 
    DoctorHospitalConnection, DoctorSchedule, Appointment, Department,
    MedicalReport
)
import traceback
from django.utils import timezone
from datetime import datetime
def clean_invisible(s: str) -> str:
    if s is None:
        return ""
    return (
        str(s)
        .strip()
        .replace("\u200c", "")  # ZWNJ
        .replace("\u200b", "")  # zero-width space
        .replace("\ufeff", "")  # BOM
    )


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
                                slot_time_range = slot.get('time', '')
                                slot_time_start = slot_time_range.split(' - ')[0]
                                if slot_time_start > now_time and slot_time_start < earliest_next_time:
                                    # Fallback to slot data but try to get real Appt for ID
                                    real_appt = Appointment.objects.filter(
                                        doctor=doctor_profile,
                                        date=today,
                                        time_slot=slot_time_range,
                                        status__in=['approved', 'pending'] # Show both
                                    ).first()
                                    
                                    earliest_next_time = slot_time_start
                                    next_patient = {
                                        'id': real_appt.patient.id if real_appt else None,
                                        'name': patient_name,
                                        'time': slot_time_range,
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
                # Ensure the structure matches what frontend expects: nested user object or direct
                # Based on auth.ts: response.user.user
                user_data = {'user': UserSerializer(user).data}
            
            # Final check to ensure 'user' key exists in user_data for consistency if not present
            if 'user' not in user_data:
                user_data['user'] = UserSerializer(user).data

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
            # Return a JSON response that frontend can parse
            return Response({
                'error': 'Registration failed',
                'message': str(e),
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
            
            # Enrich schedule data with booking info
            schedule_data = []
            for schedule in schedules:
                data = DoctorScheduleSerializer(schedule).data
                appointments = Appointment.objects.filter(
                    doctor=schedule.doctor,
                    hospital=schedule.hospital,
                    date=schedule.date
                ).values_list('time_slot', flat=True)
                
                # Iterate through sessions and slots to mark booked ones
                if data.get('session_data'):
                    for session in data['session_data']:
                        for slot in session.get('slots', []):
                            # We check if this slot's ID or Time matches any appointment
                            if slot.get('id') in appointments or slot.get('time') in appointments:
                                slot['status'] = 'booked'
                                slot['appointment'] = {'patient_name': 'Booked'} 
                
                schedule_data.append(data)

            return Response(schedule_data)

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

# ... keep all your existing imports and code above unchanged ...

def clean_invisible(s: str) -> str:
    """
    Minimal sanitization to remove invisible unicode characters that can break
    email headers/encoding (e.g. ZWNJ \u200c) without forcing ASCII.
    """
    if s is None:
        return ""
    return (
        str(s)
        .strip()
        .replace("\u200c", "")  # ZWNJ
        .replace("\u200b", "")  # zero-width space
        .replace("\ufeff", "")  # BOM
    )

class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_or_email = request.data.get('phone_or_email')
        if not phone_or_email:
            return Response({"error": "Phone or Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        phone_or_email = clean_invisible(phone_or_email)

        otp_code = OTP.generate_otp()
        OTP.objects.create(phone_or_email=phone_or_email, otp_code=otp_code)

        subject = clean_invisible('Verify your email for MediSEWA')
        message = clean_invisible(f"Your verification code is: {otp_code}")

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [phone_or_email],
                fail_silently=False
            )
            return Response({"message": "OTP sent successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_hospitals(request):
    """List hospitals that have active doctor connections"""
    hospitals = Hospital.objects.all()
    serializer = HospitalSerializer(hospitals, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_doctors(request, hospital_id):
    """List doctors connected to a specific hospital"""
    hospital = resolve_profile(hospital_id, Hospital)
    if not hospital:
        return Response({'error': 'Hospital not found'}, status=404)
    
    connections = DoctorHospitalConnection.objects.filter(hospital=hospital, status='active')
    doctors = [conn.doctor for conn in connections]
    serializer = DoctorProfileSerializer(doctors, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_schedule(request, doctor_id, hospital_id):
    """Get finalized slots for a doctor at a hospital for a specific date"""
    doctor = resolve_profile(doctor_id, DoctorProfile)
    hospital = resolve_profile(hospital_id, Hospital)
    date_str = request.query_params.get('date')
    
    if not (doctor and hospital and date_str):
        return Response({'error': 'Missing parameters'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        schedule = DoctorSchedule.objects.get(doctor=doctor, hospital=hospital, date=date_str)
        
        # Get booked slots
        booked_slots = Appointment.objects.filter(
            doctor=doctor, 
            hospital=hospital, 
            date=date_str
        ).values_list('time_slot', flat=True)
        
        finalized_sessions = []
        for s in schedule.session_data:
            if s.get('isFinalized'):
                # Mark as booked if slot is in appointments
                if s.get('id') in booked_slots:
                    s['isBooked'] = True
                else:
                    s['isBooked'] = False
                finalized_sessions.append(s)
                
        return Response({'sessions': finalized_sessions})
    except DoctorSchedule.DoesNotExist:
        return Response({'sessions': []})

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def patient_appointments(request):
    if request.method == 'GET':
        try:
            profile = request.user.patient_profile
            appointments = Appointment.objects.filter(patient=profile)
            serializer = AppointmentSerializer(appointments, many=True)
            return Response(serializer.data)
        except Exception:
            return Response([])
        
    elif request.method == 'POST':
        print(f"DEBUG: Received booking data: {request.data}")
        data = request.data.copy()
        try:
            data['patient'] = request.user.patient_profile.id
        except Exception as e:
            print(f"DEBUG: Patient profile error: {str(e)}")
            return Response({'error': 'Patient profile missing'}, status=400)
            
        # Check if slot is already booked
        raw_doctor_id = data.get('doctor')
        raw_hospital_id = data.get('hospital')
        
        doctor = resolve_profile(raw_doctor_id, DoctorProfile)
        hospital = resolve_profile(raw_hospital_id, Hospital)
        
        if not doctor or not hospital:
            return Response({'error': 'Invalid doctor or hospital ID'}, status=400)

        # Update data with resolved IDs (integers/PKs) so serializer validates correctly
        data['doctor'] = doctor.pk
        data['hospital'] = hospital.pk
        
        date = data.get('date')
        time_slot = data.get('time_slot')
        
        print(f"DEBUG: Checking slot: Doctor={doctor.pk}, Hospital={hospital.pk}, Date={date}, Slot={time_slot}")
        
        if Appointment.objects.filter(doctor=doctor, hospital=hospital, date=date, time_slot=time_slot).exists():
             return Response({'error': 'This time slot is already booked'}, status=status.HTTP_409_CONFLICT)

        serializer = AppointmentSerializer(data=data)
        if serializer.is_valid():
            appointment = serializer.save()
            
            # Create notification for hospital
            Notification.objects.create(
                user=hospital.user,
                message=f"New appointment request from {request.user.get_full_name()} for {date} at {time_slot}",
                notification_type='appointment'
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def manage_appointment(request, appointment_id):
    """Hospital or Doctor manages appointment status"""
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        user = request.user
        is_allowed = False
        if user.user_type == 'hospital' and appointment.hospital_id == user.id:
            is_allowed = True
        elif user.user_type == 'doctor' and appointment.doctor.user_id == user.id:
            is_allowed = True
            
        if not is_allowed:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        status_val = request.data.get('status')
        if status_val in ['approved', 'rejected', 'completed', 'cancelled']:
            appointment.status = status_val
            if status_val == 'approved':
                if appointment.consultation_type == 'online':
                    appointment.meeting_link = f"https://meet.jit.si/MediSEWA-{appointment.id}"
            
            appointment.save()

            # Notify patient
            Notification.objects.create(
                user=appointment.patient.user,
                message=f"Your appointment with {appointment.doctor.user.get_full_name()} on {appointment.date} has been {appointment.status}",
                notification_type='appointment'
            )

            return Response(AppointmentSerializer(appointment).data)
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hospital_appointments(request):
    """List appointments for the current hospital"""
    try:
        hospital = request.user.hospital_profile
        appointments = Appointment.objects.filter(hospital=hospital)
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)
    except Exception:
        return Response({'error': 'Hospital profile not found'}, status=404)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_appointments(request):
    """List appointments for the current doctor"""
    try:
        doctor = request.user.doctor_profile
        appointments = Appointment.objects.filter(doctor=doctor)
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)
    except Exception:
        return Response({'error': 'Doctor profile not found'}, status=404)

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

        phone_or_email = clean_invisible(phone_or_email)
        otp_code = clean_invisible(otp_code)

        try:
            otp = OTP.objects.filter(phone_or_email=phone_or_email).order_by('-created_at').first()

            if not otp:
                return Response({"error": "No OTP found for this email"}, status=status.HTTP_400_BAD_REQUEST)

            if otp.otp_code != otp_code:
                return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"message": "OTP Verified Successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_departments(request):
    """List or create departments for the authenticated hospital"""
    if request.user.user_type != 'hospital':
        return Response({'error': 'Only hospitals can manage departments'}, status=status.HTTP_403_FORBIDDEN)
    
    hospital = request.user.hospital_profile
    
    if request.method == 'GET':
        depts = Department.objects.filter(hospital=hospital)
        serializer = DepartmentSerializer(depts, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(hospital=hospital)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def department_detail(request, dept_id):
    """Update or delete a department for the authenticated hospital"""
    if request.user.user_type != 'hospital':
        return Response({'error': 'Only hospitals can manage departments'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        dept = Department.objects.get(id=dept_id, hospital=request.user.hospital_profile)
        
        if request.method == 'PATCH':
            serializer = DepartmentSerializer(dept, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        elif request.method == 'DELETE':
            dept.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
    except Department.DoesNotExist:
        return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_medical_report(request):
    try:
        user = request.user
        
        if user.user_type != 'doctor':
             return Response({'error': 'Only doctors are authorized to upload reports'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        
        try:
             doctor_profile = user.doctor_profile
             data['doctor'] = doctor_profile.pk
        except:
             return Response({'error': 'Doctor profile not found'}, status=400)
        
        appointment_id = data.get('appointment')
        if not appointment_id:
             return Response({'error': 'Appointment ID is required'}, status=400)

        try:
            appointment = Appointment.objects.get(pk=appointment_id)
            
            if appointment.doctor != doctor_profile:
                 return Response({'error': 'You are not the doctor for this appointment'}, status=403)
            
            data['patient'] = appointment.patient.pk
            data['hospital'] = appointment.hospital.pk
            data['appointment'] = appointment.pk
            
            # Additional context from appointment
            if not data.get('title'):
                data['title'] = f"Consultation Report - {appointment.date}"
                
        except Appointment.DoesNotExist:
             return Response({'error': 'Appointment not found'}, status=404)
        
        serializer = MedicalReportSerializer(data=data)
        if serializer.is_valid():
            report = serializer.save()
            
            # 1. Update Appointment Status to Completed
            appointment.status = 'completed'
            appointment.save()

            # 2. Send notification to patient (In-app)
            try:
                Notification.objects.create(
                    user=appointment.patient.user,
                    message=f"New medical report received from Dr. {user.last_name}. A copy has been sent to your email.",
                    notification_type='report'
                )
            except Exception as e:
                print(f"Notification error: {e}")

            # 3. Send automated email to patient with PDF attached
            try:
                patient_email = appointment.patient.user.email
                if patient_email:
                    subject = f"Your Medical Consultation Report - {appointment.date}"
                    body = f"Hello {appointment.patient.user.first_name},\n\nPlease find attached your medical consultation report from Dr. {user.last_name} at {appointment.hospital.hospital_name}.\n\nYou can also access this report anytime by logging into your MediSEWA dashboard.\n\nBest regards,\nMediSEWA Team"
                    
                    email = EmailMessage(
                        subject,
                        body,
                        settings.EMAIL_HOST_USER,
                        [patient_email],
                    )
                    
                    # Attach the PDF
                    if report.report_file:
                        email.attach(report.report_file.name, report.report_file.read(), 'application/pdf')
                    
                    email.send()
                    print(f"Email sent to patient: {patient_email}")

                # 4. Notify Hospital Admin via Email
                hospital_email = appointment.hospital.user.email
                if hospital_email:
                    admin_subject = f"New Report Generated: {report.title}"
                    admin_body = f"A new consultation report has been generated for patient {appointment.patient.user.get_full_name()} by Dr. {user.get_full_name()}.\n\nReport ID: {report.id}\nDate: {timezone.now()}"
                    
                    send_mail(
                        admin_subject,
                        admin_body,
                        settings.EMAIL_HOST_USER,
                        [hospital_email],
                        fail_silently=True,
                    )
            except Exception as e:
                print(f"Email sending error: {e}")
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print("Upload Error:", traceback.format_exc())
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_reports(request, patient_id):
    try:
        user = request.user
        
        # 1. Identify the target patient
        try:
            target_patient = PatientProfile.objects.get(pk=patient_id)
        except (PatientProfile.DoesNotExist, ValueError):
            try:
                target_patient = PatientProfile.objects.get(user_id=patient_id)
            except (PatientProfile.DoesNotExist, ValueError):
                try:
                    target_patient = PatientProfile.objects.get(patient_unique_id=patient_id)
                except PatientProfile.DoesNotExist:
                    return Response({'error': 'Patient profile not found'}, status=404)

        # 2. Authorization check
        if user.user_type == 'patient':
            try:
                if user.patient_profile != target_patient:
                    return Response({'error': 'Unauthorized to view these reports'}, status=403)
            except Exception as e:
                return Response({'error': 'Patient profile not found'}, status=403)
        
        # 3. Return reports
        reports = MedicalReport.objects.filter(patient=target_patient).order_by('-created_at')
        serializer = MedicalReportSerializer(reports, many=True)
        return Response(serializer.data)

    except Exception as e:
        print("Fetch Reports Error:", traceback.format_exc())
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_detail(request, patient_id):
    """Get full profile details for a patient"""
    try:
        # Try PK first (assuming it might be an integer)
        patient = PatientProfile.objects.get(pk=patient_id)
    except (PatientProfile.DoesNotExist, ValueError):
        try:
            # Try User ID
            patient = PatientProfile.objects.get(user_id=patient_id)
        except (PatientProfile.DoesNotExist, ValueError):
            try:
                # Try Unique ID
                patient = PatientProfile.objects.get(patient_unique_id=patient_id)
            except PatientProfile.DoesNotExist:
                return Response({'error': 'Patient profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = PatientProfileSerializer(patient)
    # Combine serializer data with user data for components that expect both
    data = serializer.data
    data['user'] = UserSerializer(patient.user).data
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_hospital_reports(request):
    """List all reports generated in for this hospital"""
    try:
        user = request.user
        if user.user_type != 'hospital':
            return Response({'error': 'Only hospitals can access this endpoint'}, status=403)
        
        hospital = user.hospital_profile
        reports = MedicalReport.objects.filter(hospital=hospital).order_by('-created_at')
        serializer = MedicalReportSerializer(reports, many=True)
        return Response(serializer.data)
    except Exception as e:
        print("Hospital Reports Error:", traceback.format_exc())
        return Response({'error': str(e)}, status=500)
