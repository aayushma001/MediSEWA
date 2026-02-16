from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from django.db.models import Q, Avg
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from django.contrib.auth import update_session_auth_hash
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    HospitalSerializer, DoctorProfileSerializer, PatientProfileSerializer,
    DoctorScheduleSerializer, ChangePasswordSerializer, DepartmentSerializer,
    MedicalReportSerializer, NotificationSerializer, PaymentMethodSerializer,
    AppointmentSerializer
)
from django.db import models
from .models import (
    Hospital, DoctorProfile, PatientProfile, PaymentMethod, Notification, OTP, 
    DoctorHospitalConnection, DoctorSchedule, Appointment, Department,
    MedicalReport, Review
)
from datetime import datetime
from django.utils import timezone
import traceback
from PIL import Image
import io
from django.core.files.base import ContentFile
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

def process_signature(image_file):
    """
    Cleans a signature image by removing white background and keeping black ink.
    Provides a fallback if complex OCR is not available.
    """
    try:
        img = Image.open(image_file).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # If the pixel is very white (e.g., sum of R+G+B > 600 or all > 200), make it transparent
            # This 'extracts' the black pen signature from the white paper
            if item[0] > 200 and item[1] > 200 and item[2] > 200:
                newData.append((255, 255, 255, 0))
            else:
                # Keep original color but ensure it's solid
                newData.append((item[0], item[1], item[2], 255))
        
        img.putdata(newData)
        
        # Save back to a buffer
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return ContentFile(buffer.getvalue(), name="processed_signature.png")
    except Exception as e:
        print(f"Error processing signature: {e}")
        return image_file


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
            
            # 1. Total Stats
            all_time_appointments = Appointment.objects.filter(doctor=doctor_profile).count()
            total_patients = Appointment.objects.filter(doctor=doctor_profile).values('patient').distinct().count()
            
            # 2. Today's Stats
            today_appts = Appointment.objects.filter(
                doctor=doctor_profile,
                date=today,
                status__in=['approved', 'pending']
            ).order_by('time_slot')
            
            appointments_today = today_appts.count()
            emergency_today = today_appts.filter(is_emergency=True).count()
            
            # 3. Next Patient for today
            next_patient = None
            next_appt = None
            for appt in today_appts:
                # time_slot format is "09:00 - 09:10"
                try:
                    start_time = appt.time_slot.split(' - ')[0]
                    if start_time > now_time:
                        next_appt = appt
                        break
                except:
                    continue
            
            if next_appt:
                next_patient = {
                    'id': next_appt.patient.id,
                    'appointment_id': next_appt.id,
                    'name': next_appt.patient.user.get_full_name(),
                    'time': next_appt.time_slot,
                    'condition': next_appt.symptoms or 'General Checkup',
                    'status': next_appt.status.upper()
                }

            # 4. Review Stats
            reviews = Review.objects.filter(doctor=doctor_profile)
            total_reviews = reviews.count()
            avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0.0

            # 5. Hospital breakdown
            hospital_breakdown = []
            connections = DoctorHospitalConnection.objects.filter(doctor=doctor_profile, status='active')
            for conn in connections:
                h = conn.hospital
                patient_count = Appointment.objects.filter(doctor=doctor_profile, hospital=h).values('patient').distinct().count()
                hospital_breakdown.append({
                    'id': h.hospital_unique_id,
                    'name': h.hospital_name,
                    'patients': patient_count,
                    'hospital_code': h.hospital_unique_id
                })

            return Response({
                'appointments_today': appointments_today,
                'total_patients': total_patients,
                'emergency_cases': emergency_today,
                'next_patient': next_patient,
                'all_time_appointments': all_time_appointments,
                'avg_rating': round(avg_rating, 1),
                'total_reviews': total_reviews,
                'hospital_breakdown': hospital_breakdown
            })

        elif user.user_type == 'hospital':
            hospital_profile = user.hospital_profile
            
            # 1. Total Appointments for this hospital
            total_appointments = Appointment.objects.filter(hospital=hospital_profile).count()
            
            # 2. Today's Appointments for this hospital
            appointments_today = Appointment.objects.filter(
                hospital=hospital_profile, 
                date=today
            ).count()
            
            # 3. Unique Patients for this hospital
            total_patients = Appointment.objects.filter(
                hospital=hospital_profile
            ).values('patient').distinct().count()
            
            # 4. Connected Doctors
            # Count doctors with active connection to this hospital
            active_doctors = DoctorHospitalConnection.objects.filter(
                hospital=hospital_profile,
                status='active'
            ).count()
            
            # 5. Revenue Calculation (Flat 500 per appointment)
            # You might want to sum actual consultation fees later
            revenue = total_appointments * 500
            
            # 6. Emergency Cases (Today) for this hospital
            emergency_today = Appointment.objects.filter(
                hospital=hospital_profile,
                date=today,
                is_emergency=True
            ).count() 

            return Response({
                'appointments_today': appointments_today,
                'total_appointments': total_appointments,
                'total_patients': total_patients,
                'active_doctors': active_doctors,
                'revenue': float(revenue),
                'emergency_cases': emergency_today
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
            
            elif user.user_type == 'patient':
                try:
                    profile = PatientProfile.objects.get(user=user)
                    print("Patient profile found and serialized")
                    user_data = PatientProfileSerializer(profile).data
                except PatientProfile.DoesNotExist:
                    print("ERROR: Patient profile not found after creation")
                    # Fallback if profile didn't get created for some reason
                    user_data = {'user': UserSerializer(user).data}
            else:
                # Other types
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
        
        elif user.user_type == 'patient':
            try:
                profile = PatientProfile.objects.get(user=user)
                user_data = PatientProfileSerializer(profile).data
                print("Patient data serialized successfully")
            except PatientProfile.DoesNotExist:
                # Fallback
                user_data = {'user': UserSerializer(user).data}
        else:
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
@parser_classes([MultiPartParser, FormParser, JSONParser])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    if user.user_type == 'doctor':
        try:
            profile = user.doctor_profile
            
            # Extract signature image for processing if provided
            signature_file = request.FILES.get('signature_image')
            if signature_file:
                request.data['signature_image'] = process_signature(signature_file)

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
            # request.data includes files when using MultiPartParser
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

            filters = {}
            if doctor_profile: filters['doctor'] = doctor_profile
            if hospital_profile: filters['hospital'] = hospital_profile

            if not filters:
                return Response({'error': 'Specify at least doctor or hospital'}, status=status.HTTP_400_BAD_REQUEST)

            # 1. Look for specific date schedule
            if date_str:
                schedules = DoctorSchedule.objects.filter(date=date_str, **filters)
                if not schedules.exists():
                    # 2. Look for recurring schedule for this day of week
                    try:
                        dt = datetime.strptime(date_str, '%Y-%m-%d')
                        day_of_week = dt.weekday() # 0=Mon, 6=Sun
                        
                        # Filter out Saturday (5) if needed, but let's just fetch what exists
                        schedules = DoctorSchedule.objects.filter(
                            is_recurring=True, 
                            day_of_week=day_of_week, 
                            **filters
                        )
                    except ValueError:
                        pass
            else:
                schedules = DoctorSchedule.objects.filter(**filters)
            
            # Enrich schedule data with booking info
            schedule_data = []
            for schedule in schedules:
                data = DoctorScheduleSerializer(schedule).data
                # Use current date_str for appointments check if it's a recurring schedule
                check_date = date_str if schedule.is_recurring else schedule.date
                
                appointments = Appointment.objects.filter(
                    doctor=schedule.doctor,
                    hospital=schedule.hospital,
                    date=check_date
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
            is_recurring = request.data.get('is_recurring', False)
            day_of_week = request.data.get('day_of_week')
            session_data = request.data.get('session_data')

            if not all([doctor_id, hospital_id, session_data]) or (not date_str and not is_recurring):
                return Response({'error': 'Missing required fields: doctor_id, hospital_id, session_data, and either date or is_recurring'}, status=status.HTTP_400_BAD_REQUEST)

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

            if is_recurring:
                if day_of_week is None:
                    # Derrive from date if provided
                    if date_str:
                        dt = datetime.strptime(date_str, '%Y-%m-%d')
                        day_of_week = dt.weekday()
                    else:
                        return Response({'error': 'Day of week is required for recurring schedules'}, status=status.HTTP_400_BAD_REQUEST)
                
                if day_of_week == 5: # Saturday
                     return Response({'error': 'Schedules cannot be set for Saturdays (Holiday)'}, status=status.HTTP_400_BAD_REQUEST)

                schedule, created = DoctorSchedule.objects.update_or_create(
                    doctor=doctor_profile,
                    hospital=hospital_profile,
                    is_recurring=True,
                    day_of_week=day_of_week,
                    defaults={'session_data': session_data, 'date': None}
                )
            else:
                schedule, created = DoctorSchedule.objects.update_or_create(
                    doctor=doctor_profile,
                    hospital=hospital_profile,
                    date=date_str,
                    defaults={'session_data': session_data, 'is_recurring': False, 'day_of_week': None}
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
    """Get finalized slots for a doctor at a hospital for the next 10 days"""
    from datetime import datetime, timedelta
    
    doctor = resolve_profile(doctor_id, DoctorProfile)
    hospital = resolve_profile(hospital_id, Hospital)
    date_str = request.query_params.get('date')  # Optional - for backward compatibility
    
    if not (doctor and hospital):
        return Response({'error': 'Missing doctor or hospital'}, status=status.HTTP_400_BAD_REQUEST)
    
    # If date is provided, use old single-day logic (backward compatibility)
    if date_str:
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
    
    # New logic: Return 10 days of schedule data
    today = datetime.now().date()
    schedule_days = []
    
    for i in range(10):
        current_date = today + timedelta(days=i)
        day_of_week = current_date.weekday()
        date_str = current_date.strftime('%Y-%m-%d')
        
        # Skip Saturdays (day 5)
        if day_of_week == 5:
            continue
        
        # Try to find date-specific schedule first
        date_schedule = DoctorSchedule.objects.filter(
            doctor=doctor, 
            hospital=hospital, 
            date=date_str,
            is_recurring=False
        ).first()
        
        # If no date-specific, try recurring schedule
        if not date_schedule:
            date_schedule = DoctorSchedule.objects.filter(
                doctor=doctor,
                hospital=hospital,
                is_recurring=True,
                day_of_week=day_of_week
            ).first()
        
        if date_schedule:
            # Get booked slots for this specific date
            booked_slots = list(Appointment.objects.filter(
                doctor=doctor,
                hospital=hospital,
                date=date_str
            ).values_list('time_slot', flat=True))
            
            finalized_sessions = []
            for session in date_schedule.session_data:
                if session.get('isFinalized'):
                    # Create a copy to avoid modifying original
                    session_copy = session.copy()
                    
                    # Mark each slot as booked or available
                    if 'slots' in session_copy:
                        for slot in session_copy['slots']:
                            # Consistency check: match by ID or displayed Time (matching manage_schedules logic)
                            slot_id = slot.get('id')
                            slot_time = slot.get('time')
                            
                            is_booked = (slot_id in booked_slots) or (slot_time in booked_slots)
                            slot['isBooked'] = is_booked
                            
                            # Also set status for frontend convenience if it's already 'break' or 'emergency' in JSON
                            if is_booked:
                                slot['status'] = 'booked'
                            elif slot.get('status') == 'break' or session.get('type') == 'break':
                                slot['status'] = 'break'
                            elif slot.get('status') == 'emergency':
                                slot['status'] = 'emergency'
                            else:
                                slot['status'] = 'available'
                    
                    finalized_sessions.append(session_copy)
            
            schedule_days.append({
                'date': date_str,
                'day_name': current_date.strftime('%A'),
                'sessions': finalized_sessions
            })
    
    return Response({'schedule_days': schedule_days})


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
            patient_profile = request.user.patient_profile
            data['patient'] = patient_profile.id
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
        consultation_type = request.data.get('consultation_type', 'online')
        is_emergency = request.data.get('is_emergency') == 'true' or request.data.get('is_emergency') is True

        # Verify time slot availability if not emergency (emergencies bypass strict slot checking)
        if not is_emergency:
            existing = Appointment.objects.filter(
                doctor=doctor,
                date=date,
                time_slot=time_slot,
                status__in=['pending', 'approved']
            ).exists()

            if existing:
                return Response({
                    'error': 'This time slot is already booked'
                }, status=400)

        # Create appointment
        appointment = Appointment.objects.create(
            patient=patient_profile,
            doctor=doctor,
            hospital=hospital,
            date=date,
            time_slot=time_slot,
            consultation_type=consultation_type,
            symptoms=request.data.get('symptoms', ''),
            payment_screenshot=request.FILES.get('payment_screenshot'),
            booking_reference=request.data.get('booking_reference'),
            is_emergency=is_emergency
        )
        
        # Create notification for hospital
        Notification.objects.create(
            user=hospital.user,
            message=f"New appointment request from {request.user.get_full_name()} for {date} at {time_slot}",
            notification_type='appointment'
        )

        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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
        hospital = getattr(request.user, 'hospital_profile', None)
        if hospital:
            appointments = Appointment.objects.filter(hospital=hospital)
        else:
            # Fallback to all if hospital profile not found for the user (handles setup edge cases)
            appointments = Appointment.objects.all()
            
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)
    except Exception as e:
        print(f"Error in hospital_appointments: {str(e)}")
        return Response([], status=200) # Graceful return
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_hospital_report(request):
    """Hospital uploads a lab/test report for a patient"""
    try:
        user = request.user
        if user.user_type != 'hospital':
            return Response({'error': 'Only hospitals can upload lab reports'}, status=status.HTTP_403_FORBIDDEN)
        
        hospital = user.hospital_profile
        
        # Find patient by ID (try multiple lookups)
        patient_id = request.data.get('patient_id') or request.data.get('patient')
        if not patient_id:
            return Response({'error': 'Patient ID is required'}, status=400)
        
        target_patient = None
        for lookup in [
            lambda: PatientProfile.objects.get(pk=patient_id),
            lambda: PatientProfile.objects.get(user_id=patient_id),
            lambda: PatientProfile.objects.get(patient_unique_id=patient_id),
        ]:
            try:
                target_patient = lookup()
                break
            except (PatientProfile.DoesNotExist, ValueError):
                continue
        
        if not target_patient:
            return Response({'error': 'Patient not found'}, status=404)
        
        title = request.data.get('title', 'Lab Report')
        description = request.data.get('description', '')
        report_file = request.FILES.get('report_file')
        
        if not report_file:
            return Response({'error': 'Report file is required'}, status=400)
        
        report = MedicalReport.objects.create(
            patient=target_patient,
            hospital=hospital,
            uploaded_by=user,
            report_type='lab_report',
            title=title,
            description=description,
            report_file=report_file,
        )
        
        # Notify patient
        try:
            Notification.objects.create(
                user=target_patient.user,
                message=f"New lab report '{title}' uploaded by {hospital.hospital_name}.",
                notification_type='info'
            )
        except Exception as e:
            print(f"Notification error: {e}")
        
        # Send email to patient
        try:
            patient_email = target_patient.user.email
            if patient_email:
                subject = f"New Lab Report: {title}"
                body = (
                    f"Hello {target_patient.user.first_name},\n\n"
                    f"A new lab report has been uploaded by {hospital.hospital_name}.\n"
                    f"Report: {title}\n"
                    f"Description: {description}\n\n"
                    f"You can view this report in your MediSEWA dashboard.\n\n"
                    f"Best regards,\nMediSEWA Team"
                )
                email_msg = EmailMessage(
                    subject, body,
                    settings.EMAIL_HOST_USER,
                    [patient_email],
                )
                if report.report_file:
                    email_msg.attach(report.report_file.name, report.report_file.read(), 'application/pdf')
                email_msg.send(fail_silently=True)
        except Exception as e:
            print(f"Email error: {e}")
        
        serializer = MedicalReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        print("Hospital Upload Error:", traceback.format_exc())
        return Response({'error': str(e)}, status=500)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_patients(request):
    """
    Returns all patients in the system, sorted by created_at.
    """
    patients = PatientProfile.objects.all().order_by('-created_at')
    # We need to enrich patient data with user info
    data = []
    for patient in patients:
        p_data = PatientProfileSerializer(patient).data
        # Add user info if not in serializer (though it usually is)
        if patient.user:
            p_data['name'] = f"{patient.user.first_name} {patient.user.last_name}"
            p_data['email'] = patient.user.email
            p_data['mobile'] = patient.user.mobile
        data.append(p_data)
    
    return Response(data)
@api_view(['POST'])
@permission_classes([AllowAny])
def recommend_doctors(request):
    try:
        data = request.data
        symptoms = data.get('symptoms', '')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        location_query = data.get('location', '') # If text location is passed

        # Start with all verified doctors
        doctors = DoctorProfile.objects.filter(is_verified=True).select_related('user', 'hospital')
        
        # 1. Filter by location if coordinates provided (simple radius check or bounding box could be here)
        # For now, we will just return all if no location, or maybe filter by city if text provided
        if latitude and longitude:
            # In a real app with PostGIS, we'd do a distance query.
            # Here, we might just order by proximity if we had that capability, or just return all for now.
            pass
        elif location_query:
            # Filter by city/district in hospital address or doctor address
            doctors = doctors.filter(
                Q(hospital__city__icontains=location_query) | 
                Q(hospital__district__icontains=location_query) |
                Q(hospital__address__icontains=location_query) |
                Q(address__icontains=location_query)
            )

        # 2. Filter by symptoms (rudimentary keyword matching)
        if symptoms:
            # Map symptoms to specializations (simplified)
            symptom_spec_map = {
                'heart': ['Cardiology', 'Cardiologist'],
                'chest': ['Cardiology', 'Pulmonology'],
                'skin': ['Dermatology'],
                'child': ['Pediatrics'],
                'bone': ['Orthopedics'],
                'tooth': ['Dentistry'],
                'teeth': ['Dentistry'],
                'eye': ['Ophthalmology'],
                'stomach': ['Gastroenterology'],
                'head': ['Neurology', 'General Medicine'],
            }
            
            relevant_specs = []
            for key, specs in symptom_spec_map.items():
                if key in symptoms.lower():
                    relevant_specs.extend(specs)
            
            if relevant_specs:
                doctors = doctors.filter(specialization__in=relevant_specs)

        # Return data
        # We need a serializer or manual construction
        results = []
        for doc in doctors[:20]: # Limit to 20
            results.append({
                'id': doc.id,
                'user': {
                    'first_name': doc.user.first_name,
                    'last_name': doc.user.last_name,
                },
                'specialization': doc.specialization,
                'qualification': doc.qualification,
                'experience_years': doc.experience_years,
                'hospital_id': doc.hospital.id if doc.hospital else None,
                'hospital_name': doc.hospital.hospital_name if doc.hospital else None,
                'profile_picture': doc.profile_picture.url if doc.profile_picture else None,
                'latitude': doc.hospital.latitude if doc.hospital else None,
                'longitude': doc.hospital.longitude if doc.hospital else None,
                'departments': [{'name': d.name, 'id': d.id} for d in (doc.hospital.departments.all() if doc.hospital else [])]
            })
        
        return Response(results)
    except Exception as e:
        print(f"Error in recommend_doctors: {e}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def nearby_hospitals(request):
    try:
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        location_query = request.query_params.get('location') # If text provided

        hospitals = Hospital.objects.all()

        if location_query:
            hospitals = hospitals.filter(
                Q(city__icontains=location_query) | 
                Q(district__icontains=location_query) |
                Q(address__icontains=location_query) |
                Q(hospital_name__icontains=location_query)
            )
        
        # If coordinates provided, we could calculate distance and sort
        
        results = []
        for hosp in hospitals[:20]:
            results.append({
                'id': hosp.user.id, # Using OneToOne User ID as ID
                'hospital_name': hosp.hospital_name,
                'hospital_type': hosp.hospital_type,
                'address': hosp.address,
                'city': hosp.city,
                'district': hosp.district,
                'latitude': hosp.latitude,
                'longitude': hosp.longitude,
                'logo': hosp.logo.url if hosp.logo else None,
                'opening_hours': hosp.opening_hours,
                'departments': [{'name': d.name, 'id': d.id} for d in hosp.departments.all()]
            })

        return Response(results)
    except Exception as e:
        print(f"Error in nearby_hospitals: {e}")
        return Response({'error': str(e)}, status=500)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_reviews(request, doctor_id=None):
    if request.method == 'GET':
        if doctor_id:
            reviews = Review.objects.filter(doctor__doctor_unique_id=doctor_id)
        else:
            # If no doctor_id, maybe list reviews for the current doctor
            if request.user.user_type == 'doctor':
                reviews = Review.objects.filter(doctor=request.user.doctor_profile)
            else:
                return Response({'error': 'Doctor ID required'}, status=400)
        
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        if request.user.user_type != 'patient':
            return Response({'error': 'Only patients can leave reviews'}, status=403)
        
        data = request.data.copy()
        data['patient'] = request.user.patient_profile.id
        
        # Check if doctor_id is provided in URL or body
        d_id = doctor_id or data.get('doctor')
        if not d_id:
            return Response({'error': 'Doctor ID required'}, status=400)
            
        doctor = resolve_profile(d_id, DoctorProfile)
        if not doctor:
            return Response({'error': 'Doctor not found'}, status=404)
        
        data['doctor'] = doctor.id
        
        serializer = ReviewSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_doctor_patients(request):
    if request.user.user_type != 'doctor':
        return Response({'error': 'Only doctors can access this'}, status=403)
    
    doctor = request.user.doctor_profile
    # Patients who have booked at least one appointment with this doctor
    patient_ids = Appointment.objects.filter(doctor=doctor).values_list('patient', flat=True).distinct()
    patients = PatientProfile.objects.filter(id__in=patient_ids)
    
    data = []
    for patient in patients:
        p_data = PatientProfileSerializer(patient).data
        if patient.user:
            p_data['user'] = {
                'first_name': patient.user.first_name,
                'last_name': patient.user.last_name,
                'email': patient.user.email,
                'mobile': patient.user.mobile
            }
        
        # Add extra info for PatientsView
        last_apt = Appointment.objects.filter(doctor=doctor, patient=patient).order_by('-date').first()
        p_data['lastVisit'] = str(last_apt.date) if last_apt else None
        p_data['condition'] = last_apt.symptoms if last_apt else 'General'
        
        # Reports for this patient from this doctor
        reports = MedicalReport.objects.filter(patient=patient, doctor=doctor)
        p_data['reports'] = MedicalReportSerializer(reports, many=True).data
        
        data.append(p_data)
        
    return Response(data)
