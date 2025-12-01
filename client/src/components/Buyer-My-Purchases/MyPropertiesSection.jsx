import { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';

const MyPropertiesSection = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      const response = await fetch('/property/my-purchases');
      const data = await response.json();
      
      if (data.success) {
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="my-properties" className="dashboard-section active">
      <div className="section-header">
        <h2>My Properties</h2>
      </div>

      <div className="properties-grid">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading properties...</p>
          </div>
        ) : properties.length > 0 ? (
          properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))
        ) : (
          <div className="no-properties">
            <i className="fas fa-home"></i>
            <h3>No Properties Found</h3>
            <p>You haven't purchased or rented any properties yet.</p>
            <a href="/property/list" className="browse-btn">
              <i className="fas fa-search"></i> Browse Properties
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyPropertiesSection;
