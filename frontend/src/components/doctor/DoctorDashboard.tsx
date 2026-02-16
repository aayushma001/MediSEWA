import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Doctor } from '../../types';
import { PatientsView } from './PatientsView';
import { DoctorProfile } from './DoctorProfile';
import { PatientConsultation } from './PatientConsultation';
import { DoctorChatbot } from './DoctorChatbot';
import { DashboardHeader } from '../common/DashboardHeader';
import { adminAPI, appointmentsAPI } from '../../services/api';

import {
  Users,
  Calendar,
  User,
  LayoutDashboard,
  Clock,
  Star,
  Plus,
  Building2,
  ChevronDown,
  Bell,
  TrendingUp,
  AlertCircle,
  Video,
  Award,
  Globe,
  BarChart3,
  MessageSquare,
  X,
  Check
} from 'lucide-react';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  patients: number;
  color: string;
  isOnline?: boolean;
  hospitalCode?: string;
  backendId?: string | number;
}

interface DoctorDashboardProps {
  doctor: Doctor;
  onLogout: () => void;
  initialTab?: string;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctor: initialDoctor, onLogout, initialTab = 'dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctor, setDoctor] = useState(initialDoctor);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Sync activeTab with URL
  useEffect(() => {
    const segments = location.pathname.split('/');
    const lastSegment = segments[segments.length - 1];

    if (lastSegment === 'doctor' || !lastSegment) {
      setActiveTab('dashboard');
    } else {
      // Check if it's a valid nav item
      const validTabs = ['dashboard', 'appointments', 'patients', 'reviews', 'overall', 'profile'];
      if (validTabs.includes(lastSegment)) {
        setActiveTab(lastSegment);
      }
    }
  }, [location.pathname]);

  const handleNav = (id: string) => {
    setActiveConsultation(null);
    if (id === 'dashboard') {
      navigate('/doctor');
    } else {
      navigate(`/doctor/${id}`);
    }
  };
  // Use loading to show spinner in UI if needed, for now we just suppress the lint
  const [loading, setLoading] = useState(true);
  console.log('Appointments loading:', loading);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await appointmentsAPI.getDoctorAppointments();
        setAppointments(data);
      } catch (err) {
        console.error("Doctor appointments fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);
  const [activeConsultation, setActiveConsultation] = useState<any>(null);
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [pendingConnections, setPendingConnections] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Add Hospital Form State
  const [newHospitalCode, setNewHospitalCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const onlinePractice: Hospital = {
    id: 'online',
    name: 'Online Consultations',
    address: 'Virtual Practice',
    patients: 0,
    color: 'bg-cyan-600',
    isOnline: true,
  };

  // Load hospitals from API on component mount
  useEffect(() => {
    loadDoctorHospitals();
    loadPendingConnections();
    loadDashboardStats();
  }, [doctor.id]);

  const loadDashboardStats = async () => {
    try {
      const data = await adminAPI.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadPendingConnections = async () => {
    try {
      const data = await adminAPI.getConnections('pending');
      setPendingConnections(data);
    } catch (error) {
      console.error('Error loading pending connections:', error);
    }
  };

  const loadDoctorHospitals = async () => {
    try {
      const data = await adminAPI.getConnections();
      const mappedHospitals = data.map((h: any) => ({
        id: h.hospital_unique_id || h.user?.id || h.id, // Fallback to user ID if unique_id missing
        backendId: h.user?.id || h.id, // We need the actual PK for API calls
        name: h.hospital_name,
        address: h.address,
        patients: 0, // Placeholder
        color: generateRandomColor(),
        hospitalCode: h.hospital_unique_id
      }));

      setHospitals(mappedHospitals);

      if (mappedHospitals.length > 0 && !selectedHospital) {
        setSelectedHospital(mappedHospitals[0]);
      }
    } catch (error) {
      console.error('Error loading hospitals:', error);
    }
  };

  const handleAddHospital = async () => {
    setVerificationError('');

    if (!newHospitalCode.trim()) {
      setVerificationError('Please enter the hospital ID');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await adminAPI.connectEntity(newHospitalCode);

      // Refresh connection lists
      await loadDoctorHospitals();
      await loadPendingConnections();

      // Reset form and close modal
      setNewHospitalCode('');
      setShowAddHospitalModal(false);

      alert(response.message || `Successfully sent connection request!`);
    } catch (error: any) {
      console.error('Error adding hospital:', error);
      setVerificationError(error.message || 'Failed to add hospital. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmConnection = async (connectionId: string, status: 'active' | 'rejected') => {
    try {
      await adminAPI.confirmConnection(connectionId, status);
      await loadPendingConnections();
      await loadDoctorHospitals();
      if (status === 'active') {
        alert('Connection approved!');
      } else {
        alert('Connection rejected.');
      }
    } catch (error) {
      console.error('Error confirming connection:', error);
      alert('Failed to update connection status.');
    }
  };

  const generateRandomColor = () => {
    const colors = [
      'bg-emerald-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: stats?.appointments_today || 0 },
    { id: 'patients', label: 'Patients', icon: Users, badge: stats?.total_patients || 0 },
    { id: 'reviews', label: 'Reviews', icon: Star, badge: stats?.total_reviews || 0 },
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
          hospitalName={selectedHospital?.name || 'Unknown Hospital'}
        />
      );
    }

    const filteredAppointments = appointments.filter(apt => {
      if (!selectedHospital) return true;
      if (selectedHospital.isOnline) return apt.consultation_type === 'online';

      // Use backendId if available, otherwise check id
      const targetHospitalId = selectedHospital.backendId || selectedHospital.id;
      return String(apt.hospital) === String(targetHospitalId);
    });

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            hospital={selectedHospital}
            pendingConnections={pendingConnections}
            stats={stats ? {
              ...stats,
              // Filter today's counts if a hospital/mode is selected
              appointments_today: filteredAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
              emergency_cases: filteredAppointments.filter(a => a.is_emergency && a.date === new Date().toISOString().split('T')[0]).length,
              next_patient: (() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const nowTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                const next = filteredAppointments
                  .filter(a => (a.status === 'approved' || a.status === 'APPROVED') && a.date === todayStr)
                  .filter(a => a.time_slot.split(' - ')[0] > nowTime)
                  .sort((a, b) => a.time_slot.localeCompare(b.time_slot))[0];

                return next ? {
                  id: next.id,
                  appointment_id: next.id,
                  name: next.patient_name,
                  time: next.time_slot,
                  condition: next.symptoms,
                  status: next.status
                } : null;
              })()
            } : null}
            onConfirmConnection={handleConfirmConnection}
            onStartConsultation={(apt: any) => setActiveConsultation(apt)}
          />
        );
      case 'appointments':
        return (
          <DoctorAppointmentsView
            appointments={filteredAppointments}
            onStartConsultation={(apt) => setActiveConsultation(apt)}
            onRefresh={async () => {
              const data = await appointmentsAPI.getDoctorAppointments();
              setAppointments(data);
            }}
          />
        );
      case 'patients':
        return <PatientsView doctorId={doctor.id} />;
      case 'overall':
        return <OverallStatsView hospitals={hospitals} stats={stats} />;
      case 'profile':
        return <DoctorProfile doctor={doctor} onUpdate={(updates) => setDoctor(prev => ({ ...prev, ...updates } as Doctor))} />;
      case 'reviews':
        return <ReviewsView doctorId={doctor.doctor_unique_id || doctor.id} />;
      default:
        return (
          <DashboardOverview
            hospital={selectedHospital}
            pendingConnections={pendingConnections}
            stats={stats}
            onConfirmConnection={handleConfirmConnection}
            onStartConsultation={(apt: any) => setActiveConsultation(apt)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex">
      {/* Add Hospital Modal */}
      {showAddHospitalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowAddHospitalModal(false);
                setVerificationError('');
                setNewHospitalCode('');
              }}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Connect to Hospital</h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter the unique hospital ID to link your profile and start managing appointments
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Unique ID
                </label>
                <input
                  type="text"
                  value={newHospitalCode}
                  onChange={(e) => setNewHospitalCode(e.target.value)}
                  placeholder="e.g., HOSP-CITY-KTM-P1D2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  disabled={isVerifying}
                />
              </div>

              {verificationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{verificationError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddHospitalModal(false);
                    setVerificationError('');
                    setNewHospitalCode('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={isVerifying}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddHospital}
                  disabled={isVerifying}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Check size={16} className="inline mr-2" />
                      Add Hospital
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Sidebar - Same as before but with Add button */}
      <aside className="w-72 bg-white border-r border-gray-200 fixed left-0 top-0 bottom-0 overflow-y-auto z-30 shadow-xl">
        <div className="h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center">
          <div className="flex items-center justify-center w-full">
            <img src="/LOGO.png" alt="MediSEWA" className="h-16 w-auto object-contain bg-white/90 rounded-lg p-1" />
          </div>
        </div>

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

        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-gray-900">
              <Building2 size={16} className="mr-2 text-blue-600" />
              <span className="text-xs font-bold">Selected Hospital</span>
            </div>
            <button
              onClick={() => setShowAddHospitalModal(true)}
              className="p-1 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
              title="Add Hospital"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="relative">
            {selectedHospital ? (
              <>
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
                          setActiveConsultation(null);
                          setSelectedHospital(hospital);
                          setShowHospitalDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center justify-between text-sm border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${hospital.color}`}></div>
                          <span className="font-medium">{hospital.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{hospital.hospitalCode}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setActiveConsultation(null);
                        setSelectedHospital(onlinePractice);
                        setShowHospitalDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center justify-between text-sm border-b border-gray-100"
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${onlinePractice.color}`}></div>
                        <span className="font-medium">{onlinePractice.name}</span>
                        <Globe size={12} className="text-cyan-600" />
                      </div>
                      <span className="text-xs text-gray-500">Online</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowHospitalDropdown(false);
                        setShowAddHospitalModal(true);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 font-semibold border-t-2 border-dashed border-blue-200"
                    >
                      <Plus size={14} className="inline mr-2" />
                      Add New Hospital
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowAddHospitalModal(true)}
                className="w-full px-3 py-2.5 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm transition-colors"
              >
                <Plus size={14} className="inline mr-2" />
                Add Hospital
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Virtual Practice</h3>
          <button
            onClick={() => {
              setActiveConsultation(null);
              setSelectedHospital(onlinePractice);
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${selectedHospital?.id === 'online' ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-gray-50 text-gray-600'}`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-white shadow-sm">
                <Video size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-gray-900">Online Patients</div>
                <div className="text-[10px] text-cyan-600 font-medium">Website Bookings</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-gray-900">
                {appointments.filter(a => a.consultation_type === 'online').length}
              </span>
              <span className="text-[10px] text-gray-500">active</span>
            </div>
          </button>
        </div>

        <nav className="p-4 flex-1">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content - Header and Content sections remain the same */}
      <main className="ml-72 flex-1">
        <DashboardHeader
          user={doctor.user}
          onLogout={onLogout}
          onNavigateToProfile={() => handleNav('profile')}
          showSearch={activeTab !== 'profile'}
          searchPlaceholder="Search patients, appointments, records..."
          onSearchChange={(val) => console.log('Searching:', val)}
        />

        <div className="p-6">
          {renderContent()}
        </div>
      </main>

      <button
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110 flex items-center justify-center z-40 group"
      >
        <div className="relative">
          <MessageSquare size={28} className="text-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-75"></div>
          <div className="absolute inset-0 rounded-full bg-purple-500 animate-pulse"></div>
        </div>
        <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          AI Medical Assistant
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </button>

      {showChatbot && <DoctorChatbot doctor={doctor} onClose={() => setShowChatbot(false)} />}
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview: React.FC<{
  hospital: Hospital | null;
  pendingConnections: any[];
  stats: any;
  onConfirmConnection: (id: string, status: 'active' | 'rejected') => void;
  onStartConsultation: (apt: any) => void
}> = ({ hospital, pendingConnections, stats, onConfirmConnection, onStartConsultation }) => {
  const stats_items = [
    { label: 'Appointments', value: stats?.appointments_today || 0, subtext: 'Total for today', icon: Calendar, color: 'blue' as const, badge: 'Today' },
    { label: 'Total Patients', value: stats?.total_patients || 0, subtext: 'Unique patients', icon: Users, color: 'emerald' as const, trend: <TrendingUp size={18} /> },
    { label: 'Emergency Cases', value: stats?.emergency_cases || 0, subtext: 'Require attention', icon: AlertCircle, color: 'red' as const, pulse: stats?.emergency_cases > 0 },
    { label: 'Avg Rating', value: stats?.avg_rating || 0, subtext: `${stats?.total_reviews || 0} reviews`, icon: Star, color: 'amber' as const, badge: `${stats?.avg_rating || 0}★` },
  ];

  return (
    <div className="space-y-6">
      {hospital && hospital.isOnline && (
        <Card className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500 rounded-xl">
              <Globe size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Online Consultation Mode</h3>
              <p className="text-sm text-gray-600">Showing appointments booked through website</p>
            </div>
          </div>
        </Card>
      )}

      {!hospital && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <LayoutDashboard size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Dr. Personal Overview</h3>
              <p className="text-sm text-gray-600">Viewing aggregate data across all affiliations</p>
            </div>
          </div>
        </Card>
      )}

      {/* Pending Connections Section */}
      {pendingConnections.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Bell size={20} className="mr-2 text-amber-500 animate-bounce" />
            Connection Requests ({pendingConnections.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingConnections.map((conn) => (
              <Card key={conn.connection_id} className="p-4 border-2 border-amber-100 bg-amber-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                      {conn.hospital_name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{conn.hospital_name}</p>
                      <p className="text-xs text-gray-500">{conn.address}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onConfirmConnection(conn.connection_id, 'active')}
                      className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                      title="Accept"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => onConfirmConnection(conn.connection_id, 'rejected')}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Reject"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats_items.map((stat, i) => {
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

      <Card className="p-0 border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-5 py-3 flex justify-between items-center">
          <h3 className="text-white font-bold flex items-center text-base">
            <Clock size={18} className="mr-2 text-emerald-400" />
            {stats?.next_patient ? `Next Patient - ${stats.next_patient.time.split(' - ')[0]}` : 'No Upcoming Patients'}
          </h3>
          {stats?.next_patient && (
            <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">{stats.next_patient.status}</span>
          )}
        </div>
        <div className="p-5">
          {stats?.next_patient ? (
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border-4 border-blue-100 shadow-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl">
                {stats.next_patient.name[0]}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900">{stats.next_patient.name}</h4>
                <p className="text-gray-500 text-sm">Today • Scheduled for {stats.next_patient.time}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">{stats.next_patient.condition}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => onStartConsultation({
                    id: stats.next_patient.appointment_id,
                    patient_id: stats.next_patient.id,
                    patient_name: stats.next_patient.name,
                    patientCondition: stats.next_patient.condition
                  })}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-sm"
                ><Video size={14} className="mr-1" /> Start</Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">You have no more appointments scheduled for today.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const ReviewsView: React.FC<{ doctorId: string }> = ({ doctorId }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await adminAPI.getReviews(); // Fetching for current doctor
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [doctorId]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Patient Reviews</h2>
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2 rounded-xl shadow-lg">
          <div className="text-2xl font-bold">{avgRating}</div>
          <div className="text-xs">Avg Rating</div>
        </div>
      </div>
      <div className="grid gap-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <Card className="p-12 text-center bg-white rounded-2xl shadow-sm border-0">
            <Star size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">No reviews yet.</p>
          </Card>
        ) : reviews.map((review) => (
          <Card key={review.id} className="p-5 border-0 shadow-md bg-white rounded-2xl">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {review.patient_name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{review.patient_name}</h4>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider">{new Date(review.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const DoctorAppointmentsView: React.FC<{
  appointments: any[];
  onStartConsultation: (apt: any) => void;
  onRefresh: () => void;
}> = ({ appointments, onStartConsultation, onRefresh }) => {
  const [filter, setFilter] = useState('approved');
  const filtered = appointments.filter(a => filter === 'all' || a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="Refresh Appointments"
          >
            <Clock size={20} />
          </button>
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
            {['approved', 'pending', 'completed', 'all'].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-all ${filter === t ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-blue-600'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No {filter} appointments found.</p>
          </Card>
        ) : filtered.map(apt => (
          <Card key={apt.id} className="p-4 border-l-4 border-l-blue-500">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${apt.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {apt.status}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">{apt.consultation_type} Consultation</span>
                </div>
                <h4 className="font-bold text-lg text-gray-900">{apt.patient_name}</h4>
                <p className="text-sm text-gray-600 mb-3">{apt.hospital_name}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1"><Calendar size={14} /> {apt.date}</div>
                  <div className="flex items-center gap-1"><Clock size={14} /> {apt.time_slot}</div>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-2 min-w-[150px]">
                {apt.status === 'approved' && (
                  <Button
                    onClick={() => onStartConsultation(apt)}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                  >
                    <Video size={16} className="mr-2" /> Start Now
                  </Button>
                )}
                {apt.meeting_link && (
                  <a
                    href={apt.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 text-center hover:underline"
                  >
                    View Meeting Link
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const OverallStatsView: React.FC<{ hospitals: Hospital[], stats?: any }> = ({ hospitals, stats }) => {
  const breakdown = stats?.hospital_breakdown || [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Overall Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Patients', value: stats?.total_patients || 0, color: 'blue' },
          { label: 'Total Connected Hospitals', value: hospitals.filter(h => !h.isOnline).length, color: 'emerald' },
          { label: 'All-Time Appointments', value: stats?.all_time_appointments || 0, color: 'purple' },
        ].map((stat, i) => (
          <Card key={i} className="p-5 border-0 shadow-lg bg-white rounded-2xl">
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">{stat.label}</h4>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
          </Card>
        ))}
      </div>
      <Card className="p-5 border-0 shadow-lg bg-white rounded-2xl">
        <h3 className="font-bold text-gray-900 mb-4">Hospital Breakdown</h3>
        <div className="space-y-3">
          {breakdown.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No hospital affiliations found with patient data.</p>
          ) : breakdown.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full bg-blue-500`}></div>
                <div>
                  <span className="font-bold text-gray-900 block">{item.name}</span>
                  <span className="text-xs text-gray-500 font-mono">{item.hospital_code}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-blue-600 block">{item.patients}</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold">Patients</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};