import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./propertyCard.css";

const PropertyCard = ({
  propertyId,
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
  const navigate = useNavigate();
  const [isInCompareList, setIsInCompareList] = useState(false);
  const [compareCount, setCompareCount] = useState(0);

  useEffect(() => {
    // Only proceed if propertyId is valid
    if (!propertyId) {
      console.warn(
        "PropertyCard: propertyId is missing or invalid:",
        propertyId
      );
      return;
    }

    // Check if property is already in compare list
    const compareList = JSON.parse(localStorage.getItem("compareList")) || [];
    setIsInCompareList(compareList.some((item) => item.id === propertyId));
    setCompareCount(compareList.length);
  }, [propertyId]);

  const handleAddToCompare = () => {
    // Validate propertyId exists
    if (!propertyId) {
      console.error(
        "PropertyCard: Cannot add to compare - propertyId is missing"
      );
      toast.error("Property ID is missing");
      return;
    }

    const compareList = JSON.parse(localStorage.getItem("compareList")) || [];

    // Check if already in compare list
    if (compareList.some((item) => item.id === propertyId)) {
      toast.error("Property already in comparison list");
      return;
    }

    // Check if compare list is full (max 4 properties)
    if (compareList.length >= 4) {
      toast.error("You can compare up to 4 properties at a time");
      return;
    }

    // Add property to compare list with validation
    const propertyData = {
      id: propertyId,
      title: title || "Unknown Property",
      price: price || "Price not available",
      image: imageUrl || "/assets/property-1.jpg",
      location: location || "Location not specified",
    };

    console.log("Adding property to compare list:", propertyData);

    compareList.push(propertyData);
    localStorage.setItem("compareList", JSON.stringify(compareList));

    setIsInCompareList(true);
    setCompareCount(compareList.length);

    // Trigger floating button update
    window.dispatchEvent(new CustomEvent("compareListUpdated"));

    toast.success(`${title || "Property"} added to comparison list`);
  };

  const handleRemoveFromCompare = () => {
    if (!propertyId) {
      console.error(
        "PropertyCard: Cannot remove from compare - propertyId is missing"
      );
      return;
    }

    let compareList = JSON.parse(localStorage.getItem("compareList")) || [];
    const originalLength = compareList.length;
    compareList = compareList.filter((item) => item.id !== propertyId);

    console.log("Removing property from compare list:", propertyId);
    console.log("Before:", originalLength, "After:", compareList.length);

    localStorage.setItem("compareList", JSON.stringify(compareList));
    setIsInCompareList(false);
    setCompareCount(compareList.length);

    // Trigger floating button update
    window.dispatchEvent(new CustomEvent("compareListUpdated"));

    toast.success(`${title || "Property"} removed from comparison list`);
  };

  const handleGoToCompare = () => {
    navigate("/properties/compare");
  };
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
              {/* <ion-icon name="location"></ion-icon> */}
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
            {isInCompareList ? (
              <button
                className="prop-card-footer-actions-btn prop-card-compare-btn added"
                onClick={handleRemoveFromCompare}
                title="Remove from comparison"
              >
                <ion-icon name="checkmark-circle"></ion-icon>
              </button>
            ) : (
              <button
                className="prop-card-footer-actions-btn prop-card-compare-btn"
                onClick={handleAddToCompare}
                title="Add to comparison"
              >
                <ion-icon name="git-compare-outline"></ion-icon>
              </button>
            )}
            {compareCount > 0 && (
              <button
                className="prop-card-compare-count-btn"
                onClick={handleGoToCompare}
                title={`Compare ${compareCount} properties`}
              >
                <span className="compare-count">{compareCount}</span>
                <ion-icon name="git-compare"></ion-icon>
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default PropertyCard;
