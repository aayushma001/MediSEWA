import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { LoginFormData } from '../../types';
import { Shield, Building, Heart, Stethoscope } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  loading?: boolean;
  onRegisterClick: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading, onRegisterClick }) => {
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
  
  const handleSocial = (provider: 'google' | 'facebook' | 'apple') => {
    if (provider === 'google') {
       // Simulate Google Login for now or show notice
       // If we had a real implementation, we would call it here
    }
    setOauthNotice(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in is not yet configured. Please use Email/Password for now.`);
    setTimeout(() => setOauthNotice(null), 5000);
  };

  return (
    <div className="space-y-6 relative pb-16">
      <div className="text-left mb-8 pt-4">
        <h2 className="text-4xl font-bold text-blue-600 mb-2 font-sans tracking-tight uppercase">Welcome</h2>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Login with Email</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-gray-50 p-1 rounded-xl mb-4">
           <Select
             name="userType"
             label=""
             value={formData.userType}
             onChange={handleChange}
             options={[
               { value: 'patient', label: 'Patient' },
               { value: 'doctor', label: 'Doctor' },
               { value: 'hospital', label: 'Hospital Admin' }
             ]}
             className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-600"
             required
           />
        </div>
        
        <div className="space-y-4">
          <Input
            name="email"
            type="email"
            label=""
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Id"
            className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors"
            required
          />
          
          <Input
            name="password"
            type="password"
            label=""
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors"
            required
          />
        </div>

        <div className="flex justify-end">
          <a className="text-xs font-medium text-gray-500 hover:text-blue-600 cursor-pointer transition-colors">Forgot your password?</a>
        </div>
        
        <Button 
          type="submit" 
          loading={loading} 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          LOGIN
        </Button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-medium tracking-widest">OR</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" type="button" className="w-full justify-center h-14 rounded-xl border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm group" onClick={() => handleSocial('google')}>
              <svg className="h-6 w-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EB4335"/>
              </svg>
            </Button>
            <Button variant="outline" type="button" className="w-full justify-center h-14 rounded-xl border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm group" onClick={() => handleSocial('facebook')}>
              <svg className="h-6 w-6 text-[#1877F2] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </Button>
            <Button variant="outline" type="button" className="w-full justify-center h-14 rounded-xl border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm group" onClick={() => handleSocial('apple')}>
              <svg className="h-6 w-6 text-gray-900 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.62 4.37-1.54 1.81.08 3.2 1.25 4.18 2.52-3.69 1.93-3.1 7.03.54 8.7-.65 1.58-1.55 3.12-4.17 2.55zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </Button>
        </div>
        
        {oauthNotice && (
          <div className="text-center text-xs text-red-500 animate-pulse">{oauthNotice}</div>
        )}

        <div className="text-center mt-8">
           <span className="text-gray-500 text-sm">Don't have account? </span>
           <button type="button" onClick={onRegisterClick} className="text-gray-900 font-bold text-sm hover:underline">Register Now</button>
        </div>
      </form>

      {/* Decorative Floating Elements */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <Building className="h-24 w-24 text-blue-900 transform rotate-12 translate-x-8 -translate-y-8" />
      </div>
      <div className="absolute bottom-20 left-0 opacity-10 pointer-events-none">
        <Heart className="h-16 w-16 text-blue-600 transform -rotate-12 -translate-x-4" />
      </div>
      <div className="absolute bottom-0 right-10 opacity-10 pointer-events-none">
        <Stethoscope className="h-20 w-20 text-cyan-700 transform rotate-6 translate-y-4" />
      </div>
    </div>
  );
};
