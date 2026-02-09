export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  user_type: 'patient' | 'doctor' | 'hospital';
  created_at: string;
}

export interface Patient {
  id: string;
  user: User;
  fatherName: string;
  father_name: string;
  assigned_doctor: string;
  assigned_doctor_name?: string;
  assigned_doctor_specialization?: string;
  illness_description: string;
  userType: 'patient';
  name: string;
  street_no?: string;
  province?: string;
  city?: string;
  blood_group?: string;
  health_allergies?: string;
  recent_checkups?: string;
  patient_unique_id?: string;
  nid?: string;
  consent_signed?: boolean;
}

export interface Doctor {
  id: string;
  user: User;
  specialization: string;
  latitude?: number;
  longitude?: number;
  userType: 'doctor';
  name: string;
  hospital?: Hospital;
  doctor_unique_id?: string;
  nmic_id?: string;
}

export interface Hospital {
  id: string;
  user: User;
  hospital_name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  userType: 'hospital';
  name: string;
}

export interface Appointment {
  id: string;
  patient: string;
  doctor: string;
  patient_name: string;
  doctor_name: string;
  date_time: string;
  instructions: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Medication {
  id: string;
  appointment: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  start_date: string;
  end_date: string;
  completed: boolean;
  timings: string[];
}

export interface Advice {
  id: string;
  patient: string;
  doctor: string;
  doctor_name: string;
  advice_text: string;
  advice_date: string;
  next_appointment_date?: string;
}

export interface HealthMetric {
  id: string;
  patient: string;
  measurement_date: string;
  systolic: number;
  diastolic: number;
}

export interface PatientReport {
  id: string;
  patient: string;
  doctor: string;
  upload_date: string;
  description: string;
  file?: string;
  file_type: 'pdf' | 'image' | 'text';
  file_content?: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  userType: 'patient' | 'doctor' | 'hospital';
  // Patient specific
  fatherName?: string;
  assignedDoctorId?: string;
  illnessDescription?: string;
  street_no?: string;
  province?: string;
  city?: string;
  blood_group?: string;
  health_allergies?: string;
  recent_checkups?: string;
  nid?: string;
  // Doctor specific
  specialization?: string;
  latitude?: number;
  longitude?: number;
  nmicId?: string;
  hospitalId?: string;
  // Hospital specific
  hospitalName?: string;
  address?: string;
  // Hospital location
  hospitalLatitude?: number;
  hospitalLongitude?: number;
}

export interface LoginFormData {
  email: string;
  password: string;
  userType: 'patient' | 'doctor' | 'hospital';
}

export interface MedicalRecord {
  id: string;
  patient: string;
  doctor?: string;
  doctor_name?: string;
  diagnosis: string;
  symptoms: string;
  prescription: string;
  record_date: string;
  attachment?: string;
}
