import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./footer.css";

function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleGetStarted = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);

    try {
      // Simulate API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Successfully signed up! Welcome to HomeScape!");
      setEmail("");
    } catch {
      toast.error("Failed to sign up. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <>
      {/* Parallax Section */}
      <section className="pimg1">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 120px",
            height: "50vh",
          }}
        >
          <div className="ptext">
            <span className="textBg">HomeScape</span>
          </div>
          <div style={{ marginLeft: "40px" }}>
            <form onSubmit={handleGetStarted}>
              <div className="email-container">
                <input
                  type="email"
                  placeholder="Email address"
                  className="email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubscribing}
                />
                <button
                  type="submit"
                  className="get-started-btn"
                  disabled={isSubscribing}
                >
                  {isSubscribing ? "Please wait..." : "Get Started"}
                </button>
              </div>
            </form>
            <p className="sign-in-text">
              Already a Member?{" "}
              <Link to="/auth/signin" className="sign-in-link">
                Sign in.
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          {/* Contact Section */}
          <div className="footer-section">
            <div className="contact-info">
              <p>IIIT - Sri City,</p>
              <p>Sri City , 517646</p>
              <p>homescape@demo.com</p>
            </div>
            <div className="social-icons">
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className="footer-section">
            <h3>Links</h3>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/model">Price Prediction</Link>
              </li>
              <li>
                <Link to="/advertising">Advertise With Us</Link>
              </li>
              <li>
                <Link to="/loans/emi-calculator">Loan and Emi</Link>
              </li>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="footer-section">
            <h3>Legal</h3>
            <ul>
              <li>
                <Link to="/terms">Terms & conditions</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
              <li>
                <Link to="/faq">Faq's</Link>
              </li>
            </ul>
          </div>

          {/* New Listing Section */}
          <div className="footer-section">
            <h3>New Listing</h3>
            <ul>
              <li>
                <Link to="/properties">Buy Apartments</Link>
              </li>
              <li>
                <Link to="/properties">Rent Houses</Link>
              </li>
              <li>
                <Link to="/blogs">Latest News</Link>
              </li>
              <li>
                <Link to="/agents">Agent Connect</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="copyright">
          <p>Copyright ©2024 Homescape inc.</p>
        </div>
      </footer>
    </>
  );
}

export default Footer;
