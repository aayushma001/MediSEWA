import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const MedicalRecordsPage = lazy(() => import('./pages/MedicalRecordsPage'));
const ReceiptsPage = lazy(() => import('./pages/ReceiptsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const HospitalsPage = lazy(() => import('./pages/HospitalsPage'));
const DoctorsPage = lazy(() => import('./pages/DoctorsPage'));
const VideoCallPage = lazy(() => import('./pages/VideoCallPage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-slate-600 font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="antialiased text-slate-900 selection:bg-blue-100 selection:text-blue-700 font-sans">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/book-appointment" element={<BookingPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/hospitals" element={<HospitalsPage />} />
          <Route path="/records" element={<MedicalRecordsPage />} />
          <Route path="/receipts" element={<ReceiptsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/video-call" element={<VideoCallPage />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
