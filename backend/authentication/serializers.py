from rest_framework import serializers
from django.contrib.auth import authenticate
from django.db import transaction
from .models import (
    User, Hospital, DoctorProfile, PaymentMethod, Notification, 
    PatientProfile, Department, DoctorHospitalConnection, DoctorSchedule,
    Appointment, MedicalReport
)

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    # Hospital specific
    hospital_name = serializers.CharField(required=False, allow_blank=True)
    hospital_type = serializers.CharField(required=False, allow_blank=True)
    hospital_id = serializers.CharField(required=False, allow_blank=True) # Used for hospital_unique_id
    address = serializers.CharField(required=False, allow_blank=True)
    pan_number = serializers.CharField(required=False, allow_blank=True)
    registration_number = serializers.CharField(required=False, allow_blank=True)
    contact_number = serializers.CharField(required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)
    
    # Doctor specific
    specialization = serializers.CharField(required=False, allow_blank=True)
    qualification = serializers.CharField(required=False, allow_blank=True)
    experience_years = serializers.IntegerField(required=False)
    consent_accepted = serializers.BooleanField(required=False)
    nmc_number = serializers.CharField(required=False, allow_blank=True)
    doctor_id = serializers.CharField(required=False, allow_blank=True) # Used for doctor_unique_id
    
    # Patient specific
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    age = serializers.IntegerField(required=False, allow_null=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    alternate_phone = serializers.CharField(required=False, allow_blank=True)
    emergency_contact = serializers.CharField(required=False, allow_blank=True)
    emergency_contact_name = serializers.CharField(required=False, allow_blank=True)
    blood_group = serializers.CharField(required=False, allow_blank=True)
    nid_number = serializers.CharField(required=False, allow_blank=True)
    health_condition = serializers.CharField(required=False, allow_blank=True)
    medications = serializers.CharField(required=False, allow_blank=True)
    allergies = serializers.CharField(required=False, allow_blank=True)
    province = serializers.CharField(required=False, allow_blank=True)
    district = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    postal_code = serializers.CharField(required=False, allow_blank=True)
    ward = serializers.CharField(required=False, allow_blank=True)
    tole = serializers.CharField(required=False, allow_blank=True)
    
    # Generic name field for frontend compatibility
    name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'name', 'mobile', 'user_type', 
                 'password', 'confirm_password', 'hospital_name', 'hospital_type', 'hospital_id', 'address',
                 'pan_number', 'registration_number', 'contact_number', 'website',
                 'latitude', 'longitude', 'specialization', 'qualification',
                 'experience_years', 'consent_accepted', 'nmc_number', 'doctor_id', 'unique_id',
                 'date_of_birth', 'gender', 'age', 'phone_number', 'alternate_phone',
                 'emergency_contact', 'emergency_contact_name', 'blood_group', 'nid_number',
                 'health_condition', 'medications', 'allergies', 'province', 'district',
                 'city', 'postal_code', 'ward', 'tole']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        
        if attrs['user_type'] == 'hospital':
            if not attrs.get('hospital_name'):
                raise serializers.ValidationError("Hospital name is required for hospitals")
            if not attrs.get('address'):
                raise serializers.ValidationError("Address is required for hospitals")
            if not attrs.get('pan_number'):
                raise serializers.ValidationError("PAN Number is required for hospitals")
        
        if attrs['user_type'] == 'doctor':
            if not attrs.get('specialization'):
                raise serializers.ValidationError("Specialization is required for doctors")
            if not attrs.get('consent_accepted'):
                raise serializers.ValidationError("Consent must be accepted for doctors")
        
        # Check if email already exists
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError("A user with this email already exists")
        
        return attrs

    def create(self, validated_data):
        # Handle transaction to avoid partial data creation
        with transaction.atomic():
            # 1. Pop fields to avoid duplicate arguments in create_user
            name = validated_data.pop('name', '')
            first_name = validated_data.pop('first_name', '')
            last_name = validated_data.pop('last_name', '')
            email = validated_data.pop('email', '')
            mobile = validated_data.pop('mobile', '')
            password = validated_data.pop('password', '')
            validated_data.pop('confirm_password', None)
            user_type = validated_data.get('user_type') # We can peek or pop, better pop if Meta has it
            # But user_type is in Meta.fields, so create_user needs it.
            
            # If name is provided instead of first/last name
            if name and not (first_name or last_name):
                name_parts = name.split(' ')
                first_name = name_parts[0]
                if len(name_parts) > 1:
                    last_name = ' '.join(name_parts[1:])
            
            unique_id = validated_data.pop('unique_id', None)
            
            # 2. Pop Hospital Specific
            hospital_name = validated_data.pop('hospital_name', '')
            hospital_type = validated_data.pop('hospital_type', '')
            hospital_unique_id = validated_data.pop('hospital_id', None)
            pan_number = validated_data.pop('pan_number', '')
            registration_number = validated_data.pop('registration_number', '')
            contact_number = validated_data.pop('contact_number', '')
            website = validated_data.pop('website', '')
            latitude = validated_data.pop('latitude', None)
            longitude = validated_data.pop('longitude', None)
            
            # 3. Pop Doctor Specific
            specialization = validated_data.pop('specialization', '')
            qualification = validated_data.pop('qualification', '')
            experience_years = validated_data.pop('experience_years', 0)
            consent_accepted = validated_data.pop('consent_accepted', False)
            nmc_number = validated_data.pop('nmc_number', '')
            doctor_unique_id = validated_data.pop('doctor_id', None)
            
            # 4. Pop Profile/Location Fields
            date_of_birth = validated_data.pop('date_of_birth', None)
            gender = validated_data.pop('gender', '')
            age = validated_data.pop('age', None)
            phone_number = validated_data.pop('phone_number', '')
            alternate_phone = validated_data.pop('alternate_phone', '')
            emergency_contact = validated_data.pop('emergency_contact', '')
            emergency_contact_name = validated_data.pop('emergency_contact_name', '')
            blood_group = validated_data.pop('blood_group', '')
            nid_number = validated_data.pop('nid_number', '')
            health_condition = validated_data.pop('health_condition', '')
            medications = validated_data.pop('medications', '')
            allergies = validated_data.pop('allergies', '')
            province = validated_data.pop('province', '')
            district = validated_data.pop('district', '')
            city = validated_data.pop('city', '')
            ward = validated_data.pop('ward', '')
            tole = validated_data.pop('tole', '')
            address = validated_data.pop('address', '')
            postal_code = validated_data.pop('postal_code', '')

            # Construct address if empty for hospital
            if not address and user_type == 'hospital':
                address_parts = [tole, ward, city, district, province]
                address = ", ".join([p for p in address_parts if p])
            
            # 5. Create User
            if user_type == 'patient' and not unique_id:
                patient_count = User.objects.filter(user_type='patient').count()
                unique_id = f'MED-{str(patient_count + 1).zfill(5)}'
            
            user = User.objects.create_user(
                username=email,
                email=email,
                mobile=mobile,
                password=password,
                first_name=first_name,
                last_name=last_name,
                unique_id=unique_id,
                **validated_data
            )
            
            # 6. Create Profiles
            if user_type == 'hospital':
                Hospital.objects.create(
                    user=user,
                    hospital_name=hospital_name,
                    hospital_type=hospital_type,
                    hospital_unique_id=hospital_unique_id,
                    address=address,
                    province=province,
                    district=district,
                    city=city,
                    ward=ward,
                    tole=tole,
                    pan_number=pan_number,
                    registration_number=registration_number,
                    contact_number=contact_number,
                    website=website,
                    latitude=latitude,
                    longitude=longitude
                )

            elif user_type == 'doctor':
                DoctorProfile.objects.create(
                    user=user,
                    specialization=specialization,
                    qualification=qualification,
                    experience_years=experience_years,
                    consent_accepted=consent_accepted,
                    nmc_number=nmc_number,
                    doctor_unique_id=doctor_unique_id,
                    is_verified=False
                )

            elif user_type == 'patient':
                PatientProfile.objects.create(
                    user=user,
                    patient_unique_id=unique_id,
                    date_of_birth=date_of_birth,
                    gender=gender,
                    age=age,
                    phone_number=phone_number or user.mobile,
                    alternate_phone=alternate_phone,
                    emergency_contact=emergency_contact,
                    emergency_contact_name=emergency_contact_name,
                    blood_group=blood_group,
                    nid_number=nid_number,
                    health_condition=health_condition,
                    medications=medications,
                    allergies=allergies,
                    province=province,
                    district=district,
                    city=city,
                    address=address,
                    postal_code=postal_code
                )
            
            return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    user_type = serializers.ChoiceField(choices=[
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('hospital', 'Hospital Admin')
    ])

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        user_type = attrs.get('user_type')

        if email and password:
            user = authenticate(username=email, password=password)
            if user:
                if user.user_type != user_type:
                    raise serializers.ValidationError('Invalid user type')
                if not user.is_active:
                    raise serializers.ValidationError('User account is disabled')
                
                # Check doctor verification status
                if user.user_type == 'doctor':
                    try:
                        if not user.doctor_profile.is_verified:
                            pass # We allow login but dashboard will show pending status? 
                            # Or we block login? The user prompt said: "in sigup should request for admin to verify accounts"
                            # Usually this means they can't do much until verified. 
                            # But for now, let's allow login so they can see the "Pending Verification" status or upload photo.
                    except DoctorProfile.DoesNotExist:
                        # Should not happen if registered correctly, but handle just in case
                        pass
                        
                attrs['user'] = user
                return attrs
            else:
                raise serializers.ValidationError('Invalid credentials')
        else:
            raise serializers.ValidationError('Must include email and password')

class UserSerializer(serializers.ModelSerializer):
    patient_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'mobile', 'user_type', 'unique_id', 'created_at', 'patient_profile']
    
    def get_patient_profile(self, obj):
        if obj.user_type == 'patient':
            try:
                profile = obj.patient_profile
                return PatientProfileSerializer(profile).data
            except PatientProfile.DoesNotExist:
                return None
        return None

class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = ['id', 'date_of_birth', 'gender', 'age', 'phone_number', 'alternate_phone',
                  'emergency_contact', 'emergency_contact_name', 'blood_group', 'nid_number',
                  'health_condition', 'medications', 'allergies', 'province', 'district',
                  'city', 'address', 'postal_code', 'profile_image', 'patient_unique_id',
                  'created_at', 'updated_at']

class DepartmentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'icon']

class HospitalSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    departments = DepartmentSerializer(many=True, required=False)

    class Meta:
        model = Hospital
        fields = ['user', 'hospital_name', 'hospital_type', 'hospital_unique_id', 'address', 
                  'province', 'district', 'city', 'ward', 'tole',
                  'pan_number', 'registration_number', 'contact_number', 'website', 
                  'logo', 'latitude', 'longitude', 'description', 'beds', 'opening_hours', 'departments']

    def update(self, instance, validated_data):
        departments_data = validated_data.pop('departments', None)
        
        # Update hospital fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if departments_data is not None:
            # Simple sync strategy: delete existing and recreate
            # Or a more complex one: keep existing by ID
            keep_depts = []
            for dept_data in departments_data:
                dept_id = dept_data.get('id')
                if dept_id and str(dept_id).isdigit():
                    try:
                        dept = Department.objects.get(id=dept_id, hospital=instance)
                        for attr, value in dept_data.items():
                            setattr(dept, attr, value)
                        dept.save()
                        keep_depts.append(dept.id)
                    except Department.DoesNotExist:
                        # If ID provided but not found, create as new
                        dept_data.pop('id', None)
                        dept = Department.objects.create(hospital=instance, **dept_data)
                        keep_depts.append(dept.id)
                else:
                    # No valid ID, create new
                    dept_data.pop('id', None)
                    dept = Department.objects.create(hospital=instance, **dept_data)
                    keep_depts.append(dept.id)
            
            # Remove departments not in the new list
            instance.departments.exclude(id__in=keep_depts).delete()

        return instance

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'user', 'method_type', 'provider_name', 'account_number', 'account_holder_name', 'is_default']
        read_only_fields = ['user']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'notification_type', 'is_read', 'created_at']

class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = DoctorProfile
        fields = ['id', 'user', 'profile_picture', 'qualification', 'specialization', 
                  'experience_years', 'about', 'is_verified', 'consent_accepted',
                  'nmc_number', 'doctor_unique_id', 'contact_number', 'address', 'gender', 'date_of_birth', 'consultation_fee']

class DoctorScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorSchedule
        fields = ['id', 'doctor', 'hospital', 'date', 'session_data', 'created_at', 'updated_at']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.get_full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)
    hospital_name = serializers.CharField(source='hospital.hospital_name', read_only=True)
    patient_details = UserSerializer(source='patient.user', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'doctor', 'hospital', 'date', 'time_slot', 
            'status', 'consultation_type', 'payment_screenshot', 'symptoms', 
            'meeting_link', 'booking_reference', 'created_at', 'updated_at',
            'patient_name', 'doctor_name', 'hospital_name', 'patient_details'
        ]
        read_only_fields = ['status', 'meeting_link', 'created_at', 'updated_at']

class MedicalReportSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)
    hospital_name = serializers.CharField(source='hospital.hospital_name', read_only=True)
    
    class Meta:
        model = MedicalReport
        fields = [
            'id', 'patient', 'doctor', 'hospital', 'appointment', 
            'title', 'description', 'report_file', 'created_at', 
            'doctor_name', 'hospital_name'
        ]
        read_only_fields = ['created_at']
