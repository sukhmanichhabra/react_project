import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "../../styles/AgentDesc/contactForm.css";

function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState(""); // 'success' or 'error'

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Handle contact form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitMessage("");
    setSubmitStatus("");
    console.log("Form Data Submitted:", data);

    try {
      // TODO: This form is not connected to a backend.
      // You need to add a fetch() request here to POST this data
      // to an API endpoint (e.g., /api/agent/contact).

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitStatus("success");
      setSubmitMessage("Inquiry sent successfully!");
      reset(); // Reset form fields

      // Clear message after 3 seconds
      setTimeout(() => {
        setSubmitMessage("");
        setSubmitStatus("");
      }, 3000);
    } catch (error) {
      setSubmitStatus("error");
      console.error("Error sending inquiry:", error);
      setSubmitMessage("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Contact Container */}
      <div className="agt-desc-contact-stripes-wrapper">
        <div className="agt-desc-contact-stripes">
          {" "}
          {/* This class seems unused, but kept from original */}
          <div className="agt-desc-contact-container">
            <h2>Contact Form</h2>
            <form
              className="agt-desc-contact-form"
              onSubmit={handleSubmit(onSubmit)}
            >
              {submitMessage && (
                <div className={`agt-desc-contact-feedback ${submitStatus}`}>
                  {submitMessage}
                </div>
              )}

              <div className="agt-desc-contact-form-group">
                <label>Your Email</label>
                <input
                  type="email"
                  placeholder="Enter mail address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && (
                  <span className="error-message">{errors.email.message}</span>
                )}
              </div>

              <div className="agt-desc-contact-form-group">
                <label>Your Phone</label>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[+]?[1-9][\d]{0,15}$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                  className={errors.phone ? "error" : ""}
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone.message}</span>
                )}
              </div>

              <div className="agt-desc-contact-form-group">
                <label>Message</label>
                <textarea
                  placeholder="Hello, I am interested in [California Apartments]"
                  {...register("message", {
                    required: "Message is required",
                    minLength: {
                      value: 10,
                      message: "Message must be at least 10 characters long",
                    },
                  })}
                  className={errors.message ? "error" : ""}
                ></textarea>
                {errors.message && (
                  <span className="error-message">
                    {errors.message.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="agt-desc-contact-btn agt-desc-contact-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "SENDING..." : "INQUIRY"}
              </button>
              <button
                type="button"
                className="agt-desc-contact-btn agt-desc-contact-btn-secondary"
              >
                CALL NOW
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactForm;
