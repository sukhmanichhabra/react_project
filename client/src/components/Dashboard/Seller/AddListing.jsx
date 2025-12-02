import React, { useState, useEffect } from "react";
import { propertyAPI, dashboardAPI } from "../../../services/api";
import "./AddListing.css"; // <-- Import new CSS

const AddListing = () => {
  // State for the form
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
    yearBuilt: "",
    furnishing: "Unfurnished",
    parking: "",
    floor: "",
    totalFloors: "",
    facing: "",
    propertyId: "",
    reraId: "",
    documentSummary: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [imageUploadError, setImageUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [searchAddress, setSearchAddress] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Validation rules
  const validationRules = {
    title: {
      required: true,
      minLength: 10,
      maxLength: 100,
      message: "Title must be between 10-100 characters",
    },
    description: {
      required: true,
      minLength: 50,
      maxLength: 1000,
      message: "Description must be between 50-1000 characters",
    },
    price: {
      required: true,
      min: 1000,
      max: 1000000000,
      message: "Price must be between ₹1,000 and ₹100 crore",
    },
    location: {
      required: true,
      minLength: 5,
      maxLength: 200,
      message: "Location must be between 5-200 characters",
    },
    beds: {
      required: true,
      min: 0,
      max: 20,
      message: "Bedrooms must be between 0-20",
    },
    baths: {
      required: true,
      min: 1,
      max: 20,
      message: "Bathrooms must be between 1-20",
    },
    sqft: {
      required: true,
      min: 100,
      max: 100000,
      message: "Square feet must be between 100-100,000",
    },
    kitchen: {
      min: 0,
      max: 10,
      message: "Kitchen count must be between 0-10",
    },
    yearBuilt: {
      min: 1800,
      max: new Date().getFullYear() + 5,
      message: `Year built must be between 1800-${
        new Date().getFullYear() + 5
      }`,
    },
    floor: {
      min: 0,
      max: 200,
      message: "Floor must be between 0-200",
    },
    totalFloors: {
      min: 1,
      max: 200,
      message: "Total floors must be between 1-200",
    },
    propertyId: {
      pattern: /^[a-zA-Z0-9\-\/]{3,50}$/,
      message:
        "Property ID must be 3-50 characters (letters, numbers, hyphens, slashes only)",
    },
    reraId: {
      pattern: /^[A-Z]{2}RERA\/[A-Z0-9\/\-]{5,20}$/,
      message:
        "RERA ID format: XXRERA/XXXXXXX (e.g., MPRERA/A/RES/2023/000001)",
    },
  };

  // Validation function
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    // Required field validation
    if (rules.required && (!value || value.toString().trim() === "")) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    // Skip further validation if field is empty and not required
    if (!value || value.toString().trim() === "") return null;

    const stringValue = value.toString().trim();
    const numericValue = parseFloat(value);

    // String length validation
    if (rules.minLength && stringValue.length < rules.minLength) {
      return rules.message || `Minimum ${rules.minLength} characters required`;
    }
    if (rules.maxLength && stringValue.length > rules.maxLength) {
      return rules.message || `Maximum ${rules.maxLength} characters allowed`;
    }

    // Numeric validation
    if (
      rules.min !== undefined &&
      (isNaN(numericValue) || numericValue < rules.min)
    ) {
      return rules.message || `Minimum value is ${rules.min}`;
    }
    if (
      rules.max !== undefined &&
      (isNaN(numericValue) || numericValue > rules.max)
    ) {
      return rules.message || `Maximum value is ${rules.max}`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      return rules.message || "Invalid format";
    }

    // Custom validations
    if (
      name === "totalFloors" &&
      formData.floor &&
      numericValue < parseFloat(formData.floor)
    ) {
      return "Total floors cannot be less than the floor number";
    }

    return null;
  };

  // Validate all fields
  const validateAllFields = () => {
    const errors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    // Special validation for amenities (at least 1 required)
    if (!formData.amenities || formData.amenities.length === 0) {
      errors.amenities = "Please select at least one amenity";
    }

    // Image validation
    if (images.length === 0) {
      errors.images = "Please upload at least one property image";
    }

    return errors;
  };

  // Cleanup effect for image preview URLs
  useEffect(() => {
    return () => {
      // Clean up all preview URLs when component unmounts
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Mark field as touched
    setTouchedFields((prev) => ({ ...prev, [name]: true }));

    // Validate field and update errors
    const error = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    // Clear submit status when user starts typing
    if (submitStatus.message) {
      setSubmitStatus({ type: "", message: "" });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));

    // Validate on blur
    const error = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const newAmenities = checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((a) => a !== value);

      // Mark amenities as touched and clear error if at least one is selected
      setTouchedFields((prevTouched) => ({ ...prevTouched, amenities: true }));
      if (newAmenities.length > 0) {
        setFieldErrors((prevErrors) => ({ ...prevErrors, amenities: null }));
      } else {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          amenities: "Please select at least one amenity",
        }));
      }

      return { ...prev, amenities: newAmenities };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageUploadError("");

    // Validation rules
    const maxFiles = 10;
    const maxFileSize = 5 * 1024 * 1024; // 5MB per file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
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
        setImageUploadError(
          "Only JPEG, JPG, PNG, and WebP images are allowed."
        );
        return;
      }

      // Check file size
      if (file.size > maxFileSize) {
        setImageUploadError("Each image must be smaller than 5MB.");
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      // Validate image dimensions
      const validationPromise = new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (
            img.width < minDimensions.width ||
            img.height < minDimensions.height
          ) {
            setImageUploadError(
              `Images must be at least ${minDimensions.width}x${minDimensions.height} pixels for good quality property photos.`
            );
            URL.revokeObjectURL(previewUrl);
            resolve(false);
          } else {
            validFiles.push(file);
            previewUrls.push(previewUrl);
            resolve(true);
          }
        };
        img.onerror = () => {
          setImageUploadError("One or more files are not valid images.");
          URL.revokeObjectURL(previewUrl);
          resolve(false);
        };
        img.src = previewUrl;
      });

      validationPromises.push(validationPromise);
    });

    // Wait for all validations to complete
    Promise.all(validationPromises).then((results) => {
      const allValid = results.every((result) => result === true);
      if (allValid && validFiles.length > 0) {
        // Clean up previous preview URLs
        imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));

        setImages(validFiles);
        setImagePreviewUrls(previewUrls);

        // Clear image errors and mark as touched
        setImageUploadError("");
        setFieldErrors((prev) => ({ ...prev, images: null }));
        setTouchedFields((prev) => ({ ...prev, images: true }));
      } else if (validFiles.length === 0) {
        setFieldErrors((prev) => ({
          ...prev,
          images: "Please upload at least one property image",
        }));
      }
    });
  };

  // Geocode address to get coordinates
  const handleFindLocation = async () => {
    if (!searchAddress || searchAddress.trim() === "") {
      setSubmitStatus({
        type: "error",
        message: "Please enter an address to search",
      });
      setTimeout(() => setSubmitStatus({ type: "", message: "" }), 3000);
      return;
    }

    try {
      setGeocoding(true);
      setSubmitStatus({ type: "loading", message: "Finding location..." });

      const response = await dashboardAPI.geocodeAddress(searchAddress);

      if (response.data.success) {
        const { latitude, longitude, formattedAddress } = response.data.data;

        // Update form data with coordinates
        setFormData((prev) => ({
          ...prev,
          latitude: latitude,
          longitude: longitude,
          address: formattedAddress,
        }));

        setSubmitStatus({
          type: "success",
          message: `Location found: ${formattedAddress}`,
        });

        setTimeout(() => setSubmitStatus({ type: "", message: "" }), 5000);
      } else {
        throw new Error(response.data.message || "Failed to find location");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setSubmitStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to find location",
      });
      setTimeout(() => setSubmitStatus({ type: "", message: "" }), 5000);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = Object.keys(formData);
    const touchedState = {};
    allFields.forEach((field) => {
      touchedState[field] = true;
    });
    touchedState.images = true;
    touchedState.amenities = true;
    setTouchedFields(touchedState);

    // Validate all fields
    const errors = validateAllFields();
    setFieldErrors(errors);

    // If there are validation errors, show them and prevent submission
    if (Object.keys(errors).length > 0) {
      const errorCount = Object.keys(errors).length;
      const firstError = Object.values(errors)[0];

      setSubmitStatus({
        type: "error",
        message: `Please fix ${errorCount} validation error${
          errorCount > 1 ? "s" : ""
        }: ${firstError}`,
      });

      // Scroll to first error field
      const firstErrorField = Object.keys(errors)[0];
      const element =
        document.getElementById(firstErrorField) ||
        document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }

      setTimeout(() => {
        setSubmitStatus({ type: "", message: "" });
      }, 7000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      console.log("📝 Form data before submission:", formData);

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
          // Ensure we're appending the actual value, not undefined
          const value = formData[key];
          if (value !== undefined && value !== null && value !== "") {
            data.append(key, value);
            console.log(`  ✅ Appending ${key}: ${value}`);
          } else {
            console.warn(`  ⚠️ Skipping ${key}: value is ${value}`);
          }
        }
      }
      // Append files
      images.forEach((image) => data.append("images", image));

      // Log what's being sent
      console.log("📤 Sending FormData with", images.length, "images");

      // Submit to backend
      const result = await propertyAPI.addListing(data);

      if (result.data) {
        setSubmitStatus({
          type: "success",
          message:
            "Property submitted successfully! It will be reviewed by our admin team.",
        }); // Reset form
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
          yearBuilt: "",
          furnishing: "Unfurnished",
          parking: "",
          floor: "",
          totalFloors: "",
          facing: "",
          propertyId: "",
          reraId: "",
          documentSummary: "",
        });

        // Clean up image previews
        imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        setImages([]);
        setImagePreviewUrls([]);
        setImageUploadError("");

        // Reset validation states
        setFieldErrors({});
        setTouchedFields({});

        // Clear status after 3 seconds
        setTimeout(() => {
          setSubmitStatus({ type: "", message: "" });
        }, 3000);
      } else {
        throw new Error("Failed to submit property");
      }
    } catch (error) {
      console.error("Error submitting property:", error);
      setSubmitStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to submit property. Please try again.",
      });

      // Clear error after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: "", message: "" });
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render form field with error
  const renderFormField = (fieldName, fieldProps, children) => {
    const hasError = touchedFields[fieldName] && fieldErrors[fieldName];
    const fieldClassName = `dash-form-group ${hasError ? "has-error" : ""}`;

    return (
      <div className={fieldClassName}>
        {children}
        {hasError && (
          <div className="dash-field-error">
            <i className="fas fa-exclamation-circle"></i>
            {fieldErrors[fieldName]}
          </div>
        )}
      </div>
    );
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
          <i
            className={`fas ${
              submitStatus.type === "success"
                ? "fa-check-circle"
                : "fa-exclamation-triangle"
            }`}
          ></i>
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
          {renderFormField(
            "title",
            {},
            <>
              <label htmlFor="title">
                Property Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touchedFields.title && fieldErrors.title ? "error" : ""
                }
                placeholder="Enter a descriptive title for your property"
                maxLength={100}
                required
              />
              <small className="dash-field-hint">
                {formData.title.length}/100 characters
              </small>
            </>
          )}
          {renderFormField(
            "description",
            {},
            <>
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows="6"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touchedFields.description && fieldErrors.description
                    ? "error"
                    : ""
                }
                placeholder="Provide a detailed description of your property including key features, location benefits, and unique selling points (minimum 50 characters)"
                maxLength={1000}
                required
              ></textarea>
              <small className="dash-field-hint">
                {formData.description.length}/1000 characters (minimum 50
                required)
              </small>
            </>
          )}{" "}
          <div className="dash-form-row">
            {renderFormField(
              "tag",
              {},
              <>
                <label htmlFor="tag">
                  Status (Tag) <span className="required">*</span>
                </label>
                <select
                  id="tag"
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    touchedFields.tag && fieldErrors.tag ? "error" : ""
                  }
                  required
                >
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </>
            )}
            {renderFormField(
              "type",
              {},
              <>
                <label htmlFor="type">
                  Property Type <span className="required">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    touchedFields.type && fieldErrors.type ? "error" : ""
                  }
                  required
                >
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Cottage">Cottage</option>
                </select>
              </>
            )}
            {renderFormField(
              "price",
              {},
              <>
                <label htmlFor="price">
                  Price (₹) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    touchedFields.price && fieldErrors.price ? "error" : ""
                  }
                  placeholder="Enter price in rupees"
                  min="1000"
                  max="1000000000"
                  required
                />
                <small className="dash-field-hint">
                  Enter amount between ₹1,000 and ₹100 crore
                </small>
              </>
            )}
          </div>
        </div>{" "}
        <div className="dash-form-section">
          <h3>Location & Features</h3>
          {renderFormField(
            "location",
            {},
            <>
              <label htmlFor="location">
                Location (Full Address) <span className="required">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touchedFields.location && fieldErrors.location ? "error" : ""
                }
                placeholder="Enter complete address with city, state"
                maxLength={200}
                required
              />
              <small className="dash-field-hint">
                Provide full address for better visibility
              </small>
            </>
          )}

          {/* Optional Geolocation Fields */}
          <div className="dash-form-section geolocation-section">
            <h4>📍 Geolocation (Optional - for better agent assignment)</h4>
            <p className="geolocation-help">
              Adding coordinates helps us assign the best agent for your
              property based on location.
            </p>

            {/* Address Search Field */}
            <div className="dash-form-group">
              <label htmlFor="searchAddress">Search Address</label>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <input
                  type="text"
                  id="searchAddress"
                  name="searchAddress"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="Enter property address (e.g., 123 Main St, New York, NY)"
                  style={{ flex: 1 }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleFindLocation();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleFindLocation}
                  disabled={geocoding}
                  className="dash-submit-btn"
                  style={{
                    minWidth: "140px",
                    whiteSpace: "nowrap",
                    opacity: geocoding ? 0.6 : 1,
                    padding: "10px 20px",
                  }}
                >
                  {geocoding ? (
                    <>
                      <i
                        className="fas fa-spinner fa-spin"
                        style={{ marginRight: "5px" }}
                      ></i>
                      Finding...
                    </>
                  ) : (
                    <>
                      <i
                        className="fas fa-map-marker-alt"
                        style={{ marginRight: "5px" }}
                      ></i>
                      Find Location
                    </>
                  )}
                </button>
              </div>
              <small
                style={{ marginTop: "5px", display: "block", color: "#6b7280" }}
              >
                Enter the property address and click "Find Location" to
                automatically fill latitude and longitude
              </small>
            </div>

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
            {renderFormField(
              "beds",
              {},
              <>
                <label htmlFor="beds">
                  Bedrooms <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="beds"
                  name="beds"
                  value={formData.beds}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    touchedFields.beds && fieldErrors.beds ? "error" : ""
                  }
                  placeholder="Number of bedrooms"
                  min="0"
                  max="20"
                  required
                />
              </>
            )}
            {renderFormField(
              "baths",
              {},
              <>
                <label htmlFor="baths">
                  Bathrooms <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="baths"
                  name="baths"
                  value={formData.baths}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    touchedFields.baths && fieldErrors.baths ? "error" : ""
                  }
                  placeholder="Number of bathrooms"
                  min="1"
                  max="20"
                  required
                />
              </>
            )}
            {renderFormField(
              "sqft",
              {},
              <>
                <label htmlFor="sqft">
                  Square Feet (sqft) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="sqft"
                  name="sqft"
                  value={formData.sqft}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    touchedFields.sqft && fieldErrors.sqft ? "error" : ""
                  }
                  placeholder="Total area in square feet"
                  min="100"
                  max="100000"
                  required
                />
                <small className="dash-field-hint">
                  Area between 100-100,000 sqft
                </small>
              </>
            )}
            {renderFormField(
              "kitchen",
              {},
              <>
                <label htmlFor="kitchen">Kitchen</label>
                <input
                  type="number"
                  id="kitchen"
                  name="kitchen"
                  value={formData.kitchen}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    touchedFields.kitchen && fieldErrors.kitchen ? "error" : ""
                  }
                  placeholder="Number of kitchens"
                  min="0"
                  max="10"
                />
              </>
            )}
          </div>
        </div>
        <div className="dash-form-section">
          <h3>Amenities</h3>
          <div
            className={`dash-form-group ${
              touchedFields.amenities && fieldErrors.amenities
                ? "has-error"
                : ""
            }`}
          >
            <label>
              Select Amenities <span className="required">*</span>
            </label>
            <p className="dash-field-hint">
              Choose at least one amenity available with your property
            </p>
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
                    checked={formData.amenities.includes(amenity)}
                    onChange={handleAmenityChange}
                  />
                  <span className="dash-checkmark"></span> {amenity}
                </label>
              ))}
            </div>
            {touchedFields.amenities && fieldErrors.amenities && (
              <div className="dash-field-error">
                <i className="fas fa-exclamation-circle"></i>
                {fieldErrors.amenities}
              </div>
            )}
          </div>
        </div>{" "}
        <div className="dash-form-section">
          <h3>Detailed Specifications</h3>
          <div className="dash-form-row">
            {renderFormField(
              "yearBuilt",
              {},
              <>
                <label htmlFor="yearBuilt">Year Built</label>
                <input
                  type="number"
                  id="yearBuilt"
                  name="yearBuilt"
                  value={formData.yearBuilt}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    touchedFields.yearBuilt && fieldErrors.yearBuilt
                      ? "error"
                      : ""
                  }
                  placeholder="e.g., 2015"
                  min="1800"
                  max={new Date().getFullYear() + 5}
                />
                <small className="dash-field-hint">
                  Year between 1800 and {new Date().getFullYear() + 5}
                </small>
              </>
            )}
            <div className="dash-form-group">
              <label htmlFor="furnishing">Furnishing</label>
              <select
                id="furnishing"
                name="furnishing"
                value={formData.furnishing}
                onChange={handleChange}
              >
                <option value="Unfurnished">Unfurnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Fully Furnished">Fully Furnished</option>
              </select>
            </div>
            <div className="dash-form-group">
              <label htmlFor="facing">Property Facing</label>
              <select
                id="facing"
                name="facing"
                value={formData.facing}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="North-East">North-East</option>
                <option value="North-West">North-West</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
              </select>
            </div>
          </div>
          <div className="dash-form-row">
            {renderFormField(
              "floor",
              {},
              <>
                <label htmlFor="floor">Floor</label>
                <input
                  type="number"
                  id="floor"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    touchedFields.floor && fieldErrors.floor ? "error" : ""
                  }
                  placeholder="e.g., 5"
                  min="0"
                  max="200"
                />
              </>
            )}
            {renderFormField(
              "totalFloors",
              {},
              <>
                <label htmlFor="totalFloors">Total Floors in Building</label>
                <input
                  type="number"
                  id="totalFloors"
                  name="totalFloors"
                  value={formData.totalFloors}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    touchedFields.totalFloors && fieldErrors.totalFloors
                      ? "error"
                      : ""
                  }
                  placeholder="e.g., 12"
                  min="1"
                  max="200"
                />
              </>
            )}
            <div className="dash-form-group">
              <label htmlFor="parking">Parking</label>
              <select
                id="parking"
                name="parking"
                value={formData.parking}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="No dedicated parking">
                  No dedicated parking
                </option>
                <option value="1 Open Parking">1 Open Parking</option>
                <option value="1 Covered Parking">1 Covered Parking</option>
                <option value=">= 2 Parking Spots">
                  2 or more parking spots
                </option>
              </select>
            </div>
          </div>
        </div>{" "}
        <div className="dash-form-section">
          <h3>Legal &amp; Documents</h3>
          <div className="dash-form-row">
            {renderFormField(
              "propertyId",
              {},
              <>
                <label htmlFor="propertyId">Property / Registration ID</label>
                <input
                  type="text"
                  id="propertyId"
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    touchedFields.propertyId && fieldErrors.propertyId
                      ? "error"
                      : ""
                  }
                  placeholder="Official property or registration number"
                  maxLength={50}
                />
                <small className="dash-field-hint">
                  3-50 characters, letters, numbers, hyphens, slashes only
                </small>
              </>
            )}
            {renderFormField(
              "reraId",
              {},
              <>
                <label htmlFor="reraId">RERA Registration No. (optional)</label>
                <input
                  type="text"
                  id="reraId"
                  name="reraId"
                  value={formData.reraId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    touchedFields.reraId && fieldErrors.reraId ? "error" : ""
                  }
                  placeholder="e.g., MPRERA/A/RES/2023/000001"
                  maxLength={30}
                />
                <small className="dash-field-hint">
                  Format: XXRERA/A/RES/YYYY/XXXXXX
                </small>
              </>
            )}
          </div>
          <div className="dash-form-group">
            <label htmlFor="documentSummary">Documents &amp; Legal Notes</label>
            <textarea
              id="documentSummary"
              name="documentSummary"
              rows="4"
              value={formData.documentSummary}
              onChange={handleChange}
              placeholder="Mention key documents available (e.g., Sale Deed, Tax Receipts, Occupancy Certificate) or any special legal notes."
            ></textarea>
          </div>
        </div>{" "}
        <div className="dash-form-section">
          <h3>Property Images</h3>
          {renderFormField(
            "images",
            {},
            <>
              <label htmlFor="images">
                Upload Property Images (up to 10){" "}
                <span className="required">*</span>
              </label>
              <p className="dash-form-hint">
                Upload high-quality photos of your property. Images should be at
                least 800x600 pixels. Supported formats: JPEG, JPG, PNG, WebP.
                Maximum file size: 5MB per image.
              </p>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleImageChange}
                multiple
                accept=".jpeg,.jpg,.png,.webp"
                max="10"
                className={
                  touchedFields.images && fieldErrors.images ? "error" : ""
                }
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
                  <h4>Image Previews ({imagePreviewUrls.length}/10)</h4>
                  <div className="dash-image-preview-grid">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="dash-image-preview-item">
                        <img src={url} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className="dash-remove-image"
                          onClick={() => {
                            // Remove this image from arrays
                            const newImages = images.filter(
                              (_, i) => i !== index
                            );
                            const newPreviewUrls = imagePreviewUrls.filter(
                              (_, i) => i !== index
                            );

                            // Clean up the removed URL
                            URL.revokeObjectURL(imagePreviewUrls[index]);

                            setImages(newImages);
                            setImagePreviewUrls(newPreviewUrls);

                            // Update validation if no images left
                            if (newImages.length === 0) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                images:
                                  "Please upload at least one property image",
                              }));
                            }
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="dash-form-actions">
          <button
            type="submit"
            className="dash-submit-btn"
            disabled={isSubmitting}
          >
            <i className="fas fa-plus-circle"></i>
            {isSubmitting ? "Submitting..." : "Submit Property"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AddListing;
