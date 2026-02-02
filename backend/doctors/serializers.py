from rest_framework import serializers
from authentication.models import Doctor

class DoctorProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    mobile = serializers.CharField(source='user.mobile', read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'first_name', 'last_name', 'email', 'mobile',
            'specialization', 'nid', 'experience', 'education', 'signature'
        ]
        read_only_fields = ['specialization'] # Assuming specialization is set during signup/admin approval for now, or allow edit? logic implies profile edit
