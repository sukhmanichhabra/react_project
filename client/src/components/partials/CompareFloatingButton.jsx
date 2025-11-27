import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CompareFloatingButton.css";

const CompareFloatingButton = () => {
  const navigate = useNavigate();
  const [compareList, setCompareList] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initial load
    const updateCompareList = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("compareList")) || [];
        console.log("CompareFloatingButton: Updating compare list:", saved);
        setCompareList(saved);
        setIsVisible(saved.length > 0);
      } catch (error) {
        console.error("Error parsing compare list from localStorage:", error);
        setCompareList([]);
        setIsVisible(false);
      }
    };

    updateCompareList();

    // Listen for storage changes (when properties are added/removed)
    const handleStorageChange = () => {
      updateCompareList();
    };

    // Custom event listener for compare list updates
    window.addEventListener("compareListUpdated", updateCompareList);
    window.addEventListener("storage", handleStorageChange);

    // Reduce polling frequency to avoid performance issues
    const interval = setInterval(updateCompareList, 2000);

    return () => {
      window.removeEventListener("compareListUpdated", updateCompareList);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleCompare = () => {
    navigate("/properties/compare");
  };

  const handleClear = () => {
    console.log(
      "CompareFloatingButton: Clearing all properties from compare list"
    );
    localStorage.removeItem("compareList");
    setCompareList([]);
    setIsVisible(false);

    // Trigger update event
    window.dispatchEvent(new CustomEvent("compareListUpdated"));

    // Force page refresh for property cards to update their state
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (!isVisible || compareList.length === 0) {
    return null;
  }

  return (
    <div className="compare-floating-button">
      <div className="compare-content">
        <div className="compare-info">
          <span className="compare-count">{compareList.length}</span>
          <span className="compare-text">
            {compareList.length === 1 ? "Property" : "Properties"} Selected
          </span>
        </div>
        <div className="compare-actions">
          <button className="compare-btn" onClick={handleCompare}>
            <i className="fas fa-balance-scale"></i>
            Compare
          </button>
          <button className="clear-btn" onClick={handleClear}>
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareFloatingButton;
