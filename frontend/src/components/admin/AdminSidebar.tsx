import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Stethoscope, 
  UserCheck, 
  Users, 
  Star, 
  CreditCard, 
  Settings, 
  FileText, 
  User, 
  Lock, 
  AlertTriangle, 
  File, 
  Layers, 
  Table 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { label: 'Main', isHeader: true },
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/admin/specialities', icon: Stethoscope, label: 'Specialities' },
    { path: '/admin/doctors', icon: UserCheck, label: 'Doctors' },
    { path: '/admin/patients', icon: Users, label: 'Patients' },
    { path: '/admin/reviews', icon: Star, label: 'Reviews' },
    { path: '/admin/transactions', icon: CreditCard, label: 'Transactions' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
    { path: '/admin/reports', icon: FileText, label: 'Reports', hasSubmenu: true },
    { label: 'Pages', isHeader: true },
    { path: '/admin/profile', icon: User, label: 'Profile' },
    { path: '/admin/auth', icon: Lock, label: 'Authentication', hasSubmenu: true },
    { path: '/admin/errors', icon: AlertTriangle, label: 'Error Pages', hasSubmenu: true },
    { path: '/admin/blank', icon: File, label: 'Blank Page' },
    { label: 'UI Interface', isHeader: true },
    { path: '/admin/components', icon: Layers, label: 'Components' },
    { path: '/admin/forms', icon: Table, label: 'Forms', hasSubmenu: true },
  ];

  return (
    <div className="w-64 bg-slate-800 text-gray-400 h-screen overflow-y-auto flex-shrink-0 transition-all duration-300">
      <div className="p-4">
        {menuItems.map((item, index) => {
          if (item.isHeader) {
            return (
              <div key={index} className="text-xs font-semibold uppercase tracking-wider mb-2 mt-4 px-3">
                {item.label}
              </div>
            );
          }

          const Icon = item.icon as React.ElementType;
          const active = isActive(item.path || '');

          return (
            <Link
              key={index}
              to={item.path || '#'}
              className={`flex items-center px-3 py-2 rounded-lg mb-1 transition-colors ${
                active 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="flex-1">{item.label}</span>
              {item.hasSubmenu && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
