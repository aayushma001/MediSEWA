import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { AppRoutes } from './routes';
import { Header } from './components/layout/Header';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { login, register, restoreUserSession, logout as authLogout } from './utils/auth';
import { Patient, Doctor, LoginFormData, RegisterFormData } from './types';
import { Homepage } from './components/homepage/Homepage';
import {
  Stethoscope,
  Heart,
  Shield,
  Users,
  Calendar,
  Activity,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Zap,
  Globe,
  Award,
  Phone,
  Search
} from 'lucide-react';

function App() {
  const [user, setUser] = useState<Patient | Doctor | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Restore user session on app load
  useEffect(() => {
    const restoredUser = restoreUserSession();
    if (restoredUser) {
      setUser(restoredUser);
    }
    setInitializing(false);
  }, []);

  const handleLogin = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const user = await login(data);
      setUser(user);
      setShowAuthModal(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      console.log('Starting registration process...');
      const user = await register(data);
      console.log('Registration successful, user:', user);
      setUser(user);
      setShowAuthModal(false);
    } catch (error) {
      console.error('Registration failed in App component:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      console.error('Showing error message to user:', errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authLogout();
    setUser(null);
    setAuthMode('login');
    setShowAuthModal(false);
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // Show loading spinner while initializing
  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Homepage onOpenAuthModal={openAuthModal} />
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {authMode === 'login' ? 'Welcome Back' : 'Join Us Today'}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {authMode === 'login'
                        ? 'Sign in to access your healthcare dashboard'
                        : 'Create your account to get started'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-8">
                  <div className="flex space-x-1 p-1 bg-gray-100 rounded-xl">
                    <Button
                      variant={authMode === 'login' ? 'primary' : 'ghost'}
                      onClick={() => setAuthMode('login')}
                      className="flex-1 rounded-lg transition-all duration-200"
                    >
                      Sign In
                    </Button>
                    <Button
                      variant={authMode === 'register' ? 'primary' : 'ghost'}
                      onClick={() => setAuthMode('register')}
                      className="flex-1 rounded-lg transition-all duration-200"
                    >
                      Sign Up
                    </Button>
                  </div>
                </div>

                {authMode === 'login' ? (
                  <LoginForm onSubmit={handleLogin} loading={loading} />
                ) : (
                  <RegisterForm onSubmit={handleRegister} loading={loading} />
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} />
        <AppRoutes user={user} />
      </div>
    </Router>
  );
}

export default App;
