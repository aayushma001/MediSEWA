import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RegisterFormData } from '../../types';
import { authAPI } from '../../services/api';
import { Stethoscope, Users, Shield } from 'lucide-react';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  loading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, loading }) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [showConsent, setShowConsent] = useState(false);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
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
    address: '',
    city: '',
    specialization: '',
    nid: '',
    nmicId: '',
    latitude: undefined,
    longitude: undefined
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

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const list = await authAPI.getHospitals();
        setHospitals(list);
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
      }
    };
    if (formData.userType === 'doctor') {
      fetchHospitals();
    }
  }, [formData.userType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    console.log('Form data being submitted:', formData);
    await onSubmit(formData);
  };
  
  const handleSocial = (provider: 'google' | 'facebook') => {
    setOauthNotice(`${provider === 'google' ? 'Google' : 'Facebook'} sign-up is not yet configured. Please continue with Email/Password for now.`);
    setTimeout(() => setOauthNotice(null), 5000);
  };

  const handleConsentSubmit = async () => {
    console.log('Form data being submitted with consent:', formData);
    await onSubmit(formData);
    setShowConsent(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {formData.userType === 'patient' && 'Patient Register'}
              {formData.userType === 'doctor' && 'Doctor Register'}
              {formData.userType === 'hospital' && 'Hospital Admin Register'}
            </h3>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, userType: 'doctor' }))}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Are you a Doctor?
        </button>
      </div>

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
            name="nid"
            type="text"
            label="National ID (NID)"
            value={formData.nid || ''}
            onChange={handleChange}
            placeholder="Enter your national ID"
            required
          />
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
        label="Email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      
      <Input
        name="mobile"
        type="tel"
        label="Phone"
        value={formData.mobile}
        onChange={handleChange}
        placeholder="Enter Phone"
        required
      />
      
      <div className="space-y-3">
        <p className="text-center text-sm text-gray-600">or continue with</p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full justify-center gap-2" onClick={() => handleSocial('google')}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EB4335"/>
            </svg>
            Google
          </Button>
          <Button variant="outline" className="w-full justify-center gap-2" onClick={() => handleSocial('facebook')}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325V1.325C23.998.593 23.405 0 22.675 0z" fill="#1877F2"/>
            </svg>
            Facebook
          </Button>
        </div>
        {oauthNotice && (
          <div className="text-center text-xs text-gray-600">{oauthNotice}</div>
        )}
      </div>
      
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
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="latitude"
              type="number"
              label="Latitude"
              value={formData.latitude !== undefined ? String(formData.latitude) : ''}
              onChange={handleChange}
              placeholder="e.g. 6.9271"
            />
            <Input
              name="longitude"
              type="number"
              label="Longitude"
              value={formData.longitude !== undefined ? String(formData.longitude) : ''}
              onChange={handleChange}
              placeholder="e.g. 79.8612"
            />
          </div>
        </>
      )}

      {formData.userType === 'doctor' && (
        <>
          <Input
            name="specialization"
            type="text"
            label="Specialization"
            value={formData.specialization || ''}
            onChange={handleChange}
            placeholder="e.g., Cardiology, General Medicine"
            required
          />
          <Input
            name="nmicId"
            type="text"
            label="NMIC ID"
            value={formData.nmicId || ''}
            onChange={handleChange}
            placeholder="Enter NMIC ID"
            required
          />
          <div>
            {hospitals.length > 0 ? (
              <Select
                name="hospitalId"
                label="Associated Hospital"
                value={(formData as any).hospitalId || ''}
                onChange={handleChange}
                options={hospitals.map((h: any) => ({
                  value: h.user.id.toString(),
                  label: h.hospital_name
                }))}
                required
              />
            ) : (
              <Input
                name="hospitalId"
                type="text"
                label="Hospital ID"
                value={(formData as any).hospitalId || ''}
                onChange={handleChange}
                placeholder="Enter Hospital ID"
                required
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="latitude"
              type="number"
              label="Clinic Latitude (optional)"
              value={formData.latitude !== undefined ? String(formData.latitude) : ''}
              onChange={handleChange}
              placeholder="e.g. 6.9271"
            />
            <Input
              name="longitude"
              type="number"
              label="Clinic Longitude (optional)"
              value={formData.longitude !== undefined ? String(formData.longitude) : ''}
              onChange={handleChange}
              placeholder="e.g. 79.8612"
            />
          </div>
        </>
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
      
      <div className="pt-2">
        <Button 
          type="submit" 
          loading={loading} 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
        >
          Create Account
        </Button>
        <div className="mt-3 text-center text-sm">
          Already have account? <span className="text-blue-600 cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('open-auth-login'))}>Sign In</span>
        </div>
        <div className="flex items-center justify-center text-xs text-gray-500 mt-2">
          <Shield className="h-3 w-3 mr-1" />
          Your data is securely encrypted
        </div>
      </div>
    </form>
    </>
  );
};
