from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Patient, Doctor, Hospital

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    father_name = serializers.CharField(required=False)
    assigned_doctor_id = serializers.IntegerField(required=False)
    illness_description = serializers.CharField(required=False)
    specialization = serializers.CharField(required=False)
    street_no = serializers.CharField(required=False)
    province = serializers.CharField(required=False)
    city = serializers.CharField(required=False)
    blood_group = serializers.CharField(required=False)
    health_allergies = serializers.CharField(required=False)
    recent_checkups = serializers.CharField(required=False)
    nid = serializers.CharField(required=False)
    hospital_name = serializers.CharField(required=False)
    address = serializers.CharField(required=False)
    latitude = serializers.FloatField(required=False)
    longitude = serializers.FloatField(required=False)
    hospital_id = serializers.IntegerField(required=False)
    nmic_id = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'mobile', 'user_type', 
                 'password', 'confirm_password', 'father_name', 'assigned_doctor_id', 
                 'illness_description', 'specialization', 'street_no', 'province', 'city',
                 'blood_group', 'health_allergies', 'recent_checkups', 'nid', 'hospital_name', 'address',
                 'latitude', 'longitude', 'hospital_id', 'nmic_id']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        
        if attrs['user_type'] == 'patient':
            if not attrs.get('father_name'):
                raise serializers.ValidationError("Father name is required for patients")
            if not attrs.get('illness_description'):
                raise serializers.ValidationError("Illness description is required for patients")
        
        if attrs['user_type'] == 'doctor':
            if not attrs.get('specialization'):
                raise serializers.ValidationError("Specialization is required for doctors")
            if not attrs.get('nmic_id'):
                raise serializers.ValidationError("NMIC ID is required for doctors")
        
        if attrs['user_type'] == 'hospital':
            if not attrs.get('hospital_name'):
                raise serializers.ValidationError("Hospital name is required for hospitals")
            if not attrs.get('address'):
                raise serializers.ValidationError("Address is required for hospitals")
        
        # Check if email already exists
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError("A user with this email already exists")
        
        return attrs

    def create(self, validated_data):
        # Remove extra fields
        father_name = validated_data.pop('father_name', None)
        assigned_doctor_id = validated_data.pop('assigned_doctor_id', None)
        illness_description = validated_data.pop('illness_description', None)
        specialization = validated_data.pop('specialization', None)
        street_no = validated_data.pop('street_no', None)
        province = validated_data.pop('province', None)
        city = validated_data.pop('city', None)
        blood_group = validated_data.pop('blood_group', None)
        health_allergies = validated_data.pop('health_allergies', None)
        recent_checkups = validated_data.pop('recent_checkups', None)
        nid = validated_data.pop('nid', None)
        hospital_name = validated_data.pop('hospital_name', None)
        address = validated_data.pop('address', None)
        latitude = validated_data.pop('latitude', None)
        longitude = validated_data.pop('longitude', None)
        hospital_id = validated_data.pop('hospital_id', None)
        nmic_id = validated_data.pop('nmic_id', None)
        validated_data.pop('confirm_password')
        
        # Set username to email
        validated_data['username'] = validated_data['email']
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Create patient or doctor profile
        if user.user_type == 'patient':
            assigned_doctor = None
            if assigned_doctor_id:
                try:
                    assigned_doctor = Doctor.objects.get(pk=assigned_doctor_id)
                except Doctor.DoesNotExist:
                    pass  # Don't fail if doctor doesn't exist, just set to None
            
            Patient.objects.create(
                user=user,
                father_name=father_name,
                assigned_doctor=assigned_doctor,
                illness_description=illness_description,
                street_no=street_no,
                province=province,
                city=city,
                blood_group=blood_group,
                health_allergies=health_allergies,
                recent_checkups=recent_checkups,
                nid=nid
            )
        elif user.user_type == 'doctor':
            hospital = None
            if hospital_id:
                try:
                    hospital = Hospital.objects.get(pk=hospital_id)
                except Hospital.DoesNotExist:
                    hospital = None
            Doctor.objects.create(
                user=user,
                specialization=specialization,
                latitude=latitude,
                longitude=longitude,
                hospital=hospital,
                nmic_id=nmic_id
            )
        elif user.user_type == 'hospital':
            Hospital.objects.create(
                user=user,
                hospital_name=hospital_name,
                address=address,
                latitude=latitude,
                longitude=longitude
            )
        
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    user_type = serializers.ChoiceField(choices=[('patient', 'Patient'), ('doctor', 'Doctor'), ('hospital', 'Hospital Admin')])

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
                attrs['user'] = user
                return attrs
            else:
                raise serializers.ValidationError('Invalid credentials')
        else:
            raise serializers.ValidationError('Must include email and password')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'mobile', 'user_type', 'created_at']

class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_doctor_name = serializers.CharField(source='assigned_doctor.user.get_full_name', read_only=True)
    assigned_doctor_specialization = serializers.CharField(source='assigned_doctor.specialization', read_only=True)

    class Meta:
        model = Patient
        fields = ['user', 'father_name', 'assigned_doctor', 'assigned_doctor_name', 
                 'assigned_doctor_specialization', 'illness_description', 'street_no', 
                 'province', 'city', 'blood_group', 'health_allergies', 'recent_checkups', 
                 'patient_unique_id', 'nid', 'consent_signed']

class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    hospital = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = [
            'user', 'specialization', 'latitude', 'longitude', 'hospital', 
            'doctor_unique_id', 'nmic_id', 'education', 'experience', 
            'signature', 'nid', 'bio', 'certifications', 'specializations', 
            'languages', 'registration_number', 'license_expiry', 
            'in_person_fee', 'video_fee', 'medical_degree', 'city', 'country'
        ]

    def get_hospital(self, obj):
        try:
            if obj.hospital:
                return HospitalSerializer(obj.hospital).data
            return None
        except Exception:
            return None

class HospitalSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Hospital
        fields = ['user', 'hospital_name', 'address', 'latitude', 'longitude']
