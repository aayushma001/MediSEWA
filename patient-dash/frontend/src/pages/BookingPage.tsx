
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import { getUserDetails, saveUserDetails } from '../utils/userStorage';
import {
  Heart, Activity, Droplets, Weight, Brain, Eye, Wind,
  ChevronLeft, CheckCircle, Download, Loader2, Clock, Calendar,
  User, Mail, Phone, MapPin, Video, Building2, Stethoscope,
  CreditCard, Wallet, QrCode, Banknote, CalendarCheck, MapPinHouse
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Star } from 'lucide-react';

const DEPARTMENTS = [
  { id: 'cardiology', name: 'Cardiology', icon: Heart, color: 'bg-red-500', price: 800 },
  { id: 'neurology', name: 'Neurology', icon: Brain, color: 'bg-purple-500', price: 900 },
  { id: 'orthopedics', name: 'Orthopedics', icon: Weight, color: 'bg-orange-500', price: 700 },
  { id: 'ophthalmology', name: 'Ophthalmology', icon: Eye, color: 'bg-blue-500', price: 600 },
  { id: 'pulmonology', name: 'Pulmonology', icon: Wind, color: 'bg-teal-500', price: 700 },
  { id: 'dermatology', name: 'Dermatology', icon: Droplets, color: 'bg-pink-500', price: 500 },
  { id: 'general', name: 'General Medicine', icon: Activity, color: 'bg-green-500', price: 400 },
];

const TIME_SLOTS = [
  { time: '09:00 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '12:00 PM', available: false },
  { time: '01:00 PM', available: true },
  { time: '02:00 PM', available: true },
  { time: '03:00 PM', available: true },
  { time: '04:00 PM', available: true },
  { time: '05:00 PM', available: false },
];

const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash', icon: Banknote, desc: 'Pay at hospital reception', availableFor: ['clinic'] },
  { id: 'qr', name: 'QR Code', icon: QrCode, desc: 'Scan QR to pay', availableFor: ['video', 'clinic'] },
  { id: 'card', name: 'Debit/Credit Card', icon: CreditCard, desc: 'Pay with card', availableFor: ['video', 'clinic'] },
];

interface Doctor {
  id: number;
  name: string;
  specialties: string[];
  rating: number;
  experience: number;
  consultationFee: number;
  hospital: string;
  image: string;
}

