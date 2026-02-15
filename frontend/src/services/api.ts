let API_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || 'http://127.0.0.1:8000/api';
// Ensure no trailing slash
if (API_BASE_URL.endsWith('/')) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}

export const MEDIA_URL = API_BASE_URL.replace('/api', '');
export const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // If the path already includes /media/ (standard Django/DRF behavior)
  if (path.startsWith('/media/')) return `${MEDIA_URL}${path}`;
  // If the path is relative and needs /media/ prefix
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${MEDIA_URL}/media${cleanPath}`;
};
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

  // Ensure endpoint starts with / if not present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  console.log(`Making API request to: ${API_BASE_URL}${cleanEndpoint}`);

  try {
    const doFetch = async (base: string) => {
      return fetch(`${base}${cleanEndpoint}`, { ...options, headers });
    };
    let response = await doFetch(API_BASE_URL);

    console.log(`Response status: ${response.status}`);

    if (response.status === 401) {
      // Token expired or invalid
      removeToken();
      // Optional: Redirect to login or trigger a global event
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }

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
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    // Only fallback on network errors, not 4xx/5xx responses from main server
    const isNetworkError = error instanceof TypeError || String(error).includes('Failed to fetch');

    if (isNetworkError) {
      for (const fb of FALLBACK_BASES) {
        try {
          console.warn(`Retrying API request with fallback base URL: ${fb}`);
          const resp = await fetch(`${fb}${cleanEndpoint}`, {
            ...options,
            headers,
          });
          if (resp.ok) {
            API_BASE_URL = fb; // Switch to working mirror if successful
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

  sendOTP: async (emailOrPhone: string) => {
    return apiRequest('/auth/send-otp/', {
      method: 'POST',
      body: JSON.stringify({ phone_or_email: emailOrPhone })
    });
  },

  verifyOTP: async (emailOrPhone: string, code: string) => {
    return apiRequest('/auth/verify-otp/', {
      method: 'POST',
      body: JSON.stringify({ phone_or_email: emailOrPhone, otp_code: code })
    });
  },

  getDoctors: async () => {
    return apiRequest('/auth/doctors/');
  },

  getHospitals: async () => {
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
      body: data instanceof FormData ? data : JSON.stringify(data),
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

  // Department Management
  getDepartments: async () => {
    return apiRequest('/auth/departments/');
  },
  createDepartment: async (data: { name: string; description: string }) => {
    return apiRequest('/auth/departments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateDepartment: async (id: string | number, data: { name?: string; description?: string }) => {
    return apiRequest(`/auth/departments/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  deleteDepartment: async (id: string | number) => {
    return apiRequest(`/auth/departments/${id}/`, {
      method: 'DELETE',
    });
  },

  // Reviews
  getReviews: async (doctorId?: string) => {
    const url = doctorId ? `/auth/reviews/${doctorId}/` : '/auth/reviews/';
    return apiRequest(url);
  },
  createReview: async (data: { doctor: string; rating: number; comment: string }) => {
    return apiRequest('/auth/reviews/', {
      method: 'POST',
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

  updateAppointmentStatus: async (id: number | string, status: string) => {
    return apiRequest(`/auth/appointments/${id}/manage/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // New Patient Booking Flow
  getHospitals: async () => {
    return apiRequest('/auth/patient/hospitals/');
  },

  getHospitalDoctors: async (hospitalId: string) => {
    return apiRequest(`/auth/patient/hospitals/${hospitalId}/doctors/`);
  },

  getDoctorSchedule: async (doctorId: string, hospitalId: string, date?: string) => {
    const url = date
      ? `/auth/patient/schedule/${doctorId}/${hospitalId}/?date=${date}`
      : `/auth/patient/schedule/${doctorId}/${hospitalId}/`;
    return apiRequest(url);
  },

  bookAppointment: async (data: any) => {
    return apiRequest('/auth/patient/appointments/', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  getAppointments: async () => {
    return apiRequest('/auth/patient/appointments/');
  },

  getHospitalAppointments: async () => {
    return apiRequest('/auth/hospital/appointments/');
  },

  getHospitalReports: async () => {
    return apiRequest('/auth/hospital/reports/');
  },

  uploadHospitalReport: async (formData: FormData) => {
    return apiRequest('/auth/hospital/reports/upload/', {
      method: 'POST',
      body: formData,
    });
  },

  getDoctorAppointments: async () => {
    return apiRequest('/auth/doctor/appointments/');
  },

  createAdvice: async (data: any) => {
    return apiRequest('/appointments/advice/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  recommendDoctors: async (data: { symptoms: string; latitude?: number; longitude?: number; location?: string }) => {
    return apiRequest('/auth/recommend-doctors/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  nearbyHospitals: async (params: { latitude?: number; longitude?: number; location?: string }) => {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== '') acc[k] = String(v);
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    return apiRequest(`/auth/nearby-hospitals/${query ? `?${query}` : ''}`);
  },

  getPatientMedicalRecords: async (patientId: string) => {
    return apiRequest(`/auth/patient/${patientId}/reports/`);
  },

  createMedicalRecord: async (data: any) => {
    return apiRequest('/appointments/medical-records/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  uploadMedicalReport: async (formData: FormData) => {
    return apiRequest('/auth/reports/upload/', {
      method: 'POST',
      body: formData,
    });
  },
};

// Patients API
export const patientsAPI = {
  getPatients: async () => {
    return apiRequest('/patients/');
  },

  getPatientDetail: async (patientId: string) => {
    return apiRequest(`/auth/patients/${patientId}/`);
  },

  deletePatient: async (id: string) => {
    return apiRequest(`/patients/${id}/`, {
      method: 'DELETE',
    });
  },

  getHospitalPatients: async () => {
    return apiRequest('/auth/hospital/patients/');
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

  getDoctorPatients: async () => {
    return apiRequest('/auth/doctor/patients/');
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
