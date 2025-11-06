import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ user, activeSection, onNavClick }) => {
  const NavItem = ({ section, icon, label }) => (
    <li>
      <a
        href={`#${section}`}
        className={`dash-nav-item ${activeSection === section ? "active" : ""}`}
        onClick={() => onNavClick(section)}
      >
        <i className={`fas ${icon}`}></i>
        <span>{label}</span>
      </a>
    </li>
  );

  const renderNavItems = () => {
    switch (user.role) {
      case "buyer":
        return (
          <>
            <NavItem section="overview" icon="fa-home" label="Dashboard" />
            <NavItem
              section="my-properties"
              icon="fa-building"
              label="My Properties"
            />
            <NavItem
              section="rented-properties"
              icon="fa-key"
              label="My Rented Properties"
            />
            <li>
              <Link
                to="/rent/pay"
                className="dash-nav-item"
              >
                <i className="fas fa-file-invoice-dollar"></i>
                <span>Pay Rent</span>
              </Link>
            </li>
            <li>
              <Link
                to="/loans/my-emis"
                className="dash-nav-item"
              >
                <i className="fas fa-money-check-alt"></i>
                <span>Pay EMI</span>
              </Link>
            </li>
            <li>
              <Link
                to="/loans/my-applications"
                className="dash-nav-item"
              >
                <i className="fas fa-folder-open"></i>
                <span>My Loan Applications</span>
              </Link>
            </li>
            <NavItem section="profile" icon="fa-user" label="Update Profile" />
          </>
        );
      case "agent":
        return (
          <>
            <NavItem section="overview" icon="fa-home" label="Dashboard" />
            <NavItem
              section="managed-properties"
              icon="fa-building"
              label="Properties I Manage"
            />
            <NavItem
              section="verification"
              icon="fa-file-upload"
              label="Upload Documents"
            />
            <NavItem section="messages" icon="fa-envelope" label="Messages" />
            <NavItem section="profile" icon="fa-user" label="Update Profile" />
          </>
        );

      // --- START: ADDED SELLER ROLE ---
      case "seller":
        return (
          <>
            <NavItem section="overview" icon="fa-home" label="Dashboard" />
            <NavItem
              section="add-listing"
              icon="fa-plus-circle"
              label="Add Listing"
            />
            <NavItem
              section="my-properties"
              icon="fa-building"
              label="My Properties"
            />
            <NavItem
              section="seller-rented-properties"
              icon="fa-key"
              label="Rented Properties"
            />
            <li>
              <Link
                to="/rent/manage"
                className="dash-nav-item"
              >
                <i className="fas fa-cog"></i>
                <span>Manage Rent</span>
              </Link>
            </li>
            <NavItem
              section="advertised-properties"
              icon="fa-ad"
              label="Advertised Properties"
            />
            <NavItem
              section="transactions"
              icon="fa-history"
              label="Past Transactions"
            />
            <NavItem section="profile" icon="fa-user" label="Update Profile" />
          </>
        );      case "admin":
        return (
          <>
            <NavItem section="overview" icon="fa-home" label="Dashboard" />
            <NavItem
              section="property-approval"
              icon="fa-check-to-slot"
              label="Property Approvals"
            />
            <NavItem
              section="agent-verification"
              icon="fa-user-check"
              label="Agent Verification"
            />
            <NavItem
              section="loan-approval"
              icon="fa-hand-holding-dollar"
              label="Loan Approvals"
            />
            <NavItem
              section="manage-agents"
              icon="fa-users-cog"
              label="Manage Agents"
            />
            <NavItem
              section="geolocation-manager"
              icon="fa-map-marker-alt"
              label="Geolocation Manager"
            />
            <NavItem section="profile" icon="fa-user" label="Update Profile" />
          </>
        );

      // ... other roles
      default:
        return null;
    }
  };

  const getRoleName = () => {
    switch (user.role) {
      case "buyer":
        return "Buyer";
      case "agent":
        return "Agent";
      case "admin":
        return "Admin";
      case "seller":
        return "Seller";
      default:
        return "User";
    }
  };

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-header">
        <img src="/assets/logo_main.png" alt="Logo" />
        <h2>{getRoleName()} Dashboard</h2>
      </div>
      <nav className="dash-sidebar-nav">
        <ul>{renderNavItems()}</ul>
      </nav>
      <div className="dash-sidebar-footer">
        <Link to="/" className="dash-nav-item">
          <i className="fas fa-arrow-left"></i>
          <span>Back to Home</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
