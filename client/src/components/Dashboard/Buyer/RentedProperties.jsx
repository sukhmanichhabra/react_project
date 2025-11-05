import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./RentedProperties.css";

// This is a new, specialized card for rented properties
const RentedPropertyCard = ({ property, onCancelSuccess }) => {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleContact = () => {
    const landlordEmail = property.landlordEmail || "landlord@example.com";
    const subject = `Inquiry about property: ${property.title}`;
    const body = `Hello,\n\nI am your tenant for the property at ${property.location} and I would like to discuss...\n\nThank you,`;
    window.location.href = `mailto:${landlordEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    
    if (!confirm("Are you sure you want to cancel this rental agreement? This action cannot be undone.")) {
      return;
    }

    try {
      setIsCancelling(true);
      
      const response = await fetch(`/api/rent/cancel-by-buyer/${property._id}`, {
        method: "POST",
        credentials: "include",
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert("Rental agreement cancelled successfully!");
        // Call the callback to refresh the list
        if (onCancelSuccess) {
          onCancelSuccess();
        }
      } else {
        throw new Error(result.message || "Failed to cancel rental agreement");
      }
    } catch (error) {
      console.error("Error cancelling rental agreement:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="rented-property-card">
      <figure className="rented-property-card__image">
        <Link to={`/property/${property._id}`}>
          <img
            src={property.images?.[0] || "/assets/property-1.jpg"}
            alt={property.title}
          />
        </Link>
        <span className="rented-property-card__tag">Rented</span>
      </figure>
      <div className="rented-property-card__content">
        <h3 className="rented-property-card__title">
          <Link to={`/property/${property._id}`}>{property.title}</Link>
        </h3>
        <p className="rented-property-card__location">
          <i className="fas fa-map-marker-alt"></i>
          <span>{property.location}</span>
        </p>
        <p className="rented-property-card__price">{property.price}</p>

        {/* Rental Information Block */}
        <div className="rented-property-card__info-block">
          <h4 className="rented-property-card__info-title">
            <i className="fas fa-info-circle"></i>
            <span>Rental Information</span>
          </h4>
          <div className="rented-property-card__info-details">
            <p>
              <strong>Rented On:</strong> {formatDate(property.rentedOn)}
            </p>
            <p>
              <strong>Lease Duration:</strong>{" "}
              {property.leaseDuration || "12 months"}
            </p>
            <p>
              <strong>Landlord:</strong> {property.landlordName || "Property Owner"}
            </p>
            {property.currentRent && (
              <p>
                <strong>Next Rent Due:</strong> {formatDate(property.currentRent.dueDate)}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="rented-property-card__actions">
          <Link to={`/property/${property._id}`} className="dash-btn blue">
            <i className="fas fa-eye"></i>
            <span>View Details</span>
          </Link>
          <button onClick={handleContact} className="dash-btn blue">
            <i className="fas fa-envelope"></i>
            <span>Contact Landlord</span>
          </button>
          <form onSubmit={handleCancel} style={{ width: "100%" }}>
            <button
              type="submit"
              className="dash-btn red"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-times-circle"></i>
              )}
              <span>{isCancelling ? "Cancelling..." : "Cancel Agreement"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main RentedProperties Component
const RentedProperties = ({ properties = [] }) => {
  const [rentedProperties, setRentedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch rented properties from backend
  useEffect(() => {
    const fetchRentedProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/rent/buyer-rented", {
          credentials: "include",
        });
        
        const result = await response.json();
        
        if (result.success) {
          setRentedProperties(result.data.properties);
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

  const handleCancelSuccess = () => {
    // Refresh the properties list
    const fetchRentedProperties = async () => {
      try {
        const response = await fetch("/api/rent/buyer-rented", {
          credentials: "include",
        });
        
        const result = await response.json();
        
        if (result.success) {
          setRentedProperties(result.data.properties);
        }
      } catch (err) {
        console.error("Error refreshing rented properties:", err);
      }
    };

    fetchRentedProperties();
  };

  if (loading) {
    return (
      <section id="rented-properties" className="rented-properties-section">
        <div className="rented-properties-header">
          <h2>My Rented Properties</h2>
          <p>View and manage your rented properties.</p>
        </div>
        <div className="dash-loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading rented properties...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="rented-properties" className="rented-properties-section">
        <div className="rented-properties-header">
          <h2>My Rented Properties</h2>
          <p>View and manage your rented properties.</p>
        </div>
        <div className="dash-error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Properties</h3>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="rented-properties" className="rented-properties-section">
      <div className="rented-properties-header">
        <h2>My Rented Properties</h2>
        <p>View and manage your rented properties.</p>
      </div>
      <div className="rented-properties-grid">
        {rentedProperties.length > 0 ? (
          rentedProperties.map((prop) => (
            <RentedPropertyCard 
              key={prop._id} 
              property={prop} 
              onCancelSuccess={handleCancelSuccess}
            />
          ))
        ) : (
          <div className="dash-empty-state">
            <i className="fas fa-key"></i>
            <h3>No Rented Properties</h3>
            <p>You are not currently renting any properties.</p>
            <Link to="/properties?tag=rent" className="dash-cta-button">
              <i className="fas fa-search"></i>
              <span>Find Properties for Rent</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default RentedProperties;
