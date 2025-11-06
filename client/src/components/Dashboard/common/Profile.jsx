import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../../../services/api";
import { getProfileImageUrl, handleImageError } from "../../../utils/imageUtils";
import "./Profile.css"; // <-- IMPORT THE NEW CSS

// This component receives the user object
const Profile = ({ user, agentProfile, onProfileUpdate }) => {  // State for form data
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    location: user.location || "",
    website: user.website || "",
    bio: user.bio || "",
    // Agent-specific fields (will be null for buyer)
    title: agentProfile?.title || "",
    qualification: agentProfile?.qualification || "",
    overview: agentProfile?.overview || "",
    // Agent geolocation fields
    latitude: agentProfile?.geolocation?.latitude || "",
    longitude: agentProfile?.geolocation?.longitude || "",
    serviceRadius: agentProfile?.geolocation?.serviceRadius || 50,
    // Social links
    facebook: user.socialLinks?.facebook || "",
    twitter: user.socialLinks?.twitter || "",
    instagram: user.socialLinks?.instagram || "",
    linkedin: user.socialLinks?.linkedin || "",
  });

  // State for image file and preview
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(
    user.profileImage || "/images/default-avatar.png"
  );

  // State for API response
  const [status, setStatus] = useState({ type: "", message: "" });

  // State for address geocoding
  const [searchAddress, setSearchAddress] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Logic for image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Geocode address to get coordinates
  const handleFindLocation = async () => {
    if (!searchAddress || searchAddress.trim() === "") {
      setStatus({ type: "error", message: "Please enter an address" });
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
      return;
    }

    try {
      setGeocoding(true);
      setStatus({ type: "loading", message: "Finding location..." });

      const response = await dashboardAPI.geocodeAddress(searchAddress);

      if (response.data.success) {
        const { latitude, longitude, formattedAddress } = response.data.data;
        
        // Update form data with coordinates
        setFormData((prev) => ({
          ...prev,
          latitude: latitude,
          longitude: longitude,
        }));

        setStatus({ 
          type: "success", 
          message: `Location found: ${formattedAddress}` 
        });

        setTimeout(() => setStatus({ type: "", message: "" }), 5000);
      } else {
        throw new Error(response.data.message || "Failed to find location");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setStatus({ 
        type: "error", 
        message: err.response?.data?.message || err.message || "Failed to find location" 
      });
      setTimeout(() => setStatus({ type: "", message: "" }), 5000);
    } finally {
      setGeocoding(false);
    }
  };

  // Logic for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Saving..." });

    const data = new FormData();

    // Append all form fields
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    // Append the file if one was selected
    if (profileImage) {
      data.append("profileImage", profileImage);
    }    try {
      // Use the API service for cleaner code
      const result = await dashboardAPI.updateProfile(data);

      setStatus({ type: "success", message: "Profile updated successfully!" });
      
      // Update user in localStorage if it exists
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(result.data.data.user));
      }
      
      // Update form data with fresh backend data
      const updatedUser = result.data.data.user;
      const updatedAgentProfile = result.data.data.agentProfile;
      
      setFormData({
        name: updatedUser.name || "",
        phone: updatedUser.phone || "",
        location: updatedUser.location || "",
        website: updatedUser.website || "",
        bio: updatedUser.bio || "",
        // Agent-specific fields
        title: updatedAgentProfile?.title || "",
        qualification: updatedAgentProfile?.qualification || "",
        overview: updatedAgentProfile?.overview || "",
        // Agent geolocation fields
        latitude: updatedAgentProfile?.geolocation?.latitude || "",
        longitude: updatedAgentProfile?.geolocation?.longitude || "",
        serviceRadius: updatedAgentProfile?.geolocation?.serviceRadius || 50,
        // Social links
        facebook: updatedUser.socialLinks?.facebook || "",
        twitter: updatedUser.socialLinks?.twitter || "",
        instagram: updatedUser.socialLinks?.instagram || "",
        linkedin: updatedUser.socialLinks?.linkedin || "",
      });
      
      // Update profile image preview if it was updated
      if (updatedUser.profileImage) {
        setPreview(updatedUser.profileImage);
      }
      
      // Clear the file input
      setProfileImage(null);
      
      // Call parent callback to refresh data if provided
      if (onProfileUpdate && typeof onProfileUpdate === 'function') {
        onProfileUpdate(updatedUser, updatedAgentProfile);
      }
      
      // Clear the status after 3 seconds
      setTimeout(() => {
        setStatus({ type: "", message: "" });
      }, 3000);
      
    } catch (err) {
      console.error('Profile update error:', err);
      let errorMessage = "Failed to update profile";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setStatus({ type: "error", message: errorMessage });
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setStatus({ type: "", message: "" });
      }, 5000);
    }
  };

  return (
    <section id="profile" className="profile-section">
      <div className="profile-header">
        <h2>Update Profile</h2>
      </div>

      {/* Status Message */}
      {status.message && (
        <div
          className={`profile-status-message ${
            status.type === "success" ? "success" : "error"
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="profile-card">
        <form
          className="profile-card__form"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <div className="profile-card__header">
            <div className="profile-card__avatar">
              <img
                src={getProfileImageUrl(preview)}
                alt="Profile"
                id="profile-preview"
                className="profile-card__avatar-img"
                onError={(e) => handleImageError(e, '/images/default-avatar.png')}
              />
              <label
                htmlFor="profileImage"
                className="profile-card__avatar-label"
              >
                <i className="fas fa-camera"></i>
              </label>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>
            <div className="profile-card__info">
              <h3>{user.name}</h3>
              <p>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} since{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="profile-card__grid">
            <div className="profile-card__form-group">
              <label htmlFor="name" className="profile-card__label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="profile-card__input"
              />
            </div>
            <div className="profile-card__form-group">
              <label htmlFor="phone" className="profile-card__label">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="profile-card__input"
              />
            </div>
            <div className="profile-card__form-group">
              <label htmlFor="location" className="profile-card__label">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="profile-card__input"
              />
            </div>

            <div className="profile-card__form-group">
              <label htmlFor="website" className="profile-card__label">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="profile-card__input"
              />
            </div>            {/* This section will not show for buyers */}
            {user.role === "agent" && agentProfile && (
              <>
                <div className="profile-card__form-group">
                  <label htmlFor="title" className="profile-card__label">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Real Estate Agent"
                    className="profile-card__input"
                  />
                </div>
                <div className="profile-card__form-group">
                  <label
                    htmlFor="qualification"
                    className="profile-card__label"
                  >
                    Qualifications
                  </label>
                  <input
                    type="text"
                    id="qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g., Licensed Realtor, MBA"
                    className="profile-card__input"
                  />
                </div>
                
                {/* Agent Geolocation Section */}
                <div className="profile-card__form-group profile-card__form-group--full">
                  <h4 className="profile-card__subsection-title">
                    📍 Service Area Location
                  </h4>
                  <p className="profile-card__help-text">
                    Set your location coordinates to receive property assignments in your area
                  </p>
                </div>

                {/* Address Search Field */}
                <div className="profile-card__form-group profile-card__form-group--full">
                  <label htmlFor="searchAddress" className="profile-card__label">
                    Search Address
                  </label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <input
                      type="text"
                      id="searchAddress"
                      name="searchAddress"
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                      placeholder="Enter your address (e.g., 123 Main St, New York, NY)"
                      className="profile-card__input"
                      style={{ flex: 1 }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleFindLocation();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleFindLocation}
                      disabled={geocoding}
                      className="profile-card__btn profile-card__btn--primary"
                      style={{ 
                        minWidth: "140px",
                        whiteSpace: "nowrap",
                        opacity: geocoding ? 0.6 : 1
                      }}
                    >
                      {geocoding ? (
                        <>
                          <i className="fas fa-spinner fa-spin" style={{ marginRight: "5px" }}></i>
                          Finding...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-map-marker-alt" style={{ marginRight: "5px" }}></i>
                          Find Location
                        </>
                      )}
                    </button>
                  </div>
                  <small className="profile-card__help-text" style={{ marginTop: "5px", display: "block" }}>
                    Enter your address and click "Find Location" to automatically fill latitude and longitude
                  </small>
                </div>
                
                <div className="profile-card__form-group">
                  <label htmlFor="latitude" className="profile-card__label">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="e.g., 28.6139"
                    className="profile-card__input"
                  />
                </div>
                
                <div className="profile-card__form-group">
                  <label htmlFor="longitude" className="profile-card__label">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="e.g., 77.2090"
                    className="profile-card__input"
                  />
                </div>
                
                <div className="profile-card__form-group">
                  <label htmlFor="serviceRadius" className="profile-card__label">
                    Service Radius (km)
                  </label>
                  <input
                    type="number"
                    id="serviceRadius"
                    name="serviceRadius"
                    value={formData.serviceRadius}
                    onChange={handleChange}
                    placeholder="50"
                    min="1"
                    max="100"
                    className="profile-card__input"
                  />
                  <small className="profile-card__help-text">
                    Maximum distance you're willing to service properties (1-100 km)
                  </small>
                </div>
                
                <div className="profile-card__form-group profile-card__form-group--full">
                  <label htmlFor="overview" className="profile-card__label">
                    Professional Overview
                  </label>
                  <textarea
                    id="overview"
                    name="overview"
                    rows="6"
                    value={formData.overview}
                    onChange={handleChange}
                    placeholder="Describe your experience..."
                    className="profile-card__textarea"
                  ></textarea>
                </div>
              </>
            )}

            <div className="profile-card__form-group profile-card__form-group--full">
              <label htmlFor="bio" className="profile-card__label">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself..."
                className="profile-card__textarea"
              ></textarea>
            </div>
          </div>

          <div className="profile-card__divider">
            <h3 className="profile-card__subheader">Social Media Links</h3>
            <div className="profile-card__grid">
              <div className="profile-card__form-group">
                <label
                  htmlFor="facebook"
                  className="profile-card__label profile-card__social-label"
                >
                  <i
                    className="fab fa-facebook"
                    style={{ color: "#1877F2" }}
                  ></i>
                  <span>Facebook</span>
                </label>
                <input
                  type="url"
                  id="facebook"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/username"
                  className="profile-card__input"
                />
              </div>
              <div className="profile-card__form-group">
                <label
                  htmlFor="twitter"
                  className="profile-card__label profile-card__social-label"
                >
                  <i
                    className="fab fa-twitter"
                    style={{ color: "#1DA1F2" }}
                  ></i>
                  <span>Twitter</span>
                </label>
                <input
                  type="url"
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/username"
                  className="profile-card__input"
                />
              </div>
              <div className="profile-card__form-group">
                <label
                  htmlFor="instagram"
                  className="profile-card__label profile-card__social-label"
                >
                  <i
                    className="fab fa-instagram"
                    style={{ color: "#E4405F" }}
                  ></i>
                  <span>Instagram</span>
                </label>
                <input
                  type="url"
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/username"
                  className="profile-card__input"
                />
              </div>
              <div className="profile-card__form-group">
                <label
                  htmlFor="linkedin"
                  className="profile-card__label profile-card__social-label"
                >
                  <i
                    className="fab fa-linkedin"
                    style={{ color: "#0A66C2" }}
                  ></i>
                  <span>LinkedIn</span>
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="profile-card__input"
                />
              </div>
            </div>
          </div>

          <div className="profile-card__actions">
            <button
              type="reset"
              className="profile-card__btn profile-card__btn--secondary"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="profile-card__btn profile-card__btn--primary"
              disabled={status.type === "loading"}
            >
              {status.type === "loading" ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Profile;
