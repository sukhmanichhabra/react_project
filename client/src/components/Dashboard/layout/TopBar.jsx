import React, { useState, useEffect } from "react";
import { getProfileImageUrl, handleImageError } from "../../../utils/imageUtils";
import "./Topbar.css";

const TopBar = ({ user }) => {
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleString("en-US", {
          dateStyle: "full",
          timeStyle: "short",
        })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dash-top-bar">
      <div className="dash-top-bar-left">
        <h3>Welcome back, {user.name.split(" ")[0]}!</h3>
        <p>{currentDateTime}</p>
      </div>
      <div className="dash-user-menu">
        <div className="dash-notifications">
          <i className="fas fa-bell"></i>
          <span className="dash-badge">3</span>
        </div>
        <div className="dash-profile-menu">
          <img
            src={getProfileImageUrl(user.profileImage)}
            alt="Profile"
            className="dash-avatar"
            onError={(e) => handleImageError(e, '/images/default-avatar.png')}
          />
          <span className="dash-username">{user.name}</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
