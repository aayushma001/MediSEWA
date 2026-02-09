from rest_framework import serializers
from .models import Schedule
from authentication.models import Doctor
from authentication.serializers import DoctorSerializer

class ScheduleSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(), source='doctor', write_only=True
    )

    class Meta:
        model = Schedule
        fields = ['id', 'doctor', 'doctor_id', 'title', 'date', 'time', 'max_patients', 'created_at']
