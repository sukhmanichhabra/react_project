import React from "react";
import "../../styles/AgentDesc/AgentPropertyCard.css";

function AgentPropertyCard({ property }) {
  return (
    <div
      className="agt-desc-prop-card"
      data-type={property.tag} // Used by CSS for badge color
    >
      <div className="agt-desc-prop-card-image">
        <span className="agt-desc-prop-card-badge">
          {property.tag.toUpperCase() === "SALE" ? "FOR SALE" : "FOR RENT"}
        </span>
        <img
          src={
            property.images && property.images[0]
              ? property.images[0]
              : "/assets/property-1.jpg"
          }
          alt="Property"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/assets/property-1.jpg";
          }}
        />
        <div className="agt-desc-prop-card-link-container">
          <a
            href={`/property/${property._id}`}
            className="agt-desc-prop-card-link"
          >
            <i className="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
      <div className="agt-desc-prop-card-info">
        <h3 className="agt-desc-prop-card-price">
          {property.price ? property.price.toLocaleString() : "0"}
        </h3>
        <p className="agt-desc-prop-card-address">{property.location}</p>
      </div>
    </div>
  );
}

export default AgentPropertyCard;
