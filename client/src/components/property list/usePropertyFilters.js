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

  // Get unique locations - filter out null/undefined and ensure strings
  const allLocations = [...new Set(
    properties
      .map(p => p.location || p.geolocation?.address || '')
      .filter(loc => loc && typeof loc === 'string' && loc.trim() !== '')
  )];

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
        loc && typeof loc === 'string' && loc.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(matches.slice(0, 10)); // Limit to 10 suggestions
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
      setLocationSuggestions([]);
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
    console.log('🔍 Applying filters:', filters);
    console.log('📦 Total properties:', properties.length);
    
    // Ensure properties is an array
    if (!Array.isArray(properties) || properties.length === 0) {
      console.log('⚠️ No properties to filter');
      setFilteredProperties([]);
      setNoResults(true);
      return;
    }
    
    let filtered = properties.filter((property) => {
      // Skip invalid properties
      if (!property || !property._id) {
        return false;
      }
      
      // Status/Tag filter
      const statusMatch = filters.status === 'all' || property.tag === filters.status;
      if (!statusMatch) return false;
      
      // Location filter - handle null/undefined locations
      const propertyLocation = property.location || property.geolocation?.address || '';
      const locationMatch = !filters.location || 
        (typeof propertyLocation === 'string' && 
         propertyLocation.toLowerCase().includes(filters.location.toLowerCase()));
      if (!locationMatch) return false;
      
      // Price filter - handle both string and number prices
      let propertyPrice = 0;
      if (typeof property.price === 'number') {
        propertyPrice = property.price;
      } else if (typeof property.price === 'string') {
        propertyPrice = parseInt(property.price.replace(/[^0-9]/g, '')) || 0;
      }
      const priceMatch = propertyPrice >= filters.minPrice && propertyPrice <= filters.maxPrice;
      if (!priceMatch) return false;
      
      // Bedrooms filter - handle database structure (property.features.beds as string)
      let bedroomsMatch = true;
      if (filters.bedrooms !== 'all') {
        // Handle both string and number formats, including padded strings like "03"
        const bedsValue = property.features?.beds || property.beds || '0';
        const propertyBedrooms = parseInt(bedsValue.toString().trim(), 10) || 0;
        const selectedBedrooms = parseInt(filters.bedrooms);
        if (selectedBedrooms === 4) {
          bedroomsMatch = propertyBedrooms >= 4;
        } else {
          bedroomsMatch = propertyBedrooms === selectedBedrooms;
        }
      }
      if (!bedroomsMatch) return false;
      
      // Property type filter - handle both root level and features.type
      const propertyType = property.features?.type || property.type || property.propertyType || '';
      const typeMatch = filters.propertyType === 'all' || 
        propertyType === filters.propertyType;
      if (!typeMatch) return false;
      
      // Amenities filter
      const amenitiesMatch = filters.amenities.length === 0 || 
        filters.amenities.every(amenity => property.amenities?.includes(amenity));
      if (!amenitiesMatch) return false;
      
      return true;
    });
    
    console.log('✅ Filtered properties count:', filtered.length);
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
