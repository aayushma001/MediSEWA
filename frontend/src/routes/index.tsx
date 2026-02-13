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
                bio: user.doctor_profile?.about,
                doctor_unique_id: user.doctor_profile?.doctor_unique_id
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
                age: user.patient_profile?.age || 30,
                gender: user.patient_profile?.gender || 'Male',
                blood_group: user.patient_profile?.blood_group || 'O+',
                address: user.patient_profile?.address || 'Kathmandu',
                patient_unique_id: user.patient_profile?.patient_unique_id || 'Generating...',
                mobile: user.patient_profile?.mobile || user.mobile,
                phone_number: user.patient_profile?.phone_number,
                alternate_phone: user.patient_profile?.alternate_phone,
                bloodGroup: user.patient_profile?.bloodGroup,
                nidNumberPatient: user.patient_profile?.nidNumberPatient,
                nid_number: user.patient_profile?.nid_number,
                healthCondition: user.patient_profile?.healthCondition,
                health_condition: user.patient_profile?.health_condition,
                medications: user.patient_profile?.medications,
                allergies: user.patient_profile?.allergies,
                emergency_contact: user.patient_profile?.emergency_contact,
                emergency_contact_name: user.patient_profile?.emergency_contact_name,
                province: user.patient_profile?.province,
                district: user.patient_profile?.district,
                city: user.patient_profile?.city,
                postal_code: user.patient_profile?.postal_code,
                date_of_birth: user.patient_profile?.date_of_birth,
                profile_image: user.patient_profile?.profile_image
              }}
              onLogout={onLogout}
            />
          )

        }
      />

      <Route
        path="/patient/*"
        element={
          user.user_type === 'patient' ? (
            <PatientDashboard
              patient={{
                id: user.id,
                user: user,
                age: user.patient_profile?.age || 30,
                gender: user.patient_profile?.gender || 'Male',
                blood_group: user.patient_profile?.blood_group || 'O+',
                address: user.patient_profile?.address || 'Kathmandu',
                patient_unique_id: user.patient_profile?.patient_unique_id || 'Generating...',
                mobile: user.patient_profile?.mobile || user.mobile,
                phone_number: user.patient_profile?.phone_number,
                alternate_phone: user.patient_profile?.alternate_phone,
                bloodGroup: user.patient_profile?.bloodGroup,
                nidNumberPatient: user.patient_profile?.nidNumberPatient,
                nid_number: user.patient_profile?.nid_number,
                healthCondition: user.patient_profile?.healthCondition,
                health_condition: user.patient_profile?.health_condition,
                medications: user.patient_profile?.medications,
                allergies: user.patient_profile?.allergies,
                emergency_contact: user.patient_profile?.emergency_contact,
                emergency_contact_name: user.patient_profile?.emergency_contact_name,
                province: user.patient_profile?.province,
                district: user.patient_profile?.district,
                city: user.patient_profile?.city,
                postal_code: user.patient_profile?.postal_code,
                date_of_birth: user.patient_profile?.date_of_birth,
                profile_image: user.patient_profile?.profile_image
              }}
              onLogout={onLogout}
            />
          ) : (
            <Navigate to="/" replace />
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
                bio: user.doctor_profile?.about,
                doctor_unique_id: user.doctor_profile?.doctor_unique_id
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
