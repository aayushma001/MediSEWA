import React from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  Users, 
  Calendar, 
  Star, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut,
  User,
  Share2,
  Lock,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { User as UserType } from '../../types';

interface SidebarProps {
  user: UserType;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'requests', label: 'Requests', icon: Clock, badge: 2 },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'timings', label: 'Available Timings', icon: Clock },
    { id: 'patients', label: 'My Patients', icon: Users },
    { id: 'specialties', label: 'Specialties & Services', icon: Briefcase },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'accounts', label: 'Accounts', icon: FileText },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'payout', label: 'Payout Settings', icon: CreditCard },
    { id: 'messages', label: 'Message', icon: MessageSquare, badge: 7 },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'profile-settings', label: 'Profile Settings', icon: User },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'logout', label: 'Logout', icon: LogOut, action: onLogout },
  ];

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Profile Section */}
      <div className="p-6 text-center border-b border-gray-100">
        <div className="relative inline-block mb-4">
          <img 
            src={user.doctor_profile?.profile_picture || "https://via.placeholder.com/150"} 
            alt={user.name} 
            className="w-28 h-28 rounded-full border-4 border-gray-50 shadow-lg object-cover mx-auto"
          />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{user.name || `${user.first_name} ${user.last_name}`}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {user.doctor_profile?.qualification || 'BDS, MDS'} - {user.doctor_profile?.specialization || 'Specialist'}
        </p>
        
        {/* Availability Toggle */}
        <div className="mt-6 text-left">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Availability <span className="text-red-500">*</span></span>
            </div>
             <select className="w-full p-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block">
                <option>I am Available Now</option>
                <option>Not Available</option>
             </select>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => item.action ? item.action() : setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
              activeTab === item.id 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.label}
            </div>
            {item.badge && (
              <span className="bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};
