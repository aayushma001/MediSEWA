import React, { useState } from 'react';
import { User } from '../../types';
import { 
  LayoutDashboard, 
  Calendar, 
  Stethoscope, 
  UserRound, 
  Users, 
  Star, 
  CreditCard, 
  Settings, 
  FileText, 
  LogOut,
  Bell,
  Search,
  Menu,
  MoreVertical
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface HospitalDashboardProps {
  user: User;
  onLogout: () => void;
}

const dataRevenue = [
  { year: '2013', revenue: 60 },
  { year: '2014', revenue: 100 },
  { year: '2015', revenue: 240 },
  { year: '2016', revenue: 120 },
  { year: '2017', revenue: 80 },
  { year: '2018', revenue: 100 },
  { year: '2019', revenue: 300 },
];

const dataStatus = [
  { year: '2015', patients: 100, doctors: 30 },
  { year: '2016', patients: 20, doctors: 60 },
  { year: '2017', patients: 90, doctors: 70 },
  { year: '2018', patients: 60, doctors: 80 },
  { year: '2019', patients: 120, doctors: 160 },
];

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Calendar, label: 'Appointments' },
    { icon: Stethoscope, label: 'Specialities' },
    { icon: UserRound, label: 'Doctors' },
    { icon: Users, label: 'Patients' },
    { icon: Star, label: 'Reviews' },
    { icon: CreditCard, label: 'Transactions' },
    { icon: Settings, label: 'Settings' },
    { icon: FileText, label: 'Reports' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-[#2c3e50] text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} fixed h-full z-30`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
           <h1 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>DOCCURE</h1>
           {/* Fallback logo if image not available */}
        </div>
        
        <div className="py-4">
          <div className="px-4 mb-4 text-xs text-gray-400 uppercase">Main</div>
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className={`flex items-center px-4 py-3 text-sm transition-colors ${
                  item.active 
                    ? 'bg-[#00d0f1] text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className={`${!sidebarOpen && 'hidden'}`}>{item.label}</span>
              </a>
            ))}
            
            <div className="px-4 mt-8 mb-4 text-xs text-gray-400 uppercase">Pages</div>
            <a href="#" className="flex items-center px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
              <UserRound className="h-5 w-5 mr-3" />
              <span className={`${!sidebarOpen && 'hidden'}`}>Profile</span>
            </a>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className={`${!sidebarOpen && 'hidden'}`}>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-gray-100 mr-4">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search here" 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <div className="text-sm font-semibold text-gray-900">{user.hospital_profile?.hospital_name || user.name || 'Admin'}</div>
                <div className="text-xs text-gray-500">Hospital Administrator</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                <img 
                  src={user.hospital_profile?.logo || "https://via.placeholder.com/40"} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Admin!</h2>
            <p className="text-gray-500 text-sm">Dashboard</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 text-blue-500 mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-gray-500 text-sm font-medium">Doctors</div>
                <div className="text-2xl font-bold text-gray-900">168</div>
                <div className="mt-2 h-1 w-full bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[70%]"></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-50 text-green-500 mb-4">
                  <UserRound className="h-6 w-6" />
                </div>
                <div className="text-gray-500 text-sm font-medium">Patients</div>
                <div className="text-2xl font-bold text-gray-900">487</div>
                <div className="mt-2 h-1 w-full bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[60%]"></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-50 text-red-500 mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="text-gray-500 text-sm font-medium">Appointment</div>
                <div className="text-2xl font-bold text-gray-900">485</div>
                <div className="mt-2 h-1 w-full bg-red-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[50%]"></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-yellow-50 text-yellow-500 mb-4">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="text-gray-500 text-sm font-medium">Revenue</div>
                <div className="text-2xl font-bold text-gray-900">$62523</div>
                <div className="mt-2 h-1 w-full bg-yellow-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 w-[80%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dataRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1b5a90" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1b5a90" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#1b5a90" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Status</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataStatus} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="patients" stroke="#ff902f" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="doctors" stroke="#1b5a90" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Doctors List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">Doctors List</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-semibold">
                    <tr>
                      <th className="px-6 py-4">Doctor Name</th>
                      <th className="px-6 py-4">Speciality</th>
                      <th className="px-6 py-4">Earned</th>
                      <th className="px-6 py-4">Reviews</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center">
                        <img className="h-8 w-8 rounded-full object-cover mr-3" src="https://via.placeholder.com/32" alt="" />
                        <span className="font-medium text-gray-900">Dr. Ruby Perrin</span>
                      </td>
                      <td className="px-6 py-4">Dental</td>
                      <td className="px-6 py-4 text-gray-900">$3200.00</td>
                      <td className="px-6 py-4">
                        <div className="flex text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center">
                        <img className="h-8 w-8 rounded-full object-cover mr-3" src="https://via.placeholder.com/32" alt="" />
                        <span className="font-medium text-gray-900">Dr. Darren Elder</span>
                      </td>
                      <td className="px-6 py-4">Dental</td>
                      <td className="px-6 py-4 text-gray-900">$3100.00</td>
                      <td className="px-6 py-4">
                        <div className="flex text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Patients List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">Patients List</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-semibold">
                    <tr>
                      <th className="px-6 py-4">Patient Name</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Last Visit</th>
                      <th className="px-6 py-4">Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center">
                        <img className="h-8 w-8 rounded-full object-cover mr-3" src="https://via.placeholder.com/32" alt="" />
                        <span className="font-medium text-gray-900">Charlene Reed</span>
                      </td>
                      <td className="px-6 py-4">8286329170</td>
                      <td className="px-6 py-4">20 Oct 2023</td>
                      <td className="px-6 py-4 text-gray-900">$100.00</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center">
                        <img className="h-8 w-8 rounded-full object-cover mr-3" src="https://via.placeholder.com/32" alt="" />
                        <span className="font-medium text-gray-900">Travis Trimble</span>
                      </td>
                      <td className="px-6 py-4">2077299974</td>
                      <td className="px-6 py-4">22 Oct 2023</td>
                      <td className="px-6 py-4 text-gray-900">$200.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
