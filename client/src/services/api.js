import axios from 'axios';

// Create axios instance with base configuration
// Use relative URL to leverage Vite proxy in development
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Important for sending cookies with requests
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Property API endpoints
export const propertyAPI = {
  // Get all properties
  getAllProperties: () => api.get('/property', {
    headers: { 'Accept': 'application/json' }
  }),

  // Get properties by tag (sale or rent)
  getPropertiesByTag: (tag) => api.get(`/property/tag/${tag}`, {
    headers: { 'Accept': 'application/json' }
  }),

  // Get property by ID
  getPropertyById: (id) => api.get(`/property/${id}`, {
    params: { format: 'json' },
    headers: { 'Accept': 'application/json' }
  }),

  // Search properties
  searchProperties: (query) => api.get('/property/api/search', {
    params: { q: query }
  }),

  // Add review to property
  addReview: (id, reviewData) => api.post(`/property/${id}/reviews`, reviewData),
  // Contact agent about property
  contactAgent: (id, contactData) => api.post(`/property/${id}/contact`, contactData),
  
  // Purchase a property
  purchaseProperty: (id) => api.post(`/property/${id}/purchase`, {}),

  // Add new property listing (seller only)
  addListing: (formData) => api.post('/property/listing', formData, {
    headers: { 'Accept': 'application/json' }
  }),

  // Admin: Approve property
  approveProperty: (id, notes = '') => api.post(`/property/admin/approve/${id}`, 
    { notes }, 
    { headers: { 'Accept': 'application/json' } }
  ),

  // Admin: Reject property  
  rejectProperty: (id, notes) => api.post(`/property/admin/reject/${id}`, 
    { notes }, 
    { headers: { 'Accept': 'application/json' } }
  )
};

// Dashboard API endpoints
export const dashboardAPI = {
  // Get dashboard stats
  getStats: () => api.get('/dashboard/stats', {
    headers: { 'Accept': 'application/json' }
  }),
  
  // Get current user info (includes latest balance)
  getUserInfo: () => api.get('/dashboard/debug-user', {
    headers: { 'Accept': 'application/json' }
  }),
    // Update account balance
  updateBalance: (amount) => api.post('/dashboard/update-balance', { amount }, {
    headers: { 'Accept': 'application/json' }
  }),

  // Update user profile
  updateProfile: (formData) => api.post('/dashboard/update-profile', formData, {
    headers: { 'Accept': 'application/json' }
  })
};

// Agent API endpoints
export const agentAPI = {
  // Upload verification documents
  uploadDocuments: (formData) => {
    return api.post('/agent/upload-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });
  },

  // Get agent profile
  getAgentProfile: (id) => api.get(`/agent/${id}`, {
    headers: { 'Accept': 'application/json' }
  }),

  // Update agent profile
  updateAgentProfile: (id, data) => api.put(`/agent/${id}`, data, {
    headers: { 'Accept': 'application/json' }
  }),

  // Get all agents with pagination and filters
  getAllAgents: (params = {}) => api.get('/agent', {
    params,
    headers: { 'Accept': 'application/json' }
  }),

  // Search agents
  searchAgents: (query) => api.get('/agent/search', {
    params: { query },
    headers: { 'Accept': 'application/json' }
  }),

  // Filter agents by status
  filterAgents: (status) => api.get(`/agent/filter/${status}`, {
    headers: { 'Accept': 'application/json' }
  }),

  // Add review to agent
  addReview: (id, reviewData) => api.post(`/agent/${id}/reviews`, reviewData),
  // Admin: Get pending verifications
  getPendingVerifications: (params = {}) => api.get('/agent/pending-verification', {
    params,
    headers: { 'Accept': 'application/json' }
  }),

  // Admin: Update verification status
  updateVerificationStatus: (id, data) => api.post(`/agent/update-verification/${id}`, data, {
    headers: { 'Accept': 'application/json' }
  }),

  // Get agent profile by user ID (for current user)
  getCurrentAgentProfile: () => api.get('/agent/current-profile', {
    headers: { 'Accept': 'application/json' }
  })
};

export default api;
