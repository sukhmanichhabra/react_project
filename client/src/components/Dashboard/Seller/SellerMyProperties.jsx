import React, { useState, useEffect } from "react";
import EnhancedPropertyCard from "../../partials/EnhancedPropertyCard";
import { Link } from "react-router-dom";
import "./SellerMyProperties.css";

const SellerMyProperties = ({ properties = [] }) => {
  const [approvedProperties, setApprovedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to map property data for enhanced card
  const mapPropertyToEnhancedCard = (property) => {
    return {
      id: property._id,
      propertyType: property.features?.type || "Property",
      amenities: property.amenities || [],
      badge: property.tag === "rent" ? "green" : "orange",
      badgeText: property.tag === "rent" ? "FOR RENT" : "FOR SALE",
      location: `${property.location?.address || ''}, ${property.location?.city || ''}, ${property.location?.state || ''}`.replace(/^,\s*|,\s*$/g, '') || "Location not specified",
      imagesCount: property.images?.length || 0,
      videosCount: 0,
      imageUrl: property.images && property.images.length > 0 ? property.images[0] : "/assets/property-1.jpg",
      price: typeof property.price === "string" ? property.price : `$${property.price?.toLocaleString() || "0"}`,
      title: property.title || "Property Title",
      overviewLink: `/property/${property._id}`,
      description: property.description || "No description available",
      bedrooms: property.features?.bedrooms || property.features?.beds || 0,
      bathrooms: property.features?.bathrooms || property.features?.baths || 0,
      squareFeet: property.features?.squareFootage || property.features?.sqft || 0,
      agentImage: null, // Dashboard doesn't need agent info for own properties
      agentName: "You", // It's the seller's own property
      agentId: null,
      agentLink: "#",
      status: property.status || 'active'
    };
  };

  useEffect(() => {
    fetchApprovedProperties();
  }, [properties]);  const fetchApprovedProperties = async () => {
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
            <EnhancedPropertyCard 
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