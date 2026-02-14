import json
from datetime import datetime, timedelta
from decimal import Decimal
import random
import string

from django.conf import settings
from django.core.mail import send_mail
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Appointment, Doctor, Hospital, MedicalRecord, TimeSlot, Receipt, UserProfile
from .serializers import (
    AppointmentSerializer,
    DoctorListSerializer,
    DoctorSerializer,
    EmailNotificationSerializer,
    HospitalSerializer,
    MedicalRecordSerializer,
    ReceiptSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer,
    SmsNotificationSerializer,
    TimeSlotSerializer,
)


# ==================== Hospital APIs ====================

class HospitalListCreate(generics.ListCreateAPIView):
    """List all hospitals or create a new hospital"""
    queryset = Hospital.objects.filter(is_active=True)
    serializer_class = HospitalSerializer


class HospitalDetail(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a hospital"""
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer


# ==================== Doctor APIs ====================

class DoctorListCreate(generics.ListCreateAPIView):
    """List all doctors or create a new doctor"""
    queryset = Doctor.objects.filter(is_active=True)
    serializer_class = DoctorSerializer
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return DoctorListSerializer
        return DoctorSerializer


class DoctorDetail(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a doctor"""
    queryset = Doctor.objects.filter(is_active=True)
    serializer_class = DoctorSerializer


class DoctorAvailability(APIView):
    """Get doctor's availability/time slots"""
    
    def get(self, request, doctor_id):
        """Get available time slots for a doctor"""
        try:
            doctor = Doctor.objects.get(id=doctor_id, is_active=True)
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get date parameter
        date_str = request.query_params.get('date')
        day_of_week = request.query_params.get('day')
        
        slots_queryset = TimeSlot.objects.filter(doctor=doctor, is_available=True)
        
        if day_of_week:
            try:
                slots_queryset = slots_queryset.filter(day_of_week=int(day_of_week))
            except ValueError:
                pass
        
        slots = slots_queryset.order_by('day_of_week', 'start_time')
        serializer = TimeSlotSerializer(slots, many=True)
        
        # Also return doctor's default availability info
        return Response({
            'doctor': {
                'id': doctor.id,
                'name': doctor.name,
                'specialties': doctor.get_specialties_list(),
            },
            'default_availability': {
                'days': doctor.availability_days,
                'start_time': doctor.availability_start,
                'end_time': doctor.availability_end,
                'slot_duration': doctor.time_slot_duration,
            },
            'time_slots': serializer.data,
        })


# ==================== User Profile APIs ====================

class UserProfileView(APIView):
    """User profile API for getting and updating user data"""
    
    def get(self, request):
        """Get user profile by email"""
        email = request.query_params.get('email')
        if not email:
            # Try to get from request user
            email = request.user.email if hasattr(request.user, 'email') else None
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            profile = UserProfile.objects.get(email=email)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def patch(self, request):
        """Update user profile"""
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            profile = UserProfile.objects.get(email=email)
        except UserProfile.DoesNotExist:
            # Create new profile if doesn't exist
            profile = UserProfile(email=email)
        
        serializer = UserProfileUpdateSerializer(data=request.data)
        if serializer.is_valid():
            for key, value in serializer.validated_data.items():
                setattr(profile, key, value)
            profile.save()
            return Response(UserProfileSerializer(profile).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request):
        """Change password or create/update profile"""
        if request.data.get('current_password'):
            # Change password request
            return self.change_password(request)
        return self.patch(request)
    
    def change_password(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            # In a real app, you would verify the current password
            # For demo purposes, we'll just return success
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== Receipt APIs ====================

class ReceiptListCreate(generics.ListCreateAPIView):
    """List all receipts or create a new receipt"""
    queryset = Receipt.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = ReceiptSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new receipt with auto-generated receipt number"""
        # Generate receipt number
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        receipt_number = f"RCP-{timestamp}-{random_suffix}"
        
        # Add receipt number to data
        data = request.data.copy()
        data['receipt_number'] = receipt_number
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ReceiptDetail(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a receipt"""
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer


# ==================== Appointment APIs ====================

class AppointmentListCreate(generics.ListCreateAPIView):
    """List all appointments or create a new appointment"""
    queryset = Appointment.objects.all().order_by('-date', '-created_at')
    serializer_class = AppointmentSerializer


class AppointmentDetail(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an appointment"""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer


class AppointmentByDate(APIView):
    """Get appointments by date range"""
    
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response({'error': 'start_date and end_date are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        appointments = Appointment.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        ).order_by('date', 'time')
        
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


class CreatePaymentView(APIView):
    """Create appointment with payment in a single transaction"""
    
    def post(self, request):
        # Map frontend fields to model fields
        data = {}
        
        # Map patient fields with type conversion
        if 'patient_name' in request.data:
            data['full_name'] = str(request.data.get('patient_name'))
        if 'patient_email' in request.data:
            data['email'] = str(request.data.get('patient_email'))
        if 'patient_phone' in request.data:
            data['phone'] = str(request.data.get('patient_phone'))
        if 'patient_age' in request.data:
            try:
                data['age'] = int(request.data.get('patient_age'))
            except (ValueError, TypeError):
                data['age'] = 25  # Default age
        if 'patient_gender' in request.data:
            data['gender'] = str(request.data.get('patient_gender'))
        if 'patient_address' in request.data:
            data['address'] = str(request.data.get('patient_address'))
        
        # Map appointment fields with type conversion
        if 'specialty' in request.data:
            data['specialty'] = str(request.data.get('specialty'))
        
        # Handle date parsing more robustly
        if 'preferred_date' in request.data:
            date_str = str(request.data.get('preferred_date'))
            try:
                # Try parsing various date formats
                from datetime import datetime
                for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y']:
                    try:
                        parsed_date = datetime.strptime(date_str, fmt).date()
                        data['date'] = str(parsed_date)
                        break
                    except ValueError:
                        continue
                else:
                    # If no format matches, just use the string as-is
                    data['date'] = date_str
            except Exception:
                data['date'] = date_str
        
        if 'preferred_time' in request.data:
            data['time'] = str(request.data.get('preferred_time'))
        if 'appointment_type' in request.data:
            data['appointment_type'] = str(request.data.get('appointment_type'))
        
        # Handle hospital lookup
        hospital_name = str(request.data.get('hospital', ''))
        hospital = None
        if hospital_name and hospital_name != 'Online Consultation':
            try:
                hospital = Hospital.objects.get(name__iexact=hospital_name)
                data['hospital'] = hospital.id
            except Hospital.DoesNotExist:
                pass
            except Hospital.MultipleObjectsReturned:
                hospital = Hospital.objects.filter(name__iexact=hospital_name).first()
                if hospital:
                    data['hospital'] = hospital.id
        
        # Handle doctor lookup
        doctor_name = str(request.data.get('doctor', '') or '')
        doctor = None
        if doctor_name and doctor_name.strip() and doctor_name.lower() != 'null':
            try:
                doctor = Doctor.objects.get(name__iexact=doctor_name)
                data['doctor'] = doctor.id
                # Update hospital from doctor if available
                if doctor.hospital:
                    data['hospital'] = doctor.hospital.id
                    hospital = doctor.hospital
            except Doctor.DoesNotExist:
                pass
            except Doctor.MultipleObjectsReturned:
                doctor = Doctor.objects.filter(name__iexact=doctor_name).first()
                if doctor:
                    data['doctor'] = doctor.id
        
        # Set payment status
        data['payment_status'] = 'paid'
        
        # Validate and normalize payment method (only allow: cash, qr, bank)
        payment_method = str(request.data.get('payment_method', 'cash')).lower()
        valid_methods = ['cash', 'qr', 'bank']
        if payment_method not in valid_methods:
            payment_method = 'cash'
        data['payment_method'] = payment_method
        
        # Handle numeric fields
        try:
            data['consultation_fee'] = float(request.data.get('consultation_fee', 500) or 500)
        except (ValueError, TypeError):
            data['consultation_fee'] = 500
        
        try:
            data['payment_amount'] = float(request.data.get('payment_amount', 500) or 500)
        except (ValueError, TypeError):
            data['payment_amount'] = 500
        
        # Set notes if provided
        if 'notes' in request.data:
            data['notes'] = str(request.data.get('notes'))
        
        # Set payment method
        data['payment_method'] = str(request.data.get('payment_method', 'cash'))
        
        # Create appointment
        serializer = AppointmentSerializer(data=data)
        if not serializer.is_valid():
            # Log detailed errors for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Appointment creation failed - Data: {data}")
            logger.error(f"Serializer errors: {serializer.errors}")
            
            return Response({
                'error': 'Validation failed',
                'details': serializer.errors,
                'debug_info': {
                    'received_data': dict(request.data),
                    'mapped_data': data
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        appointment = serializer.save()
        
        # Create receipt
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        receipt_number = f"RCP-{timestamp}-{random_suffix}"
        
        try:
            consultation_fee = float(request.data.get('consultation_fee', 500) or 500)
        except (ValueError, TypeError):
            consultation_fee = 500
        
        receipt_data = {
            'receipt_number': receipt_number,
            'receipt_type': 'appointment',
            'status': 'paid',
            'patient_name': appointment.full_name,
            'patient_email': appointment.email,
            'patient_phone': appointment.phone,
            'department': appointment.specialty,
            'visit_type': appointment.appointment_type,
            'appointment_date': str(appointment.date),
            'appointment_time': appointment.time,
            'amount': consultation_fee,
            'payment_method': data['payment_method'],
            'description': f"{appointment.appointment_type} appointment with {doctor_name or appointment.specialty}",
            'hospital_name': hospital_name or (hospital.name if hospital else ''),
            'doctor_name': doctor_name or (doctor.name if doctor else ''),
            'appointment': appointment.id,
        }
        
        receipt_serializer = ReceiptSerializer(data=receipt_data)
        if receipt_serializer.is_valid():
            receipt_serializer.save()
        
        # Create medical record
        medical_record_data = {
            'title': f"Appointment with {doctor_name or appointment.specialty}",
            'category': 'Appointment Receipt',
            'date': str(appointment.date),
            'hospital_name': hospital_name or (hospital.name if hospital else 'Consultation Center'),
            'description': f"{appointment.appointment_type} - {appointment.specialty}",
            'privacy': 'Private',
            'appointment': appointment.id,
        }
        
        medical_record_serializer = MedicalRecordSerializer(data=medical_record_data)
        if medical_record_serializer.is_valid():
            medical_record_serializer.save()
        
        return Response({
            'success': True,
            'message': 'Appointment booked successfully',
            'appointment': AppointmentSerializer(appointment).data,
            'receipt_number': receipt_number,
        }, status=status.HTTP_201_CREATED)


# ==================== SMS Notification (Twilio) ====================

class SmsNotificationView(APIView):
    """Send SMS notification using Twilio"""
    
    def post(self, request):
        serializer = SmsNotificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        phone = serializer.validated_data['phone']
        message = serializer.validated_data['message']
        
        # Twilio configuration
        twilio_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '')
        twilio_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '')
        twilio_phone = getattr(settings, 'TWILIO_PHONE_NUMBER', '')
        
        if not twilio_sid or not twilio_token:
            # For demo purposes, just log the message
            print(f"SMS to {phone}: {message}")
            return Response({
                'status': 'demo',
                'message': 'SMS logged (Twilio not configured)',
                'phone': phone,
            })
        
        try:
            from twilio.rest import Client
            
            client = Client(twilio_sid, twilio_token)
            twilio_message = client.messages.create(
                body=message,
                from_=twilio_phone,
                to=phone
            )
            
            return Response({
                'status': 'sent',
                'message_sid': twilio_message.sid,
                'phone': phone,
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to send SMS: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== Email Notification ====================

class EmailNotificationView(APIView):
    """Send email notification"""
    
    def post(self, request):
        serializer = EmailNotificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        subject = serializer.validated_data['subject']
        message = serializer.validated_data['message']
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@medisewa.np'),
                recipient_list=[email],
                fail_silently=False,
            )
            
            return Response({
                'status': 'sent',
                'email': email,
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to send email: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== Appointment Confirmation ====================

class AppointmentConfirmationView(APIView):
    """Send appointment confirmation via SMS and Email"""
    
    def post(self, request):
        appointment_id = request.data.get('appointment_id')
        send_sms = request.data.get('send_sms', True)
        send_email = request.data.get('send_email', True)
        
        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        results = {'appointment_id': appointment_id}
        
        # Prepare SMS message
        if send_sms:
            sms_message = (
                f"MediSewa: Your appointment is confirmed!\n"
                f"Doctor: {appointment.get_doctor_name()}\n"
                f"Date: {appointment.date} at {appointment.time}\n"
                f"Type: {appointment.appointment_type}\n"
            )
            if appointment.appointment_type == 'Video':
                sms_message += "Video consultation link will be sent via email."
            
            # Send SMS (demo mode)
            print(f"SMS to {appointment.phone}: {sms_message}")
            results['sms'] = {'status': 'demo', 'message': 'SMS logged'}
        
        # Prepare Email
        if send_email:
            subject = f'Appointment Confirmed - {appointment.date}'
            
            html_message = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">MediSewa Nepal</h1>
                </div>
                <div style="padding: 30px; background: #f8f9fc;">
                    <h2 style="color: #1e40af;">Appointment Confirmed! ✅</h2>
                    <p>Dear {appointment.full_name},</p>
                    <p>Your appointment has been successfully booked.</p>
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Doctor:</strong> {appointment.get_doctor_name()}</p>
                        <p><strong>Date:</strong> {appointment.date}</p>
                        <p><strong>Time:</strong> {appointment.time}</p>
                        <p><strong>Type:</strong> {appointment.get_hospital_name() or appointment.appointment_type}</p>
                    </div>
                    <p style="color: #666; font-size: 12px;">Thank you for using MediSewa!</p>
                </div>
            </body>
            </html>
            """
            
            try:
                send_mail(
                    subject=subject,
                    message=f"Appointment confirmed for {appointment.full_name}",
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@medisewa.np'),
                    recipient_list=[appointment.email],
                    html_message=html_message,
                    fail_silently=False,
                )
                results['email'] = {'status': 'sent', 'email': appointment.email}
            except Exception as e:
                results['email'] = {'status': 'error', 'message': str(e)}
        
        return Response(results)


# ==================== Helper Functions ====================

def send_appointment_confirmation(appointment):
    """Send confirmation SMS and Email for an appointment"""
    
    # Prepare SMS
    sms_message = (
        f"MediSewa: Appointment Confirmed!\n"
        f"Dr. {appointment.specialty}\n"
        f"{appointment.date} at {appointment.time}\n"
    )
    if appointment.appointment_type == 'Video':
        sms_message += "Video consultation link will be sent via email.\n"
    
    print(f"SMS to {appointment.phone}: {sms_message}")
    
    # Prepare Email
    subject = f'Appointment Confirmed - {appointment.date}'
    html_message = f"""
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2>Appointment Confirmed! ✅</h2>
        <p>Dear {appointment.full_name},</p>
        <p>Your appointment has been confirmed.</p>
        <p><strong>Date:</strong> {appointment.date}</p>
        <p><strong>Time:</strong> {appointment.time}</p>
        <p><strong>Type:</strong> {appointment.appointment_type}</p>
    </body>
    </html>
    """
    
    try:
        send_mail(
            subject=subject,
            message=f"Appointment confirmed for {appointment.full_name}",
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@medisewa.np'),
            recipient_list=[appointment.email],
            html_message=html_message,
            fail_silently=True,
        )
    except:
        pass


# ==================== Medical Record APIs ====================

class MedicalRecordListCreate(generics.ListCreateAPIView):
    queryset = MedicalRecord.objects.all().order_by('-date')
    serializer_class = MedicalRecordSerializer


class MedicalRecordDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer


# ==================== Time Slot APIs ====================

class TimeSlotListCreate(generics.ListCreateAPIView):
    queryset = TimeSlot.objects.all().order_by('day_of_week', 'start_time')
    serializer_class = TimeSlotSerializer


class TimeSlotDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer


# ==================== Health Check ====================

@api_view(['GET'])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'service': 'MediSewa Backend API',
        'timestamp': timezone.now().isoformat(),
    })
