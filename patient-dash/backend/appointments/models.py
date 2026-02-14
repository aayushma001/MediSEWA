from django.db import models


class Hospital(models.Model):
    """Hospital model for storing hospital information"""
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=300)
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    website = models.URLField(blank=True, default='')
    address = models.TextField(blank=True, default='')
    image = models.URLField(blank=True, default='')
    specialties = models.CharField(max_length=500, default='')  # Comma-separated specialties
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Doctor(models.Model):
    """Doctor model with availability and Zoom integration"""
    name = models.CharField(max_length=200)
    specialties = models.CharField(max_length=200)  # Comma-separated specialties
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, default='')
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, related_name='doctors')
    
    # Professional Info
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.5)
    reviews_count = models.IntegerField(default=0)
    experience_years = models.IntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=500)
    image = models.URLField(blank=True, default='')
    
    # Availability (stored as JSON or comma-separated)
    availability_days = models.CharField(max_length=100, default='Mon,Tue,Wed,Thu,Fri')  # Mon-Sun
    availability_start = models.CharField(max_length=20, default='09:00 AM')
    availability_end = models.CharField(max_length=20, default='05:00 PM')
    time_slot_duration = models.IntegerField(default=30)  # minutes
    
    # Video Call (Zoom) Integration
    zoom_meeting_id = models.CharField(max_length=50, blank=True, default='')
    zoom_meeting_url = models.URLField(blank=True, default='')
    zoom_join_url = models.URLField(blank=True, default='')
    zoom_password = models.CharField(max_length=50, blank=True, default='')
    
    # System fields
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dr. {self.name} - {self.specialties}"

    def get_specialties_list(self):
        """Return specialties as a list"""
        return [s.strip() for s in self.specialties.split(',')]


class TimeSlot(models.Model):
    """Time slots for doctor availability"""
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='time_slots')
    day_of_week = models.IntegerField(choices=[
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday')
    ])
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    
    def __str__(self):
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        return f"{self.doctor.name} - {days[self.day_of_week]} {self.start_time}-{self.end_time}"


class Appointment(models.Model):
    """Appointment model with references to Doctor and Hospital"""
    # References to related models
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')
    
    # Appointment Details
    specialty = models.CharField(max_length=100)
    appointment_type = models.CharField(max_length=50)  # 'Video' or 'Clinic'
    date = models.DateField()
    time = models.CharField(max_length=20)
    notes = models.TextField(blank=True, default='')
    
    # Patient Details
    full_name = models.CharField(max_length=200)
    age = models.IntegerField()
    gender = models.CharField(max_length=20)
    address = models.TextField()
    email = models.EmailField(default='')
    phone = models.CharField(max_length=20, default='')
    
    # System fields
    status = models.CharField(max_length=20, default='Upcoming')
    created_at = models.DateTimeField(auto_now_add=True)

    # Payment Information
    payment_status = models.CharField(max_length=20, default='pending')  # pending, paid, failed
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=500)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=500)
    payment_method = models.CharField(max_length=20, default='cash')  # cash, qr, bank
    esewa_transaction_id = models.CharField(max_length=100, blank=True, default='')
    
    # Zoom Meeting Details
    zoom_meeting_id = models.CharField(max_length=50, blank=True, default='')
    zoom_meeting_url = models.URLField(blank=True, default='')
    zoom_join_url = models.URLField(blank=True, default='')
    
    # PDF Receipt
    receipt_pdf_url = models.URLField(blank=True, default='')
    receipt_pdf_path = models.CharField(max_length=500, blank=True, default='')

    def __str__(self):
        return f"{self.full_name} - {self.specialty} ({self.date})"

    def get_doctor_name(self):
        """Get doctor name or specialty"""
        if self.doctor:
            return f"Dr. {self.doctor.name}"
        return f"{self.specialty} Specialist"

    def get_hospital_name(self):
        """Get hospital name"""
        if self.hospital:
            return self.hospital.name
        return "Online Consultation" if self.appointment_type == 'Video' else ""

    def get_zoom_link(self):
        """Get Zoom meeting link for video calls"""
        if self.appointment_type == 'Video':
            return self.zoom_join_url or self.zoom_meeting_url or (self.doctor.zoom_join_url if self.doctor else '')
        return None

    def generate_zoom_meeting(self):
        """Generate Zoom meeting details for video appointments"""
        if self.appointment_type == 'Video' and not self.zoom_meeting_id:
            # For testing, use sample meeting ID and password
            # In production, this would call Zoom API
            import random
            import string

            self.zoom_meeting_id = str(random.randint(100000000, 999999999))  # 9-digit meeting ID
            self.zoom_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
            self.zoom_meeting_url = f"https://zoom.us/j/{self.zoom_meeting_id}"
            self.zoom_join_url = f"https://zoom.us/j/{self.zoom_meeting_id}?pwd={self.zoom_password}"
            self.save()
    
