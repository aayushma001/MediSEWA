import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { PatientsView } from './PatientsView';
import { DoctorProfile } from './DoctorProfile';

import { Button } from '../ui/Button';
import { Doctor } from '../../types';
import {
  Users,
  UserCheck,
  Calendar,
  Activity,
  User,
  LayoutDashboard,
  Clock,
  MessageSquare,
  Star,
  LogOut,
  Plus,
  Building2,
  Send,
  ChevronRight
} from 'lucide-react';

import { PatientConsultation } from './PatientConsultation';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  badge: string | null;
}

interface DoctorDashboardProps {
  doctor: Doctor;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctor: initialDoctor }) => {
  const [doctor, setDoctor] = useState(initialDoctor);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedHospital, setSelectedHospital] = useState<string>('City Hospital');
  const [showChatbot, setShowChatbot] = useState(false);

  const handleUpdateDoctor = (updates: Partial<Doctor>) => {
    setDoctor(prev => ({ ...prev, ...updates } as Doctor));
  };

  // Hospital list
  const hospitals = [
    { id: '1', name: 'City Hospital', status: 'active', color: 'bg-green-500' },
    { id: '2', name: 'Apollo Clinic', status: 'active', color: 'bg-green-500' },
    { id: '3', name: 'Teaching Hospital', status: 'active', color: 'bg-green-500' },
  ];

  // Navigation items
  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: null },
    { id: 'patients', label: 'Patients', icon: Users, badge: '24' },
    { id: 'reviews', label: 'Reviews', icon: Star, badge: null },
    { id: 'profile', label: 'Profile', icon: User, badge: null },
  ];

  // Render main content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview doctor={doctor} selectedHospital={selectedHospital} />;
      case 'appointments':
        return <DailyScheduleView doctor={doctor} selectedHospital={selectedHospital} />;
      case 'patients':
        return <PatientsView doctorId={doctor.id} />;
      case 'reviews':
        return <ReviewsView />;
      case 'profile':
        return <DoctorProfile doctor={doctor} onUpdate={handleUpdateDoctor} />;
      default:
        return <DashboardOverview doctor={doctor} selectedHospital={selectedHospital} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 fixed left-0 top-0 bottom-0 overflow-y-auto z-30">
        {/* Doctor Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {doctor.user.first_name[0]}{doctor.user.last_name[0]}
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">
                Dr. {doctor.user.first_name} {doctor.user.last_name}
              </h3>
              <p className="text-sm text-gray-600">{doctor.specialization || 'Cardiologist'}</p>
              <p className="text-xs text-gray-500 mt-1">MD, MBBS</p>
            </div>
          </div>
        </div>

        {/* Hospital Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-gray-700">
              <Building2 size={16} className="mr-2" />
              <span className="text-sm font-semibold">Hospital</span>
            </div>
          </div>
          <div className="space-y-1">
            {hospitals.map((hospital) => (
              <button
                key={hospital.id}
                onClick={() => setSelectedHospital(hospital.name)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedHospital === hospital.name
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center">
                  <ChevronRight
                    size={14}
                    className={`mr-2 ${selectedHospital === hospital.name ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <span className="truncate">{hospital.name}</span>
                </div>
              </button>
            ))}
            <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium">
              <div className="flex items-center">
                <Plus size={14} className="mr-2" />
                Request Access
              </div>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'
                          }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>

                </div>
              );
            })}
          </div>
        </nav>

        {/* Chatbot Toggle & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setShowChatbot(!showChatbot)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <MessageSquare size={18} />
              <span>AI Assistant</span>
            </div>
            {showChatbot && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Chatbot Panel */}
      {showChatbot && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <MessageSquare size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-white">Medical AI Assistant</h3>
                <p className="text-xs text-blue-100">Online</p>
              </div>
            </div>
            <button onClick={() => setShowChatbot(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
              ✕
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              <div className="bg-white p-3 rounded-lg shadow-sm max-w-[80%]">
                <p className="text-sm text-gray-700">Hello Dr. {doctor.user.first_name}! How can I assist you today?</p>
                <p className="text-xs text-gray-500 mt-1">Just now</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// Dashboard Overview Component
const DashboardOverview: React.FC<{ doctor: Doctor; selectedHospital: string }> = ({ doctor, selectedHospital }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good Morning, Dr. {doctor.user.last_name}</h1>
        <p className="text-gray-500 mt-1">Here is your daily summary for {selectedHospital}.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Count */}
        <Card className="p-6 border-0 shadow-sm bg-blue-50/50 border-l-4 border-blue-600 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Today's Appointments</p>
            <h3 className="text-4xl font-bold text-gray-900 mt-2">8</h3>
            <p className="text-sm text-gray-500 mt-1">3 remaining</p>
          </div>
          <div className="h-12 w-12 bg-blue-100/50 rounded-full flex items-center justify-center text-blue-600">
            <Calendar size={24} />
          </div>
        </Card>

        {/* Emergency Alerts */}
        <Card className="p-6 border-0 shadow-sm bg-red-50/50 border-l-4 border-red-600 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-red-900 uppercase tracking-wide">Emergencies</p>
            <h3 className="text-4xl font-bold text-gray-900 mt-2">1</h3>
            <p className="text-sm text-gray-500 mt-1">Action required</p>
          </div>
          <div className="h-12 w-12 bg-red-100/50 rounded-full flex items-center justify-center text-red-600 animate-pulse">
            <Activity size={24} />
          </div>
        </Card>

        {/* New Requests */}
        <Card className="p-6 border-0 shadow-sm bg-purple-50/50 border-l-4 border-purple-600 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-purple-900 uppercase tracking-wide">New Patients</p>
            <h3 className="text-4xl font-bold text-gray-900 mt-2">3</h3>
            <p className="text-sm text-gray-500 mt-1">Review needed</p>
          </div>
          <div className="h-12 w-12 bg-purple-100/50 rounded-full flex items-center justify-center text-purple-600">
            <UserCheck size={24} />
          </div>
        </Card>
      </div>

      {/* Next Patient Card */}
      <Card className="p-0 border-0 shadow-md overflow-hidden bg-white">
        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-medium flex items-center">
            <Clock size={18} className="mr-2 text-green-400" /> Up Next (10:15 AM)
          </h3>
          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">CONFIRMED</span>
        </div>
        <div className="p-6 flex flex-col md:flex-row items-center gap-6">
          <img
            src="https://avatar.iran.liara.run/public/15"
            alt="Patient"
            className="w-20 h-20 rounded-full border-4 border-gray-100"
          />
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-xl font-bold text-gray-900">Sarah Jenkins</h4>
            <p className="text-gray-500">32 Female • Follow-up</p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Hypertension</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Last visit: 2 weeks ago</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-gray-200">View Profile</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Start Session</Button>
          </div>
        </div>
      </Card>

      {/* Quick Schedule Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Afternoon Schedule</h3>
          <Button variant="ghost" className="text-blue-600 text-sm">View Full Calendar</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['11:00 AM', '11:45 AM', '02:00 PM', '02:45 PM'].map((time, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-300 transition-all cursor-pointer">
              <span className="text-xs font-bold text-gray-400 block mb-1">{time}</span>
              <div className="font-semibold text-gray-800">Booked</div>
              <div className="text-xs text-blue-600 mt-1">General Checkup</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other views






const ReviewsView = () => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Reviews</h2>
    <Card className="p-6">
      <p className="text-gray-600">Patient reviews and ratings will appear here...</p>
    </Card>
  </div>
);

// Placeholder for DailyScheduleView (will be implemented next)
const DailyScheduleView: React.FC<{ doctor: Doctor; selectedHospital: string }> = ({ doctor, selectedHospital }) => {
  // Generate slots for 2 hours only (e.g., 9 AM to 11 AM)
  const generateSlots = () => {
    const slots = [];
    let startTime = 9 * 60; // 9 AM in minutes
    const endTime = 11 * 60; // 11 AM in minutes (2 hours window)
    const interval = 15; // 15 minutes

    while (startTime < endTime) {
      const hours = Math.floor(startTime / 60);
      const minutes = startTime % 60;
      const timeString = `${hours > 12 ? hours - 12 : hours}:${minutes === 0 ? '00' : minutes} ${hours >= 12 ? 'PM' : 'AM'}`;

      let status: 'available' | 'completed' | 'emergency' | 'upcoming' | 'follow_up' = 'available';
      let patientName = '';
      let type = '';

      // Mock data logic for specific colors
      if (startTime === 540) { // 9:00 AM
        status = 'completed'; patientName = 'John Doe'; type = 'Routine Checkup';
      } else if (startTime === 600) { // 10:00 AM
        status = 'emergency'; patientName = 'Michael Ray'; type = 'Chest Pain';
      } else if (startTime === 615) { // 10:15 AM
        status = 'upcoming'; patientName = 'Sarah Jenkins'; type = 'Hypertension';
      } else if (startTime === 630) { // 10:30 AM
        status = 'follow_up'; patientName = 'Emily Davis'; type = 'Post-Surgery';
      }

      slots.push({ time: timeString, status, patientName, type, id: startTime });
      startTime += interval;
    }
    return slots;
  };

  const slots = generateSlots();
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [isConsulting, setIsConsulting] = useState(false);

  if (isConsulting) {
    // In a real app, we'd pass the actual patient ID from the slot
    return (
      <PatientConsultation
        doctor={doctor}
        hospitalName={selectedHospital}
        onBack={() => setIsConsulting(false)}
        onComplete={() => setIsConsulting(false)}
      />
    );
  }

  // Color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200 text-green-900 hover:shadow-md'; // Green
      case 'emergency': return 'bg-red-50 border-red-200 text-red-900 hover:shadow-md'; // Red
      case 'upcoming': return 'bg-yellow-50 border-yellow-200 text-yellow-900 hover:shadow-md'; // Yellow (Remaining)
      case 'follow_up': return 'bg-blue-50 border-blue-200 text-blue-900 hover:shadow-md'; // Blue
      default: return 'bg-white border-gray-100 hover:border-blue-300 text-gray-400';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'emergency': return 'bg-red-100 text-red-700';
      case 'upcoming': return 'bg-yellow-100 text-yellow-700';
      case 'follow_up': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Daily Appointments (9 AM - 11 AM)</h2>
        <div className="flex space-x-4 text-sm flex-wrap gap-y-2 justify-end">
          <div className="flex items-center"><div className="w-3 h-3 bg-white border border-gray-300 mr-2 rounded"></div> Available</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-green-100 border border-green-200 mr-2 rounded"></div> Completed</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-red-100 border border-red-200 mr-2 rounded"></div> Emergency</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-yellow-100 border border-yellow-200 mr-2 rounded"></div> Remaining</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-blue-100 border border-blue-200 mr-2 rounded"></div> Follow-up</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {slots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => slot.status !== 'available' && setSelectedSlot(slot)}
            className={`
                p-4 rounded-xl border flex flex-col items-start transition-all text-left relative overflow-hidden group h-32
                ${getStatusColor(slot.status)}
            `}
            disabled={slot.status === 'available'}
          >
            <span className="text-xs font-bold mb-2 opacity-70">{slot.time}</span>
            {slot.status === 'available' ? (
              <span className="text-sm font-medium mt-auto">Open Slot</span>
            ) : (
              <div className="flex flex-col h-full w-full">
                <span className="font-bold text-base truncate w-full">{slot.patientName}</span>
                <span className="text-xs opacity-90 truncate w-full mt-1 mb-auto">{slot.type}</span>

                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full self-start mt-2 bg-white/50 backdrop-blur-sm`}>
                  {slot.status.replace('_', ' ')}
                </span>

                {slot.status === 'emergency' && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedSlot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${getStatusBadgeColor(selectedSlot.status)}`}>
                  {selectedSlot.status.replace('_', ' ')}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{selectedSlot.patientName}</h3>
                <p className="text-gray-500">{selectedSlot.time} • {selectedSlot.type}</p>
              </div>
              <button onClick={() => setSelectedSlot(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <span className="text-2xl text-gray-400">&times;</span>
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold mr-3">
                  {selectedSlot.patientName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Patient Profile</p>
                  <p className="text-xs text-gray-500">ID: #{selectedSlot.id}</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto text-blue-600">View</Button>
              </div>

              <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Complaint</h4>
                <p className="text-sm text-gray-800">Patient reported persistent symptoms related to {selectedSlot.type} since 2 days.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setSelectedSlot(null)} className="border-gray-200">Close</Button>
              <Button
                className="bg-gray-900 hover:bg-black text-white"
                onClick={() => {
                  setSelectedSlot(null);
                  setIsConsulting(true);
                }}
              >
                Start Consultation
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};