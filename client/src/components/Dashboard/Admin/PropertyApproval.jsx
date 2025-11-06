import React, { useState, useEffect } from "react";
import "./PropertyApproval.css";
import PropertyReviewModal from "./PropertyReviewModal";

// Child component for each property in the list
const PropertyListItem = ({ property, onSelect, onApprove, onReject, isProcessing }) => {
  const {
    approvalStatus,
    images,
    title,
    _id,
    location,
    price,
    features,
    seller,
    createdAt,
  } = property;
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  // Helper function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/assets/3.jpg';
    
    // If it's already a full URL (Cloudinary), return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // If it starts with /, it's a relative path from server root (legacy assets)
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // Default fallback
    return '/assets/3.jpg';
  };

  return (
    <div className="pa-list-item">
      <div className={`pa-item-status-bar ${approvalStatus}`}></div>
      <img 
        src={getImageUrl(images && images[0])} 
        alt={title} 
        className="pa-item-image"
        onError={(e) => {
          // Fallback to default asset if Cloudinary image fails to load
          e.target.src = '/assets/3.jpg';
        }}
      />
      <div className="pa-item-details">
        <p className="id">ID: {_id}</p>
        <h3>{title}</h3>
        <p>
          <i
            className="fas fa-map-marker-alt"
            style={{ marginRight: "8px", color: "#9ca3af" }}
          ></i>
          {location}
        </p>
        <div className="price">{price}</div>
        <div className="pa-item-features">
          <span>
            <i className="fas fa-bed"></i> {features?.beds || 0} Beds
          </span>
          <span>
            <i className="fas fa-bath"></i> {features?.baths || 0} Baths
          </span>
          <span>
            <i className="fas fa-ruler-combined"></i> {features?.sqft || 0} sqft
          </span>
        </div>
        <div className="pa-item-footer">
          <p className="pa-item-lister">
            Listed by: <strong>{seller?.name || 'Unknown'}</strong> | Submitted:{" "}
            <strong>{formatDate(createdAt)}</strong>
          </p>
          <div className="pa-item-actions">
            <button
              className="pa-item-view-btn"
              onClick={() => onSelect(property)}
            >
              <i className="fas fa-eye" style={{ marginRight: "8px" }}></i>
              View Details
            </button>
            {approvalStatus === 'pending' && (
              <>
                <button
                  className="pa-item-approve-btn"
                  onClick={() => onApprove(_id)}
                  disabled={isProcessing}
                >
                  <i className="fas fa-check"></i> 
                  {isProcessing ? 'Processing...' : 'Approve'}
                </button>
                <button
                  className="pa-item-reject-btn"
                  onClick={() => onReject(property)}
                  disabled={isProcessing}
                >
                  <i className="fas fa-times"></i> Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const PropertyApproval = ({ properties = [] }) => {
  const [activeTab, setActiveTab] = useState("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.stats) {
          const { pendingProperties = [], approvedProperties = [], rejectedProperties = [] } = result.data.stats;
          const combinedProperties = [
            ...pendingProperties.map(p => ({ ...p, approvalStatus: 'pending' })),
            ...approvedProperties.map(p => ({ ...p, approvalStatus: 'approved' })),
            ...rejectedProperties.map(p => ({ ...p, approvalStatus: 'rejected' }))
          ];
          setAllProperties(combinedProperties);
        }
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setStatusMessage({
        type: 'error',
        text: 'Failed to fetch properties'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleApprove = async (propertyId) => {
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/property/admin/approve/${propertyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notes: 'Approved by admin' })
      });

      if (response.ok) {
        setStatusMessage({
          type: 'success',
          text: 'Property approved successfully! It will now appear in the seller\'s "My Properties" section.'
        });
        
        // Update the property status in the current list instead of removing it
        setAllProperties(prev => prev.map(p => 
          p._id === propertyId 
            ? { ...p, approvalStatus: 'approved' }
            : p
        ));
        
        setTimeout(() => {
          setStatusMessage({ type: '', text: '' });
        }, 5000);
      } else {
        throw new Error('Failed to approve property');
      }
    } catch (error) {
      console.error('Error approving property:', error);
      setStatusMessage({
        type: 'error',
        text: 'Failed to approve property'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = (property) => {
    setSelectedProperty(property);
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionNotes.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please provide rejection notes'
      });
      return;
    }

    try {
      setIsProcessing(true);
      const response = await fetch(`/api/property/admin/reject/${selectedProperty._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notes: rejectionNotes })
      });      if (response.ok) {
        setStatusMessage({
          type: 'success',
          text: 'Property rejected successfully! The seller has been notified.'
        });
        
        // Update the property status in the current list
        setAllProperties(prev => prev.map(p => 
          p._id === selectedProperty._id 
            ? { ...p, approvalStatus: 'rejected', adminNotes: rejectionNotes }
            : p
        ));
        setRejectModalOpen(false);
        setRejectionNotes('');
        
        setTimeout(() => {
          setStatusMessage({ type: '', text: '' });
        }, 5000);
      } else {
        throw new Error('Failed to reject property');
      }
    } catch (error) {
      console.error('Error rejecting property:', error);
      setStatusMessage({
        type: 'error',
        text: 'Failed to reject property'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProperties = allProperties.filter(
    (p) => activeTab === 'all' || p.approvalStatus === activeTab
  );

  const counts = allProperties.reduce(
    (acc, p) => {
      acc[p.approvalStatus] = (acc[p.approvalStatus] || 0) + 1;
      acc.all += 1;
      return acc;
    },
    { all: 0, pending: 0, approved: 0, rejected: 0 }
  );
  const handleOpenModal = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  if (loading) {
    return (
      <section id="property-approval" className="pa-section">
        <div className="dash-section-header">
          <h2>Property Approval</h2>
          <p>Review new property listings submitted by sellers.</p>
        </div>
        <div className="dash-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading properties...</p>
        </div>
      </section>
    );  }

  return (
    <section id="property-approval" className="pa-section">
      <div className="dash-section-header">
        <h2>Property Approval</h2>
        <p>Review new property listings submitted by sellers.</p>
      </div>

      {/* Status Message */}
      {statusMessage.text && (
        <div className={`dash-alert dash-alert-${statusMessage.type}`}>
          <i className={`fas ${statusMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
          {statusMessage.text}
          <button 
            onClick={() => setStatusMessage({ type: '', text: '' })}
            className="dash-alert-close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="pa-header">
        <div className="pa-filters">
          <label htmlFor="filter-status">Filter by:</label>
          <select
            id="filter-status"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <label htmlFor="filter-type">Property Type:</label>
          <select id="filter-type">
            <option value="all">All Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
          </select>
        </div>
        <div className="pa-search">
          <input type="text" placeholder="Search by title or location" />
          <button>
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      <div className="pa-stats-grid">
        <div
          className={`pa-stat-card ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <div className="pa-stat-icon all">
            <i className="fas fa-list"></i>
          </div>
          <div className="pa-stat-info">
            <h4>{counts.all}</h4>
            <p>All</p>
          </div>
        </div>
        <div
          className={`pa-stat-card ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <div className="pa-stat-icon pending">
            <i className="fas fa-clock"></i>
          </div>
          <div className="pa-stat-info">
            <h4>{counts.pending}</h4>
            <p>Pending</p>
          </div>
        </div>
        <div
          className={`pa-stat-card ${activeTab === "approved" ? "active" : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          <div className="pa-stat-icon approved">
            <i className="fas fa-check"></i>
          </div>
          <div className="pa-stat-info">
            <h4>{counts.approved}</h4>
            <p>Approved</p>
          </div>
        </div>
        <div
          className={`pa-stat-card ${activeTab === "rejected" ? "active" : ""}`}
          onClick={() => setActiveTab("rejected")}
        >
          <div className="pa-stat-icon rejected">
            <i className="fas fa-times"></i>
          </div>
          <div className="pa-stat-info">
            <h4>{counts.rejected}</h4>
            <p>Rejected</p>
          </div>
        </div>
      </div>      <div className="pa-list">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((prop) => (
            <PropertyListItem
              key={prop._id}
              property={prop}
              onSelect={handleOpenModal}
              onApprove={handleApprove}
              onReject={handleRejectClick}
              isProcessing={isProcessing}
            />
          ))
        ) : (
          <div className="pa-empty-state">
            <i className="fas fa-home"></i>
            <h3>No {activeTab === 'all' ? '' : activeTab} Properties</h3>
            <p>
              {activeTab === 'pending' 
                ? 'All property applications have been reviewed.' 
                : `No ${activeTab} properties found.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Property Review Modal */}
      {isModalOpen && (
        <PropertyReviewModal
          property={selectedProperty}
          onClose={handleCloseModal}
        />
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div className="dash-modal show">
          <div className="dash-modal-content">
            <span
              className="dash-close-modal"
              onClick={() => setRejectModalOpen(false)}
            >
              &times;
            </span>
            <h3>Reject Property: {selectedProperty?.title}</h3>
            <p>
              Please provide a reason for rejection (this will be sent to the seller).
            </p>
            <div className="dash-form-group">
              <label htmlFor="rejectionNotes">Rejection Notes</label>
              <textarea
                id="rejectionNotes"
                rows="4"
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="e.g., Property description is insufficient, please provide more details."
              ></textarea>
            </div>
            <div className="dash-form-actions">
              <button
                onClick={handleReject}
                className="dash-submit-btn dash-reject-btn"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Rejection'}
              </button>
              <button
                type="button"
                className="dash-reset-btn"
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PropertyApproval;
