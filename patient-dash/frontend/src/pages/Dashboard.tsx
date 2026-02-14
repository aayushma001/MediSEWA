import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import {
  Heart, Activity, Droplets, Plus, Calendar, Clock, MapPin,
  ChevronRight, Loader2, X, Download, Video, CheckCircle2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';

interface Appointment {
  id: number;
  specialty: string;
  type: string;
  date: string;
  time: string;
  doctorName: string;
  daily_room_url?: string;
  zoom_join_url?: string;
  zoom_meeting_url?: string;
  zoom_meeting_id?: string;
  zoom_password?: string;
}

const TicketModal: React.FC<{ appointment: Appointment | null; onClose: () => void }> = ({ appointment, onClose }) => {
  if (!appointment) return null;

  const downloadTicket = () => {
    const doc = new jsPDF();
    doc.setFontSize(10);
    doc.text("HEALTHCORE NEPAL - E-TICKET", 105, 20, { align: "center" });
    doc.line(20, 25, 190, 25);
    doc.setFontSize(14);
    doc.text(`Patient: Hendrita Hayes`, 20, 40);
    doc.text(`Doctor: ${appointment.doctorName}`, 20, 50);
    doc.text(`Date: ${appointment.date} | Time: ${appointment.time}`, 20, 60);
    doc.save(`Ticket_${appointment.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-[360px] rounded-[2rem] overflow-hidden shadow-2xl relative"
      >
        <div className="bg-slate-900 p-6 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">MediSewa</p>
              <h3 className="text-xl font-black mt-1">Boarding Pass</h3>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-50 relative">
           <div className="absolute -left-3 top-0 w-6 h-6 bg-slate-900 rounded-full -translate-y-1/2"></div>
           <div className="absolute -right-3 top-0 w-6 h-6 bg-slate-900 rounded-full -translate-y-1/2"></div>
           <div className="absolute top-0 left-4 right-4 border-t-2 border-dashed border-slate-300"></div>

           <div className="mt-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center text-xl font-bold text-blue-600">
                {appointment.specialty?.charAt(0) || 'H'}
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-800 leading-tight">{appointment.doctorName}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase">{appointment.specialty} Dept.</p>
              </div>
           </div>
           
           <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                 <p className="text-[10px] text-slate-400 uppercase font-bold">Date</p>
                 <p className="font-bold text-slate-800">{appointment.date}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                 <p className="text-[10px] text-slate-400 uppercase font-bold">Time</p>
                 <p className="font-bold text-slate-800">{appointment.time}</p>
              </div>
           </div>

           <div className="mt-6 flex flex-col items-center">
              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HC-${appointment.id}`} alt="QR" className="w-32 h-32"/>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Scan at Reception</p>
           </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
           <button onClick={downloadTicket} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all text-xs uppercase tracking-wider">
             <Download size={16}/> Download PDF
           </button>
        </div>
      </motion.div>
    </div>
  );
};

const StatCard: React.FC<{ icon: any; label: string; value: string; subValue: string; color: string; iconColor: string; onUpdate?: () => void }> = ({ icon, label, value, subValue, color, iconColor, onUpdate }) => (
  <motion.div whileHover={{ y: -5 }} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} ${iconColor}`}>{icon}</div>
      {onUpdate && (
        <button 
          onClick={onUpdate}
          className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Update
        </button>
      )}
      {!onUpdate && <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded-lg">{subValue}</span>}
    </div>
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <h4 className="text-xl font-black text-slate-800 mt-1">{value}</h4>
    </div>
  </motion.div>
);

// Modal for updating health stats
const UpdateStatModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string;
  unit: string;
  onSave: (value: string) => void;
}> = ({ isOpen, onClose, title, unit, onSave }) => {
  const [value, setValue] = useState('');
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6">
          <h3 className="text-lg font-black text-slate-800 mb-4">Update {title}</h3>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter ${title.toLowerCase()} value`}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-bold"
          />
          <p className="text-xs text-slate-500 mt-2">Unit: {unit}</p>
        </div>
        <div className="flex gap-3 p-4 bg-slate-50">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (value) {
                onSave(value);
                setValue('');
                onClose();
              }
            }}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [nextVisit, setNextVisit] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Appointment | null>(null);
  
  // Health stats state
  const [healthStats, setHealthStats] = useState({
    heartRate: 0,
    glucose: 0,
    bloodPressure: '',
    lastUpdated: ''
  });
  const [updateModal, setUpdateModal] = useState<{ isOpen: boolean; type: string; title: string; unit: string }>({
    isOpen: false,
    type: '',
    title: '',
    unit: ''
  });

  // Load health stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('healthStats');
    if (savedStats) {
      setHealthStats(JSON.parse(savedStats));
    } else {
      // Default values if no data
      setHealthStats({
        heartRate: 140,
        glucose: 90,
        bloodPressure: '120/80',
        lastUpdated: new Date().toISOString()
      });
    }
  }, []);

  const saveHealthStat = (type: string, value: string) => {
    const updatedStats = { ...healthStats };
    
    if (type === 'heartRate') {
      updatedStats.heartRate = parseInt(value);
    } else if (type === 'glucose') {
      updatedStats.glucose = parseInt(value);
    } else if (type === 'bloodPressure') {
      updatedStats.bloodPressure = value;
    }
    
    updatedStats.lastUpdated = new Date().toISOString();
    
    setHealthStats(updatedStats);
    localStorage.setItem('healthStats', JSON.stringify(updatedStats));
  };

  const getHealthStatus = (type: string, value: number | string) => {
    if (type === 'heartRate') {
      return value >= 60 && value <= 100 ? 'Normal' : 'Check';
    } else if (type === 'glucose') {
      return value >= 70 && value <= 100 ? 'Normal' : 'High';
    }
    return 'Ok';
  };

  const openUpdateModal = (type: string, title: string, unit: string) => {
    setUpdateModal({ isOpen: true, type, title, unit });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    fetch('http://127.0.0.1:8001/api/appointments/')
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) return;

        const formattedData = data.map((apt: any) => ({
          id: apt.id,
          specialty: apt.specialty || 'General',
          type: apt.appointment_type || 'Clinic',
          date: apt.date,
          time: apt.time,
          doctorName: apt.doctor ? `Dr. ${apt.doctor}` : `Dr. ${apt.specialty} Specialist`,
          daily_room_url: apt.daily_room_url,
          zoom_join_url: apt.zoom_join_url,
          zoom_meeting_url: apt.zoom_meeting_url,
          zoom_meeting_id: apt.zoom_meeting_id,
          zoom_password: apt.zoom_password
        }));

        // Ensure date comparison is stable
        const todayStr = new Date().toISOString().split('T')[0];

        const sorted = formattedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const upcoming = sorted.filter(apt => apt.date >= todayStr);

        if (upcoming.length > 0) setNextVisit(upcoming[0]);
        setAppointments(upcoming.slice(0, 5));
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Dashboard Fetch Error:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="p-6 lg:p-10 max-w-[1600px] w-full mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {greeting}, Hendrita <span className="text-2xl animate-pulse">👋</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-1">Namaste! Here is your daily health summary.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <StatCard 
                  icon={<Heart size={20}/>} 
                  label="Heart Rate" 
                  value={healthStats.heartRate > 0 ? `${healthStats.heartRate} Bpm` : '--'} 
                  subValue={healthStats.heartRate > 0 ? getHealthStatus('heartRate', healthStats.heartRate) : 'N/A'} 
                  color="bg-red-50" 
                  iconColor="text-red-500" 
                  onUpdate={() => openUpdateModal('heartRate', 'Heart Rate', 'Bpm')}
                />
                <StatCard 
                  icon={<Droplets size={20}/>} 
                  label="Glucose" 
                  value={healthStats.glucose > 0 ? `${healthStats.glucose} mg/dl` : '--'} 
                  subValue={healthStats.glucose > 0 ? getHealthStatus('glucose', healthStats.glucose) : 'N/A'} 
                  color="bg-blue-50" 
                  iconColor="text-blue-500" 
                  onUpdate={() => openUpdateModal('glucose', 'Glucose', 'mg/dl')}
                />
                <StatCard 
                  icon={<Activity size={20}/>} 
                  label="Blood Pressure" 
                  value={healthStats.bloodPressure || '--'} 
                  subValue="Ok" 
                  color="bg-orange-50" 
                  iconColor="text-orange-500" 
                  onUpdate={() => openUpdateModal('bloodPressure', 'Blood Pressure', 'mmHg')}
                />
              </div>

              {/* Appointments List */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[400px]">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-slate-800">Upcoming Appointments <span className="text-xs font-normal text-slate-400 ml-2">(Recent 5)</span></h3>
                    {isLoading && <Loader2 className="animate-spin text-blue-600" size={20} />}
                 </div>

                 {!isLoading && appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((apt, index) => (
                        <motion.div 
                          key={apt.id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSelectedTicket(apt)}
                          className="flex flex-col sm:flex-row items-center justify-between p-5 border border-slate-100 rounded-[1.5rem] hover:bg-slate-50 hover:border-blue-100 transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-5 w-full sm:w-auto">
                            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black shadow-sm ${index === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                <span className="text-xl leading-none">{new Date(apt.date).getDate()}</span>
                                <span className="text-[9px] uppercase mt-1 opacity-80">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                            <div>
                               <h4 className="font-bold text-lg text-slate-800">{apt.specialty}</h4>
                               <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                                 {apt.doctorName} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {apt.type}
                               </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                             <div className="text-right mr-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                                <div className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-black text-slate-700">{apt.time}</div>
                             </div>
                             <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <ChevronRight size={18}/>
                             </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                 ) : !isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center">
                       <p className="text-sm font-bold text-slate-500">No upcoming appointments found.</p>
                       <button onClick={() => navigate('/book-appointment')} className="mt-6 text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Book Now</button>
                    </div>
                 )}
              </div>
            </div>

            {/* Next Visit Sidebar Card */}
            <div className="lg:col-span-4 h-full">
              <div className="relative overflow-hidden bg-slate-900 text-white p-8 rounded-[2.5rem] flex flex-col justify-between h-full shadow-2xl min-h-[450px]">
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-2xl font-black tracking-tight">Next Visit</h3>
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">Confirmed</span>
                        </div>
                    </div>

                    {nextVisit ? (
                      <>
                        <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                                {nextVisit.specialty?.charAt(0) || 'H'}
                            </div>
                            <div>
                                <p className="font-bold text-lg leading-tight">{nextVisit.doctorName}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{nextVisit.specialty}</p>
                            </div>
                        </div>

                        <div className="space-y-6 mb-auto">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-blue-400"><Calendar size={18} /></div>
                                <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Date</p><p className="text-sm font-bold text-slate-200">{nextVisit.date}</p></div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-blue-400"><Clock size={18} /></div>
                                <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Time</p><p className="text-sm font-bold text-slate-200">{nextVisit.time}</p></div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${nextVisit.type === 'Video' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-white/5 text-blue-400 border-white/5'}`}>
                                    {nextVisit.type === 'Video' ? <Video size={18} /> : <MapPin size={18} />}
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Mode</p>
                                    <p className={`text-sm font-bold ${nextVisit.type === 'Video' ? 'text-indigo-300' : 'text-slate-200'}`}>
                                        {nextVisit.type === 'Clinic' ? 'HealthCore Center' : 'Online Consultation'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Action Buttons based on Type */}
                        <div className="mt-8 space-y-3">
                          {nextVisit.type === 'Video' && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                // Fallback to opening link in new tab
                                const dailyLink = nextVisit.daily_room_url || nextVisit.zoom_join_url || `https://your-domain.daily.co/appointment-${nextVisit.id}`;
                                window.open(dailyLink, '_blank');
                              }}
                              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                           >
                              <Video size={18} />
                              Join Video Call
                            </motion.button>
                          )}

                          <motion.button
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => setSelectedTicket(nextVisit)}
                           className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                              nextVisit.type === 'Video'
                                ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm'
                               : 'bg-white text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            View Ticket
                         </motion.button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                         <Calendar size={32} className="mb-4" />
                         <p className="text-sm font-medium">No upcoming visits</p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <AnimatePresence>
        {selectedTicket && <TicketModal appointment={selectedTicket} onClose={() => setSelectedTicket(null)} />}
      </AnimatePresence>
      
      {/* Update Health Stats Modal */}
      <UpdateStatModal 
        isOpen={updateModal.isOpen} 
        onClose={() => setUpdateModal({ ...updateModal, isOpen: false })} 
        title={updateModal.title}
        unit={updateModal.unit}
        onSave={(value) => saveHealthStat(updateModal.type, value)}
      />


    </div>
  );
};

export default Dashboard;
