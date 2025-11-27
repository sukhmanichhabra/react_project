import React, { useEffect } from "react";
import "./About.css";

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-container">
        <div className="about-left-section">
          <p className="about-subtitle">ABOUT US</p>
          <h1 className="about-main-heading">
            We're passionate about helping you find the{" "}
            <span className="about-underline">perfect home</span>
          </h1>
          <p className="about-founder-text">
            HomeScape was founded with a simple mission: to make real estate
            accessible, transparent, and stress-free for everyone. Our team of
            dedicated professionals brings decades of combined experience in
            real estate, technology, and customer service to help you navigate
            your property journey with confidence.
          </p>
          <button
            className="about-contact-btn"
            onClick={() => (window.location.href = "/contact")}
          >
            Contact Us
          </button>

          {/* Stats */}
          <div className="about-stats-container">
            <div className="about-stat-item">
              <h2>50k+</h2>
              <p>Properties Listed</p>
            </div>
            <div className="about-stat-item">
              <h2>25k+</h2>
              <p>Happy Customers</p>
            </div>
            <div className="about-stat-item">
              <h2>500+</h2>
              <p>Verified Agents</p>
            </div>
            <div className="about-stat-item">
              <h2>15</h2>
              <p>Cities Covered</p>
            </div>
          </div>
        </div>

        <div className="about-right-section">
          <div className="about-info-card">
            <h2>Our Mission</h2>
            <p>
              To revolutionize the real estate industry by providing innovative
              technology solutions that simplify property transactions and
              connect people with their dream homes.
            </p>
            <div className="about-divider"></div>
            <h2>Our Vision</h2>
            <p>
              To become the most trusted and user-friendly real estate platform,
              making property buying, selling, and renting accessible to
              everyone, everywhere.
            </p>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="about-video-section">
        <div className="about-video-container">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="HomeScape Introduction"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* How We Help Section */}
      <div className="about-help-section">
        <h2 className="about-help-heading">How We Help You</h2>
        <p className="about-help-subtitle">
          Our comprehensive platform makes real estate transactions simple and
          secure
        </p>

        <div className="about-steps-container">
          <div className="about-step-item">
            <div className="about-step-icon">
              <img src="/assets/icon1.svg" alt="Search Properties" />
            </div>
            <h3>Search Properties</h3>
            <p>
              Browse thousands of verified properties with detailed information
              and high-quality photos
            </p>
          </div>

          <div className="about-step-arrow">
            <svg
              viewBox="0 0 48 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 12H42M42 12L35 5M42 12L35 19"
                stroke="#ff5722"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="about-step-item">
            <div className="about-step-icon">
              <img src="/assets/icon2.svg" alt="Connect with Agents" />
            </div>
            <h3>Connect with Agents</h3>
            <p>
              Get matched with experienced, verified agents who understand your
              needs and preferences
            </p>
          </div>

          <div className="about-step-arrow">
            <svg
              viewBox="0 0 48 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 12H42M42 12L35 5M42 12L35 19"
                stroke="#ff5722"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="about-step-item">
            <div className="about-step-icon">
              <img src="/assets/icon3.svg" alt="Find Your Home" />
            </div>
            <h3>Find Your Home</h3>
            <p>
              Complete your transaction securely with our integrated financing
              and legal support
            </p>
          </div>
        </div>
      </div>

      {/* Customer Testimonials */}
      <div className="about-feedback-section">
        <h2 className="about-feedback-heading">What Our Customers Say</h2>
        <p className="about-feedback-subtitle">
          Don't just take our word for it - hear from our satisfied customers
        </p>

        <div className="about-feedback-slider">
          <div className="about-feedback-container">
            <div className="about-feedback-card">
              <div className="about-quote">"</div>
              <div className="about-stars">★★★★★</div>
              <p className="about-feedback-text">
                "HomeScape made buying my first home incredibly easy. The agent
                was knowledgeable and the platform provided all the information
                I needed to make an informed decision."
              </p>
              <div className="about-feedback-author">
                <div className="about-author-info">
                  <h4>Sarah Johnson</h4>
                  <p>First-time Home Buyer</p>
                </div>
                <img
                  src="/assets/agent1.png"
                  alt="Sarah Johnson"
                  className="about-author-image"
                />
              </div>
            </div>

            <div className="about-feedback-card">
              <div className="about-quote">"</div>
              <div className="about-stars">★★★★★</div>
              <p className="about-feedback-text">
                "As a seller, I was impressed by how quickly my property was
                listed and how many qualified buyers I was able to connect with
                through HomeScape."
              </p>
              <div className="about-feedback-author">
                <div className="about-author-info">
                  <h4>Michael Chen</h4>
                  <p>Property Seller</p>
                </div>
                <img
                  src="/assets/agent1.png"
                  alt="Michael Chen"
                  className="about-author-image"
                />
              </div>
            </div>

            <div className="about-feedback-card">
              <div className="about-quote">"</div>
              <div className="about-stars">★★★★★</div>
              <p className="about-feedback-text">
                "The rental management features are fantastic. I can easily
                track payments, communicate with tenants, and manage all my
                properties in one place."
              </p>
              <div className="about-feedback-author">
                <div className="about-author-info">
                  <h4>Emily Rodriguez</h4>
                  <p>Property Investor</p>
                </div>
                <img
                  src="/assets/agent1.png"
                  alt="Emily Rodriguez"
                  className="about-author-image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Team Section */}
      <div className="about-agents-section">
        <div className="about-agents-header">
          <div>
            <h2 className="about-agents-heading">Meet Our Team</h2>
            <p className="about-agents-subtitle">
              Our experienced professionals are here to guide you every step of
              the way
            </p>
          </div>
          <button
            className="about-meet-team-btn"
            onClick={() => (window.location.href = "/agents")}
          >
            View All Agents
          </button>
        </div>

        <div className="about-agents-slider">
          <div className="about-agents-container">
            <div className="about-agent-card">
              <img
                src="/assets/agent1.png"
                alt="John Smith"
                className="about-agent-image"
              />
              <h3>John Smith</h3>
              <p>Senior Real Estate Agent</p>
            </div>

            <div className="about-agent-card">
              <img
                src="/assets/agent1.png"
                alt="Jane Doe"
                className="about-agent-image"
              />
              <h3>Jane Doe</h3>
              <p>Property Specialist</p>
            </div>

            <div className="about-agent-card">
              <img
                src="/assets/agent1.png"
                alt="Robert Wilson"
                className="about-agent-image"
              />
              <h3>Robert Wilson</h3>
              <p>Investment Advisor</p>
            </div>

            <div className="about-agent-card">
              <img
                src="/assets/agent1.png"
                alt="Lisa Brown"
                className="about-agent-image"
              />
              <h3>Lisa Brown</h3>
              <p>Rental Manager</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted Companies Section */}
      <div className="about-companies-section">
        <p className="about-companies-text">
          Trusted by leading companies and organizations
        </p>
        <div className="about-logo-slider">
          <div className="about-logo-container">
            {/* First set of logos */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg"
              alt="Slack"
              className="about-company-logo"
            />
            <img
              src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
              alt="Google"
              className="about-company-logo"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg"
              alt="Airbnb"
              className="about-company-logo"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg"
              alt="Spotify"
              className="about-company-logo"
            />

            {/* Duplicate set for smooth loop */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg"
              alt="Slack"
              className="about-company-logo"
            />
            <img
              src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
              alt="Google"
              className="about-company-logo"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg"
              alt="Airbnb"
              className="about-company-logo"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg"
              alt="Spotify"
              className="about-company-logo"
            />
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        id="aboutBackToTop"
        className="about-back-to-top"
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <i className="fas fa-chevron-up"></i>
      </button>
    </div>
  );
};

export default About;
