import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManagedProperties.css";

const ManagedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchManagedProperties();
  }, []);

  const fetchManagedProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/dashboard/managed-properties", {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.data.success && response.data.data) {
        setProperties(response.data.data.properties || []);
        setStats(response.data.data.stats || {});
      } else {
        setError("Failed to load managed properties");
      }
    } catch (err) {
      console.error("Error fetching managed properties:", err);
      setError(
        err.response?.data?.message || "Failed to load managed properties"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "status-active";
      case "sold":
        return "status-sold";
      case "rented":
        return "status-rented";
      default:
        return "status-inactive";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return "fa-check-circle";
      case "sold":
        return "fa-home";
      case "rented":
        return "fa-key";
      default:
        return "fa-circle";
    }
  };

  if (loading) {
    return (
      <section className="managed-properties-section">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading managed properties...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="managed-properties" className="managed-properties-section">
      <div className="managed-properties-header">
        <div className="header-content">
          <h2>
            <i className="fas fa-building"></i>
            Properties I Manage
          </h2>
          <p>An overview of all properties assigned to you.</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-list"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalProperties || 0}</h3>
              <p>Total Properties</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.activeProperties || 0}</h3>
              <p>Active</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon sold">
              <i className="fas fa-home"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.soldProperties || 0}</h3>
              <p>Sold</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rented">
              <i className="fas fa-key"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.rentedProperties || 0}</h3>
              <p>Rented</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon messages">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalMessages || 0}</h3>
              <p>Messages</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon unread">
              <i className="fas fa-bell"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.unreadMessages || 0}</h3>
              <p>Unread</p>
            </div>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div className="managed-properties-grid">
        {properties.length > 0 ? (
          properties.map((property) => (
            <div key={property._id} className="agt-property-card">
              {/* Property Image */}
              <div className="property-image-container">
                <img
                  src={
                    property.images && property.images.length > 0
                      ? property.images[0]
                      : "/assets/property-placeholder.jpg"
                  }
                  alt={property.title}
                  className="property-image"
                />
                <div
                  className={`property-status ${getStatusColor(
                    property.status
                  )}`}
                >
                  <i className={`fas ${getStatusIcon(property.status)}`}></i>
                  {property.status.charAt(0).toUpperCase() +
                    property.status.slice(1)}
                </div>
                <div className="property-badge">
                  {property.tag === "rent" ? "FOR RENT" : "FOR SALE"}
                </div>
              </div>

              {/* Property Details */}
              <div className="property-details">
                <h3 className="property-title">{property.title}</h3>
                <p className="property-location">
                  <i className="fas fa-map-marker-alt"></i>
                  {property.location}
                </p>

                {/* Property Features */}
                <div className="property-features">
                  {property.features?.beds && (
                    <div className="feature">
                      <i className="fas fa-bed"></i>
                      <span>{property.features.beds} Beds</span>
                    </div>
                  )}
                  {property.features?.baths && (
                    <div className="feature">
                      <i className="fas fa-bath"></i>
                      <span>{property.features.baths} Baths</span>
                    </div>
                  )}
                  {property.features?.sqft && (
                    <div className="feature">
                      <i className="fas fa-ruler-combined"></i>
                      <span>{property.features.sqft} sqft</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="property-price">
                  {typeof property.price === "string"
                    ? property.price
                    : `$${property.price?.toLocaleString() || "0"}`}
                </div>

                {/* Messages Badge */}
                {property.messageCount > 0 && (
                  <div className="messages-badge">
                    <i className="fas fa-envelope"></i>
                    {property.unreadMessageCount > 0 && (
                      <span className="unread-count">
                        {property.unreadMessageCount}
                      </span>
                    )}
                    {property.messageCount} messages
                  </div>
                )}

                {/* Action Buttons */}
                <div className="property-actions">
                  <button className="btn btn-view">
                    <i className="fas fa-eye"></i> View
                  </button>
                  {/* <button className="btn btn-edit">
                    <i className="fas fa-edit"></i> Edit
                  </button> */}
                  <button className="btn btn-messages">
                    <i className="fas fa-comments"></i> Messages
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="dash-empty-state">
            <i className="fas fa-inbox"></i>
            <h3>No Properties Yet</h3>
            <p>You have not been assigned any properties to manage.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ManagedProperties;
