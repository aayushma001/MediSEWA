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
}

export interface HospitalProfile {
  user: User;
  hospital_name: string;
  hospital_id?: string;
  hospital_type?: string;
  province?: string;
  district?: string;
  city?: string;
  ward?: string;
  address: string;
  pan_number: string;
  registration_number: string;
  contact_number: string;
  website: string;
  logo: string | null;
  description?: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  user_type: string;
  created_at: string;
  name?: string; // Optional for compatibility if needed
  doctor_profile?: DoctorProfile;
  hospital_profile?: HospitalProfile;
  patient_profile?: any; // Using any for now to avoid circular dependency issues, or I can define PatientProfile
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
  specializations?: string[];
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
