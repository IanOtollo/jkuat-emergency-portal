import axios from 'axios';

const API_URL = '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;

          return apiClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login/', credentials),
  getCurrentUser: () => apiClient.get('/users/me/'),
};

// Incidents API
export const incidentsAPI = {
  list: (params) => apiClient.get('/incidents/', { params }),
  get: (id) => apiClient.get(`/incidents/${id}/`),
  create: (data) => apiClient.post('/incidents/', data),
  update: (id, data) => apiClient.patch(`/incidents/${id}/`, data),
  delete: (id) => apiClient.delete(`/incidents/${id}/`),
  addNote: (id, data) => apiClient.post(`/incidents/${id}/add_note/`, data),
  uploadEvidence: (id, formData) => apiClient.post(`/incidents/${id}/upload_evidence/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  myIncidents: () => apiClient.get('/incidents/my_incidents/'),
  dashboardStats: () => apiClient.get('/incidents/dashboard_stats/'),
};

// Users API
export const usersAPI = {
  list: () => apiClient.get('/users/'),
  get: (id) => apiClient.get(`/users/${id}/`),
  guards: () => apiClient.get('/users/guards/'),
};

// Public API (no auth)
export const publicAPI = {
  submitReport: (data) => axios.post(`${API_URL}/public/submit/`, data),
  checkStatus: (refNumber) => axios.get(`${API_URL}/public/status/${refNumber}/`),
};
