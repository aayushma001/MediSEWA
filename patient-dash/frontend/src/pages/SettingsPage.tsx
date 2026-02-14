import React, { useState, useRef, ReactNode, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import { getUserDetails, saveUserDetails, UserDetails } from '../utils/userStorage';
import {
  User, Lock, Shield, Camera, Mail, Phone,
  Loader2, CheckCircle, Save, AlertCircle, ChevronRight,
  MapPin, Calendar, Heart, Bell, ShieldCheck, Eye, EyeOff,
  Smartphone, Globe, Trash2, Download, Clock, LogOut,
  Key, MailOpen, MessageSquare, Monitor, MapPinHouse, 
  CreditCard, FileText, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  profileImage: string;
  twoFactor: boolean;
  dataSharing: boolean;
  age: string;
  gender: string;
  address: string;
  // Notification settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  healthTips: boolean;
  promotionalEmails: boolean;
}

interface Errors {
  [key: string]: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
  description: string;
  badge?: string;
}

const SettingsPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [showPasswords, setShowPasswords] = useState<{current: boolean; new: boolean; confirm: boolean}>({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);
  const [privacySuccess, setPrivacySuccess] = useState<boolean>(false);
  const [notificationSuccess, setNotificationSuccess] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string>('');

  const defaultUser = {
    fullName: "John Doe",
    email: "johndoe@example.com",
    phone: "9841000000",
    profileImage: "https://ui-avatars.com/api/?name=John+Doe&background=1e40af&color=fff",
    age: "",
    gender: "Female",
    address: ""
  };

  const userDetails = getUserDetails();

  const [formData, setFormData] = useState<FormData>({
    fullName: (userDetails.fullName as string) || defaultUser.fullName,
    email: (userDetails.email as string) || defaultUser.email,
    phone: (userDetails.phone as string) || defaultUser.phone,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profileImage: (userDetails.profileImage as string) || defaultUser.profileImage,
    twoFactor: (userDetails.twoFactor as boolean) ?? true,
    dataSharing: (userDetails.dataSharing as boolean) ?? false,
    age: (userDetails.age as string) || defaultUser.age,
    gender: (userDetails.gender as string) || defaultUser.gender,
    address: (userDetails.address as string) || defaultUser.address,
    // Default notification settings
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    healthTips: true,
    promotionalEmails: false,
  });

  // Animation states
  const [fieldsAnimate, setFieldsAnimate] = useState<boolean>(false);

  // Activity log state
  const [activityLog, setActivityLog] = useState([
    { id: 1, action: 'Login', device: 'Chrome on Windows', location: 'Kathmandu, Nepal', time: '2 hours ago', icon: <LogOut size={14} /> },
    { id: 2, action: 'Profile Updated', device: 'Chrome on Windows', location: 'Kathmandu, Nepal', time: '1 day ago', icon: <User size={14} /> },
    { id: 3, action: 'Appointment Booked', device: 'Safari on iPhone', location: 'Kathmandu, Nepal', time: '3 days ago', icon: <Calendar size={14} /> },
    { id: 4, action: 'Password Changed', device: 'Chrome on Windows', location: 'Kathmandu, Nepal', time: '1 week ago', icon: <Key size={14} /> },
  ]);

  // Connected devices state
  const [connectedDevices] = useState([
    { id: 1, device: 'Chrome on Windows', current: true, lastActive: 'Now' },
    { id: 2, device: 'Safari on iPhone', current: false, lastActive: '2 hours ago' },
  ]);

  useEffect(() => {
    if (activeTab === 'profile') {
      setTimeout(() => setFieldsAnimate(true), 100);
    } else {
      setFieldsAnimate(false);
    }
  }, [activeTab]);

  // Load user details on component mount
  useEffect(() => {
    const userDetails = getUserDetails();
    setFormData(prev => ({
      ...prev,
      fullName: (userDetails.fullName as string) || prev.fullName,
      email: (userDetails.email as string) || prev.email,
      phone: (userDetails.phone as string) || prev.phone,
      profileImage: (userDetails.profileImage as string) || prev.profileImage,
      age: (userDetails.age as string) || prev.age,
      gender: (userDetails.gender as string) || prev.gender,
      address: (userDetails.address as string) || prev.address,
      twoFactor: (userDetails.twoFactor as boolean) ?? prev.twoFactor,
      dataSharing: (userDetails.dataSharing as boolean) ?? prev.dataSharing
    }));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a FileReader to convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setFormData({ ...formData, profileImage: imageUrl });
        
        // Save to localStorage
        const currentUser = getUserDetails();
        saveUserDetails({ ...currentUser, profileImage: imageUrl });
        
        // Try to save to backend
        saveToBackend({ profileImage: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateProfile = (): boolean => {
    let newErrors: Errors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email address";
    if (!/^(\+977|977|0)?[9][6-9]\d{8}$/.test(formData.phone.replace(/\s+/g, ''))) newErrors.phone = "Please enter a valid Nepali phone number";
    if (!formData.age || isNaN(parseInt(formData.age)) || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) newErrors.age = "Please enter a valid age (1-120)";
    if (!formData.address || formData.address.trim().length < 10) newErrors.address = "Please provide a complete address (at least 10 characters)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
    let newErrors: Errors = {};
    if (!formData.currentPassword) newErrors.currentPassword = "Current password is required";
    if (formData.newPassword && formData.newPassword.length < 6) newErrors.newPassword = "Password must be at least 6 characters";
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveToBackend = async (data: Partial<FormData>) => {
    try {
      const response = await fetch('http://127.0.0.1:8001/api/user/profile/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        console.warn('Backend save failed, continuing with local save');
      }
    } catch (err) {
      console.warn('Backend save failed:', err);
    }
  };

  const handleSaveProfile = async (): Promise<void> => {
    if (!validateProfile()) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setErrors({});

    const userData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      age: formData.age,
      gender: formData.gender as 'Male' | 'Female' | 'Other',
      address: formData.address,
      profileImage: formData.profileImage,
      twoFactor: formData.twoFactor,
      dataSharing: formData.dataSharing
    } as Partial<UserDetails>;
    
    // Save to localStorage
    saveUserDetails(userData);

    // Update form state
    setFormData(prev => ({
      ...prev,
      ...userData
    }));

    // Try to save to backend
    await saveToBackend(userData);

    // Add to activity log
    setActivityLog(prev => [{
      id: Date.now(),
      action: 'Profile Updated',
      device: navigator.userAgent.includes('Windows') ? 'Chrome on Windows' : 'Safari on Mac',
      location: 'Kathmandu, Nepal',
      time: 'Just now',
      icon: <User size={14} />
    }, ...prev.slice(0, 3)]);

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  const handleSavePassword = async (): Promise<void> => {
    if (!validatePassword()) return;
    setIsSaving(true);
    setPasswordSuccess(false);
    setErrors({});

    const userData = {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    };

    try {
      await fetch('http://127.0.0.1:8001/api/user/change-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
    } catch (err) {
      console.warn('Password change failed:', err);
    }

    // Add to activity log
    setActivityLog(prev => [{
      id: Date.now(),
      action: 'Password Changed',
      device: navigator.userAgent.includes('Windows') ? 'Chrome on Windows' : 'Safari on Mac',
      location: 'Kathmandu, Nepal',
      time: 'Just now',
      icon: <Key size={14} />
    }, ...prev.slice(0, 3)]);

    setTimeout(() => {
      setIsSaving(false);
      setPasswordSuccess(true);
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      setTimeout(() => setPasswordSuccess(false), 3000);
    }, 1200);
  };

  const handleSavePrivacy = async (): Promise<void> => {
    setIsSaving(true);
    setPrivacySuccess(false);

    const userData: Partial<UserDetails> = {
      twoFactor: formData.twoFactor,
      dataSharing: formData.dataSharing
    };
    
    saveUserDetails(userData);
    await saveToBackend(userData);

    setTimeout(() => {
      setIsSaving(false);
      setPrivacySuccess(true);
      setTimeout(() => setPrivacySuccess(false), 3000);
    }, 800);
  };

  const handleSaveNotifications = async (): Promise<void> => {
    setIsSaving(true);
    setNotificationSuccess(false);

    const userData = {
      emailNotifications: formData.emailNotifications,
      smsNotifications: formData.smsNotifications,
      appointmentReminders: formData.appointmentReminders,
      healthTips: formData.healthTips,
      promotionalEmails: formData.promotionalEmails,
    };
    
    saveUserDetails(userData as any);

    setTimeout(() => {
      setIsSaving(false);
      setNotificationSuccess(true);
      setTimeout(() => setNotificationSuccess(false), 3000);
    }, 800);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== formData.fullName) return;
    
    setIsSaving(true);
    // Simulate account deletion
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Clear local storage
    localStorage.clear();
    window.location.href = '/';
  };

  const tabs: TabItem[] = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: <User size={18}/>,
      description: 'Personal information'
    },
    { 
      id: 'security', 
      label: 'Security', 
      icon: <Lock size={18}/>,
      description: 'Password & authentication',
      badge: '2FA'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: <Bell size={18}/>,
      description: 'Manage alerts'
    },
    { 
      id: 'privacy', 
      label: 'Privacy', 
      icon: <Shield size={18}/>,
      description: 'Data sharing controls'
    },
    { 
      id: 'activity', 
      label: 'Activity Log', 
      icon: <History size={18}/>,
      description: 'Recent account activity'
    },
  ];

  const inputFields = [
    { key: 'fullName', label: 'Full Name *', icon: <User size={16} />, type: 'text', placeholder: 'Enter your full name' },
    { key: 'email', label: 'Email Address *', icon: <Mail size={16} />, type: 'email', placeholder: 'Enter your email' },
    { key: 'phone', label: 'Phone Number *', icon: <Phone size={16} />, type: 'tel', placeholder: 'e.g., 9801234567' },
    { key: 'age', label: 'Age *', icon: <Calendar size={16} />, type: 'number', placeholder: 'Enter your age' },
    { key: 'address', label: 'Address', icon: <MapPin size={16} />, type: 'textarea', placeholder: 'Enter your complete address', fullWidth: true },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="p-6 lg:p-8 w-full">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Settings</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your account and preferences</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: Profile Card & Navigation */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profile Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[2rem] p-6 shadow-lg border border-slate-200"
              >
                {/* Cover Gradient */}
                <div className="h-24 -mx-6 -mt-6 mb-4 rounded-t-[2rem] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
                  <div className="absolute inset-0"></div>
                </div>

                {/* Profile Image - Fixed positioning */}
                <div className="relative flex flex-col items-center -mt-16">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-28 h-28 rounded-full ring-4 ring-white bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl overflow-hidden transition-transform duration-300 group-hover:scale-105">
                      {formData.profileImage.startsWith('http') ? (
                        <img src={formData.profileImage} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <span>{getInitials(formData.fullName)}</span>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                      <Camera className="text-white" size={28} />
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <h2 className="text-2xl font-black text-slate-800">{formData.fullName}</h2>
                  <p className="text-slate-500 font-medium">{formData.email}</p>
                  <div className="flex items-center justify-center gap-2 mt-2 text-sm text-slate-400">
                    <Phone size={14} />
                    <span>{formData.phone || 'No phone added'}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-black text-blue-600">12</div>
                      <div className="text-xs text-slate-400">Appointments</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-green-600">5</div>
                      <div className="text-xs text-slate-400">Records</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-purple-600">3</div>
                      <div className="text-xs text-slate-400">Favorites</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Tab Navigation */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                {tabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => { 
                      setActiveTab(tab.id); 
                      setErrors({}); 
                      setSaveSuccess(false);
                      setPasswordSuccess(false);
                      setPrivacySuccess(false);
                      setNotificationSuccess(false);
                    }}
                    className={`w-full relative overflow-hidden px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                      activeTab === tab.id 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-100' 
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                          {tab.icon}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span>{tab.label}</span>
                            {tab.badge && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                activeTab === tab.id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {tab.badge}
                              </span>
                            )}
                          </div>
                          <div className={`text-xs font-medium ${activeTab === tab.id ? 'text-blue-100' : 'text-slate-400'}`}>
                            {tab.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className={`transition-transform duration-300 ${activeTab === tab.id ? 'rotate-90' : ''} ${activeTab === tab.id ? 'text-blue-200' : 'text-slate-400'}`} />
                    </div>
                  </motion.button>
                ))}
              </motion.div>

              {/* Danger Zone Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-red-50 border border-red-200 rounded-[2rem] p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-red-100">
                    <Trash2 className="text-red-600" size={18} />
                  </div>
                  <h3 className="font-bold text-red-800">Danger Zone</h3>
                </div>
                <p className="text-sm text-red-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full py-3 px-4 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
              </motion.div>
            </div>

            {/* RIGHT: Content Box */}
            <div className="lg:col-span-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden min-h-[600px] relative"
              >
                {/* Background */}
                <div className="absolute inset-0 opacity-3">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="p-8 lg:p-10 relative z-10">
                  {/* PROFILE TAB */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'profile' && (
                      <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`space-y-6 transition-all duration-500 ${fieldsAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      >
                        {/* Section Header */}
                        <div>
                          <h3 className="text-2xl font-black text-slate-800">Personal Information</h3>
                          <p className="text-slate-500 font-medium text-sm mt-1">Update your personal details</p>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {inputFields.map((field, index) => (
                            <motion.div 
                              key={field.key}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`space-y-2 ${field.fullWidth ? 'md:col-span-2' : ''}`}
                            >
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-2 flex items-center gap-2">
                                {field.icon}
                                {field.label}
                              </label>
                              {field.type === 'textarea' ? (
                                <textarea
                                  className={`w-full px-5 py-3.5 rounded-xl border-2 outline-none font-semibold transition-all duration-300 text-slate-700 ${
                                    errors[field.key as keyof FormData] 
                                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500'
                                  }`}
                                  value={formData[field.key as keyof FormData] as string}
                                  placeholder={field.placeholder}
                                  rows={3}
                                  onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                                />
                              ) : (
                                <input
                                  type={field.type}
                                  className={`w-full px-5 py-3.5 rounded-xl border-2 outline-none font-semibold transition-all duration-300 text-slate-700 ${
                                    errors[field.key as keyof FormData] 
                                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500'
                                  }`}
                                  value={formData[field.key as keyof FormData] as string}
                                  placeholder={field.placeholder}
                                  onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                                />
                              )}
                              {errors[field.key as keyof FormData] && (
                                <p className="text-red-500 text-xs font-bold ml-2 flex items-center gap-1">
                                  <AlertCircle size={12} />
                                  {errors[field.key as keyof FormData]}
                                </p>
                              )}
                            </motion.div>
                          ))}

                          {/* Gender Field */}
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-2"
                          >
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-2 flex items-center gap-2">
                              <User size={16} />
                              Gender *
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                              {['Female', 'Male', 'Other'].map((gender) => (
                                <button
                                  key={gender}
                                  type="button"
                                  onClick={() => setFormData({...formData, gender})}
                                  className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                                    formData.gender === gender 
                                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200'
                                  }`}
                                >
                                  {gender}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        </div>

                        {/* Save Button */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                          {saveSuccess && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-2 text-green-600 font-bold text-sm"
                            >
                              <CheckCircle size={18}/> Saved successfully!
                            </motion.div>
                          )}
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
                          >
                            {isSaving ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <>
                                <Save size={18} />
                                Save Profile
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* SECURITY TAB */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'security' && (
                      <motion.div
                        key="security"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`space-y-6 transition-all duration-500 ${fieldsAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      >
                        <div>
                          <h3 className="text-2xl font-black text-slate-800">Security Settings</h3>
                          <p className="text-slate-500 font-medium text-sm mt-1">Manage your password and security options</p>
                        </div>

                        {/* Connected Devices */}
                        <div className="bg-slate-50 rounded-2xl p-6">
                          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Smartphone size={18} />
                            Connected Devices
                          </h4>
                          <div className="space-y-3">
                            {connectedDevices.map((device) => (
                              <div key={device.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-xl ${device.current ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Monitor size={18} />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-800">{device.device}</div>
                                    <div className="text-xs text-slate-400">{device.lastActive}</div>
                                  </div>
                                </div>
                                {device.current ? (
                                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">Current</span>
                                ) : (
                                  <button className="text-red-500 text-sm font-medium hover:text-red-600">Sign out</button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-5">
                          {/* Password Fields */}
                          {[
                            { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password', showKey: 'current' },
                            { key: 'newPassword', label: 'New Password', placeholder: 'Min 6 characters', showKey: 'new' },
                            { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Re-type password', showKey: 'confirm' },
                          ].map((field, index) => (
                            <motion.div 
                              key={field.key}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="space-y-2"
                            >
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-2">{field.label}</label>
                              <div className="relative">
                                <input 
                                  type={showPasswords[field.showKey as keyof typeof showPasswords] ? 'text' : 'password'}
                                  placeholder={field.placeholder}
                                  className={`w-full px-5 py-3.5 rounded-xl border-2 outline-none font-semibold transition-all duration-300 text-slate-700 ${
                                    errors[field.key as keyof FormData] 
                                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500'
                                  }`}
                                  value={formData[field.key as keyof FormData] as string}
                                  onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPasswords({...showPasswords, [field.showKey]: !showPasswords[field.showKey as keyof typeof showPasswords]})}
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  {showPasswords[field.showKey as keyof typeof showPasswords] ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                              </div>
                              {errors[field.key as keyof FormData] && (
                                <p className="text-red-500 text-xs font-bold ml-2 flex items-center gap-1">
                                  <AlertCircle size={12} />
                                  {errors[field.key as keyof FormData]}
                                </p>
                              )}
                            </motion.div>
                          ))}
                        </div>

                        {/* Save Button */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                          {passwordSuccess && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-2 text-green-600 font-bold text-sm"
                            >
                              <CheckCircle size={18}/> Password updated!
                            </motion.div>
                          )}
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSavePassword}
                            disabled={isSaving}
                            className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
                          >
                            {isSaving ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <>
                                <Key size={18} />
                                Update Password
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* NOTIFICATIONS TAB */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'notifications' && (
                      <motion.div
                        key="notifications"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`space-y-6 transition-all duration-500 ${fieldsAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      >
                        <div>
                          <h3 className="text-2xl font-black text-slate-800">Notification Preferences</h3>
                          <p className="text-slate-500 font-medium text-sm mt-1">Control how you receive notifications</p>
                        </div>

                        {/* Email Notifications */}
                        <div className="space-y-4">
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-200 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                                  <Mail size={22} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800">Email Notifications</h4>
                                  <p className="text-sm text-slate-400 font-medium">Receive updates via email</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setFormData({...formData, emailNotifications: !formData.emailNotifications})}
                                className={`${formData.emailNotifications ? 'bg-blue-600' : 'bg-slate-200'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors`}
                              >
                                <span className={`${formData.emailNotifications ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-lg`} />
                              </button>
                            </div>
                          </motion.div>

                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-200 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                                  <MessageSquare size={22} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800">SMS Notifications</h4>
                                  <p className="text-sm text-slate-400 font-medium">Receive text message alerts</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setFormData({...formData, smsNotifications: !formData.smsNotifications})}
                                className={`${formData.smsNotifications ? 'bg-blue-600' : 'bg-slate-200'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors`}
                              >
                                <span className={`${formData.smsNotifications ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-lg`} />
                              </button>
                            </div>
                          </motion.div>

                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-200 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                                  <Calendar size={22} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800">Appointment Reminders</h4>
                                  <p className="text-sm text-slate-400 font-medium">Get reminded before appointments</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setFormData({...formData, appointmentReminders: !formData.appointmentReminders})}
                                className={`${formData.appointmentReminders ? 'bg-blue-600' : 'bg-slate-200'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors`}
                              >
                                <span className={`${formData.appointmentReminders ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-lg`} />
                              </button>
                            </div>
                          </motion.div>

                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-200 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg">
                                  <Heart size={22} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800">Health Tips</h4>
                                  <p className="text-sm text-slate-400 font-medium">Receive personalized health advice</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setFormData({...formData, healthTips: !formData.healthTips})}
                                className={`${formData.healthTips ? 'bg-blue-600' : 'bg-slate-200'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors`}
                              >
                                <span className={`${formData.healthTips ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-lg`} />
                              </button>
                            </div>
                          </motion.div>

                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-200 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                                  <MailOpen size={22} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800">Promotional Emails</h4>
                                  <p className="text-sm text-slate-400 font-medium">Receive offers and promotions</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setFormData({...formData, promotionalEmails: !formData.promotionalEmails})}
                                className={`${formData.promotionalEmails ? 'bg-blue-600' : 'bg-slate-200'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors`}
                              >
                                <span className={`${formData.promotionalEmails ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-lg`} />
                              </button>
                            </div>
                          </motion.div>
                        </div>

                        {/* Save Button */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                          {notificationSuccess && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-2 text-green-600 font-bold text-sm"
                            >
                              <CheckCircle size={18}/> Settings saved!
                            </motion.div>
                          )}
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSaveNotifications}
                            disabled={isSaving}
                            className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
                          >
                            {isSaving ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <>
                                <Bell size={18} />
                                Save Preferences
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* PRIVACY TAB */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'privacy' && (
                      <motion.div
                        key="privacy"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`space-y-6 transition-all duration-500 ${fieldsAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      >
                        <div>
                          <h3 className="text-2xl font-black text-slate-800">Privacy Controls</h3>
                          <p className="text-slate-500 font-medium text-sm mt-1">Manage your data sharing preferences</p>
                        </div>

                        <div className="space-y-4">
                          {[
                            { 
                              id: 'twoFactor', 
                              title: 'Two-Factor Authentication', 
                              desc: 'Add an extra layer of security to your account with 2FA.',
                              icon: <ShieldCheck size={22} />,
                              color: 'from-green-500 to-emerald-600'
                            },
                            { 
                              id: 'dataSharing', 
                              title: 'Research Participation', 
                              desc: 'Share anonymized health data for medical research and help improve healthcare.',
                              icon: <Heart size={22} />,
                              color: 'from-pink-500 to-rose-600'
                            },
                          ].map((item, index) => (
                            <motion.div 
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`group p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-200 transition-all duration-300`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {item.icon}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                                    <p className="text-sm text-slate-400 font-medium">{item.desc}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setFormData({...formData, [item.id]: !formData[item.id as keyof FormData]})}
                                  className={`${formData[item.id as keyof FormData] ? 'bg-blue-600' : 'bg-slate-200'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors`}
                                >
                                  <span className={`${formData[item.id as keyof FormData] ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-lg`} />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Data Management */}
                        <div className="mt-8 pt-6 border-t border-slate-100">
                          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Download size={18} />
                            Data Management
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button className="p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-200 transition-all duration-300 flex items-center gap-3">
                              <FileText size={20} className="text-blue-500" />
                              <span className="font-semibold text-slate-700">Export My Data</span>
                            </button>
                            <button className="p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-red-200 transition-all duration-300 flex items-center gap-3">
                              <Trash2 size={20} className="text-red-500" />
                              <span className="font-semibold text-slate-700">Clear Cache</span>
                            </button>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                          {privacySuccess && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-2 text-green-600 font-bold text-sm"
                            >
                              <CheckCircle size={18}/> Privacy settings saved!
                            </motion.div>
                          )}
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSavePrivacy}
                            disabled={isSaving}
                            className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
                          >
                            {isSaving ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <>
                                <Shield size={18} />
                                Save Privacy Settings
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ACTIVITY LOG TAB */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'activity' && (
                      <motion.div
                        key="activity"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`space-y-6 transition-all duration-500 ${fieldsAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-2xl font-black text-slate-800">Activity Log</h3>
                            <p className="text-slate-500 font-medium text-sm mt-1">Track your recent account activity</p>
                          </div>
                          <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm">
                            Clear Log
                          </button>
                        </div>

                        <div className="space-y-3">
                          {activityLog.map((activity, index) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                              <div className="p-2 rounded-lg bg-white text-slate-500 shadow-sm">
                                {activity.icon}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-slate-800">{activity.action}</div>
                                <div className="text-xs text-slate-400">{activity.device}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-slate-400">{activity.time}</div>
                                <div className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                                  <MapPinHouse size={10} />
                                  {activity.location}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Clock size={18} />
                            Session Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50">
                              <div className="text-xs text-slate-400 mb-1">Current Session</div>
                              <div className="font-semibold text-slate-800">Active since 2 hours ago</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50">
                              <div className="text-xs text-slate-400 mb-1">IP Address</div>
                              <div className="font-semibold text-slate-800">192.168.1.xxx</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="text-red-600" size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Delete Account</h3>
                <p className="text-slate-500 mb-6">
                  This action is permanent and cannot be undone. All your data will be permanently deleted.
                </p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type <span className="font-bold text-red-600">{formData.fullName}</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder={formData.fullName}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-red-300"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== formData.fullName || isSaving}
                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin mx-auto" size={18} />
                    ) : (
                      'Delete Account'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
