import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./EnhancedPropertyCard.css";

const EnhancedPropertyCard = ({
  propertyType,
  amenities = [],
  badge,
  badgeText,
  location,
  imagesCount,
  videosCount,
  imageUrl,
  price,
  title,
  overviewLink,
  description,
  bedrooms,
  bathrooms,
  squareFeet,
  agentImage,
  agentName,
  agentId,
  agentLink,
  id,
  status = 'active'
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    setIsLoading(true);
    try {
      setIsWishlisted(!isWishlisted);
      showNotification(
        isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
        'success'
      );
    } catch (error) {
      console.error('Wishlist error:', error);
      showNotification('Failed to update wishlist', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle agent contact
  const handleContactAgent = () => {
    if (agentId) {
      // Navigate to agent contact or open modal
      window.location.href = `mailto:agent@example.com?subject=Inquiry about ${title}`;
    }
    showNotification('Opening contact form...', 'info');
  };

  // Handle view property
  const handleViewProperty = () => {
    showNotification('Loading property details...', 'info');
  };

  // Notification system
  const showNotification = (message, type = 'info') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `enhanced-notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  return (
    <li className="enhanced-property-item">
      <div 
        className="enhanced-property-card" 
        data-property-type={propertyType}
        data-tag={badge}
        data-amenities={amenities.join(',')}
        data-status={status}
      >
        {/* Property Image Section */}
        <div className="enhanced-property-image-container">
          <div className={`enhanced-property-badge ${badge}`}>
            {badgeText}
          </div>
          
          {/* Property Status Overlay */}
          {status !== 'active' && (
            <div className={`enhanced-property-status-overlay ${status}`}>
              <span className="enhanced-status-text">
                {status === 'sold' ? 'SOLD' : 'RENTED'}
              </span>
            </div>
          )}
          
          {/* Image with overlay actions */}
          <div className="enhanced-property-image-wrapper">
            <img 
              src={imageUrl || '/assets/default-property.jpg'} 
              alt={title} 
              className="enhanced-property-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/default-property.jpg';
              }}
            />
            
            {/* Quick Action Buttons */}
            <div className="enhanced-property-quick-actions">
              <button 
                className={`enhanced-quick-action-btn enhanced-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlistToggle}
                disabled={isLoading}
                title="Add to Wishlist"
              >
                <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart`}></i>
              </button>
              <button className="enhanced-quick-action-btn enhanced-share-btn" title="Share Property">
                <i className="fas fa-share-alt"></i>
              </button>
            </div>
            
            {/* Media Count Overlay */}
            {(imagesCount > 0 || videosCount > 0) && (
              <div className="enhanced-media-count">
                {imagesCount > 0 && (
                  <span className="enhanced-media-item">
                    <i className="fas fa-camera"></i>
                    {imagesCount}
                  </span>
                )}
                {videosCount > 0 && (
                  <span className="enhanced-media-item">
                    <i className="fas fa-video"></i>
                    {videosCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Property Content Section */}
        <div className="enhanced-property-content">
          {/* Price and Title */}
          <div className="enhanced-property-header">
            <h3 className="enhanced-property-title">{title}</h3>
            <div className="enhanced-property-price">
              {typeof price === 'string' ? price : `$${price?.toLocaleString() || '0'}`}
              {badge === 'rent' && !price?.toString().includes('/month') && '/month'}
            </div>
          </div>
          
          {/* Location */}
          <div className="enhanced-property-location">
            <i className="fas fa-map-marker-alt"></i>
            <span>{location}</span>
          </div>
          
          {/* Property Features Grid */}
          <div className="enhanced-property-features">
            <div className="enhanced-feature-item">
              <i className="fas fa-bed"></i>
              <div className="enhanced-feature-details">
                <span className="enhanced-feature-value">{bedrooms || 0}</span>
                <span className="enhanced-feature-label">Bedrooms</span>
              </div>
            </div>
            
            <div className="enhanced-feature-item">
              <i className="fas fa-bath"></i>
              <div className="enhanced-feature-details">
                <span className="enhanced-feature-value">{bathrooms || 0}</span>
                <span className="enhanced-feature-label">Bathrooms</span>
              </div>
            </div>
            
            <div className="enhanced-feature-item">
              <i className="fas fa-ruler-combined"></i>
              <div className="enhanced-feature-details">
                <span className="enhanced-feature-value">
                  {squareFeet ? squareFeet.toLocaleString() : '0'}
                </span>
                <span className="enhanced-feature-label">Sq Ft</span>
              </div>
            </div>
            
            <div className="enhanced-feature-item">
              <i className="fas fa-home"></i>
              <div className="enhanced-feature-details">
                <span className="enhanced-feature-value">{propertyType}</span>
                <span className="enhanced-feature-label">Type</span>
              </div>
            </div>
          </div>
          
          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="enhanced-property-amenities">
              {amenities.slice(0, 3).map((amenity, index) => (
                <span key={index} className="enhanced-amenity-tag">{amenity}</span>
              ))}
              {amenities.length > 3 && (
                <span className="enhanced-amenity-more">+{amenities.length - 3} more</span>
              )}
            </div>
          )}
          
          {/* Agent Information */}
          <div className="enhanced-agent-info">
            <div className="enhanced-agent-avatar">
              {agentImage ? (
                <img src={agentImage} alt={agentName} />
              ) : (
                <i className="fas fa-user"></i>
              )}
            </div>
            <div className="enhanced-agent-details">
              <div className="enhanced-agent-name">{agentName}</div>
              <div className="enhanced-agent-title">Estate Agent</div>
            </div>
            <button 
              className="enhanced-contact-agent-btn"
              onClick={handleContactAgent}
            >
              Contact
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="enhanced-property-actions">
            <Link 
              to={overviewLink}
              className="enhanced-btn enhanced-btn-primary enhanced-view-property-btn"
              onClick={handleViewProperty}
            >
              <i className="fas fa-eye"></i>
              View Details
            </Link>
            <button className="enhanced-btn enhanced-btn-secondary enhanced-schedule-visit-btn">
              <i className="fas fa-calendar-alt"></i>
              Schedule Visit
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

export default EnhancedPropertyCard;
