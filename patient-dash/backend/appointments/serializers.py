from rest_framework import serializers
from .models import Appointment, MedicalRecord, Hospital, Doctor, TimeSlot, Receipt, UserProfile


class HospitalSerializer(serializers.ModelSerializer):
    """Serializer for Hospital model"""
    specialties_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Hospital
        fields = ['id', 'name', 'location', 'phone', 'email', 'website', 'address', 'image', 'specialties', 'specialties_list', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_specialties_list(self, obj):
        """Return specialties as a list"""
        if obj.specialties:
            return [s.strip() for s in obj.specialties.split(',')]
        return []


class TimeSlotSerializer(serializers.ModelSerializer):
    """Serializer for TimeSlot model"""
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = TimeSlot
        fields = ['id', 'day_of_week', 'day_name', 'start_time', 'end_time', 'is_available']
        read_only_fields = ['id']


class DoctorSerializer(serializers.ModelSerializer):
    """Serializer for Doctor model"""
    specialties_list = serializers.SerializerMethodField()
    hospital_name = serializers.CharField(source='hospital.name', read_only=True, allow_null=True)
    time_slots = TimeSlotSerializer(many=True, read_only=True)
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'name', 'specialties', 'specialties_list', 'email', 'phone',
            'hospital', 'hospital_name', 'rating', 'reviews_count', 'experience_years',
            'consultation_fee', 'image', 'availability_days', 'availability_start',
            'availability_end', 'time_slot_duration', 'zoom_meeting_id', 'zoom_meeting_url',
            'zoom_join_url', 'zoom_password', 'is_active', 'time_slots', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_specialties_list(self, obj):
        """Return specialties as a list"""
        return obj.get_specialties_list()


class DoctorListSerializer(serializers.ModelSerializer):
    """Simplified serializer for doctor lists"""
    specialties_list = serializers.SerializerMethodField()
    hospital_name = serializers.CharField(source='hospital.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'name', 'specialties', 'specialties_list', 'hospital', 'hospital_name',
            'rating', 'reviews_count', 'experience_years', 'consultation_fee', 'image',
            'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_specialties_list(self, obj):
        """Return specialties as a list"""
        return obj.get_specialties_list()


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for Appointment model"""
    doctor_name = serializers.SerializerMethodField()
    hospital_name = serializers.CharField(source='hospital.name', read_only=True, allow_null=True)
    
    # Accept string names for hospital and doctor (for frontend compatibility)
    hospital = serializers.CharField(write_only=True, required=False, allow_blank=True)
    doctor = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'doctor', 'doctor_name', 'hospital', 'hospital_name',
            'specialty', 'appointment_type', 'date', 'time',
            'full_name', 'age', 'gender', 'address', 'email', 'phone',
            'status', 'payment_status', 'payment_amount',
            'consultation_fee', 'payment_method', 'notes',
            'zoom_meeting_id', 'zoom_meeting_url', 'zoom_join_url',
            'receipt_pdf_url', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_doctor_name(self, obj):
        """Get doctor name"""
        return obj.get_doctor_name()
    
    def create(self, validated_data):
        """Create appointment with hospital and doctor name lookup"""
        hospital_name = validated_data.pop('hospital', None)
        doctor_name = validated_data.pop('doctor', None)
        
        # Look up hospital by name
        if hospital_name and hospital_name != 'Online Consultation':
            try:
                hospital = Hospital.objects.get(name__iexact=hospital_name)
                validated_data['hospital'] = hospital
            except Hospital.DoesNotExist:
                pass
            except Hospital.MultipleObjectsReturned:
                validated_data['hospital'] = Hospital.objects.filter(name__iexact=hospital_name).first()
        
        # Look up doctor by name
        if doctor_name:
            try:
                doctor = Doctor.objects.get(name__iexact=doctor_name)
                validated_data['doctor'] = doctor
                # Update hospital from doctor if available
                if doctor.hospital:
                    validated_data['hospital'] = doctor.hospital
            except Doctor.DoesNotExist:
                pass
            except Doctor.MultipleObjectsReturned:
                validated_data['doctor'] = Doctor.objects.filter(name__iexact=doctor_name).first()
        
        return super().create(validated_data)
    
    def to_representation(self, obj):
        """Convert back to representation with doctor/hospital as IDs"""
        ret = super().to_representation(obj)
        ret['doctor'] = obj.doctor.id if obj.doctor else None
        ret['hospital'] = obj.hospital.id if obj.hospital else None
        return ret


class MedicalRecordSerializer(serializers.ModelSerializer):
    """Serializer for MedicalRecord model"""
    class Meta:
        model = MedicalRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class ReceiptSerializer(serializers.ModelSerializer):
    """Serializer for Receipt model"""
    class Meta:
        model = Receipt
        fields = [
            'id', 'receipt_number', 'receipt_type', 'status',
            'patient_name', 'patient_email', 'patient_phone',
            'department', 'visit_type', 'appointment_date', 'appointment_time',
            'amount', 'payment_method', 'transaction_id',
            'description', 'hospital_name', 'doctor_name', 'appointment',
            'pdf_file', 'pdf_url', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    class Meta:
        model = UserProfile
        fields = [
            'id', 'email', 'full_name', 'phone', 'age', 'gender',
            'address', 'profile_image', 'two_factor_enabled',
            'data_sharing_enabled', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ==================== Notification Serializers ====================

class SmsNotificationSerializer(serializers.Serializer):
    """Serializer for SMS notification request"""
    phone = serializers.CharField(max_length=20)
    message = serializers.CharField(max_length=500)
    
    def validate_phone(self, value):
        # Basic phone validation for Nepal
        if not value.startswith('+977') and not value.startswith('0'):
            raise serializers.ValidationError("Invalid phone number format")
        return value


class EmailNotificationSerializer(serializers.Serializer):
    """Serializer for Email notification request"""
    email = serializers.EmailField()
    subject = serializers.CharField(max_length=200)
    message = serializers.CharField()


class AppointmentConfirmationSerializer(serializers.Serializer):
    """Serializer for appointment confirmation with notifications"""
    appointment_id = serializers.IntegerField()
    send_sms = serializers.BooleanField(default=True)
    send_email = serializers.BooleanField(default=True)


class UserProfileUpdateSerializer(serializers.Serializer):
    """Serializer for updating user profile"""
    full_name = serializers.CharField(max_length=200, required=False)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(max_length=20, required=False)
    age = serializers.IntegerField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=['Male', 'Female', 'Other'], required=False)
    address = serializers.CharField(required=False, allow_blank=True)
    profile_image = serializers.URLField(required=False, allow_blank=True)
    two_factor_enabled = serializers.BooleanField(required=False)
    data_sharing_enabled = serializers.BooleanField(required=False)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    current_password = serializers.CharField(max_length=100)
    new_password = serializers.CharField(min_length=6, max_length=100)
