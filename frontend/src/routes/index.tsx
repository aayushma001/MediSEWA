import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PatientDashboard } from '../components/patient/PatientDashboard';
import { DoctorDashboard } from '../components/doctor/DoctorDashboard';
import { Patient, Doctor, Hospital } from '../types';

interface AppRoutesProps {
  user: Patient | Doctor | Hospital;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ user }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          user.userType === 'patient' ? (
            <PatientDashboard patient={user as Patient} />
          ) : (
            <DoctorDashboard doctor={user as Doctor} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          user.userType === 'patient' ? (
            <PatientDashboard patient={user as Patient} />
          ) : user.userType === 'doctor' ? (
            <DoctorDashboard doctor={user as Doctor} />
          ) : (
            <div className="p-8 text-center">Hospital Dashboard coming soon</div>
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};