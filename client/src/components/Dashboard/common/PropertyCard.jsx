import React from "react";
import { Link } from "react-router-dom";
import "./PropertyCard.css";

const SimplePropertyCard = ({ property }) => {
  // Logic to determine the tag
  const getTag = () => {
    if (property.tag === "sale") {
      return <span className="dash-property-tag purchased">Purchased</span>;
    }
    if (property.tag === "rent") {
      return <span className="dash-property-tag rented">Rented</span>;
    }
    // Fallback for other tags
    return <span className="dash-property-tag rented">{property.tag}</span>;
  };

  // Logic to format the price
  const getPrice = () => {
    const price = parseInt(property.price);
    if (isNaN(price)) {
      return <div className="dash-property-price">{property.price}</div>; // Return as is if not a number
    }

    if (
      property.tag === "rent" ||
      (typeof property.price === "string" && property.price.includes("/month"))
    ) {
      return (
        <div className="dash-property-price">
          ₹{price.toLocaleString()}/month
        </div>
      );
    }

    // Default to purchase price
    return <div className="dash-property-price">${price.toLocaleString()}</div>;
  };

  return (
    <div className="dash-property-card">
      <figure className="dash-property-image">
        <Link to={`/property/${property._id}`}>
          <img
            src={property.images[0] || "/assets/property-1.jpg"}
            alt={property.title}
          />
        </Link>
        {getTag()}
      </figure>
      <div className="dash-property-content">
        <h3 className="dash-property-title">
          <Link to={`/property/${property._id}`}>{property.title}</Link>
        </h3>
        <p className="dash-property-location">
          <i className="fas fa-map-marker-alt"></i>
          <span>{property.location}</span>
        </p>

        {/* --- NEW SECTION from screenshot --- */}
        <div className="dash-property-details">
          {property.beds && (
            <span>
              <i className="fas fa-bed"></i> {property.beds} Beds
            </span>
          )}
          {property.baths && (
            <span>
              <i className="fas fa-bath"></i> {property.baths} Baths
            </span>
          )}
          {property.sqft && (
            <span>
              <i className="fas fa-ruler-combined"></i> {property.sqft} sqft
            </span>
          )}
        </div>
        {/* --- END NEW SECTION --- */}

        {getPrice()}

        <div className="dash-property-actions">
          <Link
            to={`/property/${property._id}`}
            className="dash-view-details-btn"
          >
            <i className="fas fa-eye" style={{ marginRight: "8px" }}></i>
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SimplePropertyCard;
