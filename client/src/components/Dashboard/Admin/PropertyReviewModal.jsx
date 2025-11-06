import React, { useState } from "react";
import "./PropertyReviewModal.css"; // <-- Import new CSS

const PropertyReviewModal = ({ property, onClose }) => {
  // Helper function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/assets/3.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return '/assets/3.jpg';
  };

  const [activeImage, setActiveImage] = useState(getImageUrl(property.images?.[0]));

  const details = {
    type: property.features?.type || property.type || "House",
    bedrooms: property.features?.beds || 0,
    bathrooms: property.features?.baths || 0,
    area: `${property.features?.sqft || 0} sqft`,
    status: property.tag === "sale" ? "For Sale" : "For Rent",
  };

  // Use actual property amenities or default list
  const amenities = property.amenities && property.amenities.length > 0 
    ? property.amenities 
    : [
        "A/C & Heating",
        "Swimming Pool",
        "Garden",
        "Security",
        "Parking",
        "Wifi",
        "Fireplace",
        "Play Ground",
      ];

  // Navigation functions for carousel
  const handlePrevImage = () => {
    const currentIndex = property.images.findIndex(img => getImageUrl(img) === activeImage);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : property.images.length - 1;
    setActiveImage(getImageUrl(property.images[prevIndex]));
  };

  const handleNextImage = () => {
    const currentIndex = property.images.findIndex(img => getImageUrl(img) === activeImage);
    const nextIndex = currentIndex < property.images.length - 1 ? currentIndex + 1 : 0;
    setActiveImage(getImageUrl(property.images[nextIndex]));
  };

  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <div
        className="review-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="review-modal-header">
          <h2>Property Review</h2>
          <button className="review-modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="review-modal-body">
          <div className="review-modal-carousel">
            <img
              src={activeImage}
              alt="Main property view"
              className="carousel-main-image"
              onError={(e) => {
                e.target.src = '/assets/3.jpg';
              }}
            />
            {property.images && property.images.length > 1 && (
              <>
                <button className="carousel-nav-btn prev" onClick={handlePrevImage}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button className="carousel-nav-btn next" onClick={handleNextImage}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </>
            )}
            <div className="carousel-thumbnails">
              {property.images && property.images.map((img, index) => (
                <img
                  key={index}
                  src={getImageUrl(img)}
                  alt={`Thumbnail ${index + 1}`}
                  className={`carousel-thumbnail ${
                    activeImage === getImageUrl(img) ? "active" : ""
                  }`}
                  onClick={() => setActiveImage(getImageUrl(img))}
                  onError={(e) => {
                    e.target.src = '/assets/3.jpg';
                  }}
                />
              ))}
            </div>
          </div>

          <div className="review-modal-info">
            <h3>{property.title}</h3>
            <span className="id">ID: {property._id}</span>
            <p className="location">
              <i
                className="fas fa-map-marker-alt"
                style={{ marginRight: "8px" }}
              ></i>
              {property.location}
            </p>
            <div className="price">{property.price}</div>

            <div className="review-modal-details-grid">
              <div className="review-modal-detail-group">
                <h4>Property Details</h4>
                <div className="review-modal-detail-item">
                  <span className="review-modal-detail-item-label">
                    Property Type:
                  </span>
                  <span className="review-modal-detail-item-value">
                    {details.type}
                  </span>
                </div>
                <div className="review-modal-detail-item">
                  <span className="review-modal-detail-item-label">
                    Bedrooms:
                  </span>
                  <span className="review-modal-detail-item-value">
                    {details.bedrooms}
                  </span>
                </div>
                <div className="review-modal-detail-item">
                  <span className="review-modal-detail-item-label">
                    Bathrooms:
                  </span>
                  <span className="review-modal-detail-item-value">
                    {details.bathrooms}
                  </span>
                </div>
                <div className="review-modal-detail-item">
                  <span className="review-modal-detail-item-label">Area:</span>
                  <span className="review-modal-detail-item-value">
                    {details.area}
                  </span>
                </div>
                <div className="review-modal-detail-item">
                  <span className="review-modal-detail-item-label">
                    Property Status:
                  </span>
                  <span className="review-modal-detail-item-value">
                    {details.status}
                  </span>
                </div>
              </div>
              <div className="review-modal-detail-group">
                <h4>Amenities</h4>
                <div className="review-modal-amenities-list">
                  {amenities.map((item) => (
                    <span className="review-modal-amenity" key={item}>
                      <i className="fas fa-check"></i> {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="review-modal-footer">
          <a
            href={`/property/${property._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="review-modal-footer-link"
          >
            <i className="fas fa-external-link-alt"></i> View Full Listing
          </a>
          <div className="review-modal-footer-actions">
            <button className="av-action-btn reject">
              <i className="fas fa-times"></i> Reject
            </button>
            <button className="av-action-btn approve">
              <i className="fas fa-check"></i> Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyReviewModal;
