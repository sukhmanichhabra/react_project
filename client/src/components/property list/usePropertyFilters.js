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
    
    // Log ALL properties structure for debugging
    if (properties.length > 0) {
      console.log('📋 All properties structures:');
      properties.forEach((prop, index) => {
        console.log(`Property ${index + 1}:`, {
          title: prop.title,
          location: prop.location,
          geolocation: prop.geolocation,
          type: prop.type,
          'features.type': prop.features?.type,
          'features.beds': prop.features?.beds,
          'features.baths': prop.features?.baths,
          'features.sqft': prop.features?.sqft,
          price: prop.price,
          tag: prop.tag,
          amenities: prop.amenities,
          approvalStatus: prop.approvalStatus,
          status: prop.status
        });
      });
    }
    
    let filtered = properties.filter((property, index) => {
      console.log(`\n🔍 Filtering property ${index + 1}: ${property.title}`);
      
      // Status filter
      const statusMatch = filters.status === 'all' || property.tag === filters.status;
      console.log(`  📌 Status: property.tag="${property.tag}" vs filter="${filters.status}" → ${statusMatch ? '✅' : '❌'}`);
      
      // Location filter - handle null/undefined locations
      const propertyLocation = property.location || property.geolocation?.address || '';
      const locationMatch = !filters.location || 
        (typeof propertyLocation === 'string' && 
         propertyLocation.toLowerCase().includes(filters.location.toLowerCase()));
      console.log(`  📍 Location: "${propertyLocation}" contains "${filters.location}" → ${locationMatch ? '✅' : '❌'}`);
      
      // Price filter - handle both string and number prices
      let propertyPrice = 0;
      if (typeof property.price === 'number') {
        propertyPrice = property.price;
      } else if (typeof property.price === 'string') {
        propertyPrice = parseInt(property.price.replace(/[^0-9]/g, '')) || 0;
      }
      const priceMatch = propertyPrice >= filters.minPrice && propertyPrice <= filters.maxPrice;
      console.log(`  💰 Price: $${propertyPrice} in range [$${filters.minPrice}-$${filters.maxPrice}] → ${priceMatch ? '✅' : '❌'}`);
      
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
        console.log(`  🛏️ Bedrooms: ${propertyBedrooms} vs ${selectedBedrooms} → ${bedroomsMatch ? '✅' : '❌'}`);
      }
      
      // Property type filter - handle both root level and features.type
      const propertyType = property.features?.type || property.type || property.propertyType || '';
      const typeMatch = filters.propertyType === 'all' || 
        propertyType === filters.propertyType;
      console.log(`  🏠 Type: "${propertyType}" vs "${filters.propertyType}" → ${typeMatch ? '✅' : '❌'}`);
      
      // Amenities filter
      const amenitiesMatch = filters.amenities.length === 0 || 
        filters.amenities.every(amenity => property.amenities?.includes(amenity));
      console.log(`  ✨ Amenities: ${filters.amenities.length} required, property has ${property.amenities?.length || 0} → ${amenitiesMatch ? '✅' : '❌'}`);
      
      const finalMatch = statusMatch && locationMatch && priceMatch && bedroomsMatch && typeMatch && amenitiesMatch;
      
      console.log(`  🎯 FINAL RESULT: ${finalMatch ? '✅ PASS' : '❌ FAIL'}`);
      
      if (!finalMatch) {
        console.log(`  ⚠️ Failed filters:`, {
          status: statusMatch ? '✅' : '❌',
          location: locationMatch ? '✅' : '❌',
          price: priceMatch ? '✅' : '❌',
          bedrooms: bedroomsMatch ? '✅' : '❌',
          type: typeMatch ? '✅' : '❌',
          amenities: amenitiesMatch ? '✅' : '❌'
        });
      }
      
      return finalMatch;
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
