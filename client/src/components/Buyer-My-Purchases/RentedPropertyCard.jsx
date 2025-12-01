const RentedPropertyCard = ({ property, onCancelRental, onPayRent, onContactLandlord }) => {
  return (
    <div className="property-card rented-card" data-type="rent" data-id={property.id}>
      <div className="property-image">
        <img 
          src={property.images && property.images[0] ? property.images[0] : '/images/property-placeholder.jpg'} 
          alt={property.title} 
        />
        <div className="property-tag rented">
          Rented
        </div>
      </div>
      <div className="property-details">
        <h3>{property.title}</h3>
        <p className="property-location">
          <i className="fas fa-map-marker-alt"></i>
          {property.location}
        </p>
        <div className="property-stats">
          <span><i className="fas fa-bed"></i> {property.features?.beds || 0} Beds</span>
          <span><i className="fas fa-bath"></i> {property.features?.baths || 0} Baths</span>
          <span><i className="fas fa-ruler-combined"></i> {property.features?.sqft || 0} sqft</span>
        </div>
        <div className="property-price">{property.price}</div>
        
        <div className="rental-actions">
          <button 
            className="pay-rent-btn"
            onClick={() => onPayRent(property.id)}
          >
            <i className="fas fa-credit-card"></i> Pay Rent
          </button>
          
          <button 
            className="contact-landlord-btn"
            onClick={() => onContactLandlord(property.landlordEmail)}
          >
            <i className="fas fa-envelope"></i> Contact Landlord
          </button>
          
          <button 
            className="cancel-agreement-btn"
            onClick={() => onCancelRental(property.id)}
          >
            <i className="fas fa-times-circle"></i> Cancel Agreement
          </button>
        </div>
        
        <div className="property-actions">
          <a href={`/property/${property.id}`} className="view-btn">
            <i className="fas fa-eye"></i> View Details
          </a>
        </div>
      </div>
    </div>
  );
};

export default RentedPropertyCard;