class MedicalRecord(models.Model):
    CATEGORY_CHOICES = [
        ('Lab Result', 'Lab Result'),
        ('Prescription', 'Prescription'),
        ('Radiology', 'Radiology (X-Ray/MRI)'),
        ('Vaccination', 'Vaccination'),
        ('Discharge Summary', 'Discharge Summary'),
        ('Appointment Receipt', 'Appointment Receipt'),
    ]

    PRIVACY_CHOICES = [
        ('Private', 'Private (Only Me)'),
        ('Shared', 'Shared (Visible to Doctors)'),
    ]

    title = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    date = models.DateField()
    hospital_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    privacy = models.CharField(max_length=20, choices=PRIVACY_CHOICES, default='Private')

    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, null=True, blank=True, related_name='medical_records')

    file = models.FileField(upload_to='records/', null=True, blank=True) # Changed from file_url
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.category}"


class Receipt(models.Model):
    """Receipt model for storing payment receipts"""
    PAYMENT_METHOD_CHOICES = [
        ('esewa', 'eSewa'),
        ('khalti', 'Khalti'),
        ('cash', 'Cash'),
        ('card', 'Credit/Debit Card'),
    ]

    RECEIPT_TYPE_CHOICES = [
        ('appointment', 'Appointment'),
        ('lab', 'Lab Test'),
        ('pharmacy', 'Pharmacy'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('pending', 'Pending'),
        ('refunded', 'Refunded'),
    ]

    # Receipt Details
    receipt_number = models.CharField(max_length=50, unique=True)
    receipt_type = models.CharField(max_length=20, choices=RECEIPT_TYPE_CHOICES, default='appointment')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='paid')
    
    # Patient Info
    patient_name = models.CharField(max_length=200)
    patient_email = models.EmailField(blank=True, default='')
    patient_phone = models.CharField(max_length=20, blank=True, default='')
    
    # Department & Visit Info
    department = models.CharField(max_length=100, blank=True, default='')
    visit_type = models.CharField(max_length=20, blank=True, default='')  # video, clinic
    appointment_date = models.DateField(null=True, blank=True)
    appointment_time = models.CharField(max_length=20, blank=True, default='')
    
    # Amount
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True, default='')
    
    # Description
    description = models.TextField(blank=True)
    hospital_name = models.CharField(max_length=200)
    doctor_name = models.CharField(max_length=200, blank=True, default='')
    
    # Related appointment
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='receipts')
    
    # PDF file
    pdf_file = models.FileField(upload_to='receipts/', null=True, blank=True)
    pdf_url = models.URLField(blank=True, default='')
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Receipt #{self.receipt_number} - {self.patient_name}"


class UserProfile(models.Model):
    """User profile for storing user preferences"""
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    # User identification
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, blank=True, default='')
    
    # Personal Info
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, default='')
    address = models.TextField(blank=True, default='')
    profile_image = models.URLField(blank=True, default='')
    
    # Preferences
    two_factor_enabled = models.BooleanField(default=False)
    data_sharing_enabled = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name
