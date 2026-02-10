import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { User } from '../../types';
import { 
  Users, 
  Calendar, 
  Video,
  Check,
  X,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { ProfileSettingsForm } from './ProfileSettingsForm';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
  initialTab?: string;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user, onLogout, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'dashboard');
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  
  // Update activeTab if initialTab changes (e.g. navigation)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    // Check if critical profile info is missing
    if (user.user_type === 'doctor') {
       const isProfileIncomplete = !user.doctor_profile?.profile_picture || 
                                   !user.doctor_profile?.nmc_number ||
                                   !user.doctor_profile?.contact_number;
       
       if (isProfileIncomplete) {
          setShowProfileUpload(true);
       }
    }
  }, [user]);

  const handleProfileUpdateSuccess = () => {
    alert('Profile updated successfully!');
    setShowProfileUpload(false);
    window.location.reload();
  };

  // Mock Data
  const stats = [
    { label: 'Total Patient', value: '0', sub: 'Till Today', icon: Users, color: 'text-pink-500', bg: 'bg-pink-100' },
    { label: 'Patients Today', value: '0', sub: '06, Nov 2019', icon: Users, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { label: 'Appointments Today', value: '0', sub: '06, Apr 2019', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Verification Banner */}
      {user.user_type === 'doctor' && !user.doctor_profile?.is_verified && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Account Pending Verification</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your account is currently under review by the administrator. Some features may be limited until verification is complete.
              Please ensure your profile is complete with a valid NMC number and passport-sized photo.
            </p>
          </div>
        </div>
      )}

      {showProfileUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
                <p className="text-gray-600 mb-6">Please provide the following details to verify your account and start practicing.</p>
                
                <ProfileSettingsForm 
                  user={user} 
                  onSuccess={handleProfileUpdateSuccess} 
                  onCancel={() => setShowProfileUpload(false)}
                  isModal={true}
                />
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Sidebar 
            user={user} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onLogout={onLogout} 
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <span className="text-gray-600 font-medium">{stat.label}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-sm text-gray-400 mt-1">{stat.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                 {/* Left Column */}
                 <div className="xl:col-span-2 space-y-8">
                    {/* Weekly Overview (Chart Placeholder) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Weekly Overview</h3>
                            <div className="flex gap-4">
                                <span className="text-sm text-gray-500">Revenue</span>
                                <span className="text-sm text-gray-500">Appointments</span>
                            </div>
                        </div>
                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                            Chart Visualization Area
                        </div>
                    </div>

                    {/* Upcoming Appointment */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                             <h3 className="text-lg font-bold text-gray-900">Upcoming Appointment</h3>
                        </div>
                        <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <img src="https://via.placeholder.com/100" className="w-12 h-12 rounded-lg bg-white/20" alt="Patient" />
                                    <div>
                                        <p className="font-medium text-white/90">#Apt0001</p>
                                        <h4 className="font-bold text-lg">Adrian Marshall</h4>
                                        <div className="mt-4 flex gap-3">
                                            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg text-sm">
                                                <Video className="h-4 w-4" />
                                                Video Appointment
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/80 text-sm">General Visit</p>
                                    <p className="font-bold text-lg">Today, 10:45 AM</p>
                                    <div className="mt-4 flex gap-2 justify-end">
                                        <button className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Chat</button>
                                        <button className="px-4 py-1.5 bg-white text-blue-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">Start Appointment</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Right Column */}
                 <div className="xl:col-span-1 space-y-8">
                    {/* Appointment List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Appointment</h3>
                            <select className="text-sm border-gray-200 rounded-lg text-gray-500 outline-none">
                                <option>Last 7 Days</option>
                                <option>Today</option>
                                <option>Upcoming</option>
                            </select>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <img src={`https://via.placeholder.com/40?text=${i}`} className="w-10 h-10 rounded-lg" alt="Patient" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Patient Name</p>
                                            <p className="text-xs text-blue-500">#Apt000{i}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100">
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Clinics & Availability */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">Clinics & Availability</h3>
                                <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
                            </div>
                            {/* Hospital Filter */}
                            <select className="w-full text-sm border-gray-200 rounded-lg text-gray-700 outline-none p-2 bg-gray-50">
                                <option value="">Filter by Hospital/Clinic</option>
                                <option value="sofi">Sofi's Clinic</option>
                                <option value="city">City Hospital</option>
                                <option value="general">General Medical Center</option>
                            </select>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <img src="https://via.placeholder.com/40" className="w-10 h-10 rounded-lg" alt="Clinic" />
                                        <div>
                                            <h4 className="font-bold text-gray-900">Sofi's Clinic</h4>
                                            <p className="text-xs text-gray-500">Dentist</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-900">$900</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Mon - Fri</span>
                                        <span>09:00 AM - 05:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          )}
          
          {activeTab === 'profile-settings' && (
             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                 <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                 <ProfileSettingsForm 
                    user={user} 
                    onSuccess={handleProfileUpdateSuccess} 
                 />
             </div>
          )}

          {activeTab !== 'dashboard' && activeTab !== 'profile-settings' && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center min-h-[400px] flex flex-col items-center justify-center">
                  <div className="p-4 bg-gray-50 rounded-full mb-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">{activeTab.replace('-', ' ')}</h2>
                  <p className="text-gray-500 max-w-md mx-auto">
                      This section is currently under development. The requested functionality for {activeTab.replace('-', ' ')} will be implemented in the next phase.
                  </p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
