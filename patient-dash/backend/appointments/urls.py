from django.urls import path
from .views import (
    AppointmentListCreate,
    AppointmentDetail,
    AppointmentByDate,
    AppointmentConfirmationView,
    CreatePaymentView,
    MedicalRecordListCreate,
    MedicalRecordDetail,
    HospitalListCreate,
    HospitalDetail,
    DoctorListCreate,
    DoctorDetail,
    DoctorAvailability,
    TimeSlotListCreate,
    TimeSlotDetail,
    SmsNotificationView,
    EmailNotificationView,
    UserProfileView,
    ReceiptListCreate,
    ReceiptDetail,
    health_check,
)

urlpatterns = [
    # Health Check
    path('api/health/', health_check, name='health-check'),

    # User Profile
    path('api/user/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/user/change-password/', UserProfileView.as_view(), name='change-password'),

    # Appointments
    path('api/appointments/', AppointmentListCreate.as_view(), name='appointment-list-create'),
    path('api/appointments/create/', CreatePaymentView.as_view(), name='create-payment'),
    path('api/appointments/<int:pk>/', AppointmentDetail.as_view(), name='appointment-detail'),
    path('api/appointments/by-date/', AppointmentByDate.as_view(), name='appointments-by-date'),
    path('api/appointments/<int:pk>/confirm/', AppointmentConfirmationView.as_view(), name='appointment-confirm'),

    # Hospitals
    path('api/hospitals/', HospitalListCreate.as_view(), name='hospital-list-create'),
    path('api/hospitals/<int:pk>/', HospitalDetail.as_view(), name='hospital-detail'),

    # Doctors
    path('api/doctors/', DoctorListCreate.as_view(), name='doctor-list-create'),
    path('api/doctors/<int:pk>/', DoctorDetail.as_view(), name='doctor-detail'),
    path('api/doctors/<int:doctor_id>/availability/', DoctorAvailability.as_view(), name='doctor-availability'),

    # Time Slots
    path('api/time-slots/', TimeSlotListCreate.as_view(), name='time-slot-list-create'),
    path('api/time-slots/<int:pk>/', TimeSlotDetail.as_view(), name='time-slot-detail'),

    # Medical Records
    path('api/medical-records/', MedicalRecordListCreate.as_view(), name='medical-record-list-create'),
    path('api/medical-records/<int:pk>/', MedicalRecordDetail.as_view(), name='medical-record-detail'),

    # Receipts
    path('api/receipts/', ReceiptListCreate.as_view(), name='receipt-list-create'),
    path('api/receipts/<int:pk>/', ReceiptDetail.as_view(), name='receipt-detail'),

    # Notifications
    path('api/notifications/sms/', SmsNotificationView.as_view(), name='sms-notification'),
    path('api/notifications/email/', EmailNotificationView.as_view(), name='email-notification'),
]
