import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { authAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const ConsentPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAgree = async () => {
    try {
      setLoading(true);
      await authAPI.patientConsent();
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.user && user.user.user_type === 'patient') {
          user.consent_signed = true;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
      navigate('/dashboard', { replace: true });
    } catch (e) {
      alert('Failed to record consent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Patient Consent & Terms</h1>
        <p className="text-gray-600 mb-6">Please review and accept the consent to continue.</p>
        <div className="h-72 overflow-y-auto pr-2 text-gray-700 space-y-4 border rounded-lg p-4 bg-gray-50">
          <p><strong>1. Data Collection & Usage:</strong> I consent to the collection and processing of my personal health information by Medico for healthcare purposes.</p>
          <p><strong>2. Medical Purpose:</strong> My data will be used for diagnosis, treatment, and care management by authorized medical professionals.</p>
          <p><strong>3. Privacy & Confidentiality:</strong> My information will be kept confidential and only shared as required by law or with my consent.</p>
          <p><strong>4. Emergency Access:</strong> I authorize sharing critical health data with emergency responders when necessary.</p>
          <p><strong>5. Consent Revocation:</strong> I may revoke consent at any time by contacting hospital administration, acknowledging it may affect care quality.</p>
        </div>
        <div className="flex items-center gap-4 pt-6">
          <Button onClick={handleAgree} loading={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl">
            I Agree & Continue
          </Button>
          <button onClick={() => navigate('/', { replace: true })} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl border border-gray-200 py-3">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
