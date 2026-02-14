
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import {
  MapPin, Star, Heart, Search, Building2, Phone, Clock, Users, Bed, Filter, Award
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface Hospital {
  id: number;
  name: string;
  location: string;
  distance: number;
  rating: number;
  reviews: number;
  phone: string;
  hours: string;
  specialties: string[];
  beds: number;
  doctors: number;
  image: string;
  coverImage?: string;
  isFavourite: boolean;
}

const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 1,
    name: 'Patan Hospital',
    location: 'Patan Dhoka, Kathmandu',
    distance: 0.8,
    rating: 4.7,
    reviews: 248,
    phone: '+977-1-4431111',
    hours: '24/7',
    specialties: ['Cardiology', 'Neurology', 'Orthopedic'],
    beds: 450,
    doctors: 125,
    image: 'https://images.unsplash.com/photo-1576091160550-112173f7f869?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    coverImage: 'https://images.unsplash.com/photo-1587351021759-3e566b9cfa4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    isFavourite: false,
  },
  {
    id: 2,
    name: 'Tribhuvan University Teaching Hospital',
    location: 'Kathmandu Medical College, Kathmandu',
    distance: 2.3,
    rating: 4.5,
    reviews: 189,
    phone: '+977-1-4412303',
    hours: '24/7',
    specialties: ['General Surgery', 'Pediatrics', 'Cardiac'],
    beds: 600,
    doctors: 200,
    image: 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    isFavourite: false,
  },
  {
    id: 3,
    name: 'Kathmandu Medical College Hospital',
    location: 'Sinamangal, Kathmandu',
    distance: 1.5,
    rating: 4.6,
    reviews: 312,
    phone: '+977-1-4769999',
    hours: '24/7',
    specialties: ['Oncology', 'Dentistry', 'Urology'],
    beds: 300,
    doctors: 98,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    coverImage: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    isFavourite: false,
  },
  {
    id: 4,
    name: 'Grande International Hospital',
    location: 'Jamal, Kathmandu',
    distance: 3.2,
    rating: 4.8,
    reviews: 425,
    phone: '+977-1-4430793',
    hours: 'Mon-Sun: 06:00 AM - 10:00 PM',
    specialties: ['Cardiology', 'Orthopedic', 'Gastroenterology'],
    beds: 250,
    doctors: 87,
    image: 'https://images.unsplash.com/photo-1576091160722-112b772332d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    coverImage: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    isFavourite: false,
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

const HospitalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('');
  const [showFavorites, setShowFavorites] = useState(false);

  // Load hospitals and favorites from localStorage on mount
  useEffect(() => {
    const savedFavs = localStorage.getItem('hospital_favorites');
    const favoriteIds = savedFavs ? JSON.parse(savedFavs) : [];
    
    setHospitals(MOCK_HOSPITALS.map(h => ({
      ...h,
      isFavourite: favoriteIds.includes(h.id)
    })));
  }, []);

  const filteredHospitals = hospitals
    .filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRating = ratingFilter === 0 || h.rating >= ratingFilter;
      const matchesSpecialty = specialtyFilter === '' || h.specialties.includes(specialtyFilter);
      const matchesFavorites = !showFavorites || h.isFavourite;
      return matchesSearch && matchesRating && matchesSpecialty && matchesFavorites;
    })
    .sort((a, b) => {
      if (sortBy === 'distance') return a.distance - b.distance;
      return b.rating - a.rating;
    });

  const uniqueSpecialties = Array.from(
    new Set(hospitals.flatMap(h => h.specialties))
  ).sort();

  const toggleFavourite = (id: number) => {
    const updatedHospitals = hospitals.map(h => 
      h.id === id ? { ...h, isFavourite: !h.isFavourite } : h
    );
    setHospitals(updatedHospitals);
    
    const favoriteIds = updatedHospitals
      .filter(h => h.isFavourite)
      .map(h => h.id);
    localStorage.setItem('hospital_favorites', JSON.stringify(favoriteIds));
  };

  const handleBooking = (hospitalId: number) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (hospital) {
      navigate('/book-appointment', { 
        state: { 
          selectedHospital: hospital, 
          source: 'hospital',
          skipSpecialty: true,
          skipType: true
        } 
      });
    }
  };

  const clearFilters = () => {
    setRatingFilter(0);
    setSpecialtyFilter('');
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
          <div className="bg-emerald-600 px-8 py-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-white mb-2">
                Find Hospitals
              </h1>
              <p className="text-emerald-100">
                Discover nearby hospitals and book your appointments
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
                  placeholder="Search hospitals, specialties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl focus:border-emerald-500 focus:outline-none font-semibold text-slate-800 transition-all"
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
                  { key: 'distance', label: 'Nearest', icon: MapPin },
                  { key: 'rating', label: 'Top Rated', icon: Star }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key as 'distance' | 'rating')}
                    className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                      sortBy === key
                        ? 'bg-emerald-600 text-white'
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
                className="px-4 py-2.5 rounded-lg border-2 border-slate-200 font-semibold text-sm focus:border-emerald-500 outline-none bg-white text-slate-700 cursor-pointer"
              >
                <option value="0">All Ratings</option>
                <option value="4.0">⭐ 4.0+</option>
                <option value="4.5">⭐ 4.5+</option>
                <option value="4.7">⭐ 4.7+</option>
              </select>

              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="px-4 py-2.5 rounded-lg border-2 border-slate-200 font-semibold text-sm focus:border-emerald-500 outline-none bg-white text-slate-700 cursor-pointer"
              >
                <option value="">All Specialties</option>
                {uniqueSpecialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>

              {(ratingFilter > 0 || specialtyFilter || showFavorites || searchQuery) && (
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

          {/* Hospitals Grid */}
          <div className="p-8">
            {filteredHospitals.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 size={36} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No hospitals found</h3>
                <p className="text-slate-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                layout
              >
                <AnimatePresence mode="popLayout">
                  {filteredHospitals.map((hospital, index) => (
                    <motion.div
                      key={hospital.id}
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
                      <div className="relative h-36 bg-gradient-to-r from-emerald-500 to-teal-600">
                        <img 
                          src={hospital.coverImage} 
                          alt=""
                          className="w-full h-full object-cover opacity-30"
                          onError={(e) => { 
                            e.currentTarget.style.display = 'none'; 
                          }}
                        />
                        
                        {/* Favorite Button */}
                        <motion.button 
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => { e.stopPropagation(); toggleFavourite(hospital.id); }}
                          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 ${
                            hospital.isFavourite 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white text-slate-400 hover:text-red-500'
                          }`}
                        >
                          <Heart size={16} fill={hospital.isFavourite ? "currentColor" : "none"}/>
                        </motion.button>

                        {/* Rating Badge */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white rounded-full flex items-center gap-1 shadow">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-bold text-slate-800">{hospital.rating}</span>
                        </div>

                        {/* Distance Badge */}
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/50 rounded-full flex items-center gap-1">
                          <MapPin size={11} className="text-white" />
                          <span className="text-xs font-bold text-white">{hospital.distance} km</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1">
                            {hospital.name}
                          </h3>
                          <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                            <MapPin size={12} />
                            {hospital.location}
                          </p>
                        </div>

                        {/* Specialty Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {hospital.specialties.slice(0, 3).map((spec, i) => (
                            <span 
                              key={i}
                              className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                            <Users size={14} className="text-emerald-600" />
                            <div>
                              <p className="text-[10px] text-emerald-600 uppercase font-bold">Doctors</p>
                              <p className="text-sm font-bold text-slate-800">{hospital.doctors}+</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-teal-50 rounded-lg">
                            <Bed size={14} className="text-teal-600" />
                            <div>
                              <p className="text-[10px] text-teal-600 uppercase font-bold">Beds</p>
                              <p className="text-sm font-bold text-slate-800">{hospital.beds}+</p>
                            </div>
                          </div>
                        </div>

                        {/* Experience & Reviews */}
                        <div className="flex justify-center gap-4 mb-4">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Award size={12} className="text-amber-500" />
                            <span>{hospital.reviews} reviews</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock size={12} className="text-green-500" />
                            <span>{hospital.hours}</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-3 border-t border-slate-100">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleBooking(hospital.id); }}
                            className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                          >
                            <Building2 size={16} />
                            Book Appointment
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

export default HospitalsPage;
