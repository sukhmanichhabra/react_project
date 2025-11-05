import { useState, useEffect } from 'react';
import { propertyAPI } from '../../services/api';

/**
 * Custom hook to fetch properties from the database
 * @param {string} tag - Filter properties by tag ('sale', 'rent', or 'all')
 * @returns {Object} - { properties, loading, error, refetch }
 */
export const useProperties = (tag = 'all') => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching properties with tag:', tag);
      
      let response;
      if (tag === 'all') {
        response = await propertyAPI.getAllProperties();
      } else {
        response = await propertyAPI.getPropertiesByTag(tag);
      }

      console.log('API Response status:', response.status);
      console.log('API Response data:', response.data);

      // Handle both JSON response and HTML response (fallback)
      if (response.data && Array.isArray(response.data)) {
        // Direct JSON array response
        console.log('Properties received:', response.data.length);
        if (response.data.length > 0) {
          console.log('First property structure:', response.data[0]);
        }
        setProperties(response.data);
      } else if (response.data && response.data.properties) {
        // JSON response with properties key
        console.log('Properties received (nested):', response.data.properties.length);
        setProperties(response.data.properties);
      } else {
        // If we got HTML or unexpected format, set empty array
        console.warn('Unexpected response format from API');
        console.warn('Response data:', response.data);
        setProperties([]);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        request: err.request
      });
      
      let errorMessage = 'Failed to fetch properties';
      if (err.response) {
        // Server responded with error
        errorMessage = `Server error: ${err.response.status} - ${err.response.statusText}`;
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'Network error: Unable to reach the server. Please check if the backend is running on http://localhost:8000';
      } else {
        // Something else happened
        errorMessage = err.message || 'Failed to fetch properties';
      }
      
      setError(errorMessage);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [tag]);

  // Refetch function to manually trigger data refresh
  const refetch = () => {
    fetchProperties();
  };

  return {
    properties,
    loading,
    error,
    refetch
  };
};

export default useProperties;
