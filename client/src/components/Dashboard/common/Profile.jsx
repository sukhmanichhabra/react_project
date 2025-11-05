import React, { useState } from "react";
import { dashboardAPI } from "../../../services/api";
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
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }
      
      // Call parent callback to refresh data if provided
      if (onProfileUpdate && typeof onProfileUpdate === 'function') {
        onProfileUpdate(result.data.user);
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
                src={preview}
                alt="Profile"
                id="profile-preview"
                className="profile-card__avatar-img"
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
