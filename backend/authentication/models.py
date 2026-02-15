from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('hospital', 'Hospital Admin'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    mobile = models.CharField(max_length=15)
    unique_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.username


class PatientProfile(models.Model):
    """Comprehensive patient profile with all registration and health information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    
    # Demographics
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, choices=[
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
        ('Prefer not to say', 'Prefer not to say')
    ])
    age = models.IntegerField(null=True, blank=True)
    
    # Contact Information
    phone_number = models.CharField(max_length=15, blank=True)
    alternate_phone = models.CharField(max_length=15, blank=True)
    emergency_contact = models.CharField(max_length=15, blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    
    # Health Information
    blood_group = models.CharField(max_length=5, blank=True, choices=[
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-')
    ])
    nid_number = models.CharField(max_length=50, blank=True, verbose_name='National ID Number')
    health_condition = models.TextField(blank=True)
    medications = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    
    # Location
    province = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    postal_code = models.CharField(max_length=10, blank=True)
    
    # Other
    profile_image = models.ImageField(upload_to='patient_profiles/', null=True, blank=True)
    patient_unique_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.patient_unique_id})"


class Hospital(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='hospital_profile')
    hospital_name = models.CharField(max_length=200)
    hospital_type = models.CharField(max_length=100, blank=True)
    hospital_unique_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    
    # Location
    province = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    ward = models.CharField(max_length=10, blank=True)
    tole = models.CharField(max_length=100, blank=True)
    address = models.TextField()
    
    pan_number = models.CharField(max_length=50, blank=True)
    registration_number = models.CharField(max_length=50, blank=True)
    contact_number = models.CharField(max_length=15, blank=True)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='hospital_logos/', null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    description = models.TextField(blank=True)
    beds = models.IntegerField(default=0)
    opening_hours = models.CharField(max_length=100, default='24/7')
    qr_code = models.ImageField(upload_to='hospital_qrs/', null=True, blank=True)
    
    def __str__(self):
        return self.hospital_name

class Department(models.Model):
    name = models.CharField(max_length=100)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='departments')
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True) # e.g. "heart", "brain"

    def __str__(self):
        return f"{self.name} - {self.hospital.hospital_name}"

class PaymentMethod(models.Model):
    PAYMENT_TYPES = (
        ('bank', 'Bank Account'),
        ('wallet', 'Digital Wallet'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    method_type = models.CharField(max_length=10, choices=PAYMENT_TYPES)
    provider_name = models.CharField(max_length=100) # e.g., Nabil Bank, esewa
    account_number = models.CharField(max_length=100) # Account number or Wallet ID
    account_holder_name = models.CharField(max_length=200)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.provider_name} - {self.user.username}"

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('info', 'Information'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES, default='info')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.message[:20]}"

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, related_name='doctors')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='doctors')
    profile_picture = models.ImageField(upload_to='doctor_profiles/', null=True, blank=True)
    qualification = models.CharField(max_length=100, blank=True)
    specialization = models.CharField(max_length=100, blank=True)
    experience_years = models.IntegerField(default=0)
    nmc_number = models.CharField(max_length=50, blank=True)
    contact_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    about = models.TextField(blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    available_days = models.CharField(max_length=200, blank=True) # Comma separated days
    doctor_unique_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    consent_accepted = models.BooleanField(default=False)
    signature_image = models.ImageField(upload_to='doctor_signatures/', null=True, blank=True)
    
    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name}"

class OTP(models.Model):
    phone_or_email = models.CharField(max_length=255)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    @staticmethod
    def generate_otp():
        import random
        return str(random.randint(100000, 999999))

    def __str__(self):
        return f"{self.phone_or_email} - {self.otp_code}"

class DoctorHospitalConnection(models.Model):
    CONNECTION_STATUS = (
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('rejected', 'Rejected'),
    )
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='hospital_connections')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='doctor_connections')
    status = models.CharField(max_length=20, choices=CONNECTION_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('doctor', 'hospital')

    def __str__(self):
        return f"{self.doctor} - {self.hospital} ({self.status})"

class DoctorSchedule(models.Model):
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='doctor_schedules')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='hospital_doctor_schedules')
    date = models.DateField(null=True, blank=True) # Optional if recurring
    is_recurring = models.BooleanField(default=False)
    day_of_week = models.IntegerField(null=True, blank=True, choices=[
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), 
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday')
    ])
    session_data = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('doctor', 'hospital', 'date')

    def __str__(self):
        return f"Schedule for {self.doctor} at {self.hospital} on {self.date}"

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Verification'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    CONSULTATION_TYPES = (
        ('online', 'Video Consultation'),
        ('offline', 'In-Person Visit'),
    )

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='appointments')
    date = models.DateField()
    time_slot = models.CharField(max_length=50) # e.g., "09:00 - 09:10"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    consultation_type = models.CharField(max_length=10, choices=CONSULTATION_TYPES, default='online')
    payment_screenshot = models.ImageField(upload_to='appointment_payments/', null=True, blank=True)
    symptoms = models.TextField(blank=True)
    meeting_link = models.URLField(max_length=500, blank=True, null=True)
    booking_reference = models.CharField(max_length=20, unique=True, null=True, blank=True)
    is_emergency = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-time_slot']

    def __str__(self):
        return f"Appointment: {self.patient} with {self.doctor} on {self.date}"

class MedicalReport(models.Model):
    REPORT_TYPE_CHOICES = (
        ('consultation', 'Consultation Report'),
        ('lab_report', 'Lab/Test Report'),
    )
    
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='medical_reports')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='generated_reports')
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, related_name='hospital_reports')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_reports')
    
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES, default='consultation')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    report_file = models.FileField(upload_to='medical_reports/')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.get_report_type_display()}"
    
class Review(models.Model):
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='reviews')
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('doctor', 'patient') # One review per doctor-patient pair

    def __str__(self):
        return f"Review by {self.patient} for {self.doctor} - {self.rating} stars"
