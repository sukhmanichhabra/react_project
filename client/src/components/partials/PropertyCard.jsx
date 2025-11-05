import React from "react";
import { Link } from "react-router-dom";
import "./propertyCard.css";

const PropertyCard = ({
  propertyType,
  amenities = [],
  badge,
  badgeText,
  location,
  imagesCount,
  imageUrl,
  price,
  title,
  overviewLink,
  description,
  bedrooms,
  bathrooms,
  squareFeet,
  agentImage,
  agentLink,
  agentName,
}) => {
  return (
    <li>
      <div
        className="prop-card-card"
        data-property-type={propertyType}
        data-amenities={JSON.stringify(amenities)}
      >
        <figure className="prop-card-banner">
          <div className={`prop-card-badge ${badge}`}>{badgeText}</div>
          <div className="prop-card-banner-actions">
            <button className="prop-card-banner-actions-btn">
              <ion-icon name="location"></ion-icon>
              <address>{location}</address>
            </button>
            <button className="prop-card-banner-actions-btn">
              <ion-icon name="camera"></ion-icon>
              <span>{imagesCount}</span>
            </button>
          </div>
          <img src={imageUrl} alt={title} className="prop-card-w-100" />
        </figure>
        <div className="prop-card-content">
          <div className="prop-card-price">
            <strong>
              {typeof price === "number" ? price.toLocaleString() : price}
            </strong>
            {badge === "rent" && (
              <span className="prop-card-price-period">/month</span>
            )}
          </div>
          <h3 className="prop-card-h3 prop-card-title">
            <Link to={overviewLink}>{title}</Link>
          </h3>
          <p className="prop-card-text">{description}</p>
          <ul className="prop-card-list">
            <li className="prop-card-item">
              <strong>{bedrooms}</strong>
              <ion-icon name="bed-outline"></ion-icon>
              <span>Bedrooms</span>
            </li>
            <li className="prop-card-item">
              <strong>{bathrooms}</strong>
              <ion-icon name="man-outline"></ion-icon>
              <span>Bathrooms</span>
            </li>
            <li className="prop-card-item">
              <strong>{squareFeet}</strong>
              <ion-icon name="square-outline"></ion-icon>
              <span>Square Ft</span>
            </li>
          </ul>
        </div>
        <div className="prop-card-footer">
          <div className="prop-card-author">
            <figure className="prop-card-author-avatar">
              <img
                src={agentImage}
                alt={agentName}
                className="prop-card-w-100"
              />
            </figure>
            <div>
              <p className="prop-card-author-name">
                <Link to={agentLink}>{agentName}</Link>
              </p>
              <p className="prop-card-author-title">Estate Agent</p>
            </div>
          </div>
          <div className="prop-card-footer-actions">
            <button className="prop-card-footer-actions-btn">
              <ion-icon name="resize-outline"></ion-icon>
            </button>
            <button className="prop-card-footer-actions-btn">
              <ion-icon name="heart-outline"></ion-icon>
            </button>
            <button className="prop-card-footer-actions-btn">
              <ion-icon name="add-circle-outline"></ion-icon>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

export default PropertyCard;
