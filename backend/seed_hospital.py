import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healthcare_platform.settings')
django.setup()

from authentication.models import User, Hospital, Department, DoctorProfile
from django.contrib.auth import get_user_model

User = get_user_model()

def seed_data():
    # 1. Create Hospital Admin
    email = 'admin@birhospital.com'
    password = 'password123'
    
    if not User.objects.filter(email=email).exists():
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            user_type='hospital',
            first_name='Bir',
            last_name='Hospital',
            mobile='9841000000',
            unique_id='HOSP-BIR-001'
        )
        
        hospital = Hospital.objects.create(
            user=user,
            hospital_name='Bir Hospital',
            hospital_type='Government',
            hospital_unique_id='HOSP-BIR-001',
            province='Bagmati',
            district='Kathmandu',
            city='Kathmandu',
            ward='27',
            tole='Mahaboudha',
            address='Mahaboudha, Kathmandu',
            pan_number='123456789',
            registration_number='REG-12345',
            contact_number='01-4223807',
            website='https://birhospital.gov.np',
            description='Bir Hospital is the oldest and one of the busiest hospitals in Nepal.',
            beds=350,
            opening_hours='24/7'
        )
        print(f"Hospital created: {hospital.hospital_name}")

        # 2. Create Departments
        cardiology = Department.objects.create(
            name='Cardiology',
            hospital=hospital,
            description='Heart and blood vessel care',
            icon='❤️'
        )
        neurology = Department.objects.create(
            name='Neurology',
            hospital=hospital,
            description='Brain and nervous system care',
            icon='🧠'
        )
        print("Departments created.")

        # 3. Create Doctors
        doc_user = User.objects.create_user(
            username='doctor@birhospital.com',
            email='doctor@birhospital.com',
            password='password123',
            user_type='doctor',
            first_name='Rajan',
            last_name='Shrestha',
            mobile='9841111111'
        )
        
        DoctorProfile.objects.create(
            user=doc_user,
            hospital=hospital,
            department=neurology,
            qualification='MD, DM Neurology',
            specialization='Neurologist',
            experience_years=14,
            nmc_number='12345',
            consultation_fee=800.00,
            available_days='Mon,Wed,Fri',
            is_verified=True
        )
        print(f"Doctor created: Dr. {doc_user.first_name}")
    else:
        print("Admin user already exists.")

if __name__ == '__main__':
    seed_data()
