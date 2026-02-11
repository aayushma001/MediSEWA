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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Hospital(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='hospital_profile')
    hospital_name = models.CharField(max_length=200)
    address = models.TextField()
    pan_number = models.CharField(max_length=50, blank=True)
    registration_number = models.CharField(max_length=50, blank=True)
    contact_number = models.CharField(max_length=15, blank=True)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='hospital_logos/', null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    description = models.TextField(blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    def __str__(self):
        return self.hospital_name

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
    is_verified = models.BooleanField(default=False)
    consent_accepted = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name}"
