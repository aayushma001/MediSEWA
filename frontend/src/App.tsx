import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { AppRoutes } from './routes';
import { Header } from './components/layout/Header';
import { login, register, restoreUserSession, logout as authLogout } from './utils/auth';
import { User, LoginFormData, RegisterFormData } from './types';
import { Homepage } from './components/homepage/Homepage';

function App() {
  const [user, setUser] = useState<User | null>({
    id: '123',
    first_name: 'Test',
    last_name: 'Patient',
    email: 'test@example.com',
    mobile: '1234567890',
    user_type: 'patient',
    created_at: new Date().toISOString()
  });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      const user = await login(data);
      console.log('Login successful, setting user:', user);
      setUser(user);
      setShowAuthModal(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      console.error('Login error in App:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting registration process...');
      const user = await register(data);
      console.log('Registration successful, user:', user);
      setUser(user);
      setShowAuthModal(false);
    } catch (error) {
      console.error('Registration failed in App component:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authLogout();
    setUser(null);
    setAuthMode('login');
    setShowAuthModal(false);
    setError(null);
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setError(null);
  };

  useEffect(() => {
    const handler = () => {
      setAuthMode('login');
    };
    window.addEventListener('open-auth-login', handler as EventListener);
    return () => {
      window.removeEventListener('open-auth-login', handler as EventListener);
    };
  }, []);

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
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] overflow-hidden transform transition-all duration-300 scale-100 flex flex-col md:flex-row relative">
              {error && (
                <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-[60] font-bold">
                  {error}
                </div>
              )}
              <div className="hidden md:block w-1/2 bg-gray-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/20 z-10"></div>
                <img
                  src="/Login.jpg"
                  alt="Login"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-12 left-12 z-20 text-white">
                  <h2 className="text-4xl font-bold font-serif italic mb-4 drop-shadow-lg">Medico Health</h2>
                  <p className="text-lg max-w-xs drop-shadow-md">
                    Your trusted partner in healthcare excellence and patient management.
                  </p>
                </div>
              </div>
              <div className="w-full md:w-1/2 p-4 md:p-8 overflow-y-auto h-full flex flex-col relative bg-white no-scrollbar">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-4xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200 z-50 font-light"
                >
                  &times;
                </button>


                <div className="w-full max-w-md mx-auto my-auto pt-4 pb-10">
                  {authMode === 'login' ? (
                    <LoginForm
                      onSubmit={handleLogin}
                      loading={loading}
                      onRegisterClick={() => setAuthMode('register')}
                    />
                  ) : (
                    <RegisterForm
                      onSubmit={handleRegister}
                      loading={loading}
                      onLoginClick={() => setAuthMode('login')}
                    />
                  )}
                </div>
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
        {user.user_type !== 'hospital' && user.user_type !== 'doctor' && user.user_type !== 'patient' && <Header user={user} onLogout={handleLogout} />}
        <AppRoutes user={user} onLogout={handleLogout} />
      </div>
    </Router>
  );
}

export default App;
