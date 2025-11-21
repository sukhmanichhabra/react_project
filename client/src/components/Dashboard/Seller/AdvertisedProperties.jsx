import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdvertisedPropertyCard from "./AdvertisedPropertyCard";
import { advertisingAPI } from "../../../services/api";
import "./AdvertisedProperties.css";

const AdvertisedProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdvertisedProperties();
  }, []);

  const fetchAdvertisedProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await advertisingAPI.getAdvertisedProperties();
      if (response.data.success) {
        setProperties(response.data.data.advertisedProperties || []);
      } else {
        setError(response.data.message || 'Failed to fetch advertised properties');
      }
    } catch (error) {
      console.error('Error fetching advertised properties:', error);
      setError(error.response?.data?.message || 'Failed to fetch advertised properties');
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
      if (response.data.success) {
        alert('Package cancelled successfully');
        await fetchAdvertisedProperties(); // Refresh the list
      } else {
        alert(response.data.message || 'Failed to cancel package');
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
      
      {error && (
        <div className="dash-error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="dash-loading">
          <i className="fas fa-spinner fa-spin"></i> Loading...
        </div>
      ) : (
        <div className="advertised-properties-grid">
          {properties.length > 0 ? (
            properties.map((property) => (
              <AdvertisedPropertyCard
                key={`${property._id}-${property.adPackage._id}`}
                property={property}
                isAdmin={false}
                onCancel={() => handleCancel(property.adPackage._id)}
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