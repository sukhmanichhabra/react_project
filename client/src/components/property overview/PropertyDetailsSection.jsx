import React, { useState } from 'react';

const PropertyDetailsSection = ({ property, amenities }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="prop-overview-details-container">
      {/* Property Features */}
      <div className="prop-overview-section-box">
        <h2>Property Features</h2>
        <p>Risk management and compliance, when approached strategically, have the potential to go beyond mitigating threats.</p>

        {/* Property Details Section */}
        <div className={`prop-overview-drop ${openDropdown === 'property' ? 'open' : ''}`}>
          <div className="prop-overview-drop-header" onClick={() => toggleDropdown('property')}>
            <span><i className="fas fa-home"></i> Property Details</span>
            <div className="prop-overview-drop-icon">{openDropdown === 'property' ? '-' : '+'}</div>
          </div>
          <div className="prop-overview-drop-content">
            <div className="prop-overview-details-grid">
              <p>Property ID: <strong>#{property.id}</strong></p>
              <p>Property Type: <strong>{property.features.type}</strong></p>
              <p>Bedrooms: <strong>{property.features.beds}</strong></p>
              <p>Bathrooms: <strong>{property.features.baths}</strong></p>
              <p>Total Area: <strong>{property.features.sqft} sqft</strong></p>
              <p>Year Built: <strong>2020</strong></p>
              <p>Parking Spaces: <strong>2 Cars</strong></p>
              <p>Property Status: <strong>{property.tag === 'rent' ? 'For Rent' : 'For Sale'}</strong></p>
              <p>Floor Level: <strong>3rd Floor</strong></p>
              <p>Furnishing: <strong>Semi-Furnished</strong></p>
            </div>
          </div>
        </div>

        {/* Utility Details Section */}
        <div className={`prop-overview-drop ${openDropdown === 'utility' ? 'open' : ''}`}>
          <div className="prop-overview-drop-header" onClick={() => toggleDropdown('utility')}>
            <span><i className="fas fa-bolt"></i> Utility Details</span>
            <div className="prop-overview-drop-icon">{openDropdown === 'utility' ? '-' : '+'}</div>
          </div>
          <div className="prop-overview-drop-content">
            <div className="prop-overview-details-grid">
              <p>Electricity: <strong>24/7 Supply</strong></p>
              <p>Water Supply: <strong>Municipal + Bore</strong></p>
              <p>Internet: <strong>Fiber Optic Ready</strong></p>
              <p>Gas Connection: <strong>Available</strong></p>
              <p>Security: <strong>24/7 CCTV</strong></p>
              <p>Maintenance: <strong>Monthly</strong></p>
              <p>Backup Power: <strong>100% Coverage</strong></p>
              <p>Waste Management: <strong>Daily Collection</strong></p>
              <p>Air Conditioning: <strong>Central System</strong></p>
              <p>Heating System: <strong>Floor Heating</strong></p>
            </div>
          </div>
        </div>

        {/* Location Details Section */}
        <div className={`prop-overview-drop ${openDropdown === 'location' ? 'open' : ''}`}>
          <div className="prop-overview-drop-header" onClick={() => toggleDropdown('location')}>
            <span><i className="fas fa-map-marker-alt"></i> Location Details</span>
            <div className="prop-overview-drop-icon">{openDropdown === 'location' ? '-' : '+'}</div>
          </div>
          <div className="prop-overview-drop-content">
            <div className="prop-overview-details-grid">
              <p>Address: <strong>{property.location}</strong></p>
              <p>City: <strong>Goa</strong></p>
              <p>State: <strong>Goa</strong></p>
              <p>Zip Code: <strong>403516</strong></p>
              <p>Neighborhood: <strong>Baga Beach Area</strong></p>
              <p>Near School: <strong>500m</strong></p>
              <p>Near Hospital: <strong>1.2km</strong></p>
              <p>Near Shopping: <strong>800m</strong></p>
              <p>Public Transport: <strong>Excellent</strong></p>
              <p>Beach Access: <strong>Direct</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="prop-overview-section-box">
        <h2>Amenities</h2>
        <ul className="prop-overview-amenities-list">
          {amenities.map((amenity, index) => (
            <li key={index}>
              <i className="fas fa-check"></i> {amenity}
            </li>
          ))}
        </ul>
      </div>

      {/* Video Tour */}
      <div className="prop-overview-section-box">
        <h2>Video Tour</h2>
        <div className="prop-overview-video-tour-container">
          <div className="prop-overview-video-thumbnail">
            <img 
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=675&fit=crop" 
              alt="Property Video Tour"
            />
            <div className="prop-overview-play-button-overlay">
              <button className="prop-overview-play-button" aria-label="Play Video">
                <i className="fas fa-play"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floor Plans */}
      <div className="prop-overview-section-box">
        <h2>Floor Plan</h2>
        <div className="prop-overview-floor-plan-container">
          <img 
            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=800&fit=crop" 
            alt="Property Floor Plan"
            className="prop-overview-floor-plan-image"
          />
        </div>
      </div>

      {/* What's Nearby */}
      <div className="prop-overview-section-box">
        <h2>What's Nearby</h2>
        <p style={{ color: '#888', fontSize: '15px', marginBottom: '30px' }}>
          Risk management and compliance, when approached strategically, have the potential to go beyond mitigating threats.
        </p>
        <div className="prop-overview-nearby-places">
          <div className="prop-overview-nearby-item">
            <p className="prop-overview-nearby-label">School & College:</p>
            <p className="prop-overview-nearby-distance">0.9km</p>
          </div>
          <div className="prop-overview-nearby-item">
            <p className="prop-overview-nearby-label">Grocery Center:</p>
            <p className="prop-overview-nearby-distance">0.2km</p>
          </div>
          <div className="prop-overview-nearby-item">
            <p className="prop-overview-nearby-label">Metro Station:</p>
            <p className="prop-overview-nearby-distance">0.7km</p>
          </div>
          <div className="prop-overview-nearby-item">
            <p className="prop-overview-nearby-label">Gym:</p>
            <p className="prop-overview-nearby-distance">2.3km</p>
          </div>
          <div className="prop-overview-nearby-item">
            <p className="prop-overview-nearby-label">University:</p>
            <p className="prop-overview-nearby-distance">2.7km</p>
          </div>
          <div className="prop-overview-nearby-item">
            <p className="prop-overview-nearby-label">Hospital:</p>
            <p className="prop-overview-nearby-distance">1.7km</p>
          </div>
          <div className="prop-overview-nearby-item">
            <p className="prop-overview-nearby-label">Shopping Mall:</p>
            <p className="prop-overview-nearby-distance">1.1km</p>
          </div>
          <div className="prop-overview-nearby-item">
            <p className="prop-overview-nearby-label">Police Station:</p>
            <p className="prop-overview-nearby-distance">1.2km</p>
          </div>
          <div className="prop-overview-nearby-item">
            <p className="prop-overview-nearby-label">Bus Station:</p>
            <p className="prop-overview-nearby-distance">1.1km</p>
          </div>
          <div className="prop-overview-nearby-item">
            <p className="prop-overview-nearby-label">River:</p>
            <p className="prop-overview-nearby-distance">3.1km</p>
          </div>
          <div className="prop-overview-nearby-item">
            <p className="prop-overview-nearby-label">Market:</p>
            <p className="prop-overview-nearby-distance">3.4km</p>
          </div>
        </div>
      </div>

      <div className="prop-overview-section-box">
        <h2>Map Location</h2>
        <div className="prop-overview-map-container">
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location || 'India')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            width="100%"
            height="450"
            style={{ border: 0, borderRadius: '12px' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Property Location Map"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsSection;