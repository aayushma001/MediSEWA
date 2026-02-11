import React, { useState } from 'react';
import { User } from '../../types';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  Bell,
  Search,
  Menu,
  User as UserIcon
} from 'lucide-react';

interface HospitalDashboardProps {
  user: User;
  onLogout: () => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-[#2c3e50] text-white transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'} fixed h-full z-30`}>
        {/* Sidebar Header - MediSewa branding restored */}
        <div className="h-20 flex items-center justify-center border-b border-gray-700 bg-[#243342]">
          <h1 className={`font-bold text-2xl tracking-wider text-[#00d0f1] ${!sidebarOpen && 'hidden'}`}>MEDISEWA</h1>
          <span className={`font-bold text-2xl text-[#00d0f1] ${sidebarOpen && 'hidden'}`}>MS</span>
        </div>

        <div className="py-6 h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar">
          <div className="px-6 mb-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Main</div>
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
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-gray-100 mr-4 text-gray-600">
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative hidden md:block">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0f1] focus:border-transparent w-64 bg-gray-50"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationsDropdown />
            <div className="flex items-center space-x-3 ml-4 border-l pl-4 border-gray-200">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-gray-800">{user.hospital_profile?.hospital_name || 'Hospital Admin'}</div>
                <div className="text-xs text-gray-500 font-mono">ID: {user.hospital_profile?.hospital_id || 'N/A'}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-50">
                {user.hospital_profile?.logo ? (
                  <img
                    src={user.hospital_profile.logo}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-bold text-lg">
                    {user.hospital_profile?.hospital_name?.charAt(0).toUpperCase() || 'H'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Outlet is where child routes (DashboardHome, Appointments, etc.) are rendered */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
