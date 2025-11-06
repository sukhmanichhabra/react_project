import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { rentAPI } from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import "./ManageRent.css";

const ManageRent = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(selectAuth);
  const [loading, setLoading] = useState(true);
  const [rentedProperties, setRentedProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (!mounted) return;
      
      try {
        await fetchRentedProperties();
      } catch (error) {
        console.error('Error loading rented properties:', error);
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRentedProperties = async () => {
    try {
      setLoading(true);
      const response = await rentAPI.getSellerRentedProperties();
      if (response.data.success) {
        setRentedProperties(response.data.data.properties || []);
      }
    } catch (error) {
      console.error("Error fetching rented properties:", error);
      toast.error("Failed to load rented properties");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRent = async (propertyId) => {
    try {
      setGenerating(true);
      const response = await rentAPI.generateRentPayment(propertyId);
      
      if (response.data.success) {
        toast.success("Rent payment generated successfully!");
        setShowGenerateModal(false);
        setSelectedProperty(null);
        // Refresh the data
        fetchRentedProperties();
      }
    } catch (error) {
      console.error("Error generating rent:", error);
      const errorMessage = error.response?.data?.message || "Failed to generate rent payment";
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const openGenerateModal = (property) => {
    setSelectedProperty(property);
    setShowGenerateModal(true);
  };

  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    setSelectedProperty(null);
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRentAmount = (price) => {
    // Extract numeric value from price string like "$1,500 / month"
    const match = price.match(/[\d,]+/);
    return match ? parseFloat(match[0].replace(/,/g, "")) : 0;
  };

  if (loading) {
    return (
      <div className="manage-rent-loading">
        <div className="spinner"></div>
        <p>Loading rented properties...</p>
      </div>
    );
  }

  return (
    <div className="manage-rent-container">
      <div className="manage-rent-header">
        <div>
          <h1>Manage Rent Payments</h1>
          <p>Generate and track rent payments for your rented properties</p>
        </div>
        <button className="refresh-btn" onClick={fetchRentedProperties}>
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>

      {/* Statistics Summary */}
      <div className="rent-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-home"></i>
          </div>
          <div className="stat-content">
            <h3>Total Rented Properties</h3>
            <div className="stat-value">{rentedProperties.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-content">
            <h3>Total Monthly Revenue</h3>
            <div className="stat-value">
              {formatCurrency(
                rentedProperties.reduce((sum, p) => sum + getRentAmount(p.price), 0)
              )}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-coins"></i>
          </div>
          <div className="stat-content">
            <h3>Total Collected</h3>
            <div className="stat-value">
              {formatCurrency(
                rentedProperties.reduce((sum, p) => sum + (p.totalCollected || 0), 0)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rented Properties List */}
      <section className="properties-section">
        <h2>
          <i className="fas fa-building"></i> Rented Properties
        </h2>

        {rentedProperties.length > 0 ? (
          <div className="properties-grid">
            {rentedProperties.map((property) => (
              <div key={property._id} className="manage-property-card">
                <div className="property-image-section">
                  <img
                    src={property.images?.[0] || "/assets/default-property.jpg"}
                    alt={property.title}
                  />
                  <div className="property-status-badge">
                    <i className="fas fa-check-circle"></i> Rented
                  </div>
                </div>

                <div className="property-details-section">
                  <h3>{property.title}</h3>
                  <p className="property-location">
                    <i className="fas fa-map-marker-alt"></i> {property.location}
                  </p>

                  <div className="property-rent-info">
                    <div className="rent-amount">
                      <span className="label">Monthly Rent:</span>
                      <span className="value">{property.price}</span>
                    </div>
                    <div className="tenant-info">
                      <span className="label">Tenant:</span>
                      <span className="value">{property.tenantName}</span>
                    </div>
                  </div>

                  <div className="property-stats">
                    <div className="stat-item">
                      <i className="fas fa-money-bill-wave"></i>
                      <span>Collected: {formatCurrency(property.totalCollected || 0)}</span>
                    </div>
                    <div className="stat-item">
                      <i className="fas fa-calendar"></i>
                      <span>
                        Last Payment: {formatDate(property.lastRentDate)}
                      </span>
                    </div>
                  </div>

                  {property.currentRent && (
                    <div className="current-rent-status">
                      <i className="fas fa-clock"></i>
                      <span className={`status ${property.currentRent.status}`}>
                        {property.currentRent.status === "pending"
                          ? "Payment Pending"
                          : property.currentRent.status === "overdue"
                          ? "Payment Overdue"
                          : "Rent Due"}
                      </span>
                    </div>
                  )}

                  <div className="property-actions">
                    <button
                      className="view-details-btn"
                      onClick={() => navigate(`/property/${property._id}`)}
                    >
                      <i className="fas fa-eye"></i> View Property
                    </button>
                    <button
                      className="manage-details-btn"
                      onClick={() => navigate(`/rent/manage/${property._id}`)}
                    >
                      <i className="fas fa-cog"></i> Manage Rent
                    </button>
                    <button
                      className="generate-rent-btn"
                      onClick={() => openGenerateModal(property)}
                    >
                      <i className="fas fa-file-invoice-dollar"></i> Quick Generate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-home"></i>
            <h3>No Rented Properties</h3>
            <p>You don't have any properties currently rented out.</p>
            <button onClick={() => navigate("/properties")} className="browse-btn">
              View My Properties
            </button>
          </div>
        )}
      </section>

      {/* Generate Rent Modal */}
      {showGenerateModal && selectedProperty && (
        <div className="generate-modal-overlay" onClick={closeGenerateModal}>
          <div className="generate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-file-invoice-dollar"></i> Generate Rent Payment
              </h3>
              <button className="close-modal-btn" onClick={closeGenerateModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="property-preview">
                <img
                  src={selectedProperty.images?.[0] || "/assets/default-property.jpg"}
                  alt={selectedProperty.title}
                />
                <div className="property-info">
                  <h4>{selectedProperty.title}</h4>
                  <p>
                    <i className="fas fa-map-marker-alt"></i> {selectedProperty.location}
                  </p>
                </div>
              </div>

              <div className="rent-generation-info">
                <div className="info-row">
                  <span className="info-label">Tenant:</span>
                  <span className="info-value">{selectedProperty.tenantName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Monthly Rent:</span>
                  <span className="info-value rent-amount">{selectedProperty.price}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Total Collected:</span>
                  <span className="info-value">
                    {formatCurrency(selectedProperty.totalCollected || 0)}
                  </span>
                </div>
              </div>

              <div className="generation-note">
                <i className="fas fa-info-circle"></i>
                <p>
                  This will generate a new rent payment request for the tenant. The tenant will be
                  notified and can make the payment through their dashboard.
                </p>
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={closeGenerateModal}>
                  Cancel
                </button>
                <button
                  className="confirm-generate-btn"
                  onClick={() => handleGenerateRent(selectedProperty._id)}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i> Generate Rent Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRent;
