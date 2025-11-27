import axios from "axios";

// Create axios instance with base configuration
// Use relative URL to leverage Vite proxy in development
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Important for sending cookies with requests
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
      console.error("API Error:", error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network Error:", error.message);
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Property API endpoints
export const propertyAPI = {
  // Get all properties
  getAllProperties: () =>
    api.get("/property", {
      headers: { Accept: "application/json" },
    }),

  // Get properties by tag (sale or rent)
  getPropertiesByTag: (tag) =>
    api.get(`/property/tag/${tag}`, {
      headers: { Accept: "application/json" },
    }),

  // Get property by ID
  getPropertyById: (id) =>
    api.get(`/property/${id}`, {
      params: { format: "json" },
      headers: { Accept: "application/json" },
    }),

  // Search properties
  searchProperties: (query) =>
    api.get("/property/api/search", {
      params: { q: query },
    }),

  // Add review to property
  addReview: (id, reviewData) =>
    api.post(`/property/${id}/reviews`, reviewData),
  // Contact agent about property
  contactAgent: (id, contactData) =>
    api.post(`/property/${id}/contact`, contactData),

  // Purchase a property
  purchaseProperty: (id) => api.post(`/property/${id}/purchase`, {}),

  // Add new property listing (seller only)
  addListing: (formData) =>
    api.post("/property/listing", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    }),

  // Admin: Approve property
  approveProperty: (id, notes = "") =>
    api.post(
      `/property/admin/approve/${id}`,
      { notes },
      { headers: { Accept: "application/json" } }
    ),

  // Admin: Reject property
  rejectProperty: (id, notes) =>
    api.post(
      `/property/admin/reject/${id}`,
      { notes },
      { headers: { Accept: "application/json" } }
    ),
};

