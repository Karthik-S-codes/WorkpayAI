import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('workpay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized / Expired Session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired
      localStorage.removeItem('workpay_token');
      localStorage.removeItem('workpay_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data)
};

// Worker Service
export const workerAPI = {
  list: (params) => api.get('/workers', { params }),
  getById: (id) => api.get(`/workers/${id}`),
  updateProfile: (data) => api.put('/workers/profile', data),
  getDashboard: () => api.get('/workers/me/dashboard'),
  updateAvailability: (data) => api.post('/workers/availability', data),
  uploadCertificate: (data) => api.post('/workers/certificates', data)
};

// Customer Service
export const customerAPI = {
  getProfile: () => api.get('/customers/me'),
  updateProfile: (data) => api.put('/customers/profile', data),
  getDashboard: () => api.get('/customers/me/dashboard')
};

// Job Service
export const jobAPI = {
  create: (data) => api.post('/jobs', data),
  list: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data)
};

// Hiring Service
export const hiringAPI = {
  createRequest: (data) => api.post('/hiring/request', data),
  listRequests: () => api.get('/hiring/requests'),
  respondRequest: (id, action) => api.put(`/hiring/requests/${id}/respond`, { action })
};

// Assignment Service
export const assignmentAPI = {
  list: () => api.get('/assignments'),
  markCompleteByWorker: (id) => api.put(`/assignments/${id}/complete-worker`),
  confirmCompleteByCustomer: (id) => api.put(`/assignments/${id}/confirm-customer`)
};

// Payment Service
export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  getHistory: () => api.get('/payments/history'),
  downloadInvoiceUrl: (invoiceNumber) => `/api/payments/invoice/${invoiceNumber}/pdf`
};

// Wallet Service
export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  getLedger: () => api.get('/wallet/ledger'),
  requestPayout: (data) => api.post('/wallet/payout-request', data),
  getPayouts: () => api.get('/wallet/payouts'),
  logExpense: (data) => api.post('/wallet/expenses', data),
  getExpenses: () => api.get('/wallet/expenses')
};

// Dispute Service
export const disputeAPI = {
  create: (data) => api.post('/disputes', data),
  list: () => api.get('/disputes'),
  resolve: (id, data) => api.put(`/disputes/${id}/resolve`, data)
};

// Admin Service
export const adminAPI = {
  getOverview: () => api.get('/admin/overview'),
  listUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  verifyWorker: (id, data) => api.put(`/admin/workers/${id}/verify`, data),
  listCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  listPayouts: () => api.get('/admin/payouts'),
  updatePayoutStatus: (id, data) => api.put(`/admin/payouts/${id}`, data),
  listFraudAlerts: () => api.get('/admin/fraud-alerts'),
  updateFraudAlertStatus: (id, data) => api.put(`/admin/fraud-alerts/${id}`, data)
};

// AI Engine Service
export const aiAPI = {
  matchWorkers: (data) => api.post('/ai/match-workers', data),
  predictSalary: (data) => api.post('/ai/predict-salary', data),
  chat: (data) => api.post('/ai/chat', data),
  buildProfile: (data) => api.post('/ai/build-profile', data),
  recommendSkills: (data) => api.post('/ai/recommend-skills', data),
  generateJobDesc: (data) => api.post('/ai/generate-job-desc', data),
  getIncomeInsights: (workerId = 'me') => api.get(`/ai/income-insights/${workerId}`),
  analyzeReviews: (data) => api.post('/ai/analyze-reviews', data),
  checkFraud: (userId) => api.get(`/ai/check-fraud/${userId}`),
  parseVoiceSearch: (transcript) => api.post('/ai/parse-voice-search', { transcript })
};

// Categories Service
export const categoriesAPI = {
  list: () => api.get('/categories')
};

export default api;

