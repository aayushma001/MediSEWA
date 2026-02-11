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
