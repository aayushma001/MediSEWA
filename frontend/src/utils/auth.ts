import { User, LoginFormData, RegisterFormData } from '../types';
import { authAPI } from '../services/api';

// Token management functions
export const getStoredToken = () => localStorage.getItem('access_token');
export const getStoredRefreshToken = () => localStorage.getItem('refresh_token');
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setStoredAuth = (tokens: any, user: any) => {
  localStorage.setItem('access_token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearStoredAuth = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export const login = async (formData: LoginFormData): Promise<User> => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Form data:', formData);

    const response = await authAPI.login({
      email: formData.email,
      password: formData.password,
      user_type: formData.userType
    });

    console.log('Login API response:', response);

    if (!response.user || !response.tokens) {
      throw new Error('Invalid response format from server');
    }

    // Use the user data directly or map it if necessary
    const user: User = {
      id: response.user.user.id,
      first_name: response.user.user.first_name,
      last_name: response.user.user.last_name,
      email: response.user.user.email,
      mobile: response.user.user.mobile,
      user_type: response.user.user.user_type,
      created_at: response.user.user.created_at,
      name: `${response.user.user.first_name} ${response.user.user.last_name}`
    };

    if (user.user_type === 'doctor') {
      user.doctor_profile = response.user;
    } else if (user.user_type === 'hospital') {
      user.hospital_profile = response.user;
    } else if (user.user_type === 'patient') {
      // Extract patient_profile from the nested user object
      user.patient_profile = response.user.user.patient_profile || {};
    }

    console.log('Transformed user:', user);
    console.log('Patient profile:', user.patient_profile);
    setStoredAuth(response.tokens, user);
    return user;

  } catch (error) {
    console.error('Login error:', error);
    clearStoredAuth();
    throw error;
  }
};

export const register = async (formData: RegisterFormData): Promise<User> => {
  try {
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const requestData: any = {
      first_name: firstName,
      last_name: lastName,
      email: formData.email,
      mobile: formData.mobile,
      user_type: formData.userType,
      password: formData.password,
      confirm_password: formData.confirmPassword,
      address: formData.address || `${formData.province || ''}, ${formData.district || ''}, ${formData.city || ''} - ${formData.ward || ''}`,
    };

    // Add fields conditionally based on user type
    if (formData.userType === 'doctor') {
      requestData.specialization = formData.specialization;
      requestData.qualification = formData.qualification;
      requestData.consent_accepted = formData.consentAccepted;
      requestData.nmc_number = formData.nmcId;
      requestData.experience_years = 0; // Default or add field
      requestData.nid = formData.nidNumber;
      requestData.doctor_id = formData.doctorId;
      // Ensure we don't send hospital fields
    } else if (formData.userType === 'hospital') {
      requestData.hospital_name = formData.hospitalName;
      requestData.hospital_type = formData.hospitalType;
      requestData.hospital_id = formData.hospitalId;
      requestData.province = formData.province;
      requestData.district = formData.district;
      requestData.city = formData.city;
      requestData.ward = formData.ward;
      requestData.pan_number = formData.panNumber;
      requestData.registration_number = formData.registrationNumber;
      requestData.contact_number = formData.contactNumber;
      requestData.website = formData.website;
    }

    console.log('=== FRONTEND REGISTRATION DEBUG ===');
    console.log('Form data received:', formData);
    console.log('Request data being sent to API:', requestData);

    const response = await authAPI.register(requestData);
    console.log('API response received:', response);

    if (!response.user || !response.tokens) {
      console.error('Invalid response format - missing user or tokens:', response);
      throw new Error('Invalid response format from server');
    }

    // DEBUG: Log the structure to understand nesting
    console.log('Processed Registration Response User:', response.user);

    const user: User = {
      id: response.user.user?.id?.toString() || response.user.id?.toString(),
      first_name: response.user.user?.first_name || response.user.first_name,
      last_name: response.user.user?.last_name || response.user.last_name,
      email: response.user.user?.email || response.user.email,
      mobile: response.user.user?.mobile || response.user.mobile,
      user_type: response.user.user?.user_type || response.user.user_type,
      created_at: response.user.user?.created_at || response.user.created_at,
      name: `${response.user.user?.first_name || response.user.first_name} ${response.user.user?.last_name || response.user.last_name}`
    };

    // Manually attach profile for immediate dashboard access
    if (user.user_type === 'hospital') {
      user.hospital_profile = {
        user: { ...user, hospital_profile: undefined } as User, // Break circular reference
        hospital_name: formData.hospitalName || '',
        hospital_id: formData.hospitalId,
        hospital_type: formData.hospitalType,
        province: formData.province,
        district: formData.district,
        city: formData.city,
        ward: formData.ward,
        address: formData.address || '',
        pan_number: formData.panNumber || '',
        registration_number: formData.registrationNumber || '',
        contact_number: formData.contactNumber || '',
        website: formData.website || '',
        logo: null
      };
    } else if (user.user_type === 'doctor') {
      // Attach doctor profile if needed, though we focused on Hospital for now
      user.doctor_profile = {
        user: { ...user, doctor_profile: undefined } as User, // Break circular reference
        profile_picture: null,
        qualification: formData.qualification || '',
        specialization: formData.specialization || '',
        experience_years: 0,
        about: '',
        is_verified: false,
        consent_accepted: formData.consentAccepted || false,
        nmc_number: formData.nmcId,
        doctor_unique_id: formData.doctorId,
        // Add other fields as necessary from formData
      };
    } else if (user.user_type === 'patient') {
      // Extract patient_profile from the nested user object
      user.patient_profile = response.user.user?.patient_profile || {};
    }

    console.log('Registration successful, user:', user);
    console.log('Patient profile:', user.patient_profile);
    setStoredAuth(response.tokens, user);
    return user;

  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error object:', error);
    clearStoredAuth();
    throw error;
  }
};

// Function to restore user session on app load
export const restoreUserSession = (): User | null => {
  try {
    const token = getStoredToken();
    const user = getStoredUser();

    if (!token || !user) {
      return null;
    }

    // Check if token is expired (basic check)
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;

    if (tokenPayload.exp < currentTime) {
      console.log('Token expired, clearing stored auth');
      clearStoredAuth();
      return null;
    }

    console.log('Restoring user session:', user);
    return user;
  } catch (error) {
    console.error('Error restoring user session:', error);
    clearStoredAuth();
    return null;
  }
};

export const logout = () => {
  clearStoredAuth();
};
