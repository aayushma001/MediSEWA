import React from 'react';
import { LogOut, User, Stethoscope } from 'lucide-react';
import { Button } from '../ui/Button';
import { Patient, Doctor, Hospital } from '../../types';

interface HeaderProps {
  user: Patient | Doctor | Hospital;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200 rotate-3">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-black tracking-tighter text-gray-900 flex items-center">
                Medi<span className="text-blue-600">SEWA</span>
                <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Universal Clinical Ops</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-xl">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <span className="text-sm font-medium text-gray-700 block">
                  {user.name}
                </span>
                <span className="text-xs text-gray-500">
                  {user.userType === 'patient' ? 'Patient' : user.userType === 'doctor' ? 'Doctor' : 'Hospital'}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};