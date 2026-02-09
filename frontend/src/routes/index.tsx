import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PatientDashboard } from '../components/patient/PatientDashboard';
import { DoctorDashboard } from '../components/doctor/DoctorDashboard';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { ConsentPage } from '../components/auth/ConsentPage';
import { Patient, Doctor, Hospital } from '../types';

interface AppRoutesProps {
  user: Patient | Doctor | Hospital;
  onLogout: () => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ user, onLogout }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          user.userType === 'patient' ? (
            (user as Patient).consent_signed ? (
              <Navigate to="/patient/dashboard" replace />
            ) : (
              <Navigate to="/consent" replace />
            )
          ) : user.userType === 'doctor' ? (
            <DoctorDashboard doctor={user as Doctor} />
          ) : (
            <AdminDashboard hospital={user as Hospital} onLogout={onLogout} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          user.userType === 'patient' ? (
            <Navigate to="/patient/dashboard" replace />
          ) : user.userType === 'doctor' ? (
            <DoctorDashboard doctor={user as Doctor} />
          ) : (
            <AdminDashboard hospital={user as Hospital} onLogout={onLogout} />
          )
        }
      />
      
      {/* Patient routes */}
      {user.userType === 'patient' && (
        <>
          <Route path="/patient/dashboard" element={<PatientDashboard patient={user as Patient} />} />
          <Route path="/patient/book-appointment" element={<PatientDashboard patient={user as Patient} />} />
          <Route path="/patient/appointments" element={<PatientDashboard patient={user as Patient} />} />
          <Route path="/patient/records" element={<PatientDashboard patient={user as Patient} />} />
          <Route path="/patient/emergency" element={<PatientDashboard patient={user as Patient} />} />
        </>
      )}
      
      {/* Admin specific routes */}
      {user.userType === 'hospital' && (
        <Route path="/admin/*" element={<AdminDashboard hospital={user as Hospital} onLogout={onLogout} />} />
      )}
      
      {user.userType === 'patient' && (
        <Route path="/consent" element={<ConsentPage />} />
      )}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
