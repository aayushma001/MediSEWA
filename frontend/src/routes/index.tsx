import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { User } from '../types';
import { DoctorDashboard } from '../components/doctor/DoctorDashboard';
import { HospitalDashboard } from '../components/hospital/HospitalDashboard';
import { DashboardHome } from '../components/hospital/pages/DashboardHome';
import { Appointments } from '../components/hospital/pages/Appointments';
import { Specialities } from '../components/hospital/pages/Specialities';
import { Doctors } from '../components/hospital/pages/Doctors';
import { Patients } from '../components/hospital/pages/Patients';
import { Reviews } from '../components/hospital/pages/Reviews';
import { Transactions } from '../components/hospital/pages/Transactions';
import { Settings } from '../components/hospital/pages/Settings';
import { Reports } from '../components/hospital/pages/Reports';
import { Profile } from '../components/hospital/pages/Profile';

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
            <Navigate to="/hospital" replace />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
              <h1 className="text-2xl font-bold mb-4">Welcome to HealthCare Platform</h1>
              <p className="text-gray-600">Patient Dashboard is under construction.</p>
            </div>
          )
        }
      />

      {/* Nested Hospital Routes */}
      {user.user_type === 'hospital' && (
        <Route path="/hospital" element={<HospitalDashboard user={user} onLogout={onLogout} />}>
          <Route index element={<DashboardHome />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="specialities" element={<Specialities />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="patients" element={<Patients />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile user={user} />} />
        </Route>
      )}
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