// Dashboard API endpoints
export const dashboardAPI = {
  // Get dashboard stats
  getStats: () =>
    api.get("/dashboard/stats", {
      headers: { Accept: "application/json" },
    }),

  // Get current user info (includes latest balance)
  getUserInfo: () =>
    api.get("/dashboard/debug-user", {
      headers: { Accept: "application/json" },
    }),
  // Update account balance
  updateBalance: (amount) =>
    api.post(
      "/dashboard/update-balance",
      { amount },
      {
        headers: { Accept: "application/json" },
      }
    ),

  // Update user profile
  updateProfile: (formData) =>
    api.post("/dashboard/update-profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    }),

  // Get full dashboard data
  getDashboardData: () =>
    api.get("/dashboard", {
      headers: { Accept: "application/json" },
    }),

  // Geocode address to get coordinates
  geocodeAddress: (address) =>
    api.post(
      "/dashboard/geocode",
      { address },
      {
        headers: { Accept: "application/json" },
      }
    ),
};

// Agent API endpoints
export const agentAPI = {
  // Upload verification documents
  uploadDocuments: (formData) => {
    return api.post("/agent/upload-documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });
  },

  // Get agent profile
  getAgentProfile: (id) =>
    api.get(`/agent/${id}`, {
      headers: { Accept: "application/json" },
    }),

  // Update agent profile
  updateAgentProfile: (id, data) =>
    api.put(`/agent/${id}`, data, {
      headers: { Accept: "application/json" },
    }),

  // Get all agents with pagination and filters
  getAllAgents: (params = {}) =>
    api.get("/agent", {
      params,
      headers: { Accept: "application/json" },
    }),

  // Search agents
  searchAgents: (query) =>
    api.get("/agent/search", {
      params: { query },
      headers: { Accept: "application/json" },
    }),

  // Filter agents by status
  filterAgents: (status) =>
    api.get(`/agent/filter/${status}`, {
      headers: { Accept: "application/json" },
    }),

  // Add review to agent
  addReview: (id, reviewData) => api.post(`/agent/${id}/reviews`, reviewData),
  // Admin: Get pending verifications
  getPendingVerifications: (params = {}) =>
    api.get("/agent/pending-verification", {
      params,
      headers: { Accept: "application/json" },
    }),

  // Admin: Update verification status
  updateVerificationStatus: (id, data) =>
    api.post(`/agent/update-verification/${id}`, data, {
      headers: { Accept: "application/json" },
    }),

  // Get agent profile by user ID (for current user)
  getCurrentAgentProfile: () =>
    api.get("/agent/current-profile", {
      headers: { Accept: "application/json" },
    }),
};

// Rent API endpoints
export const rentAPI = {
  // Buyer endpoints
  getRentPaymentPage: () =>
    api.get("/rent", {
      headers: { Accept: "application/json" },
    }),

  payRent: (rentId, paymentMethod) =>
    api.post(
      `/rent/pay/${rentId}`,
      { paymentMethod },
      {
        headers: { Accept: "application/json" },
      }
    ),

  getBuyerRentedProperties: () =>
    api.get("/rent/buyer-rented", {
      headers: { Accept: "application/json" },
    }),

  cancelRentalByBuyer: (propertyId) =>
    api.post(
      `/rent/cancel-by-buyer/${propertyId}`,
      {},
      {
        headers: { Accept: "application/json" },
      }
    ),

  // Seller endpoints
  getSellerRentedProperties: () =>
    api.get("/rent/seller-rented", {
      headers: { Accept: "application/json" },
    }),

  getSellerProperties: () =>
    api.get("/rent/my-properties", {
      headers: { Accept: "application/json" },
    }),

  generateRentPayment: (propertyId) =>
    api.post(
      `/rent/generate/${propertyId}`,
      {},
      {
        headers: { Accept: "application/json" },
      }
    ),

  getManageRentPage: (propertyId) =>
    api.get(`/rent/property/${propertyId}/manage`, {
      headers: { Accept: "application/json" },
    }),

  updateRentSettings: (propertyId, settings) =>
    api.post(`/rent/settings/${propertyId}`, settings, {
      headers: { Accept: "application/json" },
    }),

  cancelRentalAgreement: (propertyId) =>
    api.post(
      `/rent/cancel-agreement/${propertyId}`,
      {},
      {
        headers: { Accept: "application/json" },
      }
    ),

  // General endpoints
  getRentDetails: (rentId) =>
    api.get(`/rent/details/${rentId}`, {
      headers: { Accept: "application/json" },
    }),
};

// Agreements API endpoints
export const agreementsAPI = {
  createRentAgreement: (propertyId, data) =>
    api.post(`/agreements/rent/${propertyId}`, data, {
      headers: { Accept: "application/json" },
    }),

  getBuyerAgreements: () =>
    api.get("/agreements/buyer", {
      headers: { Accept: "application/json" },
    }),

  getSellerAgreements: () =>
    api.get("/agreements/seller", {
      headers: { Accept: "application/json" },
    }),

  approveAgreement: (agreementId) =>
    api.post(
      `/agreements/${agreementId}/approve`,
      {},
      {
        headers: { Accept: "application/json" },
      }
    ),

  rejectAgreement: (agreementId, reason) =>
    api.post(
      `/agreements/${agreementId}/reject`,
      { reason },
      {
        headers: { Accept: "application/json" },
      }
    ),

  getAgreementForProperty: (propertyId) =>
    api.get(`/agreements/property/${propertyId}`, {
      headers: { Accept: "application/json" },
    }),
};

// Loan API endpoints
export const loanAPI = {
  // EMI Calculator
  getEmiCalculator: () => api.get("/loan/emi-calculator"),

  // Loan Application
  submitLoanApplication: (formData) =>
    api.post("/loan/apply", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Get user's loan applications
  getMyApplications: () => api.get("/loan/my-applications"),

  // Get application details
  getApplicationDetails: (applicationId) =>
    api.get(`/loan/applications/${applicationId}`),

  // Admin - Get all loan applications
  getAdminApplications: (params) =>
    api.get("/loan/admin/applications", { params }),

  // Admin - Update application status
  updateApplicationStatus: (applicationId, data) =>
    api.put(`/loan/admin/applications/${applicationId}/status`, data),

  // EMI Management
  getMyEmis: () => api.get("/loan/my-emis"),

  payEmi: (emiId, data) => api.post(`/loan/pay-emi/${emiId}`, data),

  getPendingEmis: () => api.get("/loan/pending-emis"),

  getOverdueEmis: () => api.get("/loan/overdue-emis"),

  getEmiSummary: () => api.get("/loan/emi-summary"),

  getLoanSummary: (loanId) => api.get(`/loan/loan-summary/${loanId}`),

  getEmiSchedule: (loanId) => api.get(`/loan/emi-schedule/${loanId}`),

  // Check if user has approved loans
  hasApprovedLoans: () => api.get("/loan/has-approved-loans"),
};

// Visit API endpoints
export const visitAPI = {
  // Schedule a visit
  scheduleVisit: (data) => api.post("/visit/schedule", data),

  // Get my visits (buyer)
  getMyVisits: () => api.get("/visit/my-visits"),

  // Get agent visits (agent)
  getAgentVisits: () => api.get("/visit/agent-visits"),

  // Get available time slots
  getAvailableSlots: (params) => api.get("/visit/available-slots", { params }),

  // Approve visit (agent)
  approveVisit: (visitId, data) => api.post(`/visit/approve/${visitId}`, data),

  // Reject visit (agent)
  rejectVisit: (visitId, data) => api.post(`/visit/reject/${visitId}`, data),

  // Complete visit (agent)
  completeVisit: (visitId, data) =>
    api.post(`/visit/complete/${visitId}`, data),

  // Cancel visit (buyer)
  cancelVisit: (visitId) => api.post(`/visit/cancel/${visitId}`),

  // Process overdue visits (agent)
  processOverdueVisits: () => api.post("/visit/process-overdue"),
};

// Advertising API endpoints
export const advertisingAPI = {
  // Get advertising page (public)
  getAdvertisingPage: () =>
    api.get("/advertising", {
      headers: { Accept: "application/json" },
    }),

  // Get seller's advertised properties
  getAdvertisedProperties: () =>
    api.get("/advertising/advertised-properties", {
      headers: { Accept: "application/json" },
    }),

  // Get seller's advertising packages
  getMyPackages: () =>
    api.get("/advertising/my-packages", {
      headers: { Accept: "application/json" },
    }),

  // Create new advertising package
  createPackage: (propertyId, packageType) =>
    api.post(
      "/advertising/create",
      { propertyId, packageType },
      { headers: { Accept: "application/json" } }
    ),

  // Cancel advertising package
  cancelPackage: (advertisingId) =>
    api.post(
      `/advertising/cancel/${advertisingId}`,
      {},
      {
        headers: { Accept: "application/json" },
      }
    ),

  // Get advertisement by ID
  getAdvertisementById: (advertisementId) =>
    api.get(`/advertising/${advertisementId}`, {
      headers: { Accept: "application/json" },
    }),

  // Track advertisement click
  trackClick: (advertisementId, destination) =>
    api.post(
      `/advertising/click/${advertisementId}`,
      { destination },
      { headers: { Accept: "application/json" } }
    ),
};

// Auth API endpoints
export const authAPI = {
  // Get user settings
  getSettings: () =>
    api.get("/auth/settings", {
      headers: { Accept: "application/json" },
    }),

  // Setup 2FA
  getSetup2FA: () =>
    api.get("/auth/setup-2fa", {
      headers: { Accept: "application/json" },
    }),

  // Enable 2FA
  enable2FA: (token) =>
    api.post(
      "/auth/enable-2fa",
      { token },
      {
        headers: { Accept: "application/json" },
      }
    ),

  // Disable 2FA
  disable2FA: () =>
    api.post(
      "/auth/disable-2fa",
      {},
      {
        headers: { Accept: "application/json" },
      }
    ),
};

export default api;
