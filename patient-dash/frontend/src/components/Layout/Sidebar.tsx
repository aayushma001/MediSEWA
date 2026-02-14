import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Heart, FileText, Settings, LogOut, Building2, Stethoscope, Receipt } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { name: 'My Appointments', icon: <Calendar size={18} />, path: '/appointments' },
    { name: 'Doctors', icon: <Stethoscope size={18} />, path: '/doctors' },
    { name: 'Hospitals', icon: <Building2 size={18} />, path: '/hospitals' },
    { name: 'Medical Records', icon: <FileText size={18} />, path: '/records' },
    { name: 'Receipts', icon: <Receipt size={18} />, path: '/receipts' },
    { name: 'Settings', icon: <Settings size={18} />, path: '/settings' },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-100 min-h-screen sticky top-0 hidden lg:flex flex-col py-10 px-6 font-sans z-50">
      <div className="flex flex-col items-center mb-10">
        <div className="w-28 h-28 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-xl mb-4">
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256" className="w-full h-full object-cover" />
        </div>
        <h3 className="text-lg font-black text-slate-800">Hendrita Hayes</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: PT254654</p>
      </div>
      <nav className="space-y-2 w-full flex-1">
        {menuItems.map((item) => (
          <button key={item.name} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-bold transition-all duration-300 ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 translate-x-2' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}>
            {item.icon}{item.name}
          </button>
        ))}
      </nav>
      <button className="flex items-center gap-3 px-6 py-4 text-xs font-black text-red-400 hover:bg-red-50 rounded-2xl transition-all mt-auto"><LogOut size={18} /> Logout</button>
    </aside>
  );
};
export default Sidebar;