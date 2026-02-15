from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('dashboard-stats/', views.dashboard_stats, name='dashboard_stats'),
    path('hospitals/', views.get_hospitals, name='get_hospitals'),
    path('doctors/', views.get_doctors, name='get_doctors'),
    path('profile/', views.get_profile, name='get_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('connect/', views.connect_entities, name='connect_entities'),
    path('confirm-connection/', views.update_connection_status, name='confirm_connection'),
    path('schedules/', views.manage_schedules, name='manage_schedules'),
    path('connections/', views.get_connected_entities, name='get_connected_entities'),
    path('payment-methods/', views.payment_methods, name='payment_methods'),
    path('payment-methods/<int:method_id>/', views.payment_methods, name='delete_payment_method'),
    path('notifications/', views.notifications, name='notifications'),
    path('send-otp/', views.SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', views.VerifyOTPView.as_view(), name='verify-otp'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    
    # Patient Booking Endpoints
    path('patient/hospitals/', views.patient_hospitals, name='patient_hospitals'),
    path('patient/hospitals/<str:hospital_id>/doctors/', views.patient_doctors, name='patient_doctors'),
    path('patient/schedule/<str:doctor_id>/<str:hospital_id>/', views.patient_schedule, name='patient_schedule'),
    path('patient/appointments/', views.patient_appointments, name='patient_appointments'),
    path('hospital/appointments/', views.hospital_appointments, name='hospital_appointments'),
    path('doctor/appointments/', views.doctor_appointments, name='doctor_appointments'),
    path('appointments/<int:appointment_id>/manage/', views.manage_appointment, name='manage_appointment'),
    
    # Department Management
    path('departments/', views.manage_departments, name='manage_departments'),
    path('departments/<int:dept_id>/', views.department_detail, name='department_detail'),
    
    # Medical Reports
    path('reports/upload/', views.upload_medical_report, name='upload_medical_report'),
    path('hospital/reports/', views.get_hospital_reports, name='hospital_reports'),
    path('hospital/reports/upload/', views.upload_hospital_report, name='upload_hospital_report'),
    path('hospital/patients/', views.get_all_patients, name='get_all_patients'),
    path('patient/<str:patient_id>/reports/', views.get_patient_reports, name='get_patient_reports'),
    path('patients/<str:patient_id>/', views.get_patient_detail, name='get_patient_detail'),

    # Emergency Search
    path('recommend-doctors/', views.recommend_doctors, name='recommend_doctors'),
    path('nearby-hospitals/', views.nearby_hospitals, name='nearby_hospitals'),
    
    # Reviews and Doctor's Patients
    path('reviews/', views.manage_reviews, name='manage_reviews'),
    path('reviews/<str:doctor_id>/', views.manage_reviews, name='doctor_reviews'),
    path('doctor/patients/', views.get_doctor_patients, name='get_doctor_patients'),
]
