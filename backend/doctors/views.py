from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Schedule
from .serializers import ScheduleSerializer
from authentication.models import Doctor
from authentication.serializers import DoctorSerializer

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

@api_view(['GET', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def doctor_profile(request):
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response({'detail': 'Doctor profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = DoctorSerializer(doctor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
