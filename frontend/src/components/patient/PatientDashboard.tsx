import React, { useEffect, useState } from 'react';
import { Patient } from '../../types';
import {
  Home,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Activity,
  Users,
  Brain,
  Clock,
  Menu,
  ChevronRight,
  MapPin,
  Sparkles,
  Heart,
  Lightbulb,
  Search
} from 'lucide-react';
import { Button } from '../ui/Button';
import BookAppointment from './BookAppointment';
import { MyAppointments } from './MyAppointments';
import { appointmentsAPI } from '../../services/api';
import { MedicalRecords } from './MedicalRecords';
import { EmergencySearch } from './EmergencySearch';
import { TherapyWellness } from './TherapyWellness';
import { PatientProfileSettings } from './PatientProfileSettings';
import { PatientMeeting } from './PatientMeeting';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../common/DashboardHeader';
import { PatientChatbot } from './PatientChatbot';
import { MessageSquare } from 'lucide-react';

interface PatientDashboardProps {
  patient: Patient;
  onLogout: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ patient, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<{ id: string, doctorName: string } | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HealthFeed patient={patient} onNavigate={handleNav} searchQuery={searchQuery} />;
      case 'book-appointment':
        return <BookAppointment patientId={patientId} />;
      case 'appointments':
        return <MyAppointments
          patientId={patient.id.toString()}
          onJoinMeeting={(id, name) => setActiveMeeting({ id, doctorName: name })}
        />;
      case 'records':
        return <MedicalRecords patientId={patient.id.toString()} />;
      case 'emergency':
        return <EmergencySearch />;
      case 'therapy':
        return <TherapyWellness patient={patient} />;
      case 'settings':
        return <PatientProfileSettings patient={patient} />;
      default:
        return <HealthFeed patient={patient} onNavigate={handleNav} searchQuery={searchQuery} />;
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
          {/* Logo Section */}
          <div className="h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center">
            <div className="flex items-center justify-center w-full">
              <img src="/LOGO.png" alt="MediSEWA" className="h-16 w-auto object-contain bg-white/90 rounded-lg p-1" />
            </div>
          </div>

          {/* Profile */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ring-blue-100 overflow-hidden">
                  <img
                    src={`https://ui-avatars.com/api/?name=${patient.user.first_name}+${patient.user.last_name}&background=random`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base truncate">
                  {patient.user.first_name} {patient.user.last_name}
                </h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{patientId}</p>
                <div className="flex items-center mt-1 space-x-1 text-xs text-gray-500">
                  <MapPin size={12} className="text-blue-600" />
                  <span className="truncate">{patient.city || patient.province || 'Nepal'}</span>
                </div>
              </div>
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
        <DashboardHeader
          user={patient.user}
          onLogout={onLogout}
          onNavigateToProfile={() => handleNav('settings')}
          showSearch={activeTab === 'home'}
          searchPlaceholder="Search doctors, symptoms, health topics..."
          onSearchChange={(val) => setSearchQuery(val)}
        />

        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>

      <button
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-110 flex items-center justify-center z-40 group"
      >
        <div className="relative">
          <MessageSquare size={28} className="text-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500 animate-pulse"></div>
        </div>
        <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          AI Medical Assistant
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </button>

      {showChatbot && (
        <PatientChatbot
          patient={patient}
          patientId={patientId}
          onClose={() => setShowChatbot(false)}
        />
      )}

      {activeMeeting && (
        <PatientMeeting
          appointmentId={activeMeeting.id}
          doctorName={activeMeeting.doctorName}
          onClose={() => setActiveMeeting(null)}
        />
      )}
    </div>
  );
};

/* ── Badge Component ────────────────────────────────────────── */
const Badge: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${className}`}>
    {children}
  </span>
);

/* ── Health Feed (Home) ──────────────────────────────────────── */
const HealthFeed: React.FC<{
  patient: Patient;
  onNavigate: (id: string) => void;
  searchQuery: string;
}> = ({
  patient,
  onNavigate,
  searchQuery
}) => {
    const [nextAppointment, setNextAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchNext = async () => {
        try {
          const data = await appointmentsAPI.getAppointments();
          if (data && data.length > 0) {
            const upcoming = data
              .filter((a: any) => a.status !== 'cancelled' && a.status !== 'completed')
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
            setNextAppointment(upcoming);
          }
        } catch (err) {
          console.error("Feed fetch failed:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchNext();
    }, []);

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

    const filteredFeedItems = feedItems.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="w-full">
        <div className="p-4 lg:p-6 bg-white/40">
          <div className="max-w-4xl mx-auto">
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

        <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Your Next Appointment</h3>
              <Calendar className="h-6 w-6" />
            </div>
            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-blue-400 rounded w-3/4"></div>
                  <div className="h-4 bg-blue-400 rounded"></div>
                </div>
              </div>
            ) : nextAppointment ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{nextAppointment.doctor_name}</p>
                    <p className="text-blue-100 text-sm">{nextAppointment.date} @ {nextAppointment.time_slot}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={nextAppointment.status === 'approved' ? 'bg-green-400 text-white' : 'bg-blue-400 text-white'}>
                    {nextAppointment.status}
                  </Badge>
                  <span className="text-xs text-blue-100">Location: {nextAppointment.hospital_name}</span>
                </div>
                <Button
                  onClick={() => onNavigate('appointments')}
                  className="bg-white text-blue-600 hover:bg-blue-50 w-full py-3 mt-2"
                >
                  View Details
                </Button>
              </div>
            ) : (
              <>
                <p className="text-blue-100 mb-4">You don't have any upcoming appointments yet</p>
                <Button
                  onClick={() => onNavigate('book-appointment')}
                  className="bg-white text-blue-600 hover:bg-blue-50 w-full py-3"
                >
                  Schedule Your First Appointment
                </Button>
              </>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Recommended for You</h2>

          {filteredFeedItems.length > 0 ? (
            filteredFeedItems.map((item, index) => {
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
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        <div
                          className={`inline-flex items-center space-x-2 text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r ${item.color}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            item.actionFn?.();
                          }}
                        >
                          <span>{item.action}</span>
                          <ChevronRight size={16} className="text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="h-12 w-12 text-gray-300 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                <Search size={24} />
              </div>
              <p className="text-gray-500 font-medium">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    );
  };