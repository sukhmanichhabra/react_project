import React, { useState, useEffect } from "react";
import EnhancedPropertyCard from "../../partials/EnhancedPropertyCard";
import PropertyCard from "../../partials/PropertyCard";
import { Link } from "react-router-dom";
import "./SellerMyProperties.css";

const SellerMyProperties = ({ properties = [] }) => {
  const [approvedProperties, setApprovedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/assets/property-1.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return '/assets/property-1.jpg';
  };

  // Helper function to map property data for enhanced card
  const mapPropertyToEnhancedCard = (property) => {
    // Handle location - it's a string in the database, not an object
    const locationStr = property.location || property.geolocation?.address || "Location not specified";
    
    // Handle agent data
    const agentData = property.agent || {};
    const agentName = agentData.name || agentData.fullName || "No Agent Assigned";
    const agentImage = agentData.image || agentData.profileImage || "/images/default-avatar.png";
    
    return {
      id: property._id,
      propertyType: property.features?.type || property.type || "Property",
      amenities: property.amenities || [],
      badge: property.tag === "rent" ? "green" : "orange",
      badgeText: property.tag === "rent" ? "FOR RENT" : "FOR SALE",
      location: locationStr,
      imagesCount: property.images?.length || 0,
      videosCount: 0,
      imageUrl: property.images && property.images.length > 0 ? getImageUrl(property.images[0]) : "/assets/property-1.jpg",
      price: typeof property.price === "string" ? property.price : `$${property.price?.toLocaleString() || "0"}`,
      title: property.title || "Property Title",
      overviewLink: `/property/${property._id}`,
      description: property.description || "No description available",
      bedrooms: parseInt(property.features?.bedrooms || property.features?.beds || 0),
      bathrooms: parseInt(property.features?.bathrooms || property.features?.baths || 0),
      squareFeet: parseInt(property.features?.squareFootage || property.features?.sqft || 0),
      agentImage: agentImage,
      agentName: agentName,
      agentId: agentData._id || agentData.id || null,
      agentLink: agentData._id ? `/agent/${agentData._id}` : "#",
      status: property.status || 'active'
    };
  };

  useEffect(() => {
    fetchApprovedProperties();
  }, [properties]);  

  const fetchApprovedProperties = async () => {
    try {
      setLoading(true);
      console.log('🔍 SellerMyProperties: Starting to fetch approved properties...');
      
      // If properties are passed as props (from dashboard), use them
      if (properties && properties.length > 0) {
        console.log('📦 Using properties from props:', properties.length);
        // Filter only approved properties
        const approved = properties.filter(prop => prop.approvalStatus === 'approved');
        console.log('✅ Approved properties from props:', approved.length);
        setApprovedProperties(approved);      } else {
        console.log('🌐 Using dashboard API: /api/dashboard');
        // Use the dashboard API which already provides approved properties for sellers
        const response = await fetch('/api/dashboard', {
          headers: { 'Accept': 'application/json' },
          credentials: 'include'
        });
        
        console.log('📡 Dashboard API Response status:', response.status);
        console.log('📡 Dashboard API Response ok:', response.ok);
        
        if (response.ok) {
          const result = await response.json();
          console.log('📊 Dashboard API Response data:', result);
          if (result.success && result.data && result.data.properties) {
            console.log('✅ Setting approved properties from dashboard:', result.data.properties.length);
            // Dashboard already returns only approved properties for sellers
            setApprovedProperties(result.data.properties);
          } else {
            console.log('⚠️ No properties found in dashboard response');
            setApprovedProperties([]);
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Dashboard API Error response:', errorText);
          throw new Error('Failed to fetch properties from dashboard');
        }
      }
    } catch (err) {
      console.error('❌ Error fetching approved properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="my-properties" className="seller-my-properties-section">
        <div className="seller-my-properties-header">
          <h2>My Properties</h2>
          <p>A list of your approved properties for sale or rent.</p>
        </div>
        <div className="dash-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading your properties...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="my-properties" className="seller-my-properties-section">
        <div className="seller-my-properties-header">
          <h2>My Properties</h2>
          <p>A list of your approved properties for sale or rent.</p>
        </div>
        <div className="dash-empty-state">
          <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
          <h3>Error Loading Properties</h3>
          <p>{error}</p>
          <button 
            onClick={fetchApprovedProperties}
            className="dash-cta-button"
          >
            <i className="fas fa-refresh"></i> Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="my-properties" className="seller-my-properties-section">
      <div className="seller-my-properties-header">
        <h2>My Properties</h2>
        <p>A list of your approved properties for sale or rent.</p>
      </div>      <div className="seller-my-properties-grid enhanced-dashboard-grid">
        {approvedProperties.length > 0 ? (
          approvedProperties.map((prop) => (
            <PropertyCard 
              key={prop._id} 
              {...mapPropertyToEnhancedCard(prop)} 
            />
          ))
        ) : (
          <div className="dash-empty-state">
            <i className="fas fa-building"></i>
            <h3>No Approved Properties</h3>
            <p>You don't have any approved properties yet. Properties need admin approval before appearing here.</p>
            <a href="#add-listing" className="dash-cta-button">
              <i className="fas fa-plus"></i> Add Your First Listing
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default SellerMyProperties;