import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdvertisedPropertyCard from "./AdvertisedPropertyCard";
import advertisingAPI from "../../../services/advertisingAPI";
import "./AdvertisedProperties.css";

const AdvertisedProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPackages();
  }, []);

  const fetchMyPackages = async () => {
    try {
      setLoading(true);
      const response = await advertisingAPI.getMyPackages();
      if (response.success) {
        setProperties(response.packages || []);
      }
    } catch (error) {
      console.error('Error fetching advertising packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (advertisingId) => {
    if (!window.confirm("Are you sure you want to cancel this advertising package?")) {
      return;
    }

    try {
      const response = await advertisingAPI.cancelPackage(advertisingId);
      if (response.success) {
        alert('Package cancelled successfully');
        await fetchMyPackages(); // Refresh the list
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel package';
      alert(message);
    }
  };

  const handleCreateAdvertising = () => {
    navigate('/advertising');
  };

  return (
    <section
      id="advertised-properties"
      className="advertised-properties-section"
    >
      <div className="advertised-properties-header">
        <div>
          <h2>Advertised Properties</h2>
          <p>Manage your active advertising packages.</p>
        </div>
        <button className="dash-action-btn" onClick={handleCreateAdvertising}>
          <i className="fas fa-plus-circle"></i> Create New Advertisement
        </button>
      </div>
      
      {loading ? (
        <div className="dash-loading">
          <i className="fas fa-spinner fa-spin"></i> Loading...
        </div>
      ) : (
        <div className="advertised-properties-grid">
          {properties.length > 0 ? (
            properties.map((pkg) => (
              <AdvertisedPropertyCard
                key={pkg._id}
                property={pkg.property}
                advertising={pkg}
                isAdmin={false}
                onCancel={() => handleCancel(pkg._id)}
              />
            ))
          ) : (
            <div className="dash-empty-state">
              <i className="fas fa-ad"></i>
              <h3>No Advertised Properties</h3>
              <p>You have not purchased any advertising packages.</p>
              <button className="dash-action-btn" onClick={handleCreateAdvertising}>
                <i className="fas fa-plus-circle"></i> Create Your First Advertisement
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AdvertisedProperties;