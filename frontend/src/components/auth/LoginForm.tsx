import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { LoginFormData } from '../../types';
import { Stethoscope, Shield } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  loading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    userType: 'patient'
  });
  const [remember, setRemember] = useState(true);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const handleSocial = (provider: 'google' | 'facebook') => {
    setOauthNotice(`${provider === 'google' ? 'Google' : 'Facebook'} sign-in is not yet configured. Please use Email/Password for now.`);
    setTimeout(() => setOauthNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-700 mb-3">
          <Stethoscope className="h-7 w-7" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          {formData.userType === 'patient' && 'Patient Login'}
          {formData.userType === 'doctor' && 'Doctor Login'}
          {formData.userType === 'hospital' && 'Hospital Admin Login'}
        </h3>
        <p className="text-gray-600 text-sm">Sign in to access your dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          name="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <Input
          name="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Remember me</span>
          </label>
          <a className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">Forgot password?</a>
        </div>
        
        <Button 
          type="submit" 
          loading={loading} 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
        >
          Sign In
        </Button>

        <div className="flex items-center justify-center text-xs text-gray-500 mt-2">
          <Shield className="h-3 w-3 mr-1" />
          Your data is securely encrypted
        </div>

        <div className="space-y-3 mt-6">
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
      </form>
    </div>
  );
};
