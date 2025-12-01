const PropertyCard = ({ property }) => {
  const getStatusTag = () => {
    if (property.status === 'sold') return 'Purchased';
    if (property.status === 'rented') return 'Rented';
    return property.tag === 'rent' ? 'For Rent' : 'For Sale';
  };

  const getTagClass = () => {
    if (property.status === 'sold') return 'sold';
    if (property.status === 'rented') return 'rented';
    return property.tag === 'rent' ? 'rent' : 'sale';
  };

  return (
    <div className="property-card" data-type={property.tag || 'sale'} data-id={property.id}>
      <div className="property-image">
        <img 
          src={property.images && property.images[0] ? property.images[0] : '/images/property-placeholder.jpg'} 
          alt={property.title} 
        />
        <div className={`property-tag ${getTagClass()}`}>
          {getStatusTag()}
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
        <div className="property-actions">
          <a href={`/property/${property.id}`} className="view-btn">
            <i className="fas fa-eye"></i> View Details
          </a>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
