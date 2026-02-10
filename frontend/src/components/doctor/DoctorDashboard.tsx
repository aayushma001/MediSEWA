import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Doctor } from '../../types';
import { PatientsView } from './PatientsView';
import { DoctorProfile } from './DoctorProfile';
import { PatientConsultation } from './PatientConsultation';
import { DoctorChatbot } from './DoctorChatbot';
import {
  Users,
  UserCheck,
  Calendar,
  User,
  LayoutDashboard,
  Clock,
  Star,
  LogOut,
  Plus,
  Building2,
  ChevronDown,
  Bell,
  Search,
  Settings,
  TrendingUp,
  AlertCircle,
  FileText,
  Video,
  Award,
  Heart,
  Clipboard,
  ChevronRight,
  Globe,
  BarChart3,
  MessageSquare
} from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  patients: number;
  color: string;
  isOnline?: boolean;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  slotDuration: number; // minutes
  breakDuration: number; // minutes
}

interface DoctorDashboardProps {
  doctor: Doctor;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctor: initialDoctor }) => {
  const [doctor, setDoctor] = useState(initialDoctor);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedHospital, setSelectedHospital] = useState<Hospital>({
    id: '1',
    name: 'City Hospital',
    patients: 156,
    color: 'bg-emerald-500',
    startTime: '09:00',
    endTime: '10:00',
    slotDuration: 7,
    breakDuration: 10
  });
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState<any>(null);

  const hospitals: Hospital[] = [
    {
      id: '1',
      name: 'City Hospital',
      patients: 156,
      color: 'bg-emerald-500',
      startTime: '09:00',
      endTime: '10:00',
      slotDuration: 7,
      breakDuration: 10
    },
    {
      id: '2',
      name: 'Mercy Clinic',
      patients: 89,
      color: 'bg-blue-500',
      startTime: '11:00',
      endTime: '12:00',
      slotDuration: 7,
      breakDuration: 10
    },
    { id: '3', name: 'Teaching Hospital', patients: 124, color: 'bg-purple-500', startTime: '13:00', endTime: '14:00', slotDuration: 7, breakDuration: 10 },
    { id: '4', name: 'Metro Medical Center', patients: 78, color: 'bg-orange-500', startTime: '15:00', endTime: '16:00', slotDuration: 7, breakDuration: 10 },
    { id: '5', name: 'Community Hospital', patients: 92, color: 'bg-pink-500', startTime: '17:00', endTime: '18:00', slotDuration: 7, breakDuration: 10 },
  ];

  const onlinePractice: Hospital = {
    id: 'online',
    name: 'Online Consultations',
    patients: 45,
    color: 'bg-cyan-600',
    isOnline: true,
    startTime: '19:00',
    endTime: '20:00',
    slotDuration: 7,
    breakDuration: 10
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: 8 },
    { id: 'patients', label: 'Patients', icon: Users, badge: 24 },
    { id: 'reviews', label: 'Reviews', icon: Star, badge: 12 },
    { id: 'overall', label: 'Overall Stats', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const renderContent = () => {
    if (activeConsultation) {
      return (
        <PatientConsultation
          doctor={doctor}
          appointment={activeConsultation}
          onComplete={() => {
            setActiveConsultation(null);
            setActiveTab('dashboard');
          }}
          hospitalName={selectedHospital.name}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview hospital={selectedHospital} onStartConsultation={(apt: any) => setActiveConsultation(apt)} />;
      case 'appointments':
        return <AppointmentsView doctor={doctor} hospital={selectedHospital} onStartConsultation={(apt: any) => setActiveConsultation(apt)} />;
      case 'patients':
        return <PatientsView doctorId={doctor.id} />;
      case 'reviews':
        return <ReviewsView />;
      case 'overall':
        return <OverallStatsView hospitals={hospitals} />;
      case 'profile':
        return <DoctorProfile doctor={doctor} onUpdate={(updates) => setDoctor(prev => ({ ...prev, ...updates } as Doctor))} />;
      default:
        return <DashboardOverview hospital={selectedHospital} onStartConsultation={(apt: any) => setActiveConsultation(apt)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 fixed left-0 top-0 bottom-0 overflow-y-auto z-30 shadow-xl">
        {/* Logo */}
        <div className="h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center">
          <div className="flex items-center justify-center w-full">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-3">
              <Heart className="text-blue-600" size={28} />
            </div>
            <h2 className="text-white font-bold text-2xl tracking-wide">MediSEWA</h2>
          </div>
        </div>

        {/* Doctor Profile */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ring-blue-100">
                {doctor.user.first_name[0]}{doctor.user.last_name[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">
                Dr. {doctor.user.first_name} {doctor.user.last_name}
              </h3>
              <p className="text-xs text-blue-600 font-medium">{doctor.specialization || 'Cardiologist'}</p>
              <div className="flex items-center mt-1 space-x-1">
                <Award size={12} className="text-amber-500" />
                <span className="text-xs text-gray-600">MD, MBBS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital Dropdown */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-gray-900">
              <Building2 size={16} className="mr-2 text-blue-600" />
              <span className="text-xs font-bold">Selected Hospital</span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowHospitalDropdown(!showHospitalDropdown)}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${selectedHospital.color}`}></div>
                <span className="font-medium truncate">{selectedHospital.name}</span>
                {selectedHospital.isOnline && <Globe size={14} />}
              </div>
              <ChevronDown size={16} className={`transition-transform ${showHospitalDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showHospitalDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto z-50">
                {hospitals.map((hospital) => (
                  <button
                    key={hospital.id}
                    onClick={() => {
                      setSelectedHospital(hospital);
                      setShowHospitalDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center justify-between text-sm border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${hospital.color}`}></div>
                      <span className="font-medium">{hospital.name}</span>
                      {hospital.isOnline && <Globe size={12} className="text-cyan-600" />}
                    </div>
                    <span className="text-xs text-gray-500">{hospital.patients}</span>
                  </button>
                ))}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedHospital(onlinePractice);
                      setShowHospitalDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center justify-between text-sm border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${onlinePractice.color}`}></div>
                      <span className="font-medium">{onlinePractice.name}</span>
                      {onlinePractice.isOnline && <Globe size={12} className="text-cyan-600" />}
                    </div>
                    <span className="text-xs text-gray-500">{onlinePractice.patients}</span>
                  </button>
                </div>
                <button className="w-full text-left px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 font-semibold border-t-2 border-dashed border-blue-200">
                  <Plus size={14} className="inline mr-2" />
                  Add New Hospital
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Virtual Practice Section */}
        <div className="px-4 py-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Virtual Practice</h3>
          <button
            onClick={() => setSelectedHospital(onlinePractice)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${selectedHospital.id === 'online' ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-gray-50 text-gray-600'}`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-white shadow-sm">
                <Video size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-gray-900">Online Patients</div>
                <div className="text-[10px] text-cyan-600 font-medium">Remote Consultations</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-gray-900">{onlinePractice.patients}</span>
              <span className="text-[10px] text-gray-500">active</span>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1">
        {/* Top Header */}
        {activeTab !== 'profile' && (
          <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm h-20 flex items-center">
            <div className="px-6 w-full flex items-center justify-between">
              <div className="flex-1 max-w-xl">
                {activeTab === 'dashboard' && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search patients, appointments, records..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3 ml-4">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell size={18} className="text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings size={18} className="text-gray-600" />
                </button>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {doctor.user.first_name[0]}
                    </div>
                    <div className="text-left hidden md:block">
                      <div className="text-xs font-semibold text-gray-900">Dr. {doctor.user.last_name}</div>
                      <div className="text-xs text-gray-500">Doctor</div>
                    </div>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
                      >
                        <User size={16} />
                        <span>My Profile</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2 text-sm border-t border-gray-100">
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>

      {/* Floating AI Assistant Button */}
      <button
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110 flex items-center justify-center z-40 group"
      >
        <div className="relative">
          <MessageSquare size={28} className="text-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>

          {/* Pulsing rings animation */}
          <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-75"></div>
          <div className="absolute inset-0 rounded-full bg-purple-500 animate-pulse"></div>
        </div>

        {/* Tooltip */}
        <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          AI Medical Assistant
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </button>

      {/* AI Chatbot */}
      {showChatbot && <DoctorChatbot doctor={doctor} onClose={() => setShowChatbot(false)} />}
    </div>
  );
};

// Dashboard Overview
const DashboardOverview: React.FC<{ hospital: Hospital; onStartConsultation: (apt: any) => void }> = ({ hospital, onStartConsultation }) => {
  const stats = [
    { label: 'Appointments', value: 8, subtext: '3 remaining • 5 completed', icon: Calendar, color: 'blue', badge: 'Today' },
    { label: 'Total Patients', value: hospital.patients, subtext: '+12 this week', icon: Users, color: 'emerald', trend: <TrendingUp size={18} /> },
    { label: 'Emergency Cases', value: 1, subtext: 'Immediate attention needed', icon: AlertCircle, color: 'red', pulse: true },
    { label: 'New Reviews', value: 12, subtext: '98% positive feedback', icon: Star, color: 'amber', badge: '4.9★' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const bgColors = {
            blue: 'from-blue-500 to-blue-600',
            emerald: 'from-emerald-500 to-emerald-600',
            red: 'from-red-500 to-red-600',
            amber: 'from-amber-500 to-amber-600',
          };
          return (
            <Card key={i} className={`p-5 border-0 shadow-lg bg-gradient-to-br ${bgColors[stat.color as keyof typeof bgColors]} text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Icon size={20} />
                  </div>
                  {stat.badge && <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">{stat.badge}</span>}
                  {stat.trend}
                  {stat.pulse && <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>}
                </div>
                <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                <p className="text-xs opacity-90 font-medium mb-3">{stat.label}</p>
                <div className="pt-3 border-t border-white/20">
                  <p className="text-xs opacity-75">{stat.subtext}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Next Patient & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-0 border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-5 py-3 flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center text-base">
              <Clock size={18} className="mr-2 text-emerald-400" /> Next Patient - 10:15 AM
            </h3>
            <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">CONFIRMED</span>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4">
              <img src="https://avatar.iran.liara.run/public/15" alt="Patient" className="w-20 h-20 rounded-xl border-4 border-blue-100 shadow-lg" />
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900">Sarah Jenkins</h4>
                <p className="text-gray-500 text-sm">32 years • Female • Blood Type: O+</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">Hypertension</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">Follow-up</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button variant="outline" className="text-sm"><FileText size={14} className="mr-1" /> Records</Button>
                <Button
                  onClick={() => onStartConsultation({
                    patient_name: 'Sarah Jenkins',
                    instructions: 'Hypertension, Follow-up'
                  })}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-sm"
                ><Video size={14} className="mr-1" /> Start</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-0 shadow-lg">
          <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'New Prescription', sub: 'Create prescription', icon: Clipboard, color: 'blue' },
              { label: 'Schedule Break', sub: 'Manage availability', icon: Calendar, color: 'emerald' },
              { label: 'Medical Reports', sub: 'Review & sign', icon: FileText, color: 'purple' },
            ].map((action, i) => (
              <button key={i} className={`w-full p-3 bg-gradient-to-r from-${action.color}-50 to-${action.color}-100 hover:from-${action.color}-100 hover:to-${action.color}-200 rounded-lg text-left transition-all group`}>
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 ${action.color === 'blue' ? 'bg-blue-600' : action.color === 'emerald' ? 'bg-emerald-600' : 'bg-purple-600'} rounded-lg`}>
                    <action.icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-xs">{action.label}</div>
                    <div className="text-xs text-gray-500">{action.sub}</div>
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Today's Schedule</h3>
          <Button variant="ghost" className="text-blue-600 text-sm">View Full Calendar →</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { time: '11:00 AM', patient: 'John Miller', type: 'Checkup', status: 'confirmed', color: 'blue' },
            { time: '11:45 AM', patient: 'Emma Wilson', type: 'Follow-up', status: 'confirmed', color: 'emerald' },
            { time: '02:00 PM', patient: 'Michael Brown', type: 'New Patient', status: 'pending', color: 'amber' },
            { time: '02:45 PM', patient: 'Lisa Anderson', type: 'Consultation', status: 'confirmed', color: 'purple' },
          ].map((apt, i) => (
            <Card key={i} className="p-4 border-0 shadow-md hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-bold text-gray-400">{apt.time}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {apt.status}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">{apt.patient}</h4>
              <p className="text-xs text-gray-500 mb-2">{apt.type}</p>
              <div className={`h-1 rounded-full ${apt.color === 'blue' ? 'bg-blue-500' : apt.color === 'emerald' ? 'bg-emerald-500' : apt.color === 'amber' ? 'bg-amber-500' : 'bg-purple-500'}`}></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Appointments View (simplified)
const AppointmentsView: React.FC<{ doctor: Doctor; hospital: Hospital; onStartConsultation: (apt: any) => void }> = ({ onStartConsultation }) => {
  const slots = Array.from({ length: 12 }, (_, i) => {
    const time = 9 + Math.floor(i * 0.75);
    const mins = (i * 45) % 60;
    const status = ['completed', 'upcoming', 'emergency', 'follow_up', 'available'][Math.floor(Math.random() * 5)];
    return {
      id: i,
      time: `${time > 12 ? time - 12 : time}:${mins === 0 ? '00' : mins} ${time >= 12 ? 'PM' : 'AM'}`,
      status: status,
      patient_name: status === 'available' ? 'Available Slot' : ['John Doe', 'Sarah Jenkins', 'Michael Ray'][Math.floor(Math.random() * 3)],
      type: status === 'available' ? 'Free' : ['Checkup', 'Follow-up', 'Emergency'][Math.floor(Math.random() * 3)],
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
        <div className="flex gap-2 text-xs">
          {[
            { color: 'emerald', label: 'Completed' },
            { color: 'blue', label: 'Upcoming' },
            { color: 'red', label: 'Emergency' },
            { color: 'purple', label: 'Follow-up' }
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 bg-${s.color}-500 rounded`}></div>
              <span className="text-gray-600">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {slots.map((slot: any) => (
          <button
            key={slot.id}
            onClick={() => {
              if (slot.status !== 'available') {
                onStartConsultation({
                  patient_name: slot.patient_name,
                  instructions: slot.type,
                  status: 'scheduled'
                });
              }
            }}
            className={`p-4 rounded-xl border-2 transition-all text-left ${slot.status === 'completed' ? 'bg-emerald-50 border-emerald-300' :
              slot.status === 'emergency' ? 'bg-red-50 border-red-300' :
                slot.status === 'upcoming' ? 'bg-blue-50 border-blue-300' :
                  slot.status === 'follow_up' ? 'bg-purple-50 border-purple-300' :
                    'bg-white border-gray-200'
              } ${slot.status !== 'available' ? 'hover:shadow-lg cursor-pointer transform hover:-translate-y-1' : 'cursor-not-allowed opacity-50'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-500" />
                <span className="text-sm font-bold text-gray-900">{slot.time}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${slot.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                slot.status === 'emergency' ? 'bg-red-100 text-red-700' :
                  slot.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                    slot.status === 'follow_up' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-600'
                }`}>
                {slot.status}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-sm text-gray-900">{slot.patient_name}</h4>
              <p className="text-xs text-gray-600">{slot.type}</p>
            </div>

            {slot.status !== 'available' && (
              <div className="mt-3 pt-3 border-t border-gray-100/50 flex justify-between items-center text-blue-600">
                <span className="text-[10px] font-bold">START CONSULTATION</span>
                <ChevronRight size={14} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Reviews View
const ReviewsView = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-gray-900">Patient Reviews</h2>
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2 rounded-xl shadow-lg">
        <div className="text-2xl font-bold">4.9</div>
        <div className="text-xs">Avg Rating</div>
      </div>
    </div>
    <div className="grid gap-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4 border-0 shadow-md">
          <div className="flex items-start space-x-3">
            <img src={`https://avatar.iran.liara.run/public/${i}`} alt="Patient" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm">Patient Name</h4>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-600">Excellent care and professionalism!</p>
              <p className="text-xs text-gray-400 mt-1">2 days ago</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// Overall Stats View
const OverallStatsView: React.FC<{ hospitals: Hospital[] }> = ({ hospitals }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-gray-900">Overall Statistics</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: 'Total Patients', value: hospitals.reduce((acc, h) => acc + h.patients, 0), color: 'blue' },
        { label: 'Total Hospitals', value: hospitals.filter(h => !h.isOnline).length, color: 'emerald' },
        { label: 'Online Consultations', value: hospitals.find(h => h.isOnline)?.patients || 0, color: 'purple' },
      ].map((stat, i) => (
        <Card key={i} className="p-5 border-0 shadow-lg">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">{stat.label}</h4>
          <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
        </Card>
      ))}
    </div>
    <Card className="p-5 border-0 shadow-lg">
      <h3 className="font-bold text-gray-900 mb-4">Hospital Breakdown</h3>
      <div className="space-y-3">
        {hospitals.map((hospital) => (
          <div key={hospital.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${hospital.color}`}></div>
              <span className="font-medium text-sm">{hospital.name}</span>
              {hospital.isOnline && <Globe size={14} className="text-cyan-600" />}
            </div>
            <span className="font-bold text-gray-900">{hospital.patients}</span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);