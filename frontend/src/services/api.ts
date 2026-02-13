let API_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || 'http://127.0.0.1:8000/api';
const FALLBACK_BASES = ['http://localhost:8000/api'];

// Token management
export const getToken = () => localStorage.getItem('access_token');
export const setToken = (token: string) => localStorage.setItem('access_token', token);
export const removeToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// API request helper with improved error handling
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (isFormData) {
    delete headers['Content-Type'];
  }

  console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
  console.log('Headers:', headers);
  console.log('Options:', options);

  try {
    const doFetch = async (base: string) => {
      return fetch(`${base}${endpoint}`, { ...options, headers });
    };
    let response = await doFetch(API_BASE_URL);

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      let errorMessage = 'API request failed';
      let errorData = null;

      try {
        errorData = await response.json();
        console.error('API Error Response:', errorData);

        // Handle different error formats
        if (typeof errorData === 'object') {
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            // Handle field-specific errors
            const errorMessages = [];
            for (const [field, messages] of Object.entries(errorData)) {
              if (Array.isArray(messages)) {
                errorMessages.push(`${field}: ${messages.join(', ')}`);
              } else {
                errorMessages.push(`${field}: ${messages}`);
              }
            }
            if (errorMessages.length > 0) {
              errorMessage = errorMessages.join('; ');
            }
          }
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    // For 204 No Content, return empty object
    if (response.status === 204) {
      return {};
    }

    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    const isNetworkError = error instanceof TypeError || String(error).includes('Failed to fetch');
    if (isNetworkError) {
      for (const fb of FALLBACK_BASES) {
        try {
          console.warn(`Retrying API request with fallback base URL: ${fb}`);
          const resp = await fetch(`${fb}${endpoint}`, {
            ...options,
            headers,
          });
          if (resp.ok) {
            API_BASE_URL = fb;
            const data = await resp.json().catch(() => ({}));
            return data;
          }
        } catch (e) {
          console.error('Fallback attempt failed:', e);
        }
      }
    }
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (data: { email: string; password: string; user_type: string }) => {
    console.log('=== API LOGIN REQUEST ===');
    console.log('Login data:', data);

    const response = await apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.tokens) {
      setToken(response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
    }

    return response;
  },

  register: async (data: any) => {
    console.log('=== API REGISTER REQUEST ===');
    console.log('Register data:', data);

    const response = await apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.tokens) {
      setToken(response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
    }

    return response;
  },

  getDoctors: async () => {
    console.log('=== API GET DOCTORS REQUEST ===');
    return apiRequest('/auth/doctors/');
  },

  getHospitals: async () => {
    console.log('=== API GET HOSPITALS REQUEST ===');
    return apiRequest('/auth/hospitals/');
  },

  patientConsent: async () => {
    return apiRequest('/auth/patient/consent/', {
      method: 'POST',
    });
  },
};

// Admin API
export const adminAPI = {
  getDashboardStats: async () => {
    return apiRequest('/auth/dashboard-stats/');
  },

  getProfile: async () => {
    return apiRequest('/auth/profile/');
  },

  updateProfile: async (data: any) => {
    return apiRequest('/auth/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  connectEntity: async (id: string) => {
    return apiRequest('/auth/connect/', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },

  confirmConnection: async (id: string, status: 'active' | 'rejected') => {
    return apiRequest('/auth/confirm-connection/', {
      method: 'POST',
      body: JSON.stringify({ id, status }),
    });
  },

  getConnections: async (statusFilter = 'active') => {
    return apiRequest(`/auth/connections/?status=${statusFilter}`);
  },

  getSchedules: async (doctorId: string, hospitalId: string, date: string) => {
    return apiRequest(`/auth/schedules/?doctor_id=${doctorId}&hospital_id=${hospitalId}&date=${date}`);
  },

  saveSchedule: async (doctorId: string, hospitalId: string, date: string, sessionData: any) => {
    return apiRequest('/auth/schedules/', {
      method: 'POST',
      body: JSON.stringify({
        doctor_id: doctorId,
        hospital_id: hospitalId,
        date: date,
        session_data: sessionData
      }),
    });
  },

  getPaymentMethods: async () => {
    return apiRequest('/auth/payment-methods/');
  },

  addPaymentMethod: async (data: any) => {
    return apiRequest('/auth/payment-methods/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deletePaymentMethod: async (id: number) => {
    return apiRequest(`/auth/payment-methods/${id}/`, {
      method: 'DELETE',
    });
  },

  getNotifications: async () => {
    return apiRequest('/auth/notifications/');
  },

  markNotificationsRead: async () => {
    return apiRequest('/auth/notifications/', {
      method: 'POST',
      body: JSON.stringify({ mark_read: true }),
    });
  },

  deleteAccount: async (data: { password: string }) => {
    return apiRequest('/auth/account/delete/', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  },
};

// Appointments API
export const appointmentsAPI = {
  getAllAppointments: async () => {
    return apiRequest('/appointments/all/');
  },

  getPatientAppointments: async (patientId: string) => {
    return apiRequest(`/appointments/patient/${patientId}/`);
  },

  getPatientMedications: async (patientId: string) => {
    return apiRequest(`/appointments/medications/patient/${patientId}/`);
  },

  updateMedicationStatus: async (medicationId: string, completed: boolean) => {
    return apiRequest(`/appointments/medications/${medicationId}/status/`, {
      method: 'PUT',
      body: JSON.stringify({ completed }),
    });
  },

  getPatientAdvice: async (patientId: string) => {
    return apiRequest(`/appointments/advice/patient/${patientId}/`);
  },

  getPatientHealthMetrics: async (patientId: string) => {
    return apiRequest(`/appointments/health-metrics/patient/${patientId}/`);
  },

  getPatientReports: async (patientId: string) => {
    return apiRequest(`/appointments/reports/patient/${patientId}/`);
  },

  createPatientReport: async (data: any) => {
    return apiRequest('/appointments/reports/create/', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  createAppointment: async (data: any) => {
    return apiRequest('/appointments/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAppointmentStatus: async (id: string, status: string) => {
    return apiRequest(`/appointments/${id}/status/`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  createAdvice: async (data: any) => {
    return apiRequest('/appointments/advice/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  recommendDoctors: async (data: { symptoms: string; latitude?: number; longitude?: number }) => {
    return apiRequest('/appointments/recommend-doctors/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  nearbyHospitals: async (params: { latitude?: number; longitude?: number }) => {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    return apiRequest(`/appointments/nearby-hospitals/${query ? `?${query}` : ''}`);
  },

  getPatientMedicalRecords: async (patientId: string) => {
    return apiRequest(`/appointments/medical-records/patient/${patientId}/`);
  },

  createMedicalRecord: async (data: any) => {
    return apiRequest('/appointments/medical-records/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Patients API
export const patientsAPI = {
  getPatients: async () => {
    return apiRequest('/patients/');
  },

  getPatientDetail: async (patientId: string) => {
    return apiRequest(`/patients/${patientId}/`);
  },

  deletePatient: async (id: string) => {
    return apiRequest(`/patients/${id}/`, {
      method: 'DELETE',
    });
  },
};

// Doctors API
export const doctorsAPI = {
  getDoctors: async () => {
    return apiRequest('/doctors/');
  },

  getDoctorDetail: async (doctorId: string) => {
    return apiRequest(`/doctors/${doctorId}/`);
  },

  getDoctorPatients: async (doctorId: string) => {
    return apiRequest(`/doctors/${doctorId}/patients/`);
  },

  getSchedules: async (doctorId?: string) => {
    let url = '/doctors/schedules/';
    if (doctorId) {
      url += `?doctor_id=${doctorId}`;
    }
    return apiRequest(url);
  },

  createSchedule: async (data: any) => {
    return apiRequest('/doctors/schedules/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteSchedule: async (id: number) => {
    return apiRequest(`/doctors/schedules/${id}/`, {
      method: 'DELETE',
    });
  },

  deleteDoctor: async (id: string) => {
    return apiRequest(`/doctors/${id}/`, {
      method: 'DELETE',
    });
  },
};
