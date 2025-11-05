import React, { useState, useEffect } from "react";
import { propertyAPI } from "../../../services/api";
import "./AddListing.css"; // <-- Import new CSS

const AddListing = () => {  // State for the form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tag: "sale", // Changed from status to tag
    type: "House", // Changed from propertyType to type
    price: "",
    location: "",
    beds: "",
    baths: "",
    sqft: "",
    kitchen: "",
    amenities: [],
    // Optional geolocation fields
    latitude: "",
    longitude: "",
    address: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [imageUploadError, setImageUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  // Cleanup effect for image preview URLs
  useEffect(() => {
    return () => {
      // Clean up all preview URLs when component unmounts
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const newAmenities = checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((a) => a !== value);
      return { ...prev, amenities: newAmenities };
    });
  };
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageUploadError('');

    // Validation rules
    const maxFiles = 10;
    const maxFileSize = 5 * 1024 * 1024; // 5MB per file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const minDimensions = { width: 800, height: 600 };

    if (files.length > maxFiles) {
      setImageUploadError(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    // Validate each file
    const validFiles = [];
    const previewUrls = [];
    let validationPromises = [];

    files.forEach((file, index) => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        setImageUploadError('Only JPEG, JPG, PNG, and WebP images are allowed.');
        return;
      }

      // Check file size
      if (file.size > maxFileSize) {
        setImageUploadError('Each image must be smaller than 5MB.');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Validate image dimensions
      const validationPromise = new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (img.width < minDimensions.width || img.height < minDimensions.height) {
            setImageUploadError(`Images must be at least ${minDimensions.width}x${minDimensions.height} pixels for good quality property photos.`);
            URL.revokeObjectURL(previewUrl);
            resolve(false);
          } else {
            validFiles.push(file);
            previewUrls.push(previewUrl);
            resolve(true);
          }
        };
        img.onerror = () => {
          setImageUploadError('One or more files are not valid images.');
          URL.revokeObjectURL(previewUrl);
          resolve(false);
        };
        img.src = previewUrl;
      });

      validationPromises.push(validationPromise);
    });

    // Wait for all validations to complete
    Promise.all(validationPromises).then((results) => {
      const allValid = results.every(result => result === true);
      if (allValid && validFiles.length > 0) {
        // Clean up previous preview URLs
        imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        
        setImages(validFiles);
        setImagePreviewUrls(previewUrls);
      }
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.price || !formData.location) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const data = new FormData();
        // Append form data
      for (const key in formData) {
        if (key === "amenities") {
          // Handle amenities array properly
          if (formData.amenities && formData.amenities.length > 0) {
            formData.amenities.forEach((amenity) => {
              data.append("amenities[]", amenity);
            });
          }
        } else {
          data.append(key, formData[key]);
        }
      }
        // Append files
      images.forEach((image) => data.append("images", image));
      
      // Submit to backend
      const result = await propertyAPI.addListing(data);

      if (result.data) {
        setSubmitStatus({
          type: 'success',
          message: 'Property submitted successfully! It will be reviewed by our admin team.'
        });        // Reset form
        setFormData({
          title: "",
          description: "",
          tag: "sale",
          type: "House",
          price: "",
          location: "",
          beds: "",
          baths: "",
          sqft: "",
          kitchen: "",
          amenities: [],
          latitude: "",
          longitude: "",
          address: "",
        });
        
        // Clean up image previews
        imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        setImages([]);
        setImagePreviewUrls([]);
        setImageUploadError('');
          // Clear status after 3 seconds
        setTimeout(() => {
          setSubmitStatus({ type: '', message: '' });
        }, 3000);
      } else {
        throw new Error('Failed to submit property');
      }
    } catch (error) {
      console.error('Error submitting property:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to submit property. Please try again.'
      });
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: '', message: '' });
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section id="add-listing">
      <div className="dash-section-header">
        <h2>Add New Listing</h2>
        <p>Fill out the form below to submit your property for approval.</p>
      </div>

      {/* Status Message */}
      {submitStatus.message && (
        <div className={`dash-status-message ${submitStatus.type}`}>
          <i className={`fas ${submitStatus.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
          {submitStatus.message}
        </div>
      )}

      <form
        className="dash-add-listing-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="dash-form-section">
          <h3>Basic Information</h3>
          <div className="dash-form-group">
            <label htmlFor="title">Property Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="dash-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="6"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>          <div className="dash-form-row">
            <div className="dash-form-group">
              <label htmlFor="tag">Status (Tag)</label>
              <select
                id="tag"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            <div className="dash-form-group">
              <label htmlFor="type">Property Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Cottage">Cottage</option>
              </select>
            </div>
            <div className="dash-form-group">
              <label htmlFor="price">Price (₹)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>        <div className="dash-form-section">
          <h3>Location & Features</h3>
          <div className="dash-form-group">
            <label htmlFor="location">Location (Full Address)</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Optional Geolocation Fields */}
          <div className="dash-form-section geolocation-section">
            <h4>📍 Geolocation (Optional - for better agent assignment)</h4>
            <p className="geolocation-help">
              Adding coordinates helps us assign the best agent for your property based on location.
            </p>
            <div className="dash-form-row">
              <div className="dash-form-group">
                <label htmlFor="latitude">Latitude</label>
                <input
                  type="number"
                  step="any"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g., 28.6139"
                />
              </div>
              <div className="dash-form-group">
                <label htmlFor="longitude">Longitude</label>
                <input
                  type="number"
                  step="any"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g., 77.2090"
                />
              </div>
            </div>
            <div className="dash-form-group">
              <label htmlFor="address">Detailed Address (Optional)</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="More specific address details"
              />
            </div>
          </div>
          
          <div className="dash-form-row">
            <div className="dash-form-group">
              <label htmlFor="beds">Bedrooms</label>
              <input
                type="number"
                id="beds"
                name="beds"
                value={formData.beds}
                onChange={handleChange}
                required
              />
            </div>
            <div className="dash-form-group">
              <label htmlFor="baths">Bathrooms</label>
              <input
                type="number"
                id="baths"
                name="baths"
                value={formData.baths}
                onChange={handleChange}
                required
              />
            </div>
            <div className="dash-form-group">
              <label htmlFor="sqft">Square Feet (sqft)</label>
              <input
                type="number"
                id="sqft"
                name="sqft"
                value={formData.sqft}
                onChange={handleChange}
                required
              />
            </div>
            <div className="dash-form-group">
              <label htmlFor="kitchen">Kitchen</label>
              <input
                type="number"
                id="kitchen"
                name="kitchen"
                value={formData.kitchen}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="dash-form-section">
          <h3>Amenities</h3>
          <div className="dash-amenities-grid">
            {[
              "A/C & Heating",
              "Garden",
              "Swimming Pool",
              "Parking",
              "Gym",
              "Security",
              "Wifi",
              "Pet Friendly",
            ].map((amenity) => (
              <label className="dash-custom-checkbox" key={amenity}>
                <input
                  type="checkbox"
                  name="amenities"
                  value={amenity}
                  onChange={handleAmenityChange}
                />
                <span className="dash-checkmark"></span> {amenity}
              </label>
            ))}
          </div>
        </div>        <div className="dash-form-section">
          <h3>Property Images</h3>
          <div className="dash-form-group">
            <label htmlFor="images">Upload Property Images (up to 10)</label>
            <p className="dash-form-hint">
              Upload high-quality photos of your property. Images should be at least 800x600 pixels. 
              Supported formats: JPEG, JPG, PNG, WebP. Maximum file size: 5MB per image.
            </p>
            <input
              type="file"
              id="images"
              name="images"
              onChange={handleImageChange}
              multiple
              accept=".jpeg,.jpg,.png,.webp"
              max="10"
            />
            
            {/* Image Upload Error */}
            {imageUploadError && (
              <div className="dash-image-error">
                <i className="fas fa-exclamation-triangle"></i>
                {imageUploadError}
              </div>
            )}
            
            {/* Image Preview */}
            {imagePreviewUrls.length > 0 && (
              <div className="dash-image-preview-container">
                <h4>Image Previews ({imagePreviewUrls.length}/{10})</h4>
                <div className="dash-image-preview-grid">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="dash-image-preview-item">
                      <img src={url} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="dash-remove-image"
                        onClick={() => {
                          // Remove this image from arrays
                          const newImages = images.filter((_, i) => i !== index);
                          const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
                          
                          // Clean up the removed URL
                          URL.revokeObjectURL(imagePreviewUrls[index]);
                          
                          setImages(newImages);
                          setImagePreviewUrls(newPreviewUrls);
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div><div className="dash-form-actions">
          <button 
            type="submit" 
            className="dash-submit-btn"
            disabled={isSubmitting}
          >
            <i className="fas fa-plus-circle"></i> 
            {isSubmitting ? 'Submitting...' : 'Submit Property'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AddListing;