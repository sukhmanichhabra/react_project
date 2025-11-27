import React from "react";
import { Link } from "react-router-dom";
import "./DashboardStats.css"; // <-- IMPORT THE NEW CSS

const DashboardStats = ({ user, stats }) => {
  // Default stats for Seller (can be customized)
  const defaultStats = [
    // ... (defaults remain same)
  ];

  const statCards = stats?.customStats || defaultStats;

  const getColor = (color) => {
    switch (color) {
      case "blue":
        return { bg: "#e3f2fd", icon: "#1976d2" };
      case "green":
        return { bg: "#e8f5e9", icon: "#388e3c" };
      case "orange":
        return { bg: "#fff3e0", icon: "#f57c00" };
      case "pink":
        return { bg: "#fce4ec", icon: "#d81b60" };
      case "cyan":
        return { bg: "#e0f7fa", icon: "#0097a7" };
      case "red":
        return { bg: "#ffebee", icon: "#f44336" };
      case "purple":
        return { bg: "#f3e5f5", icon: "#7b1fa2" };
      default:
        return { bg: "#f5f5f5", icon: "#555" };
    }
  };

  // Check if we should show the default account balance card
  const showDefaultBalance = user.role === "agent" || user.role === "admin";

  // Check if custom stats already include account balance
  const hasCustomBalance = statCards.some(
    (stat) => stat.label === "Account Balance" || stat.icon === "fa-wallet"
  );

  return (
    <div className="dash-stats-grid">
      {/* Account Balance Card - For Agents and Admins only, and only if not in custom stats */}
      {showDefaultBalance && !hasCustomBalance && (
        <div className="dash-stat-card">
          <div
            className="dash-stat-icon"
            style={{ backgroundColor: getColor("cyan").bg }}
          >
            <i
              className="fas fa-wallet"
              style={{ color: getColor("cyan").icon }}
            ></i>
          </div>
          <div className="dash-stat-details">
            <h3>Account Balance</h3>
            <p className="dash-stat-number">
              $
              {user.accountBalance ? user.accountBalance.toLocaleString() : "0"}
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Stats */}
      {statCards.map((stat, index) => {
        const colors = getColor(stat.color);
        return (
          <div className="dash-stat-card" key={index}>
            <div
              className="dash-stat-icon"
              style={{ backgroundColor: colors.bg }}
            >
              <i
                className={`fas ${stat.icon}`}
                style={{ color: colors.icon }}
              ></i>
            </div>
            <div className="dash-stat-details">
              <h3>{stat.label}</h3>
              <p className="dash-stat-number">{stat.value}</p>
              {stat.trend && (
                <span
                  className={`dash-stat-trend ${
                    stat.trend.startsWith("+") ? "positive" : "negative"
                  }`}
                >
                  <i
                    className={`fas ${
                      stat.trend.startsWith("+")
                        ? "fa-arrow-up"
                        : "fa-arrow-down"
                    }`}
                  ></i>
                  <span>{stat.trend.substring(1)}</span>
                </span>
              )}
              {stat.action && (
                <button
                  className="dash-stat-action-btn"
                  onClick={stat.action.onClick}
                >
                  <i className={`fas ${stat.action.icon}`}></i>
                  {stat.action.label}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
