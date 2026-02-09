import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminDoctors } from './AdminDoctors';
import { AdminPatients } from './AdminPatients';
import { AdminAppointments } from './AdminAppointments';
import { AdminUploadReport } from './AdminUploadReport';
import { Hospital } from '../../types';
import { adminAPI } from '../../services/api';
import { 
  Users, 
  CreditCard, 
  FileText, 
  Activity 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface AdminDashboardProps {
  hospital: Hospital;
  onLogout: () => void;
}

const revenueData = [
  { year: '2013', value: 60 },
  { year: '2014', value: 100 },
  { year: '2015', value: 240 },
  { year: '2016', value: 120 },
  { year: '2017', value: 80 },
  { year: '2018', value: 100 },
  { year: '2019', value: 300 },
];

const statusData = [
  { year: '2015', patients: 30, doctors: 100 },
  { year: '2016', patients: 60, doctors: 25 },
  { year: '2017', patients: 90, doctors: 80 },
  { year: '2018', patients: 120, doctors: 50 },
  { year: '2019', patients: 150, doctors: 110 },
];

const DashboardHome: React.FC = () => {
  const [statsData, setStatsData] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminAPI.getDashboardStats();
        setStatsData(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { 
      label: 'Doctors', 
      value: statsData.doctors, 
      icon: Users, 
      color: 'border-blue-500', 
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50'
    },
    { 
      label: 'Patients', 
      value: statsData.patients, 
      icon: Users, 
      color: 'border-green-500', 
      iconColor: 'text-green-500',
      iconBg: 'bg-green-50'
    },
    { 
      label: 'Appointment', 
      value: statsData.appointments, 
      icon: FileText, 
      color: 'border-red-500', 
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50'
    },
    { 
      label: 'Revenue', 
      value: `$${statsData.revenue}`, 
      icon: CreditCard, 
      color: 'border-yellow-500', 
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-50'
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Welcome Admin!</h1>
        <nav className="flex text-sm text-gray-500 mt-1">
          <span className="font-medium text-gray-900">Dashboard</span>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-full ${stat.iconBg}`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="text-right">
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">{stat.label}</span>
              </div>
              <div className={`mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden`}>
                <div className={`h-full w-1/2 ${stat.color.replace('border', 'bg')}`}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Status</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statusData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="patients" 
                  name="Patients"
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="doctors" 
                  name="Doctors"
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ hospital, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 flex-shrink-0`}>
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader user={hospital} onLogout={onLogout} toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="reports" element={<AdminUploadReport />} />
            <Route path="/" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};
