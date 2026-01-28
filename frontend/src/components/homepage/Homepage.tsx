import React from 'react';
import './Homepage.css';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  Stethoscope,
  Clock,
  Phone,
  ArrowRight,
  Search,
  Activity,
  Heart,
  Zap,
  Users,
  CheckCircle,
  Shield,
  Star,
  Globe,
  Award,
  MessageSquare,
  FileText
} from 'lucide-react';

interface HomepageProps {
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const Homepage: React.FC<HomepageProps> = ({ onOpenAuthModal }) => {
  return (
    <div className="homepage-root min-h-screen bg-blue-600 font-sans">
      {/* Top Bar */}
      <div className="homepage-topbar text-white py-2 px-4 text-xs hidden md:flex justify-between items-center">
        <div className="max-w-7xl mx-auto w-full flex justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-2" /> Monday - Friday : 8:30 AM to 6:30 PM
            </span>
            <span className="flex items-center">
              <Phone className="h-3 w-3 mr-2" /> +1 80001 54569
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="cursor-pointer hover:text-blue-200">ENG</span>
            <ArrowRight className="h-3 w-3 rotate-90" />
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="homepage-nav pt-4 pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="logo-badge p-2 rounded-xl border border-white/20">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">MEDICO</h1>
            </div>

            <div className="hidden md:flex items-center space-x-8 text-white/90 text-sm font-semibold">
              <a href="#" className="hover:text-white transition-colors">Home</a>
              <a href="#" className="hover:text-white transition-colors">Doctors</a>
              <a href="#" className="hover:text-white transition-colors">Patients</a>
              <a href="#" className="hover:text-white transition-colors">Pharmacy</a>
              <a href="#" className="hover:text-white transition-colors">Pages</a>
              <a href="#" className="hover:text-white transition-colors">Blog</a>
              <a href="#" className="hover:text-white transition-colors">Admin</a>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => onOpenAuthModal('login')}
                className="text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => onOpenAuthModal('register')}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-2 font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Book Appointment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="homepage-hero relative overflow-hidden min-h-[calc(100vh-140px)] flex items-center">
        {/* Background Text Effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-10">
          <div className="hero-bg-text whitespace-nowrap">DIGITAL HEALTH</div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 pt-10 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-white z-20 order-2 lg:order-1">
              <div className="relative">
                <h2 className="stroke-heading">Redefining</h2>
                <h1 className="main-heading">
                  Digital <br />
                  Healthcare
                </h1>
              </div>

              <p className="hero-subtitle">
                Expert professionals, modern technology, and compassionate care for a healthier tomorrow. Experience the future of medical treatment.
              </p>

              <Button
                size="lg"
                onClick={() => onOpenAuthModal('register')}
                className="bg-white text-blue-700 hover:bg-blue-50 rounded-full px-8 py-6 font-bold text-lg shadow-xl hover:scale-105 transition-transform"
              >
                View All Services
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            {/* Central Image (Skeleton) */}
            <div className="relative flex justify-center items-center order-1 lg:order-2">
              {/* Floating Elements/Icons */}
              <div className="absolute -left-4 top-20 homepage-bounce-3s">
                <div className="glass-icon p-4 rounded-2xl">
                  <Activity className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="absolute right-0 bottom-32 homepage-bounce-4s">
                <div className="glass-icon p-4 rounded-2xl">
                  <Heart className="h-8 w-8 text-red-400" />
                </div>
              </div>
              <div className="absolute right-20 top-0 homepage-pulse">
                <div className="glass-icon p-3 rounded-full">
                  <Zap className="h-6 w-6 text-yellow-400" />
                </div>
              </div>

              {/* Main Image */}
              <div className="relative z-10 w-full max-w-lg">
                <img
                  src="/static/skeleton.png"
                  alt="Human Skeleton"
                  className="w-full h-auto object-contain drop-shadow-2xl homepage-float"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/400x600/transparent/white?text=Skeleton+Image';
                    e.currentTarget.style.opacity = '0.5';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Better Healthcare
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed for both patients and healthcare providers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Patient Features */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">For Patients</h3>
                <p className="text-gray-600 mb-6">Easy appointment booking and health management</p>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Online appointment scheduling
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Medication tracking & reminders
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Health analytics dashboard
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Secure messaging with doctors
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">For Doctors</h3>
                <p className="text-gray-600 mb-6">Comprehensive patient management tools</p>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Patient dashboard & history
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Appointment management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Digital prescriptions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Health monitoring tools
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 to-violet-50">
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-600 to-violet-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Reliable</h3>
                <p className="text-gray-600 mb-6">Enterprise-grade security for your health data</p>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    End-to-end encryption
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    HIPAA compliance
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Regular security audits
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    24/7 monitoring
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Key Features Grid */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features at Your Fingertips
            </h2>
            <p className="text-xl text-gray-600">Experience the future of healthcare management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <Globe className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Online Access</h3>
              </div>
              <p className="text-gray-600">Connect with healthcare professionals from anywhere</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <Award className="h-6 w-6 text-indigo-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Quality Care</h3>
              </div>
              <p className="text-gray-600">Certified professionals and verified services</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <MessageSquare className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Secure Messaging</h3>
              </div>
              <p className="text-gray-600">Communicate with doctors safely and privately</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Digital Records</h3>
              </div>
              <p className="text-gray-600">Manage prescriptions and health documents online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-blue-700 to-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MEDICO</h3>
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

