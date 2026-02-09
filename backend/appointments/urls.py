from django.urls import path
from . import views

urlpatterns = [
    path('all/', views.get_all_appointments, name='get_all_appointments'),
    path('patient/<int:patient_id>/', views.get_patient_appointments, name='patient_appointments'),
    path('medications/patient/<int:patient_id>/', views.get_patient_medications, name='patient_medications'),
    path('medications/<int:medication_id>/status/', views.update_medication_status, name='update_medication_status'),
    path('advice/patient/<int:patient_id>/', views.get_patient_advice, name='patient_advice'),
    path('health-metrics/patient/<int:patient_id>/', views.get_patient_health_metrics, name='patient_health_metrics'),
    path('reports/patient/<int:patient_id>/', views.get_patient_reports, name='patient_reports'),
    path('reports/create/', views.create_patient_report, name='create_patient_report'),
    path('create/', views.create_appointment, name='create_appointment'),
    path('<int:appointment_id>/status/', views.update_appointment_status, name='update_appointment_status'),
    path('advice/create/', views.create_advice, name='create_advice'),
    path('recommend-doctors/', views.recommend_doctors, name='recommend_doctors'),
    path('nearby-hospitals/', views.nearby_hospitals, name='nearby_hospitals'),
    path('medical-records/patient/<int:patient_id>/', views.get_patient_medical_records, name='get_patient_medical_records'),
    path('medical-records/create/', views.create_medical_record, name='create_medical_record'),
]