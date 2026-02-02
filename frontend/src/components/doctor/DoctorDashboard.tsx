import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Doctor } from '../../types';
import { NewPatients } from './NewPatients';
import { OldPatients } from './OldPatients';
import { DoctorProfile } from './DoctorProfile';
import { HospitalSelector, HospitalInfo } from './HospitalSelector';
import { HospitalSchedule } from './HospitalSchedule';
import { PrescriptionForm } from './PrescriptionForm';
import { PatientConsultation } from './PatientConsultation';
import { DoctorChatbot } from './DoctorChatbot';
import { Appointment } from '../../types';
import {
  Users,
  UserCheck,
  Calendar,
  Activity,
  Stethoscope,
  User,
  Settings,
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';

interface DoctorDashboardProps {
  doctor: Doctor;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctor: initialDoctor }) => {
  const [doctor, setDoctor] = useState(initialDoctor);
  const [activeTab, setActiveTab] = useState<'overview' | 'new-patients' | 'old-patients' | 'profile' | 'hospital' | 'prescription' | 'consulting'>('overview');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | undefined>();
  const [hospitals, setHospitals] = useState<HospitalInfo[]>([
    { id: '1', name: 'City Hospital', address: 'Kathmandu, Nepal' },
    { id: '2', name: 'Global Care Center', address: 'Lalitpur, Nepal' }
  ]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleUpdateDoctor = (updatedData: Partial<Doctor>) => {
    setDoctor(prev => ({ ...prev, ...updatedData }));
  };

  const handleAddHospital = () => {
    const name = prompt('Enter Hospital Name:');
    const address = prompt('Enter Hospital Address:');
    if (name && address) {
      const newHospital = { id: Date.now().toString(), name, address };
      setHospitals(prev => [...prev, newHospital]);
    }
  };

  const handleSelectHospital = (id: string) => {
    setSelectedHospitalId(id);
    setActiveTab('hospital');
  };

  const handleCreatePrescription = (patient: any) => {
    setSelectedPatient(patient);
    setActiveTab('prescription');
  };

  const handleStartConsultation = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setActiveTab('consulting');
  };

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId);

  const mainTabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-patients', label: 'New Patients', icon: Users },
    { id: 'old-patients', label: 'Existing Patients', icon: UserCheck },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'prescription', label: 'Prescriptions', icon: ClipboardList }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DoctorOverview doctor={doctor} onCreatePrescription={handleCreatePrescription} />;
      case 'new-patients':
        return <NewPatients doctorId={doctor.user.id.toString()} />;
      case 'old-patients':
        return <OldPatients doctorId={doctor.user.id.toString()} />;
      case 'profile':
        return <DoctorProfile doctor={doctor} onUpdate={handleUpdateDoctor} />;
      case 'hospital':
        return selectedHospital ? (
          <HospitalSchedule
            hospital={selectedHospital}
            onStartConsultation={handleStartConsultation}
          />
        ) : (
          <DoctorOverview doctor={doctor} onCreatePrescription={handleCreatePrescription} />
        );
      case 'prescription':
        return <PrescriptionForm doctor={doctor} patient={selectedPatient} onSend={() => setActiveTab('overview')} />;
      case 'consulting':
        return selectedAppointment ? (
          <PatientConsultation
            doctor={doctor}
            appointment={selectedAppointment}
            onBack={() => setActiveTab('hospital')}
            onComplete={() => setActiveTab('hospital')}
          />
        ) : (
          <DoctorOverview doctor={doctor} onCreatePrescription={handleCreatePrescription} />
        );
      default:
        return <DoctorOverview doctor={doctor} onCreatePrescription={handleCreatePrescription} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 hidden md:flex flex-col h-[calc(100vh-64px)] fixed top-16 bottom-0 overflow-y-auto">
        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Main Menu</h3>
            <nav className="space-y-1">
              {mainTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <HospitalSelector
            hospitals={hospitals}
            selectedHospitalId={selectedHospitalId}
            onSelect={handleSelectHospital}
            onAddHospital={handleAddHospital}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {activeTab === 'profile' ? 'My Profile' :
                  activeTab === 'hospital' ? 'Hospital Schedule' :
                    activeTab === 'prescription' ? 'Create Prescription' :
                      `Welcome, Dr. ${doctor.user.first_name}`}
              </h1>
              <p className="text-gray-600">
                {activeTab === 'profile' ? 'Manage your personal and professional details' :
                  activeTab === 'hospital' ? `Managing appointments at ${selectedHospital?.name}` :
                    activeTab === 'prescription' ? `Writing prescription for ${selectedPatient?.name}` :
                      'Here is what is happening with your practice today'}
              </p>
            </div>
            {activeTab === 'overview' && (
              <Button variant="outline" size="sm" onClick={() => setActiveTab('profile')}>
                <Settings size={14} className="mr-2" />
                Settings
              </Button>
            )}
          </div>

          {renderContent()}
        </div>
      </main>
      <DoctorChatbot />
    </div>
  );
};

const DoctorOverview: React.FC<{ doctor: Doctor, onCreatePrescription: (patient: any) => void }> = ({ doctor, onCreatePrescription }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-100">Total Patients</p>
            <p className="text-3xl font-bold">124</p>
          </div>
          <div className="p-3 bg-white/20 rounded-2xl">
            <Users className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-100">New Patients</p>
            <p className="text-3xl font-bold">12</p>
          </div>
          <div className="p-3 bg-white/20 rounded-2xl">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-100">Appointments</p>
            <p className="text-3xl font-bold">8</p>
          </div>
          <div className="p-3 bg-white/20 rounded-2xl">
            <Calendar className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-100">Consultations</p>
            <p className="text-3xl font-bold">45</p>
          </div>
          <div className="p-3 bg-white/20 rounded-2xl">
            <Activity className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Recent Appointments</h3>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  P{i}
                </div>
                <div>
                  <p className="font-bold text-gray-900">Patient {i}</p>
                  <p className="text-xs text-gray-500">General Checkup • 10:30 AM</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full px-4 text-xs font-bold"
                  onClick={() => onCreatePrescription({ id: i, name: `Patient ${i}` })}
                >
                  <ClipboardList size={14} className="mr-2" />
                  Prescribe
                </Button>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  In Queue
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="md:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Doctor Profile</h3>
          <Stethoscope className="h-5 w-5 text-blue-600" />
        </div>
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3 border-4 border-white shadow-sm">
              <User size={32} />
            </div>
            <h4 className="font-bold text-gray-900 text-center">Dr. {doctor.user.first_name} {doctor.user.last_name}</h4>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{doctor.specialization}</p>
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">NID</span>
              <span className="font-bold text-gray-900">{doctor.nid || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Experience</span>
              <span className="font-bold text-gray-900">8+ Years</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">Available</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};