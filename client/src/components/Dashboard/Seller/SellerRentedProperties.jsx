import React, { useState, useEffect } from "react";
import SimplePropertyCard from "../common/PropertyCard";
import "./SellerRentedProperties.css"; 

// Specialized card component for seller's rented properties
const SellerRentedPropertyCard = ({ property }) => {
  const [isGeneratingRent, setIsGeneratingRent] = useState(false);

  const handleGenerateRent = async () => {
    if (!confirm("Generate next rent payment for this property?")) return;
    
    try {
      setIsGeneratingRent(true);
      const response = await fetch(`/api/rent/generate/${property._id}`, {
        method: "POST",
        credentials: "include",
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert("Rent payment generated successfully!");
        // Optionally refresh the component
        window.location.reload();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error generating rent:", error);
      alert("Failed to generate rent payment");
    } finally {
      setIsGeneratingRent(false);
    }
  };

  const handleContactTenant = () => {
    const tenantEmail = property.tenantEmail || property.buyer?.email || "tenant@example.com";
    const subject = `Regarding your rental: ${property.title}`;
    const body = `Hello ${property.tenantName || "Tenant"},\n\nI hope you are well. I wanted to discuss your rental property at ${property.location}.\n\nBest regards,`;
    window.location.href = `mailto:${tenantEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="seller-rented-property-card">
      <figure className="seller-rented-property-card__image">
        <img
          src={property.images?.[0] || "/assets/property-1.jpg"}
          alt={property.title}
        />
        <span className="seller-rented-property-card__tag">Rented Out</span>
      </figure>
      
      <div className="seller-rented-property-card__content">
        <h3 className="seller-rented-property-card__title">{property.title}</h3>
        <p className="seller-rented-property-card__location">
          <i className="fas fa-map-marker-alt"></i>
          <span>{property.location}</span>
        </p>
        <p className="seller-rented-property-card__price">{property.price}</p>

        {/* Rental Information Block */}
        <div className="seller-rented-property-card__info-block">
          <h4 className="seller-rented-property-card__info-title">
            <i className="fas fa-info-circle"></i>
            <span>Rental Information</span>
          </h4>
          <div className="seller-rented-property-card__info-details">
            <p><strong>Tenant:</strong> {property.tenantName || "N/A"}</p>
            <p><strong>Rented Since:</strong> {formatDate(property.rentedSince)}</p>
            <p><strong>Total Collected:</strong> ₹{(property.totalCollected || 0).toLocaleString()}</p>
            <p><strong>Last Payment:</strong> {formatDate(property.lastRentDate)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="seller-rented-property-card__actions">
          <button onClick={handleContactTenant} className="dash-btn blue">
            <i className="fas fa-envelope"></i>
            <span>Contact Tenant</span>
          </button>
          <button 
            onClick={handleGenerateRent} 
            className="dash-btn green"
            disabled={isGeneratingRent}
          >
            {isGeneratingRent ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-plus-circle"></i>
            )}
            <span>{isGeneratingRent ? "Generating..." : "Generate Rent"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const SellerRentedProperties = ({ properties = [] }) => {
  const [rentedProperties, setRentedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, totalRevenue: 0 });

  // Fetch rented properties from backend
  useEffect(() => {
    const fetchRentedProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/rent/seller-rented", {
          credentials: "include",
        });
        
        const result = await response.json();
        
        if (result.success) {
          setRentedProperties(result.data.properties);
          setStats({
            total: result.data.total,
            totalRevenue: result.data.totalRevenue || 0,
          });
        } else {
          throw new Error(result.message || "Failed to fetch rented properties");
        }
      } catch (err) {
        console.error("Error fetching rented properties:", err);
        setError(err.message);
        // Fallback to filter from props if API fails
        const fallbackProperties = properties.filter(
          (p) => p.tag === "rent" && p.status === "rented"
        );
        setRentedProperties(fallbackProperties);
      } finally {
        setLoading(false);
      }
    };

    fetchRentedProperties();
  }, [properties]);
  return (
    <section
      id="seller-rented-properties"
      className="seller-rented-properties-section"
    >
      <div className="seller-rented-properties-header">
        <h2>My Rented Properties</h2>
        <p>Properties you own that are currently rented out.</p>
        {stats.total > 0 && (
          <div className="seller-rented-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Properties Rented</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">₹{stats.totalRevenue.toLocaleString()}</span>
              <span className="stat-label">Total Revenue</span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="dash-loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading rented properties...</p>
        </div>
      ) : error ? (
        <div className="dash-error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Properties</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="seller-rented-properties-grid">
          {rentedProperties.length > 0 ? (
            rentedProperties.map((prop) => (
              <SellerRentedPropertyCard key={prop._id} property={prop} />
            ))
          ) : (
            <div className="dash-empty-state">
              <i className="fas fa-key"></i>
              <h3>No Rented Properties</h3>
              <p>You do not have any properties currently rented out.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SellerRentedProperties;