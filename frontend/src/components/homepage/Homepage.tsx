import React, { useEffect, useMemo, useState } from 'react';
import './Homepage.css';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  Phone,
  ArrowRight,
  Search,
  Activity,
  Heart,
  Zap,
  Users,
  Star,
  MessageSquare,
  FileText,
  Building,
  Package,
  Home,
  Lock,
  User,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
  Quote,
  Target, // New Import
  Eye,    // New Import
  Wind,
  Droplets
} from 'lucide-react';
import { authAPI } from '../../services/api';
import { PatientChatbot } from '../patient/PatientChatbot';

interface HomepageProps {
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const Homepage: React.FC<HomepageProps> = ({ onOpenAuthModal }) => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const load = async () => {
      try {
        const ds = await authAPI.getDoctors();
        setDoctors(Array.isArray(ds) ? ds : []);
      } catch (e) {
        setDoctors([]);
      }
    };
    load();
  }, []);

  const specialities = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      if (d.specialization) set.add(String(d.specialization));
    });
    const arr = Array.from(set);
    if (arr.length === 0) {
      return ['Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics', 'Psychiatry', 'Endocrinology'];
    }
    return arr;
  }, [doctors]);

  const specialityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    doctors.forEach((d) => {
      const s = String(d.specialization || '');
      if (s) {
        counts[s] = (counts[s] || 0) + 1;
      }
    });
    return counts;
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const matchesSpec = selectedSpeciality ? String(d.specialization) === selectedSpeciality : true;
      const name = `${d?.user?.first_name || ''} ${d?.user?.last_name || ''}`.toLowerCase();
      const city = String(d?.city || '').toLowerCase();
      const q = query.toLowerCase();
      const matchesQuery = q ? name.includes(q) || city.includes(q) || String(d?.specialization || '').toLowerCase().includes(q) : true;
      return matchesSpec && matchesQuery;
    });
  }, [doctors, selectedSpeciality, query]);

  const handleSearch = () => { };

  // Mock featured doctors data
  const featuredDoctors = filteredDoctors.slice(0, 4).length > 0
    ? filteredDoctors.slice(0, 4).map(d => ({
      name: `Dr. ${d?.user?.first_name || ''} ${d?.user?.last_name || ''}`,
      specialty: d.specialization || 'Specialist',
      location: d?.city || 'Location',
      distance: '30 Min',
      rating: 4.8,
      fee: d?.consultation_fee ? `$${d.consultation_fee}` : '$500',
      available: true,
      image: null
    }))
    : [
      { name: 'Dr. Michael Brown', specialty: 'Psychologist', location: 'Minneapolis, MN', distance: '30 Min', rating: 4.8, fee: '$650', available: true, image: null },
      { name: 'Dr. Nicholas Tello', specialty: 'Pediatrician', location: 'Ogden, IA', distance: '60 Min', rating: 4.9, fee: '$350', available: true, image: null },
      { name: 'Dr. Harold Bryant', specialty: 'Neurologist', location: 'Winona, MS', distance: '30 Min', rating: 4.7, fee: '$500', available: true, image: null },
      { name: 'Dr. Sandra Jones', specialty: 'Cardiologist', location: 'Beckley, WV', distance: '30 Min', rating: 4.8, fee: '$550', available: true, image: null }
    ];

  // Mock testimonials
  const testimonials = [
    {
      title: 'Nice Treatment',
      content: 'I had a wonderful experience the staff was friendly and attentive, and Dr. Smith took the time to explain everything clearly.',
      author: 'Deny Hendrawan',
      location: 'United States',
      rating: 5,
      featured: false
    },
    {
      title: 'Nice Support',
      content: 'My experience was excellent. The staff was polite and attentive, and they took the time to explain every step clearly.',
      author: 'Brooks Steave',
      location: 'Dallas, CA',
      rating: 5,
      featured: false
    },
    {
      title: 'Excellent Service',
      content: 'I had a wonderful experience the staff was friendly and attentive, and Dr. Smith took the time to explain everything clearly.',
      author: 'Sofia Doe',
      location: 'Los Boston, USA',
      rating: 5,
      featured: true
    }
  ];

  return (
    <div className="homepage-root relative min-h-screen font-sans overflow-hidden">
      {/* Blue gradient background with wave */}
      <div className="hero-gradient-bg"></div>
      <div className="hero-wave"></div>

      {/* Decorative sparkle dots */}
      <div className="sparkle-dot" style={{ left: '8%', top: '45%' }}></div>
      <div className="sparkle-dot" style={{ right: '12%', top: '25%' }}></div>

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 py-2 px-4 text-xs hidden md:flex relative z-20">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center space-x-6 text-gray-600">
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l9 6 9-6" />
              </svg>
              infoMediSewa@gmail.com
            </span>
            <span className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              +977 66589 14556
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <span className="text-lg">NP</span>
              <span className="font-medium">ENG</span>
            </button>
            <div className="flex items-center space-x-2">
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <img src="/LOGO.png" alt="MediSEWA" className="h-24 w-auto object-contain" />
              </a>
            </div>

            {/* Navigation Menu - Simple Tabs */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#" className="text-blue-600 font-medium hover:text-blue-700 transition-colors border-b-2 border-blue-600 pb-1">
                Home
              </a>
              <a href="#" className="text-gray-700 font-medium hover:text-blue-600 transition-colors pb-1">
                Doctors
              </a>

              <a href="#" className="text-gray-700 font-medium hover:text-blue-600 transition-colors pb-1">
                Pharmacy
              </a>
              <a href="/blog" className="text-gray-700 font-medium hover:text-blue-600 transition-colors pb-1">
                Blog
              </a>

            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => onOpenAuthModal('login')}
                className="rounded-full px-6 py-2.5 font-medium shadow-md hover:shadow-lg transition-all bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
              >
                <Lock className="h-4 w-4" />
                <span>Login</span>
              </Button>
              <Button
                onClick={() => onOpenAuthModal('register')}
                className="rounded-full px-6 py-2.5 font-medium shadow-md hover:shadow-lg transition-all bg-gray-900 hover:bg-gray-800 text-white flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Sign-up</span>
              </Button>
              <button className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors lg:hidden">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="homepage-hero relative min-h-[600px] flex items-center pb-32 pt-24">
        {/* Floating Chatbot Button - Fixed position */}
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="fixed bottom-28 right-8 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[9990] animate-float-delayed border-4 border-white"
        >
          <MessageSquare className="h-7 w-7 text-white" />
        </button>

        {/* Chatbot Component */}
        {showChatbot && (
          <PatientChatbot
            patientId="guest"
            onClose={() => setShowChatbot(false)}
          />
        )}

        {/* Call Doctor Badge - Below chatbot button */}
        <div className="fixed bottom-8 right-8 bg-white rounded-full shadow-2xl px-6 py-4 animate-float-delayed flex items-center gap-3 whitespace-nowrap z-40 border border-emerald-100">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Phone className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Need help?</p>
            <p className="text-sm font-bold text-gray-900">Call your doctor</p>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white z-20 -mt-24">
              {/* Stats Badge */}
              <button
                onClick={() => onOpenAuthModal('login')}
                className="inline-flex items-center bg-white/95 backdrop-blur-sm rounded-full px-6 py-4 mb-8 shadow-xl hover:bg-white transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-800 text-sm font-bold">Book your appointment today</span>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-8">
                Discover Health: Find Your<br />
                Trusted
                <span className="inline-flex items-center mx-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl shadow-lg transform -rotate-2">
                  <Heart className="h-8 w-8 text-white" />
                </span>
                Doctors Today
              </h1>

              {/* Search Bar */}
              <div className="bg-white rounded-full px-8 py-3 shadow-2xl flex items-center space-x-4 mb-8">
                <div className="relative">
                  <select
                    value={selectedSpeciality}
                    onChange={(e) => setSelectedSpeciality(e.target.value)}
                    className="appearance-none bg-gray-50 rounded-full px-6 py-3 text-sm font-medium text-gray-700 pr-10 outline-none cursor-pointer border border-gray-200"
                  >
                    <option value="">Select Speciality</option>
                    {specialities.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for Medical Procedures, hospitals"
                  className="flex-1 outline-none text-gray-700 px-2 text-base"
                />
                <Button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 font-medium shadow-lg"
                >
                  <Search className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Right Doctor Image Placeholder */}
            <div className="relative flex justify-center items-center lg:justify-end lg:items-end mt-10 lg:-mt-24">
              <div className="relative z-10">
                <img
                  src="/Hero.png"
                  alt="Doctor"
                  className="h-auto max-h-[650px] w-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Service Icons Row */}
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-4 -mt-20 relative z-30 bg-white rounded-3xl p-6 shadow-2xl mx-4 lg:mx-0">
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-gray-700">Book Appointment</span>
            </div>
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg">
                <MessageSquare className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-gray-700">Talk to Doctors</span>
            </div>
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-pink-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg">
                <Building className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-gray-700">Hospitals & Clinics</span>
            </div>
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-cyan-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg">
                <Heart className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-gray-700">Healthcare</span>
            </div>
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg">
                <Package className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-gray-700">Medicine & Supplies</span>
            </div>
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg">
                <Activity className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-gray-700">Lab Testing</span>
            </div>
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-teal-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg">
                <Home className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-gray-700">Home Care</span>
            </div>
          </div>
        </div>
      </div>


      {/* Mission Section */}
      <div className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Image */}
            <div className="relative h-full">
              <img src="/Mission.png" alt="Our Mission" className="w-full h-full object-cover rounded-3xl transition-transform hover:scale-[1.02] duration-500 shadow-xl" />
            </div>

            {/* Right: Content */}
            <div>
              <div className="flex justify-center md:justify-start mb-8">
                <span className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-bold shadow-md uppercase tracking-wide transform hover:scale-105 transition-transform">
                  About Us
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                We Understand That Each One Is <br className="hidden lg:block" />
                Unique & Their <span className="text-green-600">Health Journey.</span>
              </h2>

              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                We aim to provide faster diagnosis, clearer insights, and more accurate treatment
                decisions ensuring every patient receives safe, precise, and personalized care.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white border border-gray-100 hover:border-blue-500 transition-all duration-300 rounded-xl p-5 shadow-sm hover:shadow-lg group">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Target className="text-blue-600 h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg mb-1 text-gray-900">Our Mission</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">To deliver compassionate, patient-first healthcare by combining expert clinical judgment with technology.</p>
                </div>
                <div className="bg-white border border-gray-100 hover:border-green-500 transition-all duration-300 rounded-xl p-5 shadow-sm hover:shadow-lg group">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Eye className="text-green-600 h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg mb-1 text-gray-900">Our Vision</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">Empower doctors to detect conditions earlier, improve outcomes, and redefine the future of modern healthcare.</p>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-base font-semibold shadow-lg shadow-blue-600/20 transition-all transform hover:translate-y-[-2px]">
                Know More
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* "Highlighting the Care & Support" - Carousel Section */}
      <div className="py-20 bg-gray-50 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="inline-block text-lg font-bold text-white bg-blue-600 px-8 py-3 rounded-full mb-5 shadow-md uppercase tracking-wide transform hover:scale-105 transition-transform">
              Top Specialties
            </span>
            <h2 className="text-4xl font-bold text-gray-900">
              Highlighting the <span className="text-blue-600">Care & Support</span>
            </h2>
          </div>

          <div className="relative group px-4">
            {/* Carousel Container */}
            <div
              id="specialties-carousel"
              className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollBehavior: 'smooth' }}
            >
              {[
                { name: 'Cardiology', count: specialityCounts['Cardiology'] || 0, img: '/Cardiology.jpg', icon: Heart },
                { name: 'Orthopedics', count: specialityCounts['Orthopedics'] || 0, img: '/Orthopedics.jpg', icon: Activity },
                { name: 'Neurology', count: specialityCounts['Neurology'] || 0, img: '/Neurology.jpg', icon: Zap },
                { name: 'Pediatrics', count: specialityCounts['Pediatrics'] || 0, img: '/Pediatrics.jpg', icon: Users },
                { name: 'Psychiatry', count: specialityCounts['Psychiatry'] || 0, img: '/Psychiatry.jpg', icon: MessageSquare },
                { name: 'Endocrinology', count: specialityCounts['Endocrinology'] || 0, img: '/Endocrinology.jpg', icon: FileText },
                { name: 'Pulmonology', count: specialityCounts['Pulmonology'] || 0, img: '/Pulmonology.jpg', icon: Wind },
                { name: 'Urology', count: specialityCounts['Urology'] || 0, img: '/Urology.jpg', icon: Droplets }
              ].map((spec, idx) => (
                <div key={idx} className="min-w-[200px] md:min-w-[220px] snap-center">
                  <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group/card relative h-[280px] cursor-pointer border border-gray-100 flex flex-col">
                    {/* Image Top Half */}
                    <div className="h-4/6 w-full relative overflow-hidden">
                      <img
                        src={spec.img}
                        alt={spec.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover/card:bg-black/20 transition-colors"></div>
                    </div>

                    {/* Content Bottom Half */}
                    <div className="h-2/6 bg-white relative pt-8 pb-4 px-4 text-center">
                      {/* Floating Icon - Overlapping */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg group-hover/card:scale-110 transition-transform duration-300 z-10 border-4 border-white-50">
                        <spec.icon className="h-6 w-6 text-blue-600" strokeWidth={2} />
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-1">{spec.name}</h3>
                      <p className="text-blue-500 font-medium text-xs">
                        {spec.count} Doctors
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => {
                const carousel = document.getElementById('specialties-carousel');
                if (carousel) carousel.scrollBy({ left: -240, behavior: 'smooth' });
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-blue-600 hover:scale-110 transition-all z-20 hidden md:flex border border-gray-100"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => {
                const carousel = document.getElementById('specialties-carousel');
                if (carousel) carousel.scrollBy({ left: 240, behavior: 'smooth' });
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-blue-600 hover:scale-110 transition-all z-20 hidden md:flex border border-gray-100"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Our Highlighted Doctor Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-blue-600 bg-blue-100 px-4 py-2 rounded-full mb-3">• Featured Doctors •</span>
            <h2 className="text-4xl font-bold text-gray-900">
              Our <span className="text-blue-600">Highlighted</span> Doctor
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDoctors.map((doctor, idx) => (
              <Card key={idx} className="p-0 overflow-hidden hover:shadow-2xl transition-all group">
                <div className="relative">
                  {/* Doctor Image Placeholder */}
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    <User className="h-24 w-24 text-gray-400" />

                    {/* Rating Badge */}
                    <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm font-bold shadow-lg">
                      <Star className="h-4 w-4 fill-white" />
                      <span>{doctor.rating}</span>
                    </div>

                    {/* Favorite Button */}
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50">
                      <Heart className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-5">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{doctor.specialty}</span>
                        {doctor.available && (
                          <span className="text-xs font-medium text-green-600 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-green-600 mr-1"></span>
                            Available
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {doctor.location} • {doctor.distance}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Consultation Fees</p>
                        <p className="text-lg font-bold text-orange-600">{doctor.fee}</p>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section - Enhanced */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-blue-600 bg-blue-100 px-4 py-2 rounded-full mb-3">• Testimonials •</span>
            <h2 className="text-4xl font-bold text-gray-900">
              15k Users <span className="text-blue-600">Trust Doccure</span> Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className={`p-6 hover:shadow-xl transition-shadow ${testimonial.featured ? 'bg-blue-600 text-white' : 'bg-white'}`}>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${testimonial.featured ? 'text-white fill-white' : 'text-yellow-400 fill-yellow-400'}`} />
                  ))}
                </div>
                <Quote className={`h-8 w-8 mb-3 ${testimonial.featured ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-lg font-bold mb-3 ${testimonial.featured ? 'text-white' : 'text-gray-900'}`}>
                  {testimonial.title}
                </h3>
                <p className={`mb-4 text-sm leading-relaxed ${testimonial.featured ? 'text-blue-100' : 'text-gray-600'}`}>
                  {testimonial.content}
                </p>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full ${testimonial.featured ? 'bg-blue-500' : 'bg-gray-200'} flex items-center justify-center`}>
                    <User className={`h-5 w-5 ${testimonial.featured ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${testimonial.featured ? 'text-white' : 'text-gray-900'}`}>
                      {testimonial.author}
                    </p>
                    <p className={`text-xs ${testimonial.featured ? 'text-blue-200' : 'text-gray-500'}`}>
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
            {[
              { value: '500+', label: 'Doctors Available' },
              { value: '18+', label: 'Specialities' },
              { value: '30K', label: 'Bookings Done' },
              { value: '97+', label: 'Hospitals & Clinic' },
              { value: '317+', label: 'Lab Tests Available' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Trusted Partners */}
          <div className="bg-gray-900 rounded-2xl p-8">
            <h3 className="text-center text-white text-lg font-semibold mb-8">Trusted Partners with Doccure</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center">
              {['NovaCare', 'Apex Health', 'PrimeLife', 'ClearSound', 'Airway', 'Cureplus'].map((partner, idx) => (
                <div key={idx} className="flex items-center justify-center">
                  <div className="text-white/80 font-semibold text-lg flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Building className="h-4 w-4 text-white" />
                    </div>
                    <span>{partner}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Trends & Insights Section */}
      <div className="py-20 bg-gray-50 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-10 left-10 opacity-10">
          <img src="/circle.png" alt="" className="w-32 h-32" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10">
          <img src="/circle.png" alt="" className="w-40 h-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-blue-600 bg-blue-100 px-4 py-2 rounded-full mb-3">Latest Articles</span>
            <h2 className="text-4xl font-bold text-gray-900">
              Latest Trends & <span className="text-blue-600">Insights</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Blog Card 1 - Heart Health */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative h-56 overflow-hidden">
                <img
                  src="/Heart.jpg"
                  alt="Heart Health"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Wellness
                  </span>
                  <span className="text-sm text-gray-500">29, Nov 2026</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors">
                  What Really Causes Heart Attacks? A Simple Explanation
                </h3>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600">18, Nov 2026</span>
                </div>
              </div>
            </div>

            {/* Blog Card 2 - Patient Care */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative h-56 overflow-hidden">
                <img
                  src="/Patients.jpg"
                  alt="Patient Care"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Heart Health
                  </span>
                  <span className="text-sm text-gray-500">25, Nov 2026</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors">
                  Early Signs of Heart Failure You Shouldn't Ignore
                </h3>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600">18, Nov 2026</span>
                </div>
              </div>
            </div>

            {/* Blog Card 3 - Doctor Consultation */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative h-56 overflow-hidden">
                <img
                  src="/Doctor.jpg"
                  alt="Doctor Consultation"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Lifestyle
                  </span>
                  <span className="text-sm text-gray-500">18, Nov 2026</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors">
                  Cholesterol & Your Heart: What Actually Happens Inside
                </h3>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600">18, Nov 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* View All Blogs Button */}
          <div className="text-center">
            <button
              onClick={() => window.location.href = '/blog'}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View All Blogs
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section - Enhanced */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-blue-600 bg-blue-100 px-4 py-2 rounded-full mb-3">• FAQ's •</span>
            <h2 className="text-4xl font-bold text-gray-900">
              Your Questions are <span className="text-blue-600">Answered</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How do I book an appointment with a doctor?',
                a: 'Yes, simply visit our website and log in or create an account. Search for a doctor based on specialization, location, or availability & confirm your booking.'
              },
              {
                q: 'Can I request a specific doctor when booking my appointment?',
                a: 'Yes, you can filter and select your preferred doctor by specialization, ratings, and availability.'
              },
              {
                q: 'What should I do if I need to cancel or reschedule my appointment?',
                a: 'You can easily cancel or reschedule through your appointments dashboard. Navigate to "My Appointments" and select the cancel or reschedule option.'
              },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors">
                <details className="group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-gray-900 hover:text-blue-600">
                    <span className="text-left pr-4">{item.q}</span>
                    <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center flex-shrink-0 group-open:rotate-45 transition-transform">
                      <Plus className="h-4 w-4 text-blue-600" />
                    </div>
                  </summary>
                  <div className="px-5 pb-5 pt-0 text-gray-600 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <img src="/LOGO.png" alt="MediSEWA" className="h-14 w-auto object-contain bg-white/10 rounded px-2 py-1" />
              </div>
              <p className="text-sm text-blue-100">
                Connecting patients and healthcare providers through innovative technology.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><a href="#" className="hover:text-white transition-colors">For Patients</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Doctors</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">News</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-sm text-blue-200">
            <p>&copy; 2024 HealthCare Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};