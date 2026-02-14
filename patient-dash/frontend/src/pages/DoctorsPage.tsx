
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import {
  Star, Heart, Search, Stethoscope, MapPin, Award, Clock, Phone, CalendarCheck, Filter
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface Doctor {
  id: number;
  name: string;
  specialties: string[];
  rating: number;
  reviews: number;
  phone: string;
  email: string;
  experience: number;
  consultationFee: number;
  availability: string;
  image: string;
  isFavourite: boolean;
  hospital: string;
  patients: number;
  coverImage?: string;
}

const MOCK_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Rajesh Kumar',
    specialties: ['Cardiology', 'Internal Medicine'],
    rating: 4.8,
    reviews: 156,
    phone: '+977-1-5000001',
    email: 'rajesh@medisewa.np',
    experience: 15,
    consultationFee: 500,
    availability: 'Mon-Fri: 10 AM - 5 PM',
    image: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    coverImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    isFavourite: false,
    hospital: 'Patan Hospital',
    patients: 1250,
  },
  {
    id: 2,
    name: 'Dr. Priya Sharma',
    specialties: ['Neurology', 'Neurosurgery'],
    rating: 4.7,
    reviews: 203,
    phone: '+977-1-5000002',
    email: 'priya@medisewa.np',
    experience: 12,
    consultationFee: 600,
    availability: 'Tue-Sat: 11 AM - 6 PM',
    image: 'https://images.unsplash.com/photo-1639699686900-6e988faf4d66?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    coverImage: 'https://images.unsplash.com/photo-1558160074-4d7b8bdf4256?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    isFavourite: false,
    hospital: 'Grande International',
    patients: 980,
  },
  {
    id: 3,
    name: 'Dr. Amit Patel',
    specialties: ['Orthopedic', 'Sports Medicine'],
    rating: 4.6,
    reviews: 189,
    phone: '+977-1-5000003',
    email: 'amit@medisewa.np',
    experience: 10,
    consultationFee: 550,
    availability: 'Mon, Wed, Fri: 2 PM - 8 PM',
    image: 'https://images.unsplash.com/photo-1612349317150-e539c59dc2e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    coverImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    isFavourite: false,
    hospital: 'Kathmandu Medical College',
    patients: 1100,
  },
  {
    id: 4,
    name: 'Dr. Anika Singh',
    specialties: ['Dentistry', 'Orthodontics'],
    rating: 4.9,
    reviews: 287,
    phone: '+977-1-5000004',
    email: 'anika@medisewa.np',
    experience: 8,
    consultationFee: 400,
    availability: 'Daily: 9 AM - 5 PM',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    coverImage: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    isFavourite: false,
    hospital: 'Nepal Medical College',
    patients: 2050,
  },
];

// Animation variants for cards
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut" as const
    }
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  hover: {
    y: -5,
    transition: { duration: 0.2 }
  }
};

const DoctorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'fee'>('rating');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('');
  const [experienceFilter, setExperienceFilter] = useState<number>(0);
  const [showFavorites, setShowFavorites] = useState(false);

  // Load doctors and favorites from localStorage on mount
  useEffect(() => {
    const savedFavs = localStorage.getItem('doc_favorites');
    const favoriteIds = savedFavs ? JSON.parse(savedFavs) : [];
    
    setDoctors(MOCK_DOCTORS.map(d => ({
      ...d,
      isFavourite: favoriteIds.includes(d.id)
    })));
  }, []);

  const filteredDoctors = doctors
    .filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRating = ratingFilter === 0 || d.rating >= ratingFilter;
      const matchesSpecialty = specialtyFilter === '' || d.specialties.includes(specialtyFilter);
      const matchesExperience = experienceFilter === 0 || d.experience >= experienceFilter;
      const matchesFavorites = !showFavorites || d.isFavourite;
      return matchesSearch && matchesRating && matchesSpecialty && matchesExperience && matchesFavorites;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experience - a.experience;
      return a.consultationFee - b.consultationFee;
    });

  const uniqueSpecialties = Array.from(
    new Set(doctors.flatMap(d => d.specialties))
  ).sort();

  const toggleFavourite = (id: number) => {
    const updatedDoctors = doctors.map(d => 
      d.id === id ? { ...d, isFavourite: !d.isFavourite } : d
    );
    setDoctors(updatedDoctors);
    
    const favoriteIds = updatedDoctors
      .filter(d => d.isFavourite)
      .map(d => d.id);
    localStorage.setItem('doc_favorites', JSON.stringify(favoriteIds));
  };

  const handleBooking = (doctorId: number) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      navigate('/book-appointment', { 
        state: { 
          selectedDoctor: doctor, 
          source: 'doctor',
          skipSpecialty: true,
          skipType: true
        } 
      });
    }
  };

  const clearFilters = () => {
    setRatingFilter(0);
    setSpecialtyFilter('');
    setExperienceFilter(0);
    setShowFavorites(false);
    setSearchQuery('');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-blue-600 px-8 py-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-white mb-2">
                Find Doctors
              </h1>
              <p className="text-blue-100">
                Consult with expert doctors and book appointments instantly
              </p>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <div className="px-8 py-6 bg-white border-b border-slate-200 sticky top-0 z-20">
            <div className="flex gap-4 flex-col lg:flex-row lg:items-center">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={20} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search doctors, specialties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl focus:border-blue-500 focus:outline-none font-semibold text-slate-800 transition-all"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowFavorites(!showFavorites)}
                  className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                    showFavorites
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Heart size={16} fill={showFavorites ? "currentColor" : "none"} />
                  Favorites
                </button>
                {[
                  { key: 'rating', label: 'Top Rated', icon: Star },
                  { key: 'experience', label: 'Experience', icon: Award },
                  { key: 'fee', label: 'Low Fee', icon: Stethoscope }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key as 'rating' | 'experience' | 'fee')}
                    className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                      sortBy === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-3 flex-wrap items-center">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
                className="px-4 py-2.5 rounded-lg border-2 border-slate-200 font-semibold text-sm focus:border-blue-500 outline-none bg-white text-slate-700 cursor-pointer"
              >
                <option value="0">All Ratings</option>
                <option value="4.0">⭐ 4.0+</option>
                <option value="4.5">⭐ 4.5+</option>
                <option value="4.7">⭐ 4.7+</option>
              </select>

              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="px-4 py-2.5 rounded-lg border-2 border-slate-200 font-semibold text-sm focus:border-blue-500 outline-none bg-white text-slate-700 cursor-pointer"
              >
                <option value="">All Specialties</option>
                {uniqueSpecialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>

              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(parseFloat(e.target.value))}
                className="px-4 py-2.5 rounded-lg border-2 border-slate-200 font-semibold text-sm focus:border-blue-500 outline-none bg-white text-slate-700 cursor-pointer"
              >
                <option value="0">All Experience</option>
                <option value="5">5+ Years</option>
                <option value="10">10+ Years</option>
                <option value="15">15+ Years</option>
              </select>

              {(ratingFilter > 0 || specialtyFilter || experienceFilter > 0 || showFavorites || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 rounded-lg bg-red-50 border-2 border-red-200 text-red-600 font-semibold text-sm hover:bg-red-100 transition-all flex items-center gap-1"
                >
                  <Filter size={14} />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="p-8">
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope size={36} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No doctors found</h3>
                <p className="text-slate-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                layout
              >
                <AnimatePresence mode="popLayout">
                  {filteredDoctors.map((doctor, index) => (
                    <motion.div
                      key={doctor.id}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      whileHover="hover"
                      layout
                      className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300"
                    >
                      {/* Cover */}
                      <div className="relative h-28 bg-gradient-to-r from-blue-500 to-indigo-600">
                        <img 
                          src={doctor.coverImage} 
                          alt=""
                          className="w-full h-full object-cover opacity-30"
                          onError={(e) => { 
                            e.currentTarget.style.display = 'none'; 
                          }}
                        />
                        
                        {/* Favorite Button */}
                        <motion.button 
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => { e.stopPropagation(); toggleFavourite(doctor.id); }}
                          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 ${
                            doctor.isFavourite 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white text-slate-400 hover:text-red-500'
                          }`}
                        >
                          <Heart size={16} fill={doctor.isFavourite ? "currentColor" : "none"}/>
                        </motion.button>

                        {/* Rating Badge */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white rounded-full flex items-center gap-1 shadow">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-bold text-slate-800">{doctor.rating}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 -mt-10 relative">
                        {/* Avatar */}
                        <div className="relative mb-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden border-3 border-white shadow-lg mx-auto">
                            <img 
                              src={doctor.image} 
                              alt={doctor.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => { 
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=3B82F6&color=fff&size=200`; 
                              }}
                            />
                          </div>
                        </div>

                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold text-slate-800 mb-1">
                            {doctor.name}
                          </h3>
                          <p className="text-sm text-blue-600 font-medium">
                            {doctor.specialties[0]}
                          </p>
                        </div>

                        {/* Experience & Patients */}
                        <div className="flex justify-center gap-4 mb-4">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Award size={12} className="text-amber-500" />
                            <span>{doctor.experience} yrs exp</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <CalendarCheck size={12} className="text-green-500" />
                            <span>{doctor.patients}+ patients</span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Stethoscope size={14} className="text-blue-500" />
                            <span className="truncate">{doctor.hospital}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock size={14} className="text-purple-500" />
                            <span className="truncate">{doctor.availability}</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div>
                            <p className="text-xs text-slate-400">Consult Fee</p>
                            <p className="text-lg font-bold text-slate-800">NPR {doctor.consultationFee}</p>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleBooking(doctor.id); }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorsPage;
