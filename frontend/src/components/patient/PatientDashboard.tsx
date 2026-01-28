import React, { useState } from 'react';
import { Patient } from '../../types';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  LogOut,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Wind,
  Weight,
  Menu,
  X,
  ChevronRight,
  Printer,
  Clock,
  MapPin
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface PatientDashboardProps {
  patient: Patient;
}

const COLORS = ['#10B981', '#E5E7EB'];

const healthData = [
  { name: 'Heart Rate', value: '0 Bpm', status: '0%', icon: Heart, color: 'text-gray-400', sub: 'No Data' },
  { name: 'Body Temperature', value: '0 C', status: '0%', icon: Thermometer, color: 'text-gray-400', sub: 'No Data' },
  { name: 'Glucose Level', value: '0', status: '0%', icon: Droplets, color: 'text-gray-400', sub: 'No Data' },
  { name: 'SpO2', value: '0%', status: '0%', icon: Wind, color: 'text-gray-400', sub: 'No Data' },
  { name: 'Blood Pressure', value: '0/0', status: '0%', icon: Activity, color: 'text-gray-400', sub: 'No Data' },
  { name: 'BMI', value: '0', status: '0%', icon: Weight, color: 'text-gray-400', sub: 'No Data' }
];

const analyticsData = [
  { name: 'Mon', value: 0 },
  { name: 'Tue', value: 0 },
  { name: 'Wed', value: 0 },
  { name: 'Thu', value: 0 },
  { name: 'Fri', value: 0 },
  { name: 'Sat', value: 0 },
  { name: 'Sun', value: 0 },
];

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ patient }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use the backend-generated ID or fallback to a display if missing
  const patientId = patient.patient_unique_id || 'Generating...';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'favourites', label: 'Favourites', icon: Heart },
    { id: 'dependants', label: 'Dependants', icon: Users },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'wallets', label: 'Wallets', icon: CreditCard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'messages', label: 'Message', icon: MessageSquare },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome patient={patient} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
              <p>This feature is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Profile Section */}
          <div className="p-6 border-b border-gray-100 text-center">
            <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full mb-4 overflow-hidden border-4 border-white shadow-lg">
              <img 
                src={`https://ui-avatars.com/api/?name=${patient.user.first_name}+${patient.user.last_name}&background=random`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {patient.user.first_name} {patient.user.last_name}
            </h2>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <span className="text-sm text-gray-500">Patient ID : {patientId}</span>
            </div>
            <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-gray-400">
              <MapPin className="h-3 w-3" />
              <span>{patient.city || patient.province || 'Unknown Location'}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                    ${activeTab === item.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {activeTab === item.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <span className="font-bold text-lg">My Dashboard</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="flex justify-end mb-6">
            <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg animate-pulse flex items-center space-x-2">
               <Activity className="h-5 w-5" />
               <span>Emergency</span>
            </Button>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const DashboardHome: React.FC<{ patient: Patient }> = ({ patient }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Records */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Health Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {healthData.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className={`p-3 rounded-full bg-white shadow-sm mr-4 ${item.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{item.name}</p>
                    <div className="flex items-baseline space-x-2">
                      <h4 className="text-xl font-bold text-gray-900">{item.value}</h4>
                      <span className="text-xs font-medium bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overall Report */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-gray-900 mb-4 self-start">Overall Report</h3>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: 0 }, { value: 100 }]}
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#F3F4F6" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">Last visit</p>
              <p className="font-bold text-gray-900">No visits</p>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-500">Your health is</p>
            <p className="text-xl font-bold text-gray-900">Not Assessed</p>
          </div>
          <Button className="mt-6 w-full bg-gray-900 text-white hover:bg-gray-800" disabled>
            View Details
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments - Empty State */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
             <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Appointments Yet</h3>
          <p className="text-gray-500 text-center mb-6 max-w-sm">Start your health journey by booking your first appointment with our specialists.</p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            Book Your First Appointment
          </Button>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Analytics</h3>
            <select className="text-sm border-none bg-transparent text-gray-500 focus:ring-0">
              <option>Last 7 Days</option>
            </select>
          </div>
          
          <div className="flex space-x-6 mb-6">
             <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Heart Rate</button>
             <button className="text-gray-400 font-medium pb-1">Blood Pressure</button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
