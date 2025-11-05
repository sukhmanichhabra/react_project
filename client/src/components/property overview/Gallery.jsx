import React from 'react';

const Gallery = ({ images, title, mainImage, onThumbnailClick }) => {
  return (
    <div className="prop-overview-gallery-container">
      <div className="prop-overview-main-image">
        <img id="prop-overview-mainImg" src={mainImage} alt={title} />
      </div>
      <div className="prop-overview-thumbnail-container">
        {images.slice(1, 5).map((image, index) => (
          <img 
            key={index}
            className="prop-overview-thumbnail" 
            src={image} 
            alt={`Thumbnail ${index + 1}`}
            onClick={() => onThumbnailClick(image)}
          />
        ))}
      </div>
    </div>
  );
};

export default Gallery;