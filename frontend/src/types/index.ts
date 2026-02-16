export interface DoctorProfile {
  user: User;
  profile_picture: string | null;
  qualification: string;
  specialization: string;
  experience_years: number;
  about: string;
  is_verified: boolean;
  consent_accepted: boolean;
  nmc_number?: string;
  contact_number?: string;
  address?: string;
  gender?: string;
  date_of_birth?: string;
  doctor_unique_id?: string;
  consultation_fee?: number;
  signature_image?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface HospitalProfile {
  user: User;
  hospital_name: string;
  hospital_unique_id?: string;
  hospital_id?: string; // Keep for backward compatibility if any
  hospital_type?: string;
  province?: string;
  district?: string;
  city?: string;
  ward?: string;
  tole?: string;
  address: string;
  pan_number: string;
  registration_number: string;
  contact_number: string;
  website: string;
  logo: string | null;
  latitude?: number;
  longitude?: number;
  description?: string;
  beds?: number;
  opening_hours?: string;
  qr_code?: string;
  departments?: Department[];
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  user_type: string;
  created_at: string;
  unique_id?: string;
  name?: string;
  doctor_profile?: DoctorProfile;
  hospital_profile?: HospitalProfile;
  patient_profile?: any;
}

export interface RegisterFormData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  userType: string;
  // Location Common
  province?: string;
  district?: string;
  city?: string;
  ward?: string;
  tole?: string;

  // Doctor specific
  specialization?: string;
  qualification?: string;
  nmcId?: string;
  resources?: string;
  consentAccepted?: boolean;
  nidNumber?: string;
  doctorId?: string;

  // Patient specific
  bloodGroup?: string;
  allergies?: string;
  recentTest?: string; // Kept for compatibility, can be used for "recent health checkups"
  recentHealthCheckups?: string; // Added as per new request if different
  nidNumberPatient?: string;
  healthCondition?: string;
  medications?: string;
  generatedId?: string;

  // Hospital specific
  hospitalName?: string;
  hospitalType?: string;
  hospitalId?: string;
  address?: string; // Keep as fallback or full address string if needed
  panNumber?: string;
  registrationNumber?: string;
  contactNumber?: string;
  website?: string;
  unique_id?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  userType: string;
}

export interface Doctor {
  id: string;
  user: User;
  specialization: string;
  qualification?: string;
  experience_years?: number;
  profile_picture?: string | null;
  hospital_id?: string;
  hospital_name?: string;
  departments?: { id: string; name: string }[];
  latitude?: number;
  longitude?: number;
  medicalDegree?: string;
  experience?: string;
  bio?: string;
  nid?: string;
  registrationNumber?: string;
  registration_number?: string;
  licenseExpiry?: string;
  license_expiry?: string;
  languages?: string[];
  education?: string[];
  certifications?: string[];
  signature?: string;
  inPersonFee?: string;
  in_person_fee?: string;
  videoFee?: string;
  video_fee?: string;
  city?: string;
  country?: string;
  gender?: string;
  age?: number;
  doctor_unique_id?: string;
  signature_image?: string;
  hospital_logo?: string;
  specializations?: string[];
}

export interface Hospital {
  id: string;
  hospital_name: string;
  hospital_type?: string;
  address?: string;
  city?: string;
  district?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  logo?: string | null;
  opening_hours?: string;
  departments?: { id: string; name: string }[];
  hospital_unique_id?: string;
  user?: User; // For consistency
}

export interface Patient {
  id: string | number;
  user: User;
  father_name?: string;
  illness_description?: string;
  age?: number;
  gender?: string;
  blood_group?: string;
  address?: string;
  condition?: string;
  lastVisit?: string;
  status?: string;
  reports?: any[];
  patient_unique_id?: string;
  city?: string;
  province?: string;
  district?: string;
  mobile?: string;
  bloodGroup?: string;
  nidNumberPatient?: string;
  healthCondition?: string;
  medications?: string;
  allergies?: string;
  phone_number?: string;
  alternate_phone?: string;
  nid_number?: string;
  health_condition?: string;
  emergency_contact?: string;
  emergency_contact_name?: string;
  postal_code?: string;
  date_of_birth?: string;
  profile_image?: string;
}

export interface Medication {
  id: string;
  appointment?: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  start_date: string;
  end_date: string;
  completed: boolean;
  timings?: string[];
}

export interface Appointment {
  id: string;
  patient_name?: string;
  instructions?: string;
  patientCondition?: string;
  time?: string;
  status?: string;
  date?: string;
  doctor_id?: string;
  hospital_id?: string;
}

export interface MedicalRecord {
  id: number;
  patient: number;
  doctor: number;
  hospital: number;
  appointment: number | null;
  title: string;
  description: string;
  report_file: string;
  created_at: string;
  doctor_name: string;
  hospital_name: string;
}
