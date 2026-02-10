import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Users } from 'lucide-react';
import { getStoredToken } from '../../utils/auth';

interface ProfileSettingsFormProps {
  user: User;
  onSuccess: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({ 
  user, 
  onSuccess, 
  onCancel,
  isModal = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    nmcNumber: '',
    contactNumber: '',
    address: '',
    gender: '',
    dob: '',
    about: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user.user_type === 'doctor') {
      setProfileData({
        nmcNumber: user.doctor_profile?.nmc_number || '',
        contactNumber: user.doctor_profile?.contact_number || user.mobile || '',
        address: user.doctor_profile?.address || '',
        gender: user.doctor_profile?.gender || '',
        dob: user.doctor_profile?.date_of_birth || '',
        about: user.doctor_profile?.about || ''
      });
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('profile_picture', selectedFile);
      }
      formData.append('nmc_number', profileData.nmcNumber);
      formData.append('contact_number', profileData.contactNumber);
      formData.append('address', profileData.address);
      formData.append('gender', profileData.gender);
      formData.append('date_of_birth', profileData.dob);
      formData.append('about', profileData.about);

      const token = getStoredToken();
      const response = await fetch('http://localhost:8000/api/profile/update/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        alert('Failed to update profile: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Upload */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative w-32 h-32 mb-4">
          <img 
            src={previewUrl || user.doctor_profile?.profile_picture || "https://via.placeholder.com/150"} 
            alt="Profile Preview" 
            className="w-full h-full rounded-full object-cover border-4 border-gray-100 shadow-md"
          />
          <label 
            htmlFor="profile-upload" 
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Users className="h-4 w-4" />
          </label>
          <input 
            id="profile-upload" 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </div>
        <p className="text-sm text-gray-500">Upload a professional passport size photo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          name="nmcNumber"
          label="NMC Number (Medical License)"
          value={profileData.nmcNumber}
          onChange={handleChange}
          required
          placeholder="e.g. 12345"
        />
        <Input
          name="contactNumber"
          label="Contact Number"
          value={profileData.contactNumber}
          onChange={handleChange}
          required
          placeholder="e.g. +977 9800000000"
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
          <select
            name="gender"
            value={profileData.gender}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <Input
          name="dob"
          label="Date of Birth"
          type="date"
          value={profileData.dob}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
        <textarea
          name="address"
          value={profileData.address}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
          placeholder="Clinic or Residential Address"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
        <textarea
          name="about"
          value={profileData.about}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
          placeholder="Short bio..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        {isModal && onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={onCancel}
          >
            Complete Later
          </Button>
        )}
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          loading={loading}
        >
          Save & Continue
        </Button>
      </div>
    </form>
  );
};
