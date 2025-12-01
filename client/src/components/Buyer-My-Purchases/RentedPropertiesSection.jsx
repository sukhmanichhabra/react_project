import { useState, useEffect } from 'react';
import RentedPropertyCard from './RentedPropertyCard';

const RentedPropertiesSection = () => {
  const [rentedProperties, setRentedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentedProperties();
  }, []);

  const fetchRentedProperties = async () => {
    try {
      const response = await fetch('/property/my-rented');
      const data = await response.json();
      
      if (data.success) {
        const rented = (data.properties || []).filter(
          property => property.status === 'rented' && property.tag === 'rent'
        );
        setRentedProperties(rented);
      }
    } catch (error) {
      console.error('Error fetching rented properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRental = async (propertyId) => {
    if (!confirm('Are you sure you want to cancel this rental agreement? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/property/${propertyId}/cancel-rental`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = await response.json();

      if (data.success) {
        alert('Rental agreement cancelled successfully.');
        fetchRentedProperties();
      } else {
        alert(data.message || 'Failed to cancel rental agreement');
      }
    } catch (error) {
      console.error('Error cancelling rental agreement:', error);
      alert('An error occurred while cancelling the rental agreement. Please try again later.');
    }
  };

  const handlePayRent = (propertyId) => {
    window.location.href = `/property/${propertyId}/pay-rent`;
  };

  const handleContactLandlord = (landlordEmail) => {
    if (landlordEmail) {
      window.location.href = `mailto:${landlordEmail}?subject=Regarding%20Your%20Rental%20Property`;
    } else {
      alert('Landlord email is not available. Please contact the site administrator for assistance.');
    }
  };

  return (
    <section id="rented-properties" className="dashboard-section active">
      <div className="section-header">
        <h2>My Rented Properties</h2>
        <p>View and manage your rented properties</p>
      </div>

      <div className="properties-grid">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading rented properties...</p>
          </div>
        ) : rentedProperties.length > 0 ? (
          rentedProperties.map(property => (
            <RentedPropertyCard 
              key={property.id} 
              property={property}
              onCancelRental={handleCancelRental}
              onPayRent={handlePayRent}
              onContactLandlord={handleContactLandlord}
            />
          ))
        ) : (
          <div className="no-properties">
            <i className="fas fa-home"></i>
            <h3>No Rented Properties</h3>
            <p>You don't have any active rental agreements.</p>
            <a href="/property/list" className="browse-btn">
              <i className="fas fa-search"></i> Browse Rental Properties
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default RentedPropertiesSection;
