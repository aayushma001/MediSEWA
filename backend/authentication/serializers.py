from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Hospital, DoctorProfile, PaymentMethod, Notification

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    # Hospital specific
    hospital_name = serializers.CharField(required=False)
    address = serializers.CharField(required=False)
    pan_number = serializers.CharField(required=False)
    registration_number = serializers.CharField(required=False)
    contact_number = serializers.CharField(required=False)
    website = serializers.URLField(required=False)
    latitude = serializers.FloatField(required=False)
    longitude = serializers.FloatField(required=False)
    
    # Doctor specific
    specialization = serializers.CharField(required=False)
    qualification = serializers.CharField(required=False)
    experience_years = serializers.IntegerField(required=False)
    consent_accepted = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'mobile', 'user_type', 
                 'password', 'confirm_password', 'hospital_name', 'address',
                 'pan_number', 'registration_number', 'contact_number', 'website',
                 'latitude', 'longitude', 'specialization', 'qualification',
                 'experience_years', 'consent_accepted']

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
        # Remove extra fields
        hospital_name = validated_data.pop('hospital_name', None)
        address = validated_data.pop('address', None)
        pan_number = validated_data.pop('pan_number', '')
        registration_number = validated_data.pop('registration_number', '')
        contact_number = validated_data.pop('contact_number', '')
        website = validated_data.pop('website', '')
        latitude = validated_data.pop('latitude', None)
        longitude = validated_data.pop('longitude', None)
        
        specialization = validated_data.pop('specialization', None)
        qualification = validated_data.pop('qualification', None)
        experience_years = validated_data.pop('experience_years', 0)
        consent_accepted = validated_data.pop('consent_accepted', False)
        
        validated_data.pop('confirm_password')
        
        # Set username to email
        validated_data['username'] = validated_data['email']
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Create hospital profile
        if user.user_type == 'hospital':
            Hospital.objects.create(
                user=user,
                hospital_name=hospital_name,
                address=address,
                pan_number=pan_number,
                registration_number=registration_number,
                contact_number=contact_number,
                website=website,
                latitude=latitude,
                longitude=longitude
            )
            
        # Create doctor profile
        if user.user_type == 'doctor':
            DoctorProfile.objects.create(
                user=user,
                specialization=specialization,
                qualification=qualification,
                experience_years=experience_years,
                consent_accepted=consent_accepted,
                is_verified=False  # Default to False as per requirements
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
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'mobile', 'user_type', 'created_at']

class HospitalSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Hospital
        fields = ['user', 'hospital_name', 'address', 'pan_number', 'registration_number', 
                  'contact_number', 'website', 'logo', 'latitude', 'longitude', 'description']

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
        fields = ['user', 'profile_picture', 'qualification', 'specialization', 
                  'experience_years', 'about', 'is_verified', 'consent_accepted',
                  'nmc_number', 'contact_number', 'address', 'gender', 'date_of_birth']
