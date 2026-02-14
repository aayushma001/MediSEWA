"""
API Test Suite for MediSewa Backend
Tests all backend API endpoints for the patient dashboard application.
"""
import os
import sys

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

import json
from datetime import datetime, timedelta
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from appointments.models import Appointment, Doctor, Hospital, TimeSlot, MedicalRecord


class HealthCheckAPITest(APITestCase):
    """Test health check endpoint"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_health_check(self):
        """Test that health check returns healthy status"""
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'healthy')
        self.assertIn('timestamp', response.data)


class HospitalAPITest(APITestCase):
    """Test Hospital API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.hospital = Hospital.objects.create(
            name='Test Hospital',
            location='Kathmandu, Nepal',
            phone='+977-1234567890',
            email='test@hospital.np',
            address='Test Address',
            is_active=True
        )
    
    def test_list_hospitals(self):
        """Test listing all hospitals"""
        response = self.client.get('/api/hospitals/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)
    
    def test_create_hospital(self):
        """Test creating a new hospital"""
        data = {
            'name': 'New Hospital',
            'location': 'Pokhara, Nepal',
            'phone': '+977-9876543210',
            'email': 'info@newhospital.np',
            'address': 'Pokhara Address'
        }
        response = self.client.post('/api/hospitals/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Hospital.objects.count(), 2)
    
    def test_retrieve_hospital(self):
        """Test retrieving a single hospital"""
        response = self.client.get(f'/api/hospitals/{self.hospital.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Hospital')
    
    def test_update_hospital(self):
        """Test updating a hospital"""
        data = {'name': 'Updated Hospital Name'}
        response = self.client.patch(
            f'/api/hospitals/{self.hospital.id}/',
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.hospital.refresh_from_db()
        self.assertEqual(self.hospital.name, 'Updated Hospital Name')


class DoctorAPITest(APITestCase):
    """Test Doctor API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.hospital = Hospital.objects.create(
            name='Test Hospital',
            location='Kathmandu'
        )
        self.doctor = Doctor.objects.create(
            name='Dr. John Doe',
            specialties='Cardiology,Neurology',
            email='john@doctor.np',
            phone='+977-1234567890',
            hospital=self.hospital,
            rating=4.5,
            experience_years=10,
            consultation_fee=1000,
            availability_days='Mon,Tue,Wed,Thu,Fri',
            availability_start='09:00 AM',
            availability_end='05:00 PM',
            time_slot_duration=30,
            is_active=True
        )
        for day in range(5):
            TimeSlot.objects.create(
                doctor=self.doctor,
                day_of_week=day,
                start_time=datetime.strptime('09:00', '%H:%M').time(),
                end_time=datetime.strptime('17:00', '%H:%M').time(),
                is_available=True
            )
    
    def test_list_doctors(self):
        """Test listing all doctors"""
        response = self.client.get('/api/doctors/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)
    
    def test_doctor_availability(self):
        """Test doctor availability endpoint"""
        response = self.client.get(f'/api/doctors/{self.doctor.id}/availability/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('time_slots', response.data)
        self.assertIn('default_availability', response.data)


class AppointmentAPITest(APITestCase):
    """Test Appointment API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.hospital = Hospital.objects.create(
            name='Test Hospital',
            location='Kathmandu'
        )
        self.doctor = Doctor.objects.create(
            name='Dr. John Doe',
            specialties='Cardiology',
            email='john@doctor.np',
            consultation_fee=500,
            is_active=True
        )
        self.appointment = Appointment.objects.create(
            doctor=self.doctor,
            hospital=self.hospital,
            specialty='Cardiology',
            appointment_type='Video',
            date=datetime.now().date() + timedelta(days=7),
            time='10:00 AM',
            full_name='Test Patient',
            age=30,
            gender='Male',
            address='Test Address',
            email='patient@test.com',
            phone='+977-1234567890',
            payment_status='pending',
            payment_amount=500
        )
    
    def test_list_appointments(self):
        """Test listing all appointments"""
        response = self.client.get('/api/appointments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)
    
    def test_create_appointment(self):
        """Test creating a new appointment"""
        initial_count = Appointment.objects.count()
        tomorrow = datetime.now().date() + timedelta(days=1)
        data = {
            'doctor': self.doctor.id,
            'hospital': self.hospital.id,
            'specialty': 'Cardiology',
            'appointment_type': 'Video',
            'date': tomorrow.strftime('%Y-%m-%d'),
            'time': '02:00 PM',
            'full_name': 'New Patient',
            'age': 25,
            'gender': 'Female',
            'address': 'New Address',
            'email': 'newpatient@test.com',
            'phone': '+977-9876543210',
            'payment_amount': 500
        }
        response = self.client.post('/api/appointments/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.count(), initial_count + 1)
    
    def test_retrieve_appointment(self):
        """Test retrieving a single appointment"""
        response = self.client.get(f'/api/appointments/{self.appointment.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Test Patient')
    
    def test_update_appointment_status(self):
        """Test updating appointment status"""
        data = {'status': 'Confirmed'}
        response = self.client.patch(
            f'/api/appointments/{self.appointment.id}/',
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class PaymentAPITest(APITestCase):
    """Test Payment API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_initiate_esewa_payment(self):
        """Test eSewa payment initiation"""
        data = {
            'amount': '500.00',
            'product_name': 'Consultation Fee'
        }
        response = self.client.post('/api/payments/esewa/init/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('esewa_url', response.data)
        self.assertIn('payment_data', response.data)
        self.assertIn('transaction_uuid', response.data)


class NotificationAPITest(APITestCase):
    """Test Notification API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_send_sms_notification(self):
        """Test sending SMS notification"""
        data = {
            'phone': '+977-9841234567',
            'message': 'Test SMS from MediSewa'
        }
        response = self.client.post(
            '/api/notifications/sms/',
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)
    
    def test_send_email_notification(self):
        """Test sending email notification"""
        data = {
            'email': 'test@example.com',
            'subject': 'Test Email',
            'message': 'This is a test email from MediSewa'
        }
        response = self.client.post(
            '/api/notifications/email/',
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)


class MedicalRecordAPITest(APITestCase):
    """Test Medical Record API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.record = MedicalRecord.objects.create(
            title='Blood Test',
            category='Lab Result',
            date=datetime.now().date(),
            hospital_name='Test Hospital',
            description='Complete blood count',
            privacy='Private'
        )
    
    def test_list_medical_records(self):
        """Test listing medical records"""
        response = self.client.get('/api/medical-records/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)


class TimeSlotAPITest(APITestCase):
    """Test Time Slot API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.doctor = Doctor.objects.create(
            name='Dr. John Doe',
            specialties='Cardiology',
            email='john@doctor.np',
            is_active=True
        )
        self.time_slot = TimeSlot.objects.create(
            doctor=self.doctor,
            day_of_week=0,
            start_time=datetime.strptime('09:00', '%H:%M').time(),
            end_time=datetime.strptime('12:00', '%H:%M').time(),
            is_available=True
        )
    
    def test_list_time_slots(self):
        """Test listing time slots"""
        response = self.client.get('/api/time-slots/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)


if __name__ == '__main__':
    import unittest
    
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    suite.addTests(loader.loadTestsFromTestCase(HealthCheckAPITest))
    suite.addTests(loader.loadTestsFromTestCase(HospitalAPITest))
    suite.addTests(loader.loadTestsFromTestCase(DoctorAPITest))
    suite.addTests(loader.loadTestsFromTestCase(AppointmentAPITest))
    suite.addTests(loader.loadTestsFromTestCase(PaymentAPITest))
    suite.addTests(loader.loadTestsFromTestCase(NotificationAPITest))
    suite.addTests(loader.loadTestsFromTestCase(MedicalRecordAPITest))
    suite.addTests(loader.loadTestsFromTestCase(TimeSlotAPITest))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print("="*70)
    
    sys.exit(0 if result.wasSuccessful() else 1)

