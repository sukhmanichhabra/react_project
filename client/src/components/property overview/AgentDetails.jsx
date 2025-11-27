import React, { useState } from "react";
import axios from "axios";

const AgentDetails = ({ agent, propertyId }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  const validateName = (name) => {
    const namePattern = /^[a-zA-Z\s]{2,30}$/;
    return namePattern.test(name.trim());
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email.trim());
  };

  const validatePhone = (phone) => {
    const phonePattern = /^\d{10}$/;
    return phonePattern.test(phone.replace(/\D/g, ""));
  };

  const validateMessage = (message) => {
    return message.trim().length >= 30;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    // Clear error when user starts typing
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    let error = "";

    switch (id) {
      case "name":
        if (!validateName(value)) {
          error = "Please enter a valid name (2-30 characters, letters only)";
        }
        break;
      case "email":
        if (!validateEmail(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "phone":
        if (!validatePhone(value)) {
          error = "Please enter a valid 10-digit phone number";
        }
        break;
      case "message":
        if (!validateMessage(value)) {
          error = "Message must be at least 30 characters long";
        }
        break;
      default:
        break;
    }

    if (error) {
      setErrors({ ...errors, [id]: error });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    if (!validateName(formData.name)) {
      newErrors.name = "Please enter a valid name";
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!validateMessage(formData.message)) {
      newErrors.message = "Message must be at least 30 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    setStatus("sending");

    try {
      const response = await axios.post(
        `/api/property/${propertyId}/contact`,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus(""), 3000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("error");
      setTimeout(() => setStatus(""), 3000);
    }
  };

  if (!agent) {
    return (
      <div className="prop-overview-agent-details-container">
        <h2>Property Agent</h2>
        <p>No agent assigned to this property.</p>
      </div>
    );
  }

  return (
    <div className="prop-overview-agent-details-container">
      {/* Agent Info Section */}
      <div className="prop-overview-agent-info-section">
        <h2>Property Agent</h2>
        <div className="prop-overview-agent-card">
          <img
            src={agent.image}
            alt={agent.name}
            className="prop-overview-agent-avatar"
          />
          <div className="prop-overview-agent-details">
            <h3>{agent.name}</h3>
            {agent.verified && (
              <span className="prop-overview-verified-badge">
                <i className="fas fa-check-circle"></i> Verified
              </span>
            )}
            <p className="prop-overview-agent-properties">
              <i className="fas fa-home"></i>{" "}
              {agent.properties || agent.listingCount || 0} Properties
            </p>
            <div className="prop-overview-agent-contact">
              <p>
                <i className="fas fa-envelope"></i> {agent.email}
              </p>
              <p>
                <i className="fas fa-phone"></i> {agent.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="prop-overview-contact-form-container">
        <h2>Contact Agent</h2>
        <form className="prop-overview-contact-form" onSubmit={handleSubmit}>
          <div className="prop-overview-form-message">
            {status === "sending" && (
              <div className="prop-overview-sending-message">
                <i className="fas fa-spinner fa-pulse"></i> Sending your
                message...
              </div>
            )}
            {status === "success" && (
              <div className="prop-overview-success-message">
                <i className="fas fa-check-circle"></i> Message sent
                successfully!
              </div>
            )}
            {status === "error" && (
              <div className="prop-overview-error-message">
                <i className="fas fa-exclamation-circle"></i> Failed to send
                message. Please try again.
              </div>
            )}
          </div>

          <div className="prop-overview-form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.name ? "invalid" : formData.name ? "valid" : ""}
              required
            />
            {errors.name && (
              <span className="prop-overview-validation-message show">
                {errors.name}
              </span>
            )}
          </div>

          <div className="prop-overview-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                errors.email ? "invalid" : formData.email ? "valid" : ""
              }
              required
            />
            {errors.email && (
              <span className="prop-overview-validation-message show">
                {errors.email}
              </span>
            )}
          </div>

          <div className="prop-overview-form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                errors.phone ? "invalid" : formData.phone ? "valid" : ""
              }
              required
            />
            {errors.phone && (
              <span className="prop-overview-validation-message show">
                {errors.phone}
              </span>
            )}
          </div>

          <div className="prop-overview-form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              rows="5"
              placeholder="Enter your message (minimum 30 characters)"
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                errors.message ? "invalid" : formData.message ? "valid" : ""
              }
              required
            ></textarea>
            {errors.message && (
              <span className="prop-overview-validation-message show">
                {errors.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="prop-overview-submit-btn"
            disabled={status === "sending"}
          >
            <i className="fas fa-paper-plane"></i> Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentDetails;
