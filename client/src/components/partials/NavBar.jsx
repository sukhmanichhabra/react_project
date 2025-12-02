import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectAuth, logoutUser } from "../../store/slices/authSlice";
import { loanAPI } from "../../services/api";
import "./navbar.css";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(selectAuth);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [hasApprovedLoans, setHasApprovedLoans] = useState(false);

  // Announcement messages
  const announcements = [
    "🎉 New Feature: Property Price Prediction Tool Now Available!",
    "📱 Try our new mobile app for faster property browsing",
    "💰 Special discount on premium listings this month",
    "🏠 Virtual property tours now available for selected properties",
  ];

  // No need for rotating announcements anymore - show all in scrolling text

  // Check for approved loans if user is buyer
  useEffect(() => {
    if (user?.role === "buyer") {
      checkApprovedLoans();
    }
  }, [user]);

  // Fetch notifications and messages count
  useEffect(() => {
    if (user) {
      fetchNotificationsCount();
      fetchUnreadMessagesCount();
    }
  }, [user]);

  const fetchNotificationsCount = async () => {
    try {
      const response = await fetch("/api/notifications/count");
      const data = await response.json();
      if (data.success) {
        setNotifications(data.count);
      }
    } catch (error) {
      console.error("Error fetching notifications count:", error);
    }
  };

  const fetchUnreadMessagesCount = async () => {
    try {
      const response = await fetch("/api/messages/unread-count");
      const data = await response.json();
      if (data.success) {
        setUnreadMessages(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread messages count:", error);
    }
  };

  const checkApprovedLoans = async () => {
    try {
      const response = await loanAPI.hasApprovedLoans();
      if (response.data.success) {
        setHasApprovedLoans(response.data.hasApprovedLoans);
      }
    } catch (error) {
      console.error("Error checking loan status:", error);
      // Set to true by default so users can always access if they want
      setHasApprovedLoans(true);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/auth/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleDropdownToggle = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  const isHomePage = location.pathname === "/" || !location.pathname;

  return (
    <div className="navbar-container">
      {/* Announcement Bar - Only shown on homepage */}
      {isHomePage && (
        <div
          className="announcement-bar"
          role="banner"
          aria-label="Announcements"
        >
          <div className="announcement-content">
            <div className="announcement-text" aria-live="polite">
              {announcements.map((announcement, index) => (
                <span key={index}>{announcement}</span>
              ))}
              {/* Duplicate announcements for seamless scrolling */}
              {announcements.map((announcement, index) => (
                <span key={`duplicate-${index}`}>{announcement}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className={`navbar ${isHomePage ? "with-announcement" : ""}`}>
        <div className="nav-left">
          <Link to="/" className="logo">
            <img
              src="/assets/logo_main.png"
              alt="FDFED Logo"
              className="logo-image"
            />
          </Link>
        </div>

        <div className="nav-middle">
          {user?.role === "admin" ? (
            /* Admin Navigation */
            <div className="admin-nav">
              <Link to="/" className="nav-link admin-link">
                <i className="fas fa-home"></i> Home
              </Link>
              <Link
                to="/dashboard#property-approval"
                className="nav-link admin-link"
              >
                <i className="fas fa-check-circle"></i> Property Approvals
              </Link>
              <Link to="/blog/add" className="nav-link admin-link">
                <i className="fas fa-edit"></i> Add Blog
              </Link>
              <Link to="/chatbot/admin" className="nav-link admin-link">
                <i className="fas fa-robot"></i> Chatbot
              </Link>
              <Link to="/activity/log" className="nav-link admin-link">
                <i className="fas fa-chart-line"></i> Activity Log
              </Link>
            </div>
          ) : (
            /* Regular User Navigation */
            <>
              <Link
                to="/"
                className={`nav-link ${isCurrentPath("/") ? "active" : ""}`}
              >
                Home
              </Link>

              <Link
                to="/agents"
                className={`nav-link ${
                  isCurrentPath("/agents") ? "active" : ""
                }`}
              >
                Our Agents
              </Link>

              <Link
                to="/blogs"
                className={`nav-link ${
                  isCurrentPath("/blogs") ? "active" : ""
                }`}
              >
                News
              </Link>

              <div className="nav-dropdown">
                <Link
                  to="/properties"
                  className={`nav-link ${
                    isCurrentPath("/properties") ? "active" : ""
                  }`}
                >
                  Property
                </Link>
                <div className="dropdown-content">
                  <div className="dropdown-grid">
                    <div className="dropdown-column">
                      <h3>Browse Properties</h3>
                      <Link to="/properties">
                        <i className="fas fa-home"></i> All Properties
                      </Link>
                      <Link to="/properties/compare">
                        <i className="fas fa-exchange-alt"></i> Compare
                        Properties
                      </Link>
                    </div>
                    <div className="dropdown-column">
                      <h3>Property Visits</h3>
                      {user?.role === "buyer" && (
                        <Link to="/visits/schedule">
                          <i className="fas fa-calendar-plus"></i> Schedule
                          Visit
                        </Link>
                      )}
                      {user?.role === "agent" && (
                        <Link to="/visits/manage">
                          <i className="fas fa-tasks"></i> Manage Visits
                        </Link>
                      )}
                      {!user && (
                        <Link to="/auth/signin">
                          <i className="fas fa-sign-in-alt"></i> Login to
                          Schedule
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="nav-dropdown">
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => e.preventDefault()}
                >
                  Finances <i className="fas fa-chevron-down"></i>
                </a>
                <div className="dropdown-content">
                  <div className="dropdown-grid">
                    <div className="dropdown-column">
                      <h3>Loans & EMI</h3>
                      <Link to="/loans/emi-calculator">
                        <i className="fas fa-calculator"></i> EMI Calculator
                      </Link>
                      {user?.role === "buyer" && (
                        <>
                          <Link to="/loans/apply">
                            <i className="fas fa-file-alt"></i> Apply for Loan
                          </Link>
                          <Link to="/loans/my-applications">
                            <i className="fas fa-folder-open"></i> My Loan
                            Applications
                          </Link>
                          {hasApprovedLoans && (
                            <Link to="/loans/my-emis">
                              <i className="fas fa-money-check-alt"></i> Pay EMI
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                    <div className="dropdown-column">
                      <h3>Rent Management</h3>
                      {user?.role === "buyer" && (
                        <Link to="/rent/pay">
                          <i className="fas fa-file-invoice-dollar"></i> Pay
                          Rent
                        </Link>
                      )}
                      {user?.role === "seller" && (
                        <Link to="/rent/manage">
                          <i className="fas fa-cog"></i> Manage Rent
                        </Link>
                      )}
                      {!user && (
                        <Link to="/auth/signin">
                          <i className="fas fa-sign-in-alt"></i> Login to Access
                        </Link>
                      )}
                    </div>
                    <div className="dropdown-column">
                      <h3>Tools & Analytics</h3>
                      <Link to="/model">
                        <i className="fas fa-chart-line"></i> Price Prediction
                      </Link>
                      <Link to="/pricing">
                        <i className="fas fa-tags"></i> Pricing
                      </Link>
                      <Link to="/trend">
                        <i className="fas fa-chart-area"></i> Market Trends
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="nav-dropdown">
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => e.preventDefault()}
                >
                  About Us <i className="fas fa-chevron-down"></i>
                </a>
                <div className="dropdown-content">
                  <div className="dropdown-grid">
                    <div className="dropdown-column">
                      <h3>About Us</h3>
                      <Link to="/about">About Us</Link>
                      <Link to="/contact">Contact Us</Link>
                      <Link to="/faq">FAQ</Link>
                      {user && (
                        <Link to="/chat" className="nav-link chat-link">
                          Messages
                          {unreadMessages > 0 && (
                            <span className="message-indicator">
                              {unreadMessages}
                            </span>
                          )}
                        </Link>
                      )}
                      <Link to="/chatbot">Chatbot</Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Role-specific navigation */}
          {user && (
            <>
              {user.role === "seller" && (
                <>
                  <Link to="/advertising" className="nav-link">
                    Advertise with Us
                  </Link>
                  <div className="nav-dropdown">
                    <a
                      href="#"
                      className="nav-link"
                      onClick={(e) => e.preventDefault()}
                    >
                      Properties <i className="fas fa-chevron-down"></i>
                    </a>
                    <div className="dropdown-content">
                      <div className="dropdown-grid">
                        <div className="dropdown-column">
                          <h3>Properties</h3>
                          <Link to="/dashboard#add-listing">List Property</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {user.role === "buyer" && (
                <>
                  <Link to="/dashboard#my-properties" className="nav-link">
                    My Properties
                  </Link>
                  <div className="nav-dropdown">
                    <a
                      href="#"
                      className="nav-link"
                      onClick={(e) => e.preventDefault()}
                    >
                      Visits <i className="fas fa-chevron-down"></i>
                    </a>
                    <div className="dropdown-content">
                      <div className="dropdown-grid">
                        <div className="dropdown-column">
                          <h3>Visits</h3>
                          <Link to="/visits/my-visits">My Visits</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {user.role === "agent" && (
                <Link to="/visits/agent" className="nav-link">
                  Visit Requests
                </Link>
              )}
            </>
          )}
        </div>

        <div className="nav-right">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <Link to="/notifications" className="notification-bell-link">
                <div className="notification-bell">
                  <i className="fas fa-bell"></i>
                  {notifications > 0 && (
                    <span className="notification-count-badge">
                      {notifications}
                    </span>
                  )}
                </div>
              </Link>

              <Link
                to="/dashboard"
                className={`user-name ${
                  user?.role === "admin" ? "admin-user-name" : ""
                }`}
              >
                <i
                  className={
                    user?.role === "admin" ? "fas fa-crown" : "fas fa-star"
                  }
                ></i>
                {user?.name}
                {user?.role === "admin" && <span>(Admin)</span>}
              </Link>

              <Link to="/settings" className="login-btn">
                <i className="fas fa-cog"></i> Settings
              </Link>

              <button
                onClick={handleLogout}
                className={`logout-btn ${
                  user?.role === "admin" ? "admin-logout-btn" : ""
                }`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/signin" className="login-btn">
                Login
              </Link>
              <Link to="/auth/signup" className="login-btn">
                Signup
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <i className="fas fa-bars"></i>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <Link to="/" className="logo" onClick={closeMobileMenu}>
              <img src="/assets/logo_main.png" alt="FDFED Logo" />
            </Link>
            <button className="close-menu" onClick={closeMobileMenu}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="mobile-nav-items">
            {user?.role === "admin" ? (
              /* Admin Mobile Navigation */
              <>
                <Link
                  to="/"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  <span>
                    <i className="fas fa-home"></i> Home
                  </span>
                </Link>
                <Link
                  to="/dashboard"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  <span>
                    <i className="fas fa-tachometer-alt"></i> Dashboard
                  </span>
                </Link>
                <Link
                  to="/dashboard#property-approval"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  <span>
                    <i className="fas fa-check-circle"></i> Property Approvals
                  </span>
                </Link>
                <Link
                  to="/blog/add"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  <span>
                    <i className="fas fa-edit"></i> Add Blog
                  </span>
                </Link>
              </>
            ) : (
              /* Regular User Mobile Navigation */
              <>
                <Link
                  to="/"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  <span>Home</span>
                </Link>
                <Link
                  to="/agents"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  <span>Our Agents</span>
                </Link>
                <Link
                  to="/blogs"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  <span>News and Insights</span>
                </Link>
                <Link
                  to="/properties"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  <span>
                    <i className="fas fa-home"></i> All Properties
                  </span>
                </Link>
                <Link
                  to="/properties/compare"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  <span>
                    <i className="fas fa-exchange-alt"></i> Compare Properties
                  </span>
                </Link>

                {user && (
                  <>
                    <Link
                      to="/notifications"
                      className="mobile-nav-link"
                      onClick={closeMobileMenu}
                    >
                      <span>
                        <i className="fas fa-bell"></i> Notifications
                      </span>
                      {notifications > 0 && (
                        <span className="notification-count-badge">
                          {notifications}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/chat"
                      className="mobile-nav-link chat-link"
                      onClick={closeMobileMenu}
                    >
                      <span>Messages</span>
                      {unreadMessages > 0 && (
                        <span className="message-indicator">
                          {unreadMessages}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                <a
                  href="#"
                  className="mobile-nav-link toggle-submenu"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDropdownToggle("finances");
                  }}
                >
                  <span>Finances</span>
                  <i className="fas fa-chevron-down"></i>
                </a>
                {openDropdown === "finances" && (
                  <div className="mobile-submenu">
                    <Link to="/loans/emi-calculator" onClick={closeMobileMenu}>
                      Loan and EMI
                    </Link>
                    {user?.role === "buyer" && hasApprovedLoans && (
                      <Link to="/loans/my-emis" onClick={closeMobileMenu}>
                        Pay EMI
                      </Link>
                    )}
                    <Link to="/model" onClick={closeMobileMenu}>
                      Price Prediction
                    </Link>
                    <Link to="/pricing" onClick={closeMobileMenu}>
                      Pricing
                    </Link>
                    <Link to="/trend" onClick={closeMobileMenu}>
                      Market Trends
                    </Link>
                  </div>
                )}

                <Link
                  to="/advertising"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  <span>Advertise with Us</span>
                </Link>

                <a
                  href="#"
                  className="mobile-nav-link toggle-submenu"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDropdownToggle("about");
                  }}
                >
                  <span>About Us</span>
                  <i className="fas fa-chevron-down"></i>
                </a>
                {openDropdown === "about" && (
                  <div className="mobile-submenu">
                    <Link to="/about" onClick={closeMobileMenu}>
                      About Us
                    </Link>
                    <Link to="/contact" onClick={closeMobileMenu}>
                      Contact Us
                    </Link>
                    <Link to="/faq" onClick={closeMobileMenu}>
                      FAQ
                    </Link>
                    {user && (
                      <Link
                        to="/chat"
                        className="chat-link"
                        onClick={closeMobileMenu}
                      >
                        <span>Messages</span>
                        {unreadMessages > 0 && (
                          <span className="message-indicator">
                            {unreadMessages}
                          </span>
                        )}
                      </Link>
                    )}
                  </div>
                )}

                {user && (
                  <>
                    {user.role === "seller" && (
                      <>
                        <Link
                          to="/dashboard#my-properties"
                          className="mobile-nav-link"
                          onClick={closeMobileMenu}
                        >
                          <span>My Properties</span>
                        </Link>
                        <Link
                          to="/dashboard#add-listingg"
                          className="mobile-nav-link"
                          onClick={closeMobileMenu}
                        >
                          <span>List Property</span>
                        </Link>
                      </>
                    )}

                    {user.role === "buyer" && (
                      <>
                        <Link
                          to="/dashboard#my-properties"
                          className="mobile-nav-link"
                          onClick={closeMobileMenu}
                        >
                          <span>My Properties</span>
                        </Link>
                        <Link
                          to="/visits/my-visits"
                          className="mobile-nav-link"
                          onClick={closeMobileMenu}
                        >
                          <span>My Visits</span>
                        </Link>
                      </>
                    )}

                    {user.role === "agent" && (
                      <Link
                        to="/visits/agent"
                        className="mobile-nav-link"
                        onClick={closeMobileMenu}
                      >
                        <span>Visit Requests</span>
                      </Link>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <div className="mobile-nav-actions">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`user-name ${
                    user?.role === "admin" ? "admin-user-name" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  <i
                    className={
                      user?.role === "admin" ? "fas fa-crown" : "fas fa-star"
                    }
                  ></i>
                  {user?.name}
                  {user?.role === "admin" && <span>(Admin)</span>}
                </Link>
                <Link
                  to="/settings"
                  className="login-btn"
                  onClick={closeMobileMenu}
                >
                  <i className="fas fa-cog"></i> Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className={`logout-btn ${
                    user?.role === "admin" ? "admin-logout-btn" : ""
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/signin"
                  className="login-btn"
                  onClick={closeMobileMenu}
                >
                  <i className="fas fa-sign-in-alt"></i> Login
                </Link>
                <Link
                  to="/auth/signup"
                  className="login-btn"
                  onClick={closeMobileMenu}
                >
                  <i className="fas fa-user-plus"></i> Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
