import React from "react";
import "../../styles/AgentDesc/contactForm.css";

function ContactForm() {
  // Handle contact form submission
  const handleContactSubmit = (e) => {
    e.preventDefault();

    // TODO: This form is not connected to a backend.
    // You need to add a fetch() request here to POST this data
    // to an API endpoint (e.g., /api/agent/contact).

    const feedbackElement = document.querySelector(
      ".agt-desc-contact-form .agt-desc-contact-feedback"
    );
    if (feedbackElement) {
      feedbackElement.className = "agt-desc-contact-feedback success";
      feedbackElement.textContent = "Inquiry sent successfully!";
      feedbackElement.style.display = "block";

      setTimeout(() => {
        e.target.reset();
        feedbackElement.style.display = "none";
      }, 3000);
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
              onSubmit={handleContactSubmit}
            >
              <div className="agt-desc-contact-feedback"></div>
              <div className="agt-desc-contact-form-group">
                <label>Your Email</label>
                <input type="email" placeholder="Enter mail address" required />
              </div>
              <div className="agt-desc-contact-form-group">
                <label>Your Phone</label>
                <input type="tel" placeholder="Your phone number" required />
              </div>
              <div className="agt-desc-contact-form-group">
                <label>Message</label>
                <textarea
                  placeholder="Hello, I am interested in [California Apartments]"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="agt-desc-contact-btn agt-desc-contact-btn-primary"
              >
                INQUIRY
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
