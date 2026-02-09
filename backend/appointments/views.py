from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Appointment, Medication, Advice, HealthMetric, PatientReport, MedicalRecord
from .serializers import (AppointmentSerializer, MedicationSerializer, 
                         AdviceSerializer, HealthMetricSerializer, PatientReportSerializer, MedicalRecordSerializer)
from authentication.models import Patient, Doctor, Hospital
from authentication.serializers import DoctorSerializer, HospitalSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_appointments(request):
    try:
        appointments = Appointment.objects.all().order_by('-date_time')
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_appointments(request, patient_id):
    try:
        appointments = Appointment.objects.filter(patient_id=patient_id).order_by('-date_time')
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_medications(request, patient_id):
    try:
        medications = Medication.objects.filter(appointment__patient_id=patient_id)
        serializer = MedicationSerializer(medications, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_medication_status(request, medication_id):
    try:
        medication = Medication.objects.get(id=medication_id)
        medication.completed = request.data.get('completed', medication.completed)
        medication.save()
        serializer = MedicationSerializer(medication)
        return Response(serializer.data)
    except Medication.DoesNotExist:
        return Response({'error': 'Medication not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_advice(request, patient_id):
    try:
        advice = Advice.objects.filter(patient_id=patient_id).order_by('-advice_date')
        serializer = AdviceSerializer(advice, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_health_metrics(request, patient_id):
    try:
        metrics = HealthMetric.objects.filter(patient_id=patient_id).order_by('measurement_date')
        serializer = HealthMetricSerializer(metrics, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_reports(request, patient_id):
    try:
        reports = PatientReport.objects.filter(patient_id=patient_id).order_by('-upload_date')
        serializer = PatientReportSerializer(reports, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_patient_report(request):
    serializer = PatientReportSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_appointment(request):
    serializer = AppointmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_advice(request):
    serializer = AdviceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_appointment_status(request, appointment_id):
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        appointment.status = request.data.get('status', appointment.status)
        appointment.save()
        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recommend_doctors(request):
    symptoms = request.data.get('symptoms', '')
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')
    
    doctors = Doctor.objects.all()
    
    # Filter by symptoms (Simple keyword matching)
    if symptoms:
        # Map common symptoms to specializations (Mock AI)
        symptom_map = {
            'heart': 'Cardiologist',
            'chest': 'Cardiologist',
            'skin': 'Dermatologist',
            'rash': 'Dermatologist',
            'stomach': 'Gastroenterologist',
            'digestive': 'Gastroenterologist',
            'bone': 'Orthopedic',
            'joint': 'Orthopedic',
            'tooth': 'Dentist',
            'teeth': 'Dentist',
            'eye': 'Ophthalmologist',
            'vision': 'Ophthalmologist',
            'child': 'Pediatrician',
            'kid': 'Pediatrician',
            'brain': 'Neurologist',
            'head': 'Neurologist',
            'cancer': 'Oncologist',
            'tumor': 'Oncologist',
        }
        
        matched_specializations = set()
        for word in symptoms.lower().split():
            for key, spec in symptom_map.items():
                if key in word:
                    matched_specializations.add(spec)
        
        if matched_specializations:
            doctors = doctors.filter(specialization__in=matched_specializations)
        else:
            # Fallback: search description or specialization directly if no map match
            # For now, if no match in map, we don't filter or could filter by text search
            pass

    # Sort by location if provided
    if latitude and longitude:
        try:
            lat = float(latitude)
            lon = float(longitude)
            
            doctor_list = []
            for doc in doctors:
                if doc.latitude and doc.longitude:
                    dist = ((doc.latitude - lat)**2 + (doc.longitude - lon)**2)**0.5
                    doctor_list.append((dist, doc))
                else:
                    doctor_list.append((float('inf'), doc))
            
            doctor_list.sort(key=lambda x: x[0])
            doctors = [x[1] for x in doctor_list]
        except ValueError:
            pass

    serializer = DoctorSerializer(doctors, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nearby_hospitals(request):
    latitude = request.query_params.get('latitude')
    longitude = request.query_params.get('longitude')
    
    hospitals = Hospital.objects.all()
    
    if latitude and longitude:
        try:
            lat = float(latitude)
            lon = float(longitude)
            
            hospital_list = []
            for hosp in hospitals:
                if hosp.latitude and hosp.longitude:
                    dist = ((hosp.latitude - lat)**2 + (hosp.longitude - lon)**2)**0.5
                    hospital_list.append((dist, hosp))
                else:
                    hospital_list.append((float('inf'), hosp))
            
            hospital_list.sort(key=lambda x: x[0])
            hospitals = [x[1] for x in hospital_list]
        except ValueError:
            pass
            
    serializer = HospitalSerializer(hospitals, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_medical_records(request, patient_id):
    try:
        records = MedicalRecord.objects.filter(patient_id=patient_id).order_by('-record_date')
        serializer = MedicalRecordSerializer(records, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_medical_record(request):
    serializer = MedicalRecordSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
