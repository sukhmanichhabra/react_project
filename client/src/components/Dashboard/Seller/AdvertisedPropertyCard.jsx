import React from "react";
import { Link } from "react-router-dom";
import "./AdvertisedPropertyCard.css"; // <-- Import new CSS

const AdvertisedPropertyCard = ({
  property,
  isAdmin,
  onApprove,
  onReject,
  onCancel,
}) => {
  // Calculate time remaining or get sold status
  const getProgress = () => {
    // Check if property is sold
    if (property.status === "sold") {
      return { 
        width: "0%", 
        text: "SOLD", 
        color: "red",
        isSold: true 
      };
    }

    if (!property.adPackage || !property.adPackage.startDate) {
        return { 
          width: "100%", 
          text: "Pending Approval", 
          color: "yellow",
          isSold: false 
        };
    }

    const start = new Date(property.adPackage.startDate).getTime();
    const end = new Date(property.adPackage.endDate).getTime();
    const now = new Date().getTime();

    const totalDuration = end - start;
    const elapsed = now - start;
    const percentage = Math.max(
      0,
      Math.min(100, (elapsed / totalDuration) * 100)
    );

    const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    let text = `${daysRemaining} days remaining`;
    let color = "green";

    if (daysRemaining <= 0) {
      text = "Expired";
      color = "red";
    } else if (daysRemaining <= 7) {
      color = "yellow";
    }

    return { 
      width: `${100 - percentage}%`, 
      text, 
      color,
      isSold: false 
    };
  };

  const { width, text, color, isSold } = getProgress();

  return (
    <div className="dash-property-card">
      <figure className="dash-property-image">
        <Link to={`/property/${property._id}`}>
          <img
            src={property.images[0] || "/assets/property-1.jpg"}
            alt={property.title}
          />
        </Link>
        <span className="dash-advertising-badge">
          <i className="fas fa-star"></i>{" "}
          {property.adPackage?.name || "Pending"}
        </span>
      </figure>
      <div className="dash-property-details">
        <h3>
          <Link to={`/property/${property._id}`}>{property.title}</Link>
        </h3>
        <p className="dash-property-location">
          <i className="fas fa-map-marker-alt"></i>
          {property.location}
        </p>
        <p className="dash-property-price">{property.price}</p>

        <div className="dash-property-features">
          <span>
            <i className="fas fa-bed"></i> {property.features?.beds || 0}
          </span>
          <span>
            <i className="fas fa-bath"></i> {property.features?.baths || 0}
          </span>
          <span>
            <i className="fas fa-ruler-combined"></i> {property.features?.sqft || 0}
            sqft
          </span>
        </div>

        <div className="dash-advertising-details">
          <div className="dash-package-info">
            <p>
              Package:{" "}
              <strong>{property.adPackage?.name || "Pending Approval"}</strong>
            </p>
            <p>
              Status: <strong>{property.status || "Pending"}</strong>
            </p>
          </div>
          {isSold ? (
            <div className="dash-sold-badge-container">
              <span className="dash-sold-badge">
                <i className="fas fa-check-circle"></i> SOLD
              </span>
            </div>
          ) : (
            <div className="dash-time-remaining-container">
              <span className="dash-time-remaining-text">{text}</span>
              <div className="dash-time-remaining-bar">
                <div
                  className={`dash-time-remaining-progress dash-progress-${color}`}
                  style={{ width }}
                ></div>
              </div>
            </div>
          )}

          {isAdmin ? (
            <div className="dash-admin-actions">
              <button
                onClick={() => onApprove(property._id)}
                className="dash-action-btn dash-approve-btn"
              >
                <i className="fas fa-check"></i> Approve
              </button>
              <button
                onClick={() => onReject(property._id)}
                className="dash-action-btn dash-reject-btn"
              >
                <i className="fas fa-times"></i> Reject
              </button>
            </div>
          ) : !isSold && (
            <button
              onClick={() => onCancel(property._id)}
              className="dash-cancel-package-btn"
            >
              <i className="fas fa-times-circle"></i> Cancel Package
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvertisedPropertyCard;