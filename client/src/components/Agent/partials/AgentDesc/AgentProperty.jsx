import React, { useState } from "react";
import AgentPropertyCard from "./AgentPropertyCard";
import "../../styles/AgentDesc/AgentProperty.css";

// Receive properties as a prop
function AgentProperty({ properties = [] }) {
  // State
  const [activeFilter, setActiveFilter] = useState("all");

  // REMOVED: useEffect hook that fetched agent data

  // Filter properties
  const filteredProperties = properties.filter((property) => {
    if (activeFilter === "all") return true;
    return property.tag.toLowerCase() === activeFilter;
  });

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <div className="agt-desc-prop-container">
      {/* Listings Section */}
      <div className="agt-desc-prop-listings">
        <div className="agt-desc-prop-listings-header">
          <h2>
            Listings ({filteredProperties.length}{" "}
            {filteredProperties.length === 1 ? "Property" : "Properties"})
          </h2>
          <div className="agt-desc-prop-filter-buttons">
            <button
              className={`agt-desc-prop-filter-btn ${
                activeFilter === "all" ? "active" : ""
              }`}
              onClick={() => handleFilterChange("all")}
            >
              ALL
            </button>
            <button
              className={`agt-desc-prop-filter-btn ${
                activeFilter === "sale" ? "active" : ""
              }`}
              onClick={() => handleFilterChange("sale")}
            >
              SELL
            </button>
            <button
              className={`agt-desc-prop-filter-btn ${
                activeFilter === "rent" ? "active" : ""
              }`}
              onClick={() => handleFilterChange("rent")}
            >
              RENT
            </button>
          </div>
        </div>

        <div className="agt-desc-prop-listings-grid">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <AgentPropertyCard key={property._id} property={property} />
            ))
          ) : (
            <div className="agt-desc-prop-no-listings">
              <p>This agent currently has no property listings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgentProperty;
