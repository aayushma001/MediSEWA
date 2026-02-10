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
  address: string;
  pan_number: string;
  registration_number: string;
  contact_number: string;
  website: string;
  logo: string | null;
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
  // Doctor specific
  specialization?: string;
  qualification?: string;
  nmcId?: string;
  resources?: string;
  consentAccepted?: boolean;
  // Patient specific
  bloodGroup?: string;
  allergies?: string;
  recentTest?: string;
  // Hospital specific
  hospitalName?: string;
  address?: string;
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
