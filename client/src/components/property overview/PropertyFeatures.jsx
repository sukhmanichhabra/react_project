import React from 'react';

const PropertyFeatures = ({ features }) => {
  return (
    <div className="prop-overview-features">
      <div className="prop-overview-features-item">
        <i className="fa-solid fa-ruler-combined"></i>
        <p>Sqft.<span> {features.sqft}</span></p>
      </div>
      <div className="prop-overview-features-divider"></div>

      <div className="prop-overview-features-item">
        <i className="fa-solid fa-bed"></i>
        <p>Bed.<span> {features.beds}</span></p>
      </div>
      <div className="prop-overview-features-divider"></div>

      <div className="prop-overview-features-item">
        <i className="fa-solid fa-bath"></i>
        <p>Bath.<span> {features.baths}</span></p>
      </div>
      <div className="prop-overview-features-divider"></div>

      <div className="prop-overview-features-item">
        <i className="fa-solid fa-utensils"></i>
        <p>Kitchen.<span> {features.kitchen}</span></p>
      </div>
      <div className="prop-overview-features-divider"></div>

      <div className="prop-overview-features-item">
        <i className="fa-solid fa-building"></i>
        <p>Type.<span> {features.type}</span></p>
      </div>
    </div>
  );
};

export default PropertyFeatures;