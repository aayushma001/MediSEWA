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
      id: response.user.user.id.toString(),
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
    }
    
    console.log('Transformed user:', user);
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
    
    const requestData = {
      first_name: firstName,
      last_name: lastName,
      email: formData.email,
      mobile: formData.mobile,
      user_type: formData.userType,
      password: formData.password,
      confirm_password: formData.confirmPassword,
      // Doctor specific
      specialization: formData.specialization,
      qualification: formData.qualification,
      consent_accepted: formData.consentAccepted,
      // Hospital specific
      hospital_name: formData.hospitalName,
      address: formData.address,
      pan_number: formData.panNumber,
      registration_number: formData.registrationNumber,
      contact_number: formData.contactNumber,
      website: formData.website
    };
    
    console.log('=== FRONTEND REGISTRATION DEBUG ===');
    console.log('Form data received:', formData);
    console.log('Request data being sent to API:', requestData);
    
    const response = await authAPI.register(requestData);
    console.log('API response received:', response);
    
    if (!response.user || !response.tokens) {
      throw new Error('Invalid response format from server');
    }
    
    const user: User = {
      id: response.user.user.id.toString(),
      first_name: response.user.user.first_name,
      last_name: response.user.user.last_name,
      email: response.user.user.email,
      mobile: response.user.user.mobile,
      user_type: response.user.user.user_type,
      created_at: response.user.user.created_at,
      name: `${response.user.user.first_name} ${response.user.user.last_name}`
    };
    
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
