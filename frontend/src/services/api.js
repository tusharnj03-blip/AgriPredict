import axios from 'axios'

const API_BASE = '/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  changePassword: (data) => api.put('/users/me/password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
}

// Farms API
export const farmsAPI = {
  list: () => api.get('/farms'),
  get: (id) => api.get(`/farms/${id}`),
  create: (data) => api.post('/farms', data),
  update: (id, data) => api.put(`/farms/${id}`, data),
  delete: (id) => api.delete(`/farms/${id}`),
}

// Predictions API
export const predictionsAPI = {
  yieldPredict: (data) => api.post('/predictions/yield', data),
  history: (params) => api.get('/predictions/history', { params }),
}

// Risk API
export const riskAPI = {
  analyze: (data) => api.post('/risk/analyze', data),
  history: () => api.get('/risk/history'),
}

// Crop API
export const cropAPI = {
  recommend: (data) => api.post('/crop/recommend', data),
  list: () => api.get('/crop/list'),
}

// Weather API
export const weatherAPI = {
  current: (params) => api.get('/weather', { params }),
}

// Soil API
export const soilAPI = {
  analyze: (data) => api.post('/soil/analyze', data),
  get: (farmId) => api.get(`/soil/${farmId}`),
}

// Market API
export const marketAPI = {
  prices: (params) => api.get('/market/prices', { params }),
}

// Simulation API
export const simulationAPI = {
  whatIf: (data) => api.post('/simulation/what-if', data),
}

// Disease API
export const diseaseAPI = {
  detect: (data) => api.post('/disease/detect', data),
}

// Alerts API
export const alertsAPI = {
  list: () => api.get('/alerts'),
  markRead: (id) => api.put(`/alerts/${id}/read`),
  markAllRead: () => api.put('/alerts/read-all'),
}

// Reports API
export const reportsAPI = {
  generate: (data) => api.post('/reports/generate', data),
  list: () => api.get('/reports'),
  get: (id) => api.get(`/reports/${id}`),
  download: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
}

// Admin API
export const adminAPI = {
  analytics: () => api.get('/admin/analytics'),
  users: (params) => api.get('/admin/users', { params }),
  userDetail: (id) => api.get(`/admin/users/${id}`),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`),
  activity: (params) => api.get('/admin/activity', { params }),
  predictions: (params) => api.get('/admin/predictions', { params }),
  systemLogs: (params) => api.get('/admin/system-logs', { params }),
  featureUsage: () => api.get('/admin/feature-usage'),
  systemHealth: () => api.get('/admin/system-health'),
  models: () => api.get('/admin/models'),
  farms: (params) => api.get('/admin/farms', { params }),
  changePassword: (data) => api.put('/admin/change-password', data),
}

// Activity tracking
export const trackActivity = (page, action, feature, duration = null) => {
  return api.post('/activity/track', {
    page,
    action,
    feature,
    duration_seconds: duration,
    session_id: sessionStorage.getItem('session_id') || 'unknown',
  }).catch(() => {}) // Silent fail for tracking
}

export default api
