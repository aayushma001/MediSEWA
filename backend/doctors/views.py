from rest_framework import viewsets, permissions
from .models import Schedule
from .serializers import ScheduleSerializer

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Schedule.objects.all()
        
        # Filter by specific doctor if provided (e.g. for patients booking)
        doctor_id = self.request.query_params.get('doctor_id')
        if doctor_id:
            return queryset.filter(doctor_id=doctor_id)

        # If no specific doctor requested, and user is a doctor, show their own sessions
        if hasattr(user, 'doctor'):
            return queryset.filter(doctor=user.doctor)
            
        # Otherwise return all (e.g. for admin or patient browsing all)
        return queryset

    def perform_create(self, serializer):
        # Automatically assign the doctor if the user is a doctor
        if hasattr(self.request.user, 'doctor'):
            serializer.save(doctor=self.request.user.doctor)
        else:
            serializer.save()
