import axios from "axios";

const API_URL = "/api/advertising";

const advertisingAPI = {
  // Get advertising page data
  getAdvertisingData: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Create advertising package
  createPackage: async (data) => {
    const response = await axios.post(`${API_URL}/create`, data);
    return response.data;
  },

  // Get seller's packages
  getMyPackages: async () => {
    const response = await axios.get(`${API_URL}/my-packages`);
    return response.data;
  },

  // Cancel package
  cancelPackage: async (id) => {
    const response = await axios.post(`${API_URL}/cancel/${id}`);
    return response.data;
  },

  // Get advertisement by ID
  getAdvertisement: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Track advertisement click
  trackClick: async (id, destination) => {
    const response = await axios.post(`${API_URL}/click/${id}`, {
      destination,
    });
    return response.data;
  },
};

export default advertisingAPI;
