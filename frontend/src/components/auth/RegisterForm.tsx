import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RegisterFormData } from '../../types';
import { authAPI } from '../../services/api';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  loading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, loading }) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showConsent, setShowConsent] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    userType: 'patient',
    street_no: '',
    province: '',
    blood_group: '',
    health_allergies: '',
    recent_checkups: '',
    illnessDescription: '',
    fatherName: '',
    hospitalName: '',
    address: ''
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsList = await authAPI.getDoctors();
        setDoctors(doctorsList);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    };
    
    if (formData.userType === 'patient') {
      fetchDoctors();
    }
  }, [formData.userType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (formData.userType === 'patient') {
      setShowConsent(true);
    } else {
      console.log('Form data being submitted:', formData);
      await onSubmit(formData);
    }
  };

  const handleConsentSubmit = async () => {
    console.log('Form data being submitted with consent:', formData);
    await onSubmit(formData);
    setShowConsent(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      {showConsent && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50 transition-all duration-300">
          <div className="relative p-8 border w-full max-w-3xl shadow-2xl rounded-2xl bg-white transform transition-all scale-100">
            <h3 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Patient Consent & Terms</h3>
            <div className="mt-2 space-y-4">
              <div className="h-64 overflow-y-auto pr-2 text-gray-600 space-y-4 border rounded-lg p-4 bg-gray-50">
                <p>
                  <strong>1. Data Collection & Usage:</strong> I hereby give my explicit consent for the collection, processing, and storage of my personal health information by Medico. I understand that this data includes but is not limited to my medical history, prescriptions, and diagnostic reports.
                </p>
                <p>
                  <strong>2. Medical Purpose:</strong> I understand that this information will be strictly used for medical diagnosis, treatment planning, and healthcare management purposes by authorized medical professionals.
                </p>
                <p>
                  <strong>3. Privacy & Confidentiality:</strong> My data will be kept confidential and will not be shared with unauthorized third parties without my prior written consent, except as required by law.
                </p>
                <p>
                  <strong>4. Emergency Access:</strong> In case of a medical emergency, I authorize the sharing of my critical health data with emergency responders.
                </p>
                <p>
                  <strong>5. Consent Revocation:</strong> I acknowledge that I have the right to revoke this consent at any time by contacting the hospital administration, understanding that this may affect the quality of care provided.
                </p>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <Button
                  onClick={handleConsentSubmit}
                  loading={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  I Read & Agree to Terms
                </Button>
                <button
                  onClick={() => setShowConsent(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors border border-gray-200"
                >
                  Cancel & Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">      
      <Select
        name="userType"
        label="I am a"
        value={formData.userType}
        onChange={handleChange}
        options={[
          { value: 'patient', label: 'Patient' },
          { value: 'doctor', label: 'Doctor' },
          { value: 'hospital', label: 'Hospital Admin' }
        ]}
        required
      />
      
      <Input
        name="name"
        type="text"
        label="Full Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      
      {formData.userType === 'patient' && (
        <>
          <Input
            name="fatherName"
            type="text"
            label="Father's Name"
            value={formData.fatherName || ''}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              name="street_no"
              type="text"
              label="Street No"
              value={formData.street_no || ''}
              onChange={handleChange}
              placeholder="e.g. 123"
              required
            />
            <Input
              name="province"
              type="text"
              label="Province"
              value={formData.province || ''}
              onChange={handleChange}
              placeholder="e.g. ON"
              required
            />
            <Input
              name="city"
              type="text"
              label="City/Location"
              value={formData.city || ''}
              onChange={handleChange}
              placeholder="e.g. Toronto"
              required
            />
          </div>

          <Input
            name="blood_group"
            type="text"
            label="Blood Group"
            value={formData.blood_group || ''}
            onChange={handleChange}
            required
            placeholder="e.g. A+, O-"
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Health Allergies
            </label>
            <textarea
              name="health_allergies"
              value={formData.health_allergies || ''}
              onChange={handleChange}
              rows={2}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="List any allergies..."
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Recent Checkups
            </label>
            <textarea
              name="recent_checkups"
              value={formData.recent_checkups || ''}
              onChange={handleChange}
              rows={2}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Details of recent checkups..."
            />
          </div>
        </>
      )}
      
      <Input
        name="email"
        type="email"
        label="Email Address"
        value={formData.email}
        onChange={handleChange}
        required
      />
      
      <Input
        name="mobile"
        type="tel"
        label="Mobile Number"
        value={formData.mobile}
        onChange={handleChange}
        required
      />
      
      {formData.userType === 'hospital' && (
        <>
          <Input
            name="hospitalName"
            type="text"
            label="Hospital Name"
            value={formData.hospitalName || ''}
            onChange={handleChange}
            required
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Hospital Address
            </label>
            <textarea
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Full address of the hospital..."
              required
            />
          </div>
        </>
      )}

      {formData.userType === 'doctor' && (
        <Input
          name="specialization"
          type="text"
          label="Specialization"
          value={formData.specialization || ''}
          onChange={handleChange}
          placeholder="e.g., Cardiology, General Medicine"
          required
        />
      )}

      {formData.userType === 'patient' && (
        <>
          {doctors.length > 0 && (
            <Select
              name="assignedDoctorId"
              label="Select Doctor (Optional)"
              value={formData.assignedDoctorId || ''}
              onChange={handleChange}
              options={doctors.map(doctor => ({
                value: doctor.user.id.toString(),
                label: `Dr. ${doctor.user.first_name} ${doctor.user.last_name} - ${doctor.specialization}`
              }))}
            />
          )}
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description of Illness
            </label>
            <textarea
              name="illnessDescription"
              value={formData.illnessDescription || ''}
              onChange={handleChange}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please describe your current medical condition..."
              required
            />
          </div>
        </>
      )}
      
      <Input
        name="password"
        type="password"
        label="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      
      <Input
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />
      
      <Button 
        type="submit" 
        loading={loading} 
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        Create Account
      </Button>
    </form>
    </>
  );
};
