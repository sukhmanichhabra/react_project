import React, { useState, useEffect } from "react";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    // Initialize scroll reveal animation
    const revealElements = document.querySelectorAll(
      ".contact-reveal, .contact-reveal-left, .contact-reveal-right"
    );

    const revealOnScroll = function () {
      for (let i = 0; i < revealElements.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = revealElements[i].getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
          revealElements[i].classList.add("active");
        }
      }
    };

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll(); // Initial check on page load

    // Back to top button functionality
    const backToTopButton = document.getElementById("contactBackToTop");

    if (backToTopButton) {
      window.addEventListener("scroll", () => {
        if (window.pageYOffset > 300) {
          backToTopButton.style.display = "flex";
        } else {
          backToTopButton.style.display = "none";
        }
      });
    }

    return () => {
      window.removeEventListener("scroll", revealOnScroll);
    };
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // Here you would typically send the data to your server
    console.log("Form submitted with data:", formData);

    // Show success message
    alert(
      "Your message has been sent successfully! We will get back to you soon."
    );

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1 className="contact-title">
          Questions? Feel Free to Reach Out
          <br />
          Via Message.
        </h1>
        <p className="contact-subtitle">
          Our dedicated team is here to help you with any questions or concerns.
          We're committed to providing exceptional service and support to all
          our customers.
        </p>

        <div className="contact-items">
          <div className="contact-item contact-reveal-left">
            <div className="contact-icon-circle">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="contact-text">
              <h3>We're always happy to help.</h3>
              <p>
                <a href="mailto:homescape@demo.com">homescape@demo.com</a>
              </p>
            </div>
          </div>

          <div className="contact-divider">/</div>

          <div className="contact-item contact-reveal">
            <div className="contact-icon-circle">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.01 15.38C18.78 15.38 17.59 15.18 16.48 14.82C16.13 14.7 15.74 14.79 15.47 15.06L13.9 17.03C11.07 15.68 8.42 13.13 7.01 10.2L8.96 8.54C9.23 8.26 9.31 7.87 9.2 7.52C8.83 6.41 8.64 5.22 8.64 3.99C8.64 3.45 8.19 3 7.65 3H4.19C3.65 3 3 3.24 3 3.99C3 13.28 10.73 21 20.01 21C20.72 21 21 20.37 21 19.82V16.37C21 15.83 20.55 15.38 20.01 15.38Z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="contact-text">
              <h3>Our hotline number</h3>
              <p className="contact-clickable">+91 9267924499</p>
            </div>
          </div>

          <div className="contact-divider">/</div>

          <div className="contact-item contact-reveal-right">
            <div className="contact-icon-circle">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"
                  fill="white"
                />
                <path
                  d="M7 9H17V11H7V9ZM7 12H14V14H7V12ZM7 6H17V8H7V6Z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="contact-text">
              <h3>Live chat</h3>
              <p>
                <a href="http://www.homescape.com">www.homescape.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="contact-map-form-container">
        <div className="contact-map contact-reveal-left">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d233667.82239550783!2d90.25446957354994!3d23.780863188726124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka%2C%20Bangladesh!5e0!3m2!1sen!2s!4v1709655083599!5m2!1sen!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="HomeScape Office Location"
          ></iframe>
        </div>

        <div className="contact-form-section contact-reveal-right">
          <h2>Send Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="contact-form-group">
              <label htmlFor="name">Name*</label>
              <input
                type="text"
                id="name"
                placeholder="Your Name*"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="contact-form-group">
              <label htmlFor="email">Email*</label>
              <input
                type="email"
                id="email"
                placeholder="Email Address*"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="contact-form-group">
              <label htmlFor="subject">Subject*</label>
              <input
                type="text"
                id="subject"
                placeholder="Message Subject*"
                value={formData.subject}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="contact-form-group">
              <label htmlFor="message">Message*</label>
              <textarea
                id="message"
                placeholder="Your message*"
                rows="5"
                value={formData.message}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <button type="submit">SEND MESSAGE</button>
          </form>
        </div>
      </div>

      {/* Contact Information Cards */}
      <div className="contact-info-section">
        <h2 className="contact-info-title">Get in Touch</h2>
        <div className="contact-info-cards">
          <div className="contact-info-card contact-reveal">
            <div className="contact-info-card-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <h3>Visit Our Office</h3>
            <p>
              Come visit us at our headquarters for a face-to-face consultation.
            </p>
            <ul>
              <li>
                <i className="fas fa-check"></i> 123 Real Estate Street
              </li>
              <li>
                <i className="fas fa-check"></i> Downtown Business District
              </li>
              <li>
                <i className="fas fa-check"></i> City, State 12345
              </li>
            </ul>
          </div>

          <div className="contact-info-card contact-reveal">
            <div className="contact-info-card-icon">
              <i className="fas fa-clock"></i>
            </div>
            <h3>Business Hours</h3>
            <p>
              We're here to help you during these hours. Contact us anytime!
            </p>
            <ul>
              <li>
                <i className="fas fa-check"></i> Monday - Friday: 9:00 AM - 6:00
                PM
              </li>
              <li>
                <i className="fas fa-check"></i> Saturday: 10:00 AM - 4:00 PM
              </li>
              <li>
                <i className="fas fa-check"></i> Sunday: Closed
              </li>
            </ul>
          </div>

          <div className="contact-info-card contact-reveal">
            <div className="contact-info-card-icon">
              <i className="fas fa-headset"></i>
            </div>
            <h3>24/7 Support</h3>
            <p>
              Our support team is available around the clock for urgent matters.
            </p>
            <ul>
              <li>
                <i className="fas fa-check"></i> Emergency hotline
              </li>
              <li>
                <i className="fas fa-check"></i> Live chat support
              </li>
              <li>
                <i className="fas fa-check"></i> Email support
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        id="contactBackToTop"
        className="contact-back-to-top"
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <i className="fas fa-chevron-up"></i>
      </button>
    </div>
  );
};

export default Contact;
