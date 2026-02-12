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
import { PatientDashboard } from '../components/patient/PatientDashboard';

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
            <DoctorDashboard
              doctor={{
                id: user.id,
                user: user,
                specialization: user.doctor_profile?.specialization || 'General Physician',
                medicalDegree: user.doctor_profile?.qualification,
                experience: user.doctor_profile?.experience_years?.toString(),
                bio: user.doctor_profile?.about
              }}
              onLogout={onLogout}
            />
          ) : user.user_type === 'hospital' ? (
            <Navigate to="/hospital" replace />
          ) : (
            <PatientDashboard
              patient={{
                id: user.id,
                user: user,
                age: 30, // Default/Placeholder age
                gender: 'Male', // Default/Placeholder gender
                blood_group: 'O+', // Default/Placeholder
                address: 'Kathmandu' // Default/Placeholder
              }}
              onLogout={onLogout}
            />
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
          <Route path="settings" element={<Settings user={user} />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile user={user} />} />
        </Route>
      )}
      <Route
        path="/settings"
        element={
          user.user_type === 'doctor' ? (
            <DoctorDashboard
              doctor={{
                id: user.id,
                user: user,
                specialization: user.doctor_profile?.specialization || 'General Physician',
                medicalDegree: user.doctor_profile?.qualification,
                experience: user.doctor_profile?.experience_years?.toString(),
                bio: user.doctor_profile?.about
              }}
              onLogout={onLogout}
              initialTab="profile"
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
