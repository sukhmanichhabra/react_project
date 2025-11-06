import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rentAPI } from "../../services/api";
import toast from "react-hot-toast";
import "./PropertyRentManagement.css";

const PropertyRentManagement = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [rentHistory, setRentHistory] = useState([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Rent settings state
  const [rentSettings, setRentSettings] = useState({
    rentAmount: 0,
    frequency: "monthly",
    dueDay: 1,
    gracePeriod: 5,
    lateFee: 50
  });

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (!mounted) return;
      
      try {
        await fetchPropertyData();
      } catch (error) {
        console.error('Error loading property data:', error);
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      const response = await rentAPI.getManageRentPage(propertyId);
      
      if (response.data.success) {
        const data = response.data.data;
        setProperty(data.property);
        setRentHistory(data.rentHistory || []);
        
        // Set rent settings from property
        if (data.property.rentSettings) {
          setRentSettings(data.property.rentSettings);
        } else {
          // Extract rent amount from price
          const rentAmount = extractRentAmount(data.property.price);
          setRentSettings(prev => ({ ...prev, rentAmount }));
        }
      }
    } catch (error) {
      console.error("Error fetching property data:", error);
      toast.error("Failed to load property information");
    } finally {
      setLoading(false);
    }
  };

  const extractRentAmount = (priceString) => {
    const match = priceString?.match(/[\d,]+/);
    return match ? parseFloat(match[0].replace(/,/g, "")) : 0;
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    
    try {
      setProcessing(true);
      const response = await rentAPI.updateRentSettings(propertyId, rentSettings);
      
      if (response.data.success) {
        toast.success("Rent settings updated successfully!");
        setShowSettingsModal(false);
        fetchPropertyData();
      }
    } catch (error) {
      console.error("Error updating rent settings:", error);
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateRent = async () => {
    if (!window.confirm("Generate next rent payment for this property?")) {
      return;
    }
    
    try {
      setProcessing(true);
      const response = await rentAPI.generateRentPayment(propertyId);
      
      if (response.data.success) {
        toast.success("Rent payment generated successfully!");
        fetchPropertyData();
      }
    } catch (error) {
      console.error("Error generating rent:", error);
      toast.error(error.response?.data?.message || "Failed to generate rent");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelAgreement = async () => {
    try {
      setProcessing(true);
      const response = await rentAPI.cancelRentalAgreement(propertyId);
      
      if (response.data.success) {
        toast.success("Rental agreement cancelled successfully!");
        setShowCancelModal(false);
        navigate("/rent/manage");
      }
    } catch (error) {
      console.error("Error cancelling agreement:", error);
      toast.error(error.response?.data?.message || "Failed to cancel agreement");
    } finally {
      setProcessing(false);
    }
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

  if (loading) {
    return (
      <div className="property-rent-loading">
        <div className="spinner"></div>
        <p>Loading property information...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="property-rent-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Property Not Found</h3>
        <button onClick={() => navigate("/rent/manage")} className="back-btn">
          Back to Manage Rent
        </button>
      </div>
    );
  }

  return (
    <div className="property-rent-management">
      {/* Header */}
      <div className="property-rent-header">
        <div>
          <h1>
            <i className="fas fa-file-invoice-dollar"></i> Manage Rent: {property.title}
          </h1>
          <button onClick={() => navigate("/rent/manage")} className="back-link">
            <i className="fas fa-arrow-left"></i> Back to All Properties
          </button>
        </div>
        <button onClick={() => navigate(`/property/${property._id}`)} className="view-property-btn">
          <i className="fas fa-eye"></i> View Property
        </button>
      </div>

      {/* Property Information */}
      <section className="property-info-section">
        <h2>Property Information</h2>
        <div className="property-overview">
          <div className="property-image">
            <img
              src={property.images?.[0] || "/assets/default-property.jpg"}
              alt={property.title}
            />
          </div>
          <div className="property-details">
            <h3>{property.title}</h3>
            <p className="property-location">
              <i className="fas fa-map-marker-alt"></i> {property.location}
            </p>
            <div className="property-features">
              <span><i className="fas fa-bed"></i> {property.features?.beds || 0} Beds</span>
              <span><i className="fas fa-bath"></i> {property.features?.baths || 0} Baths</span>
              <span><i className="fas fa-ruler-combined"></i> {property.features?.sqft || 0} sqft</span>
            </div>
            <p className="property-price">
              <i className="fas fa-money-bill-wave"></i> {property.price}
            </p>
            <p className="property-status">
              <i className="fas fa-info-circle"></i> Status:{" "}
              <span className={`status-badge ${property.status}`}>
                {property.status?.toUpperCase()}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Rent Settings */}
      <section className="rent-settings-section">
        <div className="section-header">
          <h2>Rent Settings</h2>
          <button onClick={() => setShowSettingsModal(true)} className="edit-settings-btn">
            <i className="fas fa-edit"></i> Edit Settings
          </button>
        </div>
        <div className="settings-display">
          <div className="setting-item">
            <span className="setting-label">Rent Amount:</span>
            <span className="setting-value">{formatCurrency(rentSettings.rentAmount)}</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Frequency:</span>
            <span className="setting-value">{rentSettings.frequency}</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Due Day:</span>
            <span className="setting-value">Day {rentSettings.dueDay} of month</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Grace Period:</span>
            <span className="setting-value">{rentSettings.gracePeriod} days</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Late Fee:</span>
            <span className="setting-value">{formatCurrency(rentSettings.lateFee)}</span>
          </div>
        </div>
      </section>

      {/* Generate Rent */}
      <section className="generate-rent-section">
        <div className="section-header">
          <h2>Generate Rent</h2>
          {property.status === "rented" ? (
            <button
              onClick={handleGenerateRent}
              className="generate-rent-btn"
              disabled={processing}
            >
              <i className="fas fa-file-invoice-dollar"></i> Generate Next Rent
            </button>
          ) : (
            <button className="generate-rent-btn" disabled>
              <i className="fas fa-file-invoice-dollar"></i> Property Not Rented
            </button>
          )}
        </div>
        <div className="info-box">
          <i className="fas fa-info-circle"></i>
          <p>
            You can generate a new rent payment for the tenant once the current payment is settled.
            The rent will be generated based on the settings above and will be due according to the
            frequency and due date specified.
          </p>
        </div>
      </section>

      {/* Rent History */}
      <section className="rent-history-section">
        <h2>Complete Rent History</h2>
        {rentHistory && rentHistory.length > 0 ? (
          <div className="rent-history-table-wrapper">
            <table className="rent-history-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Paid Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rentHistory.map((rent) => (
                  <tr key={rent._id}>
                    <td>{rent.renterName || "Tenant"}</td>
                    <td>{formatDate(rent.dueDate)}</td>
                    <td>{formatCurrency(rent.amount)}</td>
                    <td>
                      <span className={`status-badge status-${rent.status}`}>
                        {rent.status.charAt(0).toUpperCase() + rent.status.slice(1)}
                      </span>
                    </td>
                    <td>{rent.paidDate ? formatDate(rent.paidDate) : "Not paid yet"}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/rent/details/${rent._id}`)}
                        className="view-rent-btn"
                      >
                        <i className="fas fa-eye"></i> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-file-invoice-dollar"></i>
            <p>No rent history available for this property.</p>
          </div>
        )}
      </section>

      {/* Tenant Information */}
      <section className="tenant-info-section">
        <h2>Current Tenant Information</h2>
        {property.status === "rented" && property.buyer ? (
          <>
            <div className="tenant-details">
              <div className="tenant-detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{property.buyer.name}</span>
              </div>
              <div className="tenant-detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{property.buyer.email}</span>
              </div>
              <div className="tenant-detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{property.buyer.phone || "N/A"}</span>
              </div>
              <div className="tenant-detail-item">
                <span className="detail-label">Rented Since:</span>
                <span className="detail-value">
                  {formatDate(property.purchaseDate || property.rentedSince)}
                </span>
              </div>
            </div>
            
            <div className="tenant-actions">
              <button
                className="message-tenant-btn"
                onClick={() => toast.info("Messaging feature coming soon!")}
              >
                <i className="fas fa-envelope"></i> Message Tenant
              </button>
              <button
                className="cancel-agreement-btn"
                onClick={() => setShowCancelModal(true)}
              >
                <i className="fas fa-times-circle"></i> Cancel Agreement
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <i className="fas fa-user"></i>
            <p>This property is not currently rented.</p>
          </div>
        )}
      </section>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Rent Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="close-modal-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSaveSettings} className="settings-form">
              <div className="form-group">
                <label htmlFor="rentAmount">Rent Amount ($)</label>
                <input
                  type="number"
                  id="rentAmount"
                  value={rentSettings.rentAmount}
                  onChange={(e) =>
                    setRentSettings({ ...rentSettings, rentAmount: parseFloat(e.target.value) })
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="frequency">Payment Frequency</label>
                <select
                  id="frequency"
                  value={rentSettings.frequency}
                  onChange={(e) => setRentSettings({ ...rentSettings, frequency: e.target.value })}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="dueDay">Due Day of Month</label>
                <input
                  type="number"
                  id="dueDay"
                  value={rentSettings.dueDay}
                  onChange={(e) =>
                    setRentSettings({ ...rentSettings, dueDay: parseInt(e.target.value) })
                  }
                  min="1"
                  max="31"
                  required
                />
                <p className="form-hint">Day of the month when rent is due</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="gracePeriod">Grace Period (Days)</label>
                <input
                  type="number"
                  id="gracePeriod"
                  value={rentSettings.gracePeriod}
                  onChange={(e) =>
                    setRentSettings({ ...rentSettings, gracePeriod: parseInt(e.target.value) })
                  }
                  min="0"
                  max="30"
                  required
                />
                <p className="form-hint">Days after due date before rent is marked overdue</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="lateFee">Late Fee ($)</label>
                <input
                  type="number"
                  id="lateFee"
                  value={rentSettings.lateFee}
                  onChange={(e) =>
                    setRentSettings({ ...rentSettings, lateFee: parseFloat(e.target.value) })
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={processing}>
                  {processing ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Save Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Agreement Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Rental Agreement</h3>
              <button onClick={() => setShowCancelModal(false)} className="close-modal-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-message">
                <i className="fas fa-exclamation-triangle"></i>
                <p>
                  Are you sure you want to cancel this rental agreement? This action cannot be
                  undone. The property will be marked as available and the tenant will be notified.
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCancelModal(false)} className="cancel-btn">
                No, Keep Agreement
              </button>
              <button
                onClick={handleCancelAgreement}
                className="danger-btn"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Cancelling...
                  </>
                ) : (
                  <>
                    <i className="fas fa-times-circle"></i> Yes, Cancel Agreement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyRentManagement;
