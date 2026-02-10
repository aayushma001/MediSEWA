import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { User } from '../types';
import { DoctorDashboard } from '../components/doctor/DoctorDashboard';
import { HospitalDashboard } from '../components/hospital/HospitalDashboard';

interface AppRoutesProps {
  user: User;
  onLogout: () => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ user, onLogout }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          user.user_type === 'doctor' ? (
            <DoctorDashboard user={user} onLogout={onLogout} />
          ) : user.user_type === 'hospital' ? (
            <HospitalDashboard user={user} onLogout={onLogout} />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
                <h1 className="text-2xl font-bold mb-4">Welcome to HealthCare Platform</h1>
                <p className="text-gray-600">Patient Dashboard is under construction.</p>
            </div>
          )
        }
      />
      <Route 
        path="/settings" 
        element={
          user.user_type === 'doctor' ? (
            <DoctorDashboard user={user} onLogout={onLogout} initialTab="profile-settings" />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
