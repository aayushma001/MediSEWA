import React, { useState } from 'react';
import { User } from '../../types';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { NotificationsDropdown } from './NotificationsDropdown';
import {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  UserRound,
  Users,
  Star,
  CreditCard,
  Settings,
  FileText,
  LogOut,
  Search,
  Menu,
  User as UserIcon
} from 'lucide-react';

import { adminAPI } from '../../services/api';

interface HospitalDashboardProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ user, onLogout, onUserUpdate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleUpdateProfile = async (updatedData: any) => {
    try {
      const response = await adminAPI.updateProfile(updatedData);
      // The response is the updated hospital profile.
      // We need to merge it back into the user object.
      const updatedUser = {
        ...user,
        hospital_profile: response
      };
      onUserUpdate(updatedUser);
    } catch (error) {
      console.error('Error refreshing/updating hospital profile:', error);
      throw error;
    }
  };

  const handleRefreshProfile = async () => {
    try {
      const response = await adminAPI.getProfile();
      // The response is the full user object from get_profile view
      onUserUpdate(response);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/hospital' },
    { icon: Calendar, label: 'Appointments', path: '/hospital/appointments' },
    { icon: Stethoscope, label: 'Specialities', path: '/hospital/specialities' },
    { icon: UserRound, label: 'Doctors', path: '/hospital/doctors' },
    { icon: Users, label: 'Patients', path: '/hospital/patients' },
    { icon: Star, label: 'Reviews', path: '/hospital/reviews' },
    { icon: CreditCard, label: 'Transactions', path: '/hospital/transactions' },
    { icon: Settings, label: 'Settings', path: '/hospital/settings' },
    { icon: FileText, label: 'Reports', path: '/hospital/reports' },
    { icon: UserIcon, label: 'Profile', path: '/hospital/profile' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Determine active item based on current path
  const isActive = (path: string) => {
    // Exact match for dashboard home
    if (path === '/hospital' && (location.pathname === '/hospital' || location.pathname === '/hospital/')) return true;
    // Prefix match for other routes
    if (path !== '/hospital' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen page-bg-themed flex">
      {/* Sidebar */}
      <aside className={`sidebar-themed text-white transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'} fixed h-full z-30`}>
        {/* Sidebar Header - MediSewa branding restored */}
        <div className="h-20 flex items-center justify-center border-b border-gray-700 bg-[#243342]">
          <div className={`${!sidebarOpen ? 'p-2' : 'px-4'} flex items-center justify-center h-full w-full transition-all duration-300`}>
            <img src="/LOGO.png" alt="MediSEWA" className="max-h-16 w-auto object-contain" />
          </div>
        </div>

        <div className="py-6 h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar">
          <nav className="space-y-2 pb-20">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-6 py-4 text-base font-medium transition-colors border-l-4 ${isActive(item.path)
                  ? 'bg-[#2c3e50] border-[#00d0f1] text-[#00d0f1]'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                <item.icon className={`h-6 w-6 mr-4 ${isActive(item.path) ? 'text-[#00d0f1]' : ''}`} />
                <span className={`${!sidebarOpen && 'hidden'}`}>{item.label}</span>
              </button>
            ))}

            <div className="my-6 border-t border-gray-700"></div>

            <button
              onClick={onLogout}
              className="w-full flex items-center px-6 py-4 text-base font-medium text-gray-400 hover:text-red-400 hover:bg-gray-700 border-l-4 border-transparent transition-colors"
            >
              <LogOut className="h-6 w-6 mr-4" />
              <span className={`${!sidebarOpen && 'hidden'}`}>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Header */}
        <header className="header-themed h-20 shadow-sm flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-gray-100 mr-4 header-text-theme">
              <Menu className="h-7 w-7" />
            </button>
            <div className="relative hidden md:block">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00d0f1] focus:border-transparent w-72 bg-gray-50"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationsDropdown />
            <div className="flex items-center space-x-4 ml-4 border-l pl-4 header-border-theme">
              <div className="text-right hidden md:block">
                <div className="text-lg font-bold header-text-theme">{user.hospital_profile?.hospital_name || 'Hospital Admin'}</div>
                <div className="text-sm settings-text-secondary font-mono">ID: {user.hospital_profile?.hospital_unique_id || user.hospital_profile?.hospital_id || 'N/A'}</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-50">
                {localStorage.getItem('hospital-profile-picture') ? (
                  <img
                    src={localStorage.getItem('hospital-profile-picture') || ''}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : user.hospital_profile?.logo ? (
                  <img
                    src={user.hospital_profile.logo}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-bold text-xl">
                    {user.hospital_profile?.hospital_name?.charAt(0).toUpperCase() || 'H'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Outlet is where child routes (DashboardHome, Appointments, etc.) are rendered */}
          <Outlet context={{ onUpdateProfile: handleUpdateProfile, refreshProfile: handleRefreshProfile }} />
        </div>
      </div>
    </div>
  );
};
