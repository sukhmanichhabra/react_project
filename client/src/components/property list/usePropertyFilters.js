import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing property filters
 */
export const usePropertyFilters = (properties = []) => {
  const [filters, setFilters] = useState({
    status: 'all',
    location: '',
    minPrice: 500,
    maxPrice: 1000000,
    bedrooms: 'all',
    amenities: [],
    propertyType: 'all'
  });
  
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Get unique locations
  const allLocations = [...new Set(properties.map(p => p.location))];

  // Extract price from string
  const extractPrice = (priceString) => {
    if (typeof priceString === 'number') return priceString;
    if (!priceString) return 0;
    const numericPart = priceString.toString().replace(/[$,]/g, '').split('/')[0].trim();
    return parseInt(numericPart) || 0;
  };

  // Handle location input
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, location: value }));
    
    if (value.length >= 2) {
      const matches = allLocations.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle amenity checkbox
  const handleAmenityChange = (amenity) => {
    setFilters(prev => {
      const newAmenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: newAmenities };
    });
  };

  // Update price values
  const updatePriceValues = (min, max) => {
    const newMin = Math.min(min, max);
    const newMax = Math.max(min, max);
    setFilters(prev => ({ ...prev, minPrice: newMin, maxPrice: newMax }));
  };

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = properties.filter(property => {
      // Status filter
      const statusMatch = filters.status === 'all' || property.tag === filters.status;
      
      // Location filter
      const locationMatch = !filters.location || 
        property.location.toLowerCase().includes(filters.location.toLowerCase());
      
      // Price filter - handle both string and number prices
      let propertyPrice = 0;
      if (typeof property.price === 'number') {
        propertyPrice = property.price;
      } else if (typeof property.price === 'string') {
        propertyPrice = parseInt(property.price.replace(/[^0-9]/g, '')) || 0;
      }
      const priceMatch = propertyPrice >= filters.minPrice && propertyPrice <= filters.maxPrice;
      
      // Bedrooms filter - handle database structure (property.features.beds)
      let bedroomsMatch = true;
      if (filters.bedrooms !== 'all') {
        const propertyBedrooms = parseInt(property.features?.beds || 0);
        const selectedBedrooms = parseInt(filters.bedrooms);
        if (selectedBedrooms === 4) {
          bedroomsMatch = propertyBedrooms >= 4;
        } else {
          bedroomsMatch = propertyBedrooms === selectedBedrooms;
        }
      }
      
      // Property type filter - handle database structure (property.features.type)
      const propertyType = property.features?.type || property.propertyType || '';
      const typeMatch = filters.propertyType === 'all' || 
        propertyType === filters.propertyType;
      
      // Amenities filter
      const amenitiesMatch = filters.amenities.length === 0 || 
        filters.amenities.every(amenity => property.amenities?.includes(amenity));
      
      return statusMatch && locationMatch && priceMatch && bedroomsMatch && typeMatch && amenitiesMatch;
    });
    
    setFilteredProperties(filtered);
    setNoResults(filtered.length === 0);
  }, [properties, filters]);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      location: '',
      minPrice: 500,
      maxPrice: 1000000,
      bedrooms: 'all',
      amenities: [],
      propertyType: 'all'
    });
    setFilteredProperties(properties);
    setNoResults(false);
  };

  // Auto-apply filters when properties or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Initialize filtered properties
  useEffect(() => {
    setFilteredProperties(properties);
  }, [properties]);

  return {
    filters,
    filteredProperties,
    noResults,
    locationSuggestions,
    showSuggestions,
    handleLocationChange,
    handleFilterChange,
    handleAmenityChange,
    updatePriceValues,
    applyFilters,
    resetFilters,
    setShowSuggestions,
  };
};