interface Hospital {
  id: number;
  name: string;
  location: string;
  rating: number;
  specialties: string[];
}

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedHospital = location.state?.selectedHospital as Hospital | undefined;
  const selectedDoctor = location.state?.selectedDoctor as Doctor | undefined;
  const bookingSource = location.state?.source as string | undefined;
  const skipSpecialtyParam = location.state?.skipSpecialty as boolean | undefined;
  const skipTypeParam = location.state?.skipType as boolean | undefined;

  const [step, setStep] = useState(skipSpecialtyParam ? (skipTypeParam ? 3 : 2) : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const [appointmentData, setAppointmentData] = useState<any>(null);
const [selectedPayment, setSelectedPayment] = useState<string>('cash');
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [selectedVideoDoctor, setSelectedVideoDoctor] = useState<Doctor | null>(selectedDoctor || null);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const userDetails = getUserDetails();

  // Determine initial values based on source
  const isDoctorSource = bookingSource === 'doctor' || selectedDoctor;
  const isHospitalSource = bookingSource === 'hospital' || selectedHospital;

  const [formData, setFormData] = useState({
    department: selectedDoctor?.specialties?.[0] || (selectedHospital?.specialties?.[0] || ''),
    visitType: isDoctorSource ? 'video' : (isHospitalSource ? 'clinic' : ''),
    date: '',
    time: '',
    fullName: (userDetails.fullName as string) || '',
    age: (userDetails.age as string) || '',
    gender: (userDetails.gender as string) || 'Female',
    address: (userDetails.address as string) || '',
    phone: (userDetails.phone as string) || '',
    email: (userDetails.email as string) || '',
    hospital: selectedHospital?.name || (selectedDoctor?.hospital || ''),
    doctor: selectedDoctor?.name || '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Fetch hospitals when in-person visit type is selected
  const [availableHospitals, setAvailableHospitals] = useState<Hospital[]>([]);
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  // Fetch hospitals when in-person is selected
  useEffect(() => {
    if (formData.visitType === 'clinic') {
      setLoadingHospitals(true);
      // Load mock hospitals for now
      const mockHospitals: Hospital[] = [
        { id: 1, name: 'Patan Hospital', location: 'Patan Dhoka, Kathmandu', rating: 4.7, specialties: ['Cardiology', 'Neurology', 'Orthopedic'] },
        { id: 2, name: 'Tribhuvan University Teaching Hospital', location: 'Kathmandu Medical College', rating: 4.5, specialties: ['General Surgery', 'Pediatrics', 'Cardiac'] },
        { id: 3, name: 'Kathmandu Medical College Hospital', location: 'Sinamangal, Kathmandu', rating: 4.6, specialties: ['Oncology', 'Dentistry', 'Urology'] },
        { id: 4, name: 'Grande International Hospital', location: 'Jamal, Kathmandu', rating: 4.8, specialties: ['Cardiology', 'Orthopedic', 'Gastroenterology'] },
      ];
      setTimeout(() => {
        setAvailableHospitals(mockHospitals);
        setLoadingHospitals(false);
      }, 300);
    } else {
      setAvailableHospitals([]);
    }
  }, [formData.visitType]);

  const handleSelectHospital = (hospital: Hospital) => {
    setFormData({...formData, hospital: hospital.name});
    setShowHospitalModal(false);
  };

  const handleSelectVideoDoctor = (doctor: Doctor) => {
    setSelectedVideoDoctor(doctor);
    setFormData({
      ...formData,
      doctor: doctor.name,
      hospital: doctor.hospital
    });
  };

  // Save receipt to localStorage for ReceiptsPage
  const saveReceiptToStorage = (receiptData: any) => {
    const existingReceipts = JSON.parse(localStorage.getItem('receipts') || '[]');
    const newReceipt = {
      id: Date.now(),
      receiptNumber: `RCP-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      hospital: formData.hospital,
      doctor: formData.doctor || 'N/A',
      department: formData.department,
      items: [{ name: 'Consultation Fee', quantity: 1, price: getConsultationFee() }],
      subtotal: getConsultationFee(),
      tax: 0,
      discount: 0,
      total: getConsultationFee(),
      paymentMethod: selectedPayment === 'cash' ? 'cash' : (selectedPayment === 'card' ? 'card' : 'online'),
      status: 'paid',
      notes: `${formData.visitType === 'video' ? 'Video Consultation' : 'In-Clinic Visit'}`,
      isPrivate: false,
      appointmentId: receiptData.id || appointmentId,
    };
    existingReceipts.unshift(newReceipt);
    localStorage.setItem('receipts', JSON.stringify(existingReceipts));
  };

  // Calculate price based on department and visit type
  const getConsultationFee = () => {
    const dept = DEPARTMENTS.find(d => d.id === formData.department);
    let basePrice = dept?.price || 500;
    
    // Video consultations are cheaper
    if (formData.visitType === 'video') {
      basePrice = Math.round(basePrice * 0.8);
    }
    
    // Add doctor premium if selected
    if (selectedDoctor?.consultationFee) {
      basePrice = selectedDoctor.consultationFee;
    }
    
    return basePrice;
  };

  // Auto-assign values based on source
  useEffect(() => {
    if (bookingSource === 'hospital' && selectedHospital) {
      setFormData(prev => ({
        ...prev,
        hospital: selectedHospital.name,
        visitType: 'clinic',
        department: prev.department || selectedHospital.specialties?.[0] || 'general'
      }));
    } else if (bookingSource === 'doctor' && selectedDoctor) {
      setFormData(prev => ({
        ...prev,
        doctor: selectedDoctor.name,
        hospital: selectedDoctor.hospital,
        visitType: 'video',
        department: prev.department || selectedDoctor.specialties?.[0] || 'general'
      }));
    }
  }, [bookingSource, selectedHospital, selectedDoctor]);

  // Skip steps based on source params
  const skipSpecialty = skipSpecialtyParam ?? (bookingSource === 'doctor' || bookingSource === 'hospital');
  const skipType = skipTypeParam ?? (bookingSource === 'doctor' || bookingSource === 'hospital');

  const totalSteps = 5; // Department, Time, Details, Payment, Confirmation

  const getActualStep = (visibleStep: number) => {
    let actualStep = visibleStep;
    if (skipSpecialty && visibleStep >= 1) actualStep++;
    if (skipType && visibleStep >= 2) actualStep++;
    return actualStep;
  };

  const validateField = (name: string, value: string) => {
    const errors: {[key: string]: string} = {};
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) errors.fullName = 'Full name is required';
        break;
      case 'email':
        if (!value.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Valid email required';
        break;
      case 'phone':
        if (!value.trim()) errors.phone = 'Phone number is required';
        else if (!/^(\+977|977|0)?[9][6-9]\d{8}$/.test(value.replace(/\s+/g, ''))) {
          errors.phone = 'Valid Nepali phone required';
        }
        break;
      case 'age':
        if (!value.trim()) errors.age = 'Age is required';
        else if (parseInt(value) < 1 || parseInt(value) > 120) errors.age = 'Valid age required';
        break;
      case 'address':
        if (!value.trim()) errors.address = 'Address is required';
        break;
      case 'date':
        if (!value) errors.date = 'Please select a date';
        else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) errors.date = 'Future date required';
        }
        break;
      case 'time':
        if (!value) errors.time = 'Please select a time slot';
        break;
      case 'department':
        if (!value) errors.department = 'Please select a department';
        break;
    }
    
    return errors;
  };

  const validateStep = (currentStep: number) => {
    const errors: {[key: string]: string} = {};
    const actualStep = getActualStep(currentStep);
    
    switch (actualStep) {
      case 1:
        if (!skipSpecialty) {
          Object.assign(errors, validateField('department', formData.department));
        }
        break;
      case 2:
        Object.assign(errors, validateField('date', formData.date));
        Object.assign(errors, validateField('time', formData.time));
        // Validate hospital for in-person booking
        if (formData.visitType === 'clinic' && !formData.hospital) {
          errors.hospital = 'Please select a hospital';
        }
        // Validate doctor for video booking
        if (formData.visitType === 'video' && !formData.doctor) {
          errors.doctor = 'Please select a doctor';
        }
        break;
      case 3:
        ['fullName', 'email', 'phone', 'age', 'address'].forEach(field => {
          Object.assign(errors, validateField(field, formData[field as keyof typeof formData] as string));
        });
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canContinue = () => {
    const actualStep = getActualStep(step);
    
    switch (actualStep) {
      case 1: return !!formData.department || skipSpecialty;
      case 2: 
        if (!formData.date || !formData.time) return false;
        // Validate hospital for in-person booking
        if (formData.visitType === 'clinic' && !formData.hospital) return false;
        // Validate doctor for video booking
        if (formData.visitType === 'video' && !formData.doctor) return false;
        return true;
      case 3: return !!formData.fullName && !!formData.age && !!formData.address && !!formData.email && !!formData.phone;
      case 4: return !!selectedPayment;
      default: return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleBookingComplete = async () => {
    setIsSubmitting(true);
    setError(null);
    setPaymentStatus('processing');

    const consultationFee = getConsultationFee();

    const payload = {
      patient_name: formData.fullName,
      patient_email: formData.email,
      patient_phone: formData.phone,
      patient_age: parseInt(formData.age) || 0,
      patient_gender: formData.gender,
      patient_address: formData.address,
      specialty: formData.department,
      appointment_type: formData.visitType === 'video' ? 'Video' : 'Clinic',
      preferred_date: formData.date,
      preferred_time: formData.time,
      hospital: formData.hospital,
      doctor: formData.doctor || null,
      notes: formData.notes,
      consultation_fee: consultationFee,
      payment_amount: consultationFee,
      payment_method: selectedPayment,
    };

    try {
      const response = await fetch('http://127.0.0.1:8001/api/appointments/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || errorData.details || errorData.message || 'Failed to create appointment');
      }
      
      const data = await response.json();
      console.log('Success response:', data);
      setAppointmentId(data.appointment?.id || data.id);
      setAppointmentData(data.appointment);
      setPaymentStatus('success');
      
      // Save to localStorage
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      appointments.push({
        id: data.appointment?.id || data.id,
        ...payload,
        status: 'confirmed',
        receipt_number: data.receipt_number,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('appointments', JSON.stringify(appointments));
      
      // Save receipt to localStorage for ReceiptsPage
      saveReceiptToStorage({ id: data.appointment?.id || data.id });
      
      setStep(5);
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || "Failed to book appointment. Please try again.");
      setPaymentStatus('pending');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createReceipt = async (appointment: any, amount: number) => {
    try {
      await fetch('http://127.0.0.1:8001/api/receipts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receipt_number: `RCP-${Date.now()}`,
          appointment: appointment.id,
          patient_name: formData.fullName,
          patient_email: formData.email,
          patient_phone: formData.phone,
          department: formData.department,
          hospital_name: formData.hospital,
          doctor_name: formData.doctor,
          appointment_date: formData.date,
          appointment_time: formData.time,
          visit_type: formData.visitType,
          description: `${formData.visitType === 'video' ? 'Video Consultation' : 'In-Clinic Visit'} with ${formData.doctor || formData.department} at ${formData.hospital}`,
          amount: amount,
          payment_method: selectedPayment,
          payment_status: 'paid',
          status: 'paid',
        }),
      });
    } catch (err) {
      console.error('Failed to create receipt:', err);
    }
  };

  const generatePDF = () => {
    if (!appointmentData) return;
    
    const doc = new jsPDF();
    const primaryColor = "#1e40af";
    
    // Header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("MEDISEWA", 105, 25, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Healthcare Appointment System", 105, 38, { align: "center" });

    // Title
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("APPOINTMENT CONFIRMATION", 105, 65, { align: "center" });

    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.5);
    doc.line(20, 72, 190, 72);

    // Appointment Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Appointment Details", 20, 90);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Appointment ID: ${appointmentData.id || appointmentId}`, 20, 100);
    doc.text(`Date: ${formData.date}`, 20, 108);
    doc.text(`Time: ${formData.time}`, 20, 116);
    doc.text(`Department: ${formData.department}`, 20, 124);
    doc.text(`Type: ${formData.visitType === 'video' ? 'Video Consultation' : 'In-Clinic Visit'}`, 20, 132);

    // Doctor & Hospital Info
    doc.setFont("helvetica", "bold");
    doc.text("Healthcare Provider", 110, 90);
    doc.setFont("helvetica", "normal");
    if (formData.doctor) {
      doc.text(`Doctor: Dr. ${formData.doctor}`, 110, 100);
    }
    doc.text(`Hospital: ${formData.hospital}`, 110, 108);

    // Patient Info
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information", 20, 150);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${formData.fullName}`, 20, 160);
    doc.text(`Age: ${formData.age} years`, 20, 168);
    doc.text(`Phone: ${formData.phone}`, 20, 176);
    doc.text(`Email: ${formData.email}`, 20, 184);

    // Payment Summary
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 200, 170, 45, 3, 3, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.text("Payment Summary", 30, 212);
    
    doc.setFont("helvetica", "normal");
    doc.text("Consultation Fee", 30, 222);
    doc.text(`NPR ${getConsultationFee()}.00`, 170, 222, { align: "right" });
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total Paid", 30, 238);
    doc.text(`NPR ${getConsultationFee()}.00`, 170, 238, { align: "right" });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 270, { align: "center" });
    doc.text("Thank you for choosing MediSewa!", 105, 278, { align: "center" });

    doc.save(`Appointment_${appointmentData.id || Date.now()}.pdf`);
  };

  const getStepName = (stepNum: number) => {
    const stepNames = ['Department', 'Schedule', 'Your Details', 'Payment', 'Confirmation'];
    return stepNames[stepNum - 1] || '';
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium mb-6 transition-colors"
          >
            <ChevronLeft size={20} />
            Back
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Book Appointment</h1>
            <p className="text-slate-500 mt-1">
              {selectedDoctor 
                ? `Booking with Dr. ${selectedDoctor.name}` 
                : selectedHospital 
                  ? `Booking at ${selectedHospital.name}`
                  : 'Schedule your consultation'}
            </p>
          </div>

          {/* Progress Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 w-full h-1.5 bg-slate-200 rounded-full -z-0"></div>
              <div 
                className="absolute top-5 left-0 h-1.5 bg-blue-600 rounded-full -z-0 transition-all duration-500"
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              ></div>
              
              {Array.from({ length: totalSteps }).map((_, i) => {
                const stepNum = i + 1;
                const isActive = step === stepNum;
                const isCompleted = step > stepNum;
                
                return (
                  <div key={stepNum} className="flex flex-col items-center z-10">
                    <motion.div 
                      initial={false}
                      animate={{ 
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isCompleted ? '#22c55e' : (isActive ? '#2563eb' : '#e2e8f0')
                      }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        isCompleted ? 'text-white' : (isActive ? 'text-white' : 'text-slate-400')
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle size={24} />
                      ) : (
                        stepNum
                      )}
                    </motion.div>
                    <span className={`text-xs mt-2 font-medium hidden sm:block ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}>
                      {getStepName(stepNum)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 font-medium"
                    >
                      {error}
                    </motion.div>
                  )}

                  <AnimatePresence mode="wait">
                    {/* Step 1: Department */}
                    {step === 1 && !skipSpecialty && (
                      <motion.div
                        key="step1"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Select Department</h2>
                        <p className="text-slate-500 mb-6">Choose the department for your consultation</p>
                        
                        {formErrors.department && (
                          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {formErrors.department}
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {DEPARTMENTS.map((dept) => {
                            const Icon = dept.icon;
                            return (
                              <motion.button
                                key={dept.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setFormData({...formData, department: dept.id});
                                  setFormErrors(prev => ({ ...prev, department: '' }));
                                }}
                                className={`p-5 border-2 rounded-2xl flex flex-col items-center gap-3 transition-all ${
                                  formData.department === dept.id 
                                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                                  : 'border-slate-200 hover:border-blue-300 bg-white'
                                }`}
                              >
                                <div className={`p-4 rounded-2xl ${dept.color} text-white shadow-lg`}>
                                  <Icon size={28} />
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-700 block">{dept.name}</span>
                                  <span className="text-xs text-slate-400">NPR {dept.price}</span>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Schedule */}
                    {getActualStep(step) === 2 && (
                      <motion.div
                        key="step2"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Choose Schedule</h2>
                        <p className="text-slate-500 mb-6">Select your preferred date and time</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Date Selection */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Select Date</label>
                            <input
                              type="date"
                              value={formData.date}
                              onChange={(e) => {
                                setFormData({...formData, date: e.target.value});
                                setFormErrors(prev => ({ ...prev, date: '' }));
                              }}
                              min={new Date().toISOString().split('T')[0]}
                              className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                                formErrors.date 
                                ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500'
                              }`}
                            />
                            {formErrors.date && (
                              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                <CalendarCheck size={12} /> {formErrors.date}
                              </p>
                            )}
                          </div>

                          {/* Visit Type */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Visit Type</label>
                            <div className="grid grid-cols-2 gap-3">
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFormData({...formData, visitType: 'video'})}
                                className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                                  formData.visitType === 'video'
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-slate-200 hover:border-blue-300'
                                }`}
                              >
                                <Video size={24} className={formData.visitType === 'video' ? 'text-blue-600' : 'text-slate-400'} />
                                <span className={`text-sm font-semibold ${formData.visitType === 'video' ? 'text-blue-600' : 'text-slate-600'}`}>Video Call</span>
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFormData({...formData, visitType: 'clinic'})}
                                className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                                  formData.visitType === 'clinic'
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-slate-200 hover:border-blue-300'
                                }`}
                              >
                                <Building2 size={24} className={formData.visitType === 'clinic' ? 'text-blue-600' : 'text-slate-400'} />
                                <span className={`text-sm font-semibold ${formData.visitType === 'clinic' ? 'text-blue-600' : 'text-slate-600'}`}>In-Person</span>
                              </motion.button>
                            </div>
                          </div>

                          {/* Hospital Selection for In-Person */}
                          {formData.visitType === 'clinic' && (
                            <div className="mt-6">
                              <label className="block text-sm font-semibold text-slate-700 mb-3">Select Hospital</label>
                              {formData.hospital ? (
                                <div className="flex items-center justify-between p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                      <Building2 size={20} className="text-emerald-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-800">{formData.hospital}</p>
                                      <p className="text-xs text-emerald-600">Selected Hospital</p>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => setShowHospitalModal(true)}
                                    className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg font-medium hover:bg-emerald-700 transition-all"
                                  >
                                    Change
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setShowHospitalModal(true)}
                                    className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-all"
                                  >
                                    <Building2 size={20} />
                                    Select Hospital
                                  </button>
                                  {formErrors.hospital && (
                                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                      <Building2 size={12} /> {formErrors.hospital}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          )}

                          {/* Doctor Selection for Video Call */}
                          {formData.visitType === 'video' && (
                            <div className="mt-6">
                              <label className="block text-sm font-semibold text-slate-700 mb-3">Select Doctor</label>
                              {selectedVideoDoctor ? (
                                <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={selectedVideoDoctor.image}
                                      alt={selectedVideoDoctor.name}
                                      className="w-10 h-10 rounded-xl object-cover"
                                    />
                                    <div>
                                      <p className="font-semibold text-slate-800">Dr. {selectedVideoDoctor.name}</p>
                                      <p className="text-xs text-blue-600">{selectedVideoDoctor.specialties?.[0]} • {selectedVideoDoctor.experience} years exp</p>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => setSelectedVideoDoctor(null)}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-all"
                                  >
                                    Change
                                  </button>
                                </div>
                              ) : loadingDoctors ? (
                                <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-center gap-2">
                                  <Loader2 size={20} className="animate-spin text-blue-600" />
                                  <span className="text-slate-500">Loading doctors...</span>
                                </div>
                              ) : availableDoctors.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {availableDoctors.map((doctor) => (
                                    <button
                                      key={doctor.id}
                                      onClick={() => handleSelectVideoDoctor(doctor)}
                                      className="w-full p-3 flex items-center gap-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
                                    >
                                      <img 
                                        src={doctor.image}
                                        alt={doctor.name}
                                        className="w-10 h-10 rounded-xl object-cover"
                                      />
                                      <div className="flex-1 text-left">
                                        <p className="font-medium text-slate-800">Dr. {doctor.name}</p>
                                        <p className="text-xs text-slate-500">{doctor.specialties?.[0]} • NPR {doctor.consultationFee}</p>
                                      </div>
                                      <div className="flex items-center gap-1 text-amber-500">
                                        <Star size={12} fill="currentColor" />
                                        <span className="text-sm font-medium">{doctor.rating}</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <>
                                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-500">
                                    <p>No doctors available</p>
                                    <p className="text-xs mt-1">Please select a department first</p>
                                  </div>
                                  {formErrors.doctor && (
                                    <p className="text-red-500 text-xs mt-2 flex items-center justify-center gap-1">
                                      <Building2 size={12} /> {formErrors.doctor}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          )}

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Available Time Slots</label>
                            {formErrors.time && (
                              <p className="text-red-500 text-xs mb-2 flex items-center gap-1">
                                <Clock size={12} /> {formErrors.time}
                              </p>
                            )}
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                              {TIME_SLOTS.map((slot) => (
                                <motion.button
                                  key={slot.time}
                                  whileTap={{ scale: slot.available ? 0.95 : 1 }}
                                  onClick={() => {
                                    if (slot.available) {
                                      setFormData({...formData, time: slot.time});
                                      setFormErrors(prev => ({ ...prev, time: '' }));
                                    }
                                  }}
                                  disabled={!slot.available}
                                  className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                                    !slot.available 
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                    : formData.time === slot.time
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                                  }`}
                                >
                                  {slot.time}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Patient Details */}
                    {getActualStep(step) === 3 && (
                      <motion.div
                        key="step3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Information</h2>
                        <p className="text-slate-500 mb-6">Please fill in your details for the appointment</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Full Name *</label>
                            <div className="relative">
                              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => {
                                  setFormData({...formData, fullName: e.target.value});
                                  setFormErrors(prev => ({ ...prev, fullName: '' }));
                                }}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none transition-all ${
                                  formErrors.fullName 
                                  ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                  : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500'
                                }`}
                                placeholder="Enter your full name"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Age *</label>
                            <div className="relative">
                              <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => {
                                  setFormData({...formData, age: e.target.value});
                                  setFormErrors(prev => ({ ...prev, age: '' }));
                                }}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none transition-all ${
                                  formErrors.age 
                                  ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                  : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500'
                                }`}
                                placeholder="Your age"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Gender *</label>
                            <div className="grid grid-cols-3 gap-2">
                              {['Female', 'Male', 'Other'].map((gender) => (
                                <button
                                  key={gender}
                                  onClick={() => setFormData({...formData, gender})}
                                  className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                                    formData.gender === gender
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                                  }`}
                                >
                                  {gender}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Phone *</label>
                            <div className="relative">
                              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => {
                                  setFormData({...formData, phone: e.target.value});
                                  setFormErrors(prev => ({ ...prev, phone: '' }));
                                }}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none transition-all ${
                                  formErrors.phone 
                                  ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                  : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500'
                                }`}
                                placeholder="e.g., 9801234567"
                              />
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Email *</label>
                            <div className="relative">
                              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => {
                                  setFormData({...formData, email: e.target.value});
                                  setFormErrors(prev => ({ ...prev, email: '' }));
                                }}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none transition-all ${
                                  formErrors.email 
                                  ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                  : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500'
                                }`}
                                placeholder="your@email.com"
                              />
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Address *</label>
                            <div className="relative">
                              <MapPin size={18} className="absolute left-4 top-4 text-slate-400" />
                              <textarea
                                value={formData.address}
                                onChange={(e) => {
                                  setFormData({...formData, address: e.target.value});
                                  setFormErrors(prev => ({ ...prev, address: '' }));
                                }}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none transition-all resize-none ${
                                  formErrors.address 
                                  ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                  : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500'
                                }`}
                                placeholder="Enter your complete address"
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Payment */}
                    {getActualStep(step) === 4 && (
                      <motion.div
                        key="step4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment</h2>
                        <p className="text-slate-500 mb-6">
                          {formData.visitType === 'clinic' 
                            ? 'Choose your payment method - pay at hospital or online'
                            : 'Choose your payment method for video consultation'}
                        </p>

                        {/* Show message for clinic cash payment */}
                        {formData.visitType === 'clinic' && (
                          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="text-amber-700 font-medium flex items-center gap-2">
                              <Building2 size={18} />
                              For in-person visits, you can pay at the hospital reception
                            </p>
                          </div>
                        )}

                        {formData.visitType === 'video' && (
                          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <p className="text-blue-700 font-medium flex items-center gap-2">
                              <Video size={18} />
                              Video consultation requires online payment before appointment
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                          {PAYMENT_METHODS.filter(method => 
                            !method.availableFor || method.availableFor.includes(formData.visitType)
                          ).map((method) => {
                            const Icon = method.icon;
                            return (
                              <motion.button
                                key={method.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedPayment(method.id)}
                                className={`p-5 border-2 rounded-2xl flex flex-col items-center gap-3 transition-all ${
                                  selectedPayment === method.id
                                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                                  : 'border-slate-200 hover:border-blue-300 bg-white'
                                }`}
                              >
                                <div className={`p-3 rounded-xl ${
                                  selectedPayment === method.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  <Icon size={24} />
                                </div>
                                <span className="font-semibold text-slate-700">{method.name}</span>
                                <span className="text-xs text-slate-400 text-center">{method.desc}</span>
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* Payment Details */}
                        {selectedPayment === 'card' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-slate-50 rounded-2xl"
                          >
                            <h3 className="font-semibold text-slate-700 mb-4">Card Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <input
                                  type="text"
                                  placeholder="Card Number"
                                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-blue-500 outline-none"
                                  maxLength={16}
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="MM/YY"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-blue-500 outline-none"
                                maxLength={5}
                              />
                              <input
                                type="text"
                                placeholder="CVV"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-blue-500 outline-none"
                                maxLength={4}
                              />
                              <div className="md:col-span-2">
                                <input
                                  type="text"
                                  placeholder="Cardholder Name"
                                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-blue-500 outline-none"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {selectedPayment === 'qr' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-slate-50 rounded-2xl text-center"
                          >
                            <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center border-2 border-slate-200 p-4">
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MediSewa-Payment-${appointmentId || 'pending'}`} 
                                alt="Payment QR Code"
                                className="w-full h-full"
                              />
                            </div>
                            <p className="text-slate-600 font-medium mb-2">Scan with your payment app</p>
                            <p className="text-sm text-slate-400">Amount: NPR {getConsultationFee()}</p>
                          </motion.div>
                        )}

                        {selectedPayment === 'cash' && formData.visitType === 'clinic' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-green-50 rounded-2xl text-center border border-green-200"
                          >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Banknote size={32} className="text-green-600" />
                            </div>
                            <p className="text-green-700 font-semibold mb-2">Pay at Hospital</p>
                            <p className="text-sm text-green-600">Please pay NPR {getConsultationFee()} at the hospital reception when you arrive</p>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {/* Step 5: Confirmation */}
                    {step === 5 && (
                      <motion.div
                        key="step5"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <div className="text-center py-8">
                          {paymentStatus === 'processing' ? (
                            <div>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
                              />
                              <h2 className="text-2xl font-bold text-slate-800">Processing Payment...</h2>
                              <p className="text-slate-500 mt-2">Please wait while we confirm your appointment</p>
                            </div>
                          ) : paymentStatus === 'success' ? (
                            <div>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                              >
                                <CheckCircle size={48} className="text-green-600" />
                              </motion.div>
                              <h2 className="text-3xl font-bold text-slate-800 mb-2">Appointment Booked!</h2>
                              <p className="text-slate-500 mb-6">Your appointment has been confirmed successfully</p>
                              <div className="bg-slate-50 rounded-2xl p-6 max-w-sm mx-auto">
                                <p className="text-sm text-slate-500 mb-1">Appointment ID</p>
                                <p className="text-xl font-bold text-slate-800 mb-4">#{appointmentId}</p>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Date</span>
                                    <span className="font-semibold text-slate-700">{formData.date}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Time</span>
                                    <span className="font-semibold text-slate-700">{formData.time}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Department</span>
                                    <span className="font-semibold text-slate-700">{formData.department}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Hospital</span>
                                    <span className="font-semibold text-slate-700">{formData.hospital}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-4 justify-center mt-8">
                                <button
                                  onClick={generatePDF}
                                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                                >
                                  <Download size={18} />
                                  Download Receipt
                                </button>
                                <button
                                  onClick={() => navigate('/appointments')}
                                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                                >
                                  View Appointments
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                {step < 5 && (
                  <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between">
                    <button
                      onClick={handlePrevStep}
                      disabled={step === 1 || paymentStatus === 'processing'}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        step === 1 
                        ? 'opacity-0 pointer-events-none' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Back
                    </button>
                    
                    {getActualStep(step) < 4 ? (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNextStep}
                        disabled={!canContinue()}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                        <ChevronLeft size={18} className="rotate-180" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBookingComplete}
                        disabled={isSubmitting || paymentStatus === 'processing'}
                        className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            Confirm & Pay NPR {getConsultationFee()}
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Booking Summary</h3>
                
                {/* Provider Info */}
                {selectedDoctor && (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl mb-4">
                    <img 
                      src={selectedDoctor.image} 
                      alt={selectedDoctor.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-800">Dr. {selectedDoctor.name}</p>
                      <p className="text-sm text-blue-600">{selectedDoctor.specialties?.[0]}</p>
                      <p className="text-xs text-slate-500">{selectedDoctor.experience} years exp.</p>
                    </div>
                  </div>
                )}

                {selectedHospital && !selectedDoctor && (
                  <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl mb-4">
                    <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Building2 size={28} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{selectedHospital.name}</p>
                      <p className="text-sm text-emerald-600 flex items-center gap-1">
                        <MapPinHouse size={14} />
                        {selectedHospital.location}
                      </p>
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department</span>
                    <span className="font-semibold text-slate-700">{formData.department || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Visit Type</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      {formData.visitType === 'video' ? <Video size={14} /> : <Building2 size={14} />}
                      {formData.visitType === 'video' ? 'Video Call' : 'In-Person'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="font-semibold text-slate-700">{formData.date || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time</span>
                    <span className="font-semibold text-slate-700">{formData.time || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient</span>
                    <span className="font-semibold text-slate-700">{formData.fullName || '-'}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500">Consultation Fee</span>
                    <span className="text-lg font-bold text-slate-800">NPR {getConsultationFee()}</span>
                  </div>
                  {formData.visitType === 'video' && (
                    <p className="text-xs text-center text-slate-400 mb-4">Video consultation discount applied</p>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="font-bold text-slate-800">Total</span>
                    <span className="text-xl font-bold text-blue-600">NPR {getConsultationFee()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Hospital Selection Modal */}
      <AnimatePresence>
        {showHospitalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Select Hospital</h3>
                <button 
                  onClick={() => setShowHospitalModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="relative mb-4">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search hospitals..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-2 border-transparent rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {loadingHospitals ? (
                    <div className="p-8 text-center">
                      <Loader2 size={24} className="animate-spin text-emerald-600 mx-auto mb-2" />
                      <p className="text-slate-500">Loading hospitals...</p>
                    </div>
                  ) : availableHospitals.map((hospital) => (
                    <button
                      key={hospital.id}
                      onClick={() => handleSelectHospital(hospital)}
                      className="w-full p-4 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left"
                    >
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Building2 size={18} className="text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{hospital.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin size={12} />
                          {hospital.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={12} fill="currentColor" />
                        <span className="text-sm font-medium">{hospital.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingPage;
