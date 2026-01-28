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

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    father_name = models.CharField(max_length=100)
    assigned_doctor = models.ForeignKey('Doctor', on_delete=models.SET_NULL, null=True, blank=True)
    illness_description = models.TextField()
    street_no = models.CharField(max_length=50, blank=True, null=True)
    province = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    blood_group = models.CharField(max_length=10, blank=True, null=True)
    health_allergies = models.TextField(blank=True, null=True)
    recent_checkups = models.TextField(blank=True, null=True)
    patient_unique_id = models.CharField(max_length=20, blank=True, null=True, unique=True)
    
    def save(self, *args, **kwargs):
        if not self.patient_unique_id and self.street_no and self.province and self.city:
            # Generate ID: Initials of street_no + Initials of province + First 3 chars/words of city
            # Logic: 
            # 1. First char of street_no
            # 2. First char of province
            # 3. First 3 chars of city (simplified interpretation for uniqueness)
            
            s_initial = self.street_no[0] if self.street_no else 'X'
            p_initial = self.province[0] if self.province else 'X'
            
            # For city, let's take first 3 letters uppercase
            c_part = self.city[:3].upper() if self.city else 'XXX'
            
            # Combine
            base_id = f"{s_initial}{p_initial}{c_part}".upper()
            
            # Add a random suffix or counter to ensure uniqueness if needed, 
            # but prompt says "generating a unique Id" from these components.
            # To guarantee uniqueness in DB, we might need a sequence, but let's start with this.
            # Format: PT + generated part + user ID to ensure true uniqueness
            self.patient_unique_id = f"PT{base_id}{self.user.id}"
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Patient: {self.user.get_full_name()}"

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    specialization = models.CharField(max_length=100)
    
    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.specialization}"

class Hospital(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    hospital_name = models.CharField(max_length=200)
    address = models.TextField()
    
    def __str__(self):
        return self.hospital_name