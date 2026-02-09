import React from 'react';
import { Menu, Search, Bell, User, ChevronDown } from 'lucide-react';
import { Hospital } from '../../types';

interface AdminHeaderProps {
  user: Hospital;
  onLogout: () => void;
  toggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ user, onLogout, toggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center">
        <div className="flex items-center mr-8">
          <img src="/vite.svg" alt="Logo" className="h-8 w-8 mr-2" />
          <span className="text-xl font-bold text-blue-600">Hospital</span>
        </div>
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100 lg:hidden">
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100 hidden lg:block">
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
        
        <div className="hidden md:flex items-center ml-4 bg-gray-100 rounded-full px-4 py-2 w-64">
          <Search className="h-4 w-4 text-gray-500 mr-2" />
          <input 
            type="text" 
            placeholder="Search here" 
            className="bg-transparent border-none focus:outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell className="h-6 w-6 text-gray-600" />
          <span className="absolute top-1 right-1 h-4 w-4 bg-blue-600 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-white">
            3
          </span>
        </button>
        
        <div className="flex items-center space-x-3 pl-4 border-l">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {user.user.first_name ? (
              <span className="text-gray-600 font-bold text-lg">{user.user.first_name[0]}</span>
            ) : (
              <User className="h-6 w-6 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
