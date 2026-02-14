import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, X, Video, Building2, Stethoscope, Search, Star } from 'lucide-react';
import NotificationBell from '../NotificationBell';

interface Doctor {
  id: number;
  name: string;
  specialties: string[];
  rating: number;
  consultationFee: number;
  hospital: string;
  image: string;
}

interface Hospital {
  id: number;
  name: string;
  location: string;
  rating: number;
}

const MOCK_DOCTORS: Doctor[] = [
  { id: 1, name: 'Dr. Rajesh Kumar', specialties: ['Cardiology', 'Internal Medicine'], rating: 4.8, consultationFee: 500, hospital: 'Patan Hospital', image: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
  { id: 2, name: 'Dr. Priya Sharma', specialties: ['Neurology', 'Neurosurgery'], rating: 4.7, consultationFee: 600, hospital: 'Grande International', image: 'https://images.unsplash.com/photo-1639699686900-6e988faf4d66?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
  { id: 3, name: 'Dr. Amit Patel', specialties: ['Orthopedic', 'Sports Medicine'], rating: 4.6, consultationFee: 550, hospital: 'Kathmandu Medical College', image: 'https://images.unsplash.com/photo-1612349317150-e539c59dc2e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
  { id: 4, name: 'Dr. Anika Singh', specialties: ['Dentistry', 'Orthodontics'], rating: 4.9, consultationFee: 400, hospital: 'Nepal Medical College', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
];

const MOCK_HOSPITALS: Hospital[] = [
  { id: 1, name: 'Patan Hospital', location: 'Patan Dhoka, Kathmandu', rating: 4.7 },
  { id: 2, name: 'Tribhuvan University Teaching Hospital', location: 'Kathmandu Medical College', rating: 4.5 },
  { id: 3, name: 'Kathmandu Medical College Hospital', location: 'Sinamangal, Kathmandu', rating: 4.6 },
  { id: 4, name: 'Grande International Hospital', location: 'Jamal, Kathmandu', rating: 4.8 },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [showQuickBookModal, setShowQuickBookModal] = useState(false);
  const [quickBookType, setQuickBookType] = useState<'doctor' | 'hospital' | null>(null);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [hospitalSearch, setHospitalSearch] = useState('');

  const handleQuickBook = () => {
    setShowQuickBookModal(true);
    setQuickBookType(null);
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    navigate('/book-appointment', { 
      state: { 
        selectedDoctor: doctor, 
        source: 'doctor',
        skipSpecialty: true,
        skipType: true
      } 
    });
    setShowQuickBookModal(false);
  };

  const handleSelectHospital = (hospital: Hospital) => {
    navigate('/book-appointment', { 
      state: { 
        selectedHospital: hospital, 
        source: 'hospital',
        skipSpecialty: true,
        skipType: true
      } 
    });
    setShowQuickBookModal(false);
  };

  const handleGeneralBooking = () => {
    navigate('/book-appointment', { 
      state: { 
        source: 'general'
      } 
    });
    setShowQuickBookModal(false);
  };

  const filteredDoctors = MOCK_DOCTORS.filter(d => 
    d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.specialties.some(s => s.toLowerCase().includes(doctorSearch.toLowerCase()))
  );

  const filteredHospitals = MOCK_HOSPITALS.filter(h =>
    h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
    h.location.toLowerCase().includes(hospitalSearch.toLowerCase())
  );

  return (
    <>
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img 
            src="./logo.png" 
            alt="Logo" 
            className="h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          />
        </div>

        <div className="flex items-center gap-6">
          {/* Quick Book Button */}
          <button 
            onClick={handleQuickBook}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={16} strokeWidth={3} />
            Quick Book
          </button>

          <div className="flex items-center gap-6">
            <NotificationBell />
            
            <div className="h-8 w-[1px] bg-slate-200"></div>

            <div className="flex items-center gap-3 cursor-pointer group">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" 
                className="w-9 h-9 rounded-xl object-cover border border-slate-200" 
                alt="User" 
              />
              <div className="hidden md:block">
                <p className="text-xs font-black text-slate-700 leading-none group-hover:text-blue-600 transition-colors">Hendrita H.</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Kathmandu, NP</p>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Quick Book Modal */}
      {showQuickBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Quick Book</h3>
                <p className="text-sm text-slate-500">Choose how you want to book your appointment</p>
              </div>
              <button 
                onClick={() => setShowQuickBookModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Quick Book Type Selection */}
            {!quickBookType && (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setQuickBookType('doctor')}
                    className="p-6 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <Stethoscope size={28} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Book with Doctor</p>
                      <p className="text-xs text-slate-500">Video consultation</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setQuickBookType('hospital')}
                    className="p-6 border-2 border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <Building2 size={28} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Book at Hospital</p>
                      <p className="text-xs text-slate-500">In-person visit</p>
                    </div>
                  </button>

                  <button
                    onClick={handleGeneralBooking}
                    className="p-6 border-2 border-slate-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all flex flex-col items-center gap-3 col-span-2"
                  >
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <Search size={28} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">General Booking</p>
                      <p className="text-xs text-slate-500">Select department and schedule</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Doctor Selection */}
            {quickBookType === 'doctor' && (
              <div className="p-6">
                <button
                  onClick={() => setQuickBookType(null)}
                  className="mb-4 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  ← Back to options
                </button>

                <div className="relative mb-4">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search doctors..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredDoctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => handleSelectDoctor(doctor)}
                      className="w-full p-4 flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                    >
                      <img 
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{doctor.name}</p>
                        <p className="text-xs text-slate-500">{doctor.specialties[0]}</p>
                        <p className="text-xs text-slate-400">{doctor.hospital}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hospital Selection */}
            {quickBookType === 'hospital' && (
              <div className="p-6">
                <button
                  onClick={() => setQuickBookType(null)}
                  className="mb-4 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  ← Back to options
                </button>

                <div className="relative mb-4">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search hospitals..."
                    value={hospitalSearch}
                    onChange={(e) => setHospitalSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredHospitals.map((hospital) => (
                    <button
                      key={hospital.id}
                      onClick={() => handleSelectHospital(hospital)}
                      className="w-full p-4 flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Building2 size={20} className="text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{hospital.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Search size={12} />
                          {hospital.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-medium">{hospital.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
