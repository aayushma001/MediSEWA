import React, { useEffect, useState } from 'react';
import { Patient } from '../../types';
import {
  Home,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Activity,
  Menu,
  ChevronRight,
  MapPin,
  Search,
  Sparkles,
  Heart,
  Lightbulb,
  Users,
  Bell,
  Brain
} from 'lucide-react';
import { Button } from '../ui/Button';
import BookAppointment from './BookAppointment';
import { MyAppointments } from './MyAppointments';
import { MedicalRecords } from './MedicalRecords';
import { EmergencySearch } from './EmergencySearch';
import { TherapyWellness } from './TherapyWellness';
import { PatientProfileSettings } from './PatientProfileSettings';
import { useLocation, useNavigate } from 'react-router-dom';

interface PatientDashboardProps {
  patient: Patient;
  onLogout: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ patient, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Ensure this pulls from the correct field
  const patientId = patient.patient_unique_id || 'Generating...';

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'book-appointment', label: 'Book Appointment', icon: Calendar },
    { id: 'emergency', label: 'Emergency', icon: Activity },
    { id: 'therapy', label: 'Therapy & Wellness', icon: Brain },
    { id: 'appointments', label: 'My Appointments', icon: FileText },
    { id: 'records', label: 'My Records', icon: FileText },
    { id: 'settings', label: 'Profile & Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/patient/book-appointment')) setActiveTab('book-appointment');
    else if (path.includes('/patient/appointments')) setActiveTab('appointments');
    else if (path.includes('/patient/records')) setActiveTab('records');
    else if (path.includes('/patient/emergency')) setActiveTab('emergency');
    else if (path.includes('/patient/therapy')) setActiveTab('therapy');
    else if (path.includes('/patient/settings')) setActiveTab('settings');
    else setActiveTab('home');
  }, [location.pathname]);

  const handleNav = (id: string) => {
    if (id === 'logout') {
      onLogout();
      return;
    }

    // Explicit routing for sidebar items
    const routes: Record<string, string> = {
      'home': '/patient/dashboard',
      'book-appointment': '/patient/book-appointment',
      'appointments': '/patient/appointments',
      'records': '/patient/records',
      'emergency': '/patient/emergency',
      'therapy': '/patient/therapy',
      'settings': '/patient/settings',
    };

    const targetRoute = routes[id] ?? '/patient/dashboard';
    navigate(targetRoute);
    setSidebarOpen(false);
  };

  // Full bleed for certain tabs
  const isFullBleed = activeTab === 'book-appointment' || activeTab === 'emergency';

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HealthFeed patient={patient} onNavigate={handleNav} />;
      case 'book-appointment':
        return <BookAppointment patientId={patientId} />;
      case 'appointments':
        return <MyAppointments patientId={patient.id.toString()} />;
      case 'records':
        return <MedicalRecords patientId={patient.id.toString()} />;
      case 'emergency':
        return <EmergencySearch />;
      case 'therapy':
        return <TherapyWellness patient={patient} />;
      case 'settings':
        return <PatientProfileSettings patient={patient} />;
      default:
        return <HealthFeed patient={patient} onNavigate={handleNav} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Profile */}
          <div className="p-6 border-b border-gray-100 text-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <div className="w-24 h-24 mx-auto bg-white rounded-full mb-4 overflow-hidden border-4 border-white shadow-lg">
              <img
                src={`https://ui-avatars.com/api/?name=${patient.user.first_name}+${patient.user.last_name}&background=random`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold">
              {patient.user.first_name} {patient.user.last_name}
            </h2>
            <p className="text-sm text-blue-100 mt-1">ID: {patientId}</p>
            <div className="mt-2 flex items-center justify-center space-x-1 text-xs text-blue-100">
              <MapPin className="h-3 w-3" />
              <span>{patient.city || patient.province || 'Location'}</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:scale-102'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 mb-2">Need help?</p>
              <div className="text-sm font-medium text-blue-600">Contact Support</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-72">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded-md hover:bg-gray-100">
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <span className="font-bold text-lg">HealthCare</span>
          <button className="p-1 rounded-md hover:bg-gray-100">
            <Bell className="h-6 w-6 text-gray-600" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

/* ── Health Feed (Home) ──────────────────────────────────────── */
const HealthFeed: React.FC<{ patient: Patient; onNavigate: (id: string) => void }> = ({
  patient,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const feedItems = [
    {
      type: 'therapy-prompt',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      title: 'Feeling anxious today?',
      description: 'Start a guided therapy session with our AI wellness coach',
      action: 'Start Session',
      actionFn: () => onNavigate('therapy')
    },
    {
      type: 'tip',
      icon: Heart,
      color: 'from-red-500 to-orange-500',
      title: '5 Early Signs of Heart Problems',
      description: 'Learn the warning signs that you should never ignore',
      action: 'Read More'
    },
    {
      type: 'nutrition',
      icon: Lightbulb,
      color: 'from-green-500 to-teal-500',
      title: 'Today\'s Nutrition Tip',
      description: 'Drinking water 30 minutes before meals can help with digestion and weight management',
      action: 'Learn More'
    },
    {
      type: 'community',
      icon: Users,
      color: 'from-indigo-500 to-purple-500',
      title: 'Community Health Discussion',
      description: 'Join the conversation about managing stress in modern life',
      action: 'Join Discussion'
    },
    {
      type: 'ai-suggestion',
      icon: Sparkles,
      color: 'from-yellow-500 to-orange-500',
      title: 'Personalized Health Insight',
      description: 'Based on your profile, we recommend a general health checkup this month',
      action: 'Book Checkup',
      actionFn: () => onNavigate('book-appointment')
    }
  ];

  return (
    <div className="w-full">
      {/* Top Section - Sticky */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome back, {patient.user.first_name}! 👋
          </h1>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors, symptoms, health topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={() => onNavigate('book-appointment')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-center space-x-2 py-3"
            >
              <Calendar className="h-5 w-5" />
              <span>Book Now</span>
            </Button>
            <Button
              onClick={() => onNavigate('therapy')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white flex items-center justify-center space-x-2 py-3"
            >
              <Brain className="h-5 w-5" />
              <span>Therapy</span>
            </Button>
            <Button
              onClick={() => onNavigate('emergency')}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white flex items-center justify-center space-x-2 py-3 animate-pulse"
            >
              <Activity className="h-5 w-5" />
              <span>Emergency</span>
            </Button>
            <Button
              onClick={() => onNavigate('records')}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white flex items-center justify-center space-x-2 py-3"
            >
              <FileText className="h-5 w-5" />
              <span>Records</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-4">
        {feedItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {item.description}
                    </p>
                    <Button
                      onClick={item.actionFn}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-4"
                    >
                      {item.action} →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Upcoming Appointments Preview */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Your Next Appointment</h3>
            <Calendar className="h-6 w-6" />
          </div>
          <p className="text-blue-100 mb-4">
            You don't have any upcoming appointments yet
          </p>
          <Button
            onClick={() => onNavigate('book-appointment')}
            className="bg-white text-blue-600 hover:bg-blue-50 w-full py-3"
          >
            Schedule Your First Appointment
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ── Profile Settings (Moved to separate file) ────────────────────── */
/* Use Imported Component */