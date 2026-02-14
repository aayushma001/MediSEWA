import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import { Clock, Trash2, XCircle, Filter, Video, Building2, AlertTriangle, Zap, Calendar, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionModalProps {
  isOpen: boolean;
  type: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, type, onClose, onConfirm }) => {
  if (!isOpen) return null;
  const isDelete = type === 'delete';
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl"
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isDelete ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'}`}>
          <AlertTriangle size={28} />
        </div>
        <h3 className="text-xl font-black text-center text-slate-800 mb-2">
          {isDelete ? 'Delete Appointment?' : 'Cancel Appointment?'}
        </h3>
        <p className="text-center text-slate-500 text-sm font-medium mb-8 leading-relaxed">
          {isDelete
            ? "This action cannot be undone. The record will be permanently removed from your history."
            : "Are you sure? We will notify the doctor about this cancellation."}
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
            Keep it
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 rounded-xl font-bold text-white transition-all shadow-lg ${isDelete ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'}`}
          >
            {isDelete ? 'Yes, Delete' : 'Yes, Cancel'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState<'all' | 'Video' | 'Clinic'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false, type: null, id: null });

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8001/api/appointments/');
      const data = await response.json();
      console.log('Fetched appointments:', data);
      setAppointments(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const openActionModal = (type: string, id: number) => {
    setModalConfig({ isOpen: true, type, id });
  };

  const handleConfirmAction = async () => {
    const { type, id } = modalConfig;
    try {
      if (type === 'cancel') {
        const response = await fetch(`http://127.0.0.1:8001/api/appointments/${id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Cancelled' }),
        });
        if (response.ok) {
          setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: 'Cancelled' } : apt));
        }
      } else if (type === 'delete') {
        const response = await fetch(`http://127.0.0.1:8001/api/appointments/${id}/`, { method: 'DELETE' });
        if (response.ok) {
          setAppointments(prev => prev.filter(apt => apt.id !== id));
        }
      }
    } catch (error) {
      alert("Action failed. Please check server.");
    } finally {
      setModalConfig({ isOpen: false, type: null, id: null });
    }
  };

  const getFilteredAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    let filtered = appointments.filter(apt => {
      if (activeTab === 'cancelled') return apt.status === 'Cancelled';
      if (activeTab === 'past') return apt.date < today && apt.status !== 'Cancelled';
      return apt.date >= today && apt.status !== 'Cancelled';
    });

    if (appointmentTypeFilter !== 'all') {
      filtered = filtered.filter(apt => apt.appointment_type === appointmentTypeFilter);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return sortBy === 'recent' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

    return filtered;
  };

  const filteredData = getFilteredAppointments();

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 lg:p-10 max-w-[1200px] w-full mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Appointments</h1>
              <p className="text-slate-500 text-sm font-medium mt-1">Manage your visits and history.</p>
            </div>
            
            <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex gap-2 overflow-x-auto shadow-sm">
              {['upcoming', 'past', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Filter Section */}
          <div className="mb-8 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Filters:</span>
              
              {/* Appointment Type Filters */}
              <button
                onClick={() => setAppointmentTypeFilter('all')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  appointmentTypeFilter === 'all' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Calendar size={14} /> All Types
              </button>
              <button
                onClick={() => setAppointmentTypeFilter('Video')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  appointmentTypeFilter === 'Video' 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-200' 
                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                }`}
              >
                <Video size={14} /> Video Call
              </button>
              <button
                onClick={() => setAppointmentTypeFilter('Clinic')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  appointmentTypeFilter === 'Clinic' 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-200' 
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                <Building2 size={14} /> Clinic Visit
              </button>

              <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

              {/* Sort Filters */}
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 hidden lg:inline">Sort:</span>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  sortBy === 'recent' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200' 
                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                }`}
              >
                <Zap size={14} /> Most Recent
              </button>
              <button
                onClick={() => setSortBy('oldest')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  sortBy === 'oldest' 
                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Oldest First
              </button>

              {/* Active filter indicator */}
              {(appointmentTypeFilter !== 'all' || sortBy !== 'recent') && (
                <button
                  onClick={() => {
                    setAppointmentTypeFilter('all');
                    setSortBy('recent');
                  }}
                  className="ml-auto px-3 py-2 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 min-h-[400px]">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400 text-sm font-bold">Loading appointments...</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredData.length > 0 ? (
                  filteredData.map((apt) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={apt.id} 
                      className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-6 relative group overflow-hidden"
                    >
                      {/* Colored accent bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${apt.appointment_type === 'Video' ? 'bg-gradient-to-b from-purple-500 to-purple-600' : 'bg-gradient-to-b from-green-500 to-green-600'}`}></div>

                      <div className="flex-shrink-0 ml-2">
                        <div className="w-full md:w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex flex-col items-center justify-center border border-slate-200 text-slate-700 shadow-inner">
                          <span className="text-3xl font-black">{new Date(apt.date).getDate()}</span>
                          <span className="text-xs font-bold uppercase text-blue-600">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-[10px] font-medium mt-0.5 text-slate-400">{new Date(apt.date).getFullYear()}</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-black text-slate-800">
                              {apt.doctor ? `Dr. ${apt.doctor}` : `${apt.specialty} Specialist`}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1 flex items-center gap-2">
                              {apt.hospital && (
                                <>
                                  <MapPin size={12} className="text-blue-400" />
                                  {apt.hospital}
                                </>
                              )}
                              {apt.hospital && apt.specialty && <span className="text-slate-300">•</span>}
                              {apt.specialty && <span>{apt.specialty} Dept.</span>}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                              apt.status === 'Cancelled' 
                                ? 'bg-red-50 text-red-500 border border-red-100' 
                                : activeTab === 'past' 
                                  ? 'bg-slate-100 text-slate-500' 
                                  : apt.appointment_type === 'Video'
                                    ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                    : 'bg-green-50 text-green-600 border border-green-100'
                            }`}>
                              {apt.status === 'Upcoming' && activeTab === 'past' ? 'Completed' : apt.status}
                            </span>
                            {apt.appointment_type === 'Video' && activeTab === 'upcoming' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const dailyLink = apt.daily_room_url || apt.zoom_join_url || `https://your-domain.daily.co/appointment-${apt.id}`;
                                  window.open(dailyLink, '_blank');
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                                  apt.daily_room_url || apt.zoom_join_url
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-blue-200'
                                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                <Video size={14} />
                                {apt.daily_room_url || apt.zoom_join_url ? 'Join Call' : 'Call Link Pending'}
                              </motion.button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                            <Clock size={16} className="text-blue-400" /> 
                            <span className="text-slate-700 font-bold">{apt.time}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                            {apt.appointment_type === 'Video' ? (
                              <>
                                <Video size={16} className="text-blue-400" />
                                <span className="text-blue-600 font-bold">Online Video Call</span>
                                {apt.daily_room_url && (
                                  <span className="text-[10px] text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">
                                    Daily Ready
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <Building2 size={16} className="text-green-400" />
                                <span className="text-green-600 font-bold">In-Clinic Visit</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-slate-300">|</span> 
                            <span className="font-mono">#AP-{apt.id.toString().padStart(4, '0')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-end md:border-l md:pl-6 border-slate-100">
                        {activeTab === 'upcoming' && (
                          <button 
                            onClick={() => openActionModal('cancel', apt.id)} 
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors font-bold text-xs uppercase tracking-wider"
                          >
                            <XCircle size={16} /> Cancel
                          </button>
                        )}
                        <button 
                          onClick={() => openActionModal('delete', apt.id)} 
                          className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                          title="Delete Record"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                     <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Filter size={28} />
                     </div>
                     <h3 className="text-xl font-black text-slate-800">No {activeTab} appointments</h3>
                     <p className="text-slate-400 text-sm mt-2 mb-6">Your schedule looks clear for now.</p>
                     {activeTab === 'upcoming' && (
                       <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                         Book New Appointment
                       </button>
                     )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
      <AnimatePresence>
        {modalConfig.isOpen && (
           <ActionModal 
             isOpen={modalConfig.isOpen} 
             type={modalConfig.type} 
             onClose={() => setModalConfig({ isOpen: false, type: null, id: null })} 
             onConfirm={handleConfirmAction} 
           />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentsPage;

