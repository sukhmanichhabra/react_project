import React from "react";

const FilterSidebar = ({
  filters,
  onFilterChange,
  onAmenityChange,
  onLocationChange,
  onPriceUpdate,
  onApplyFilters,
  onResetFilters,
  locationSuggestions,
  showSuggestions,
  setShowSuggestions,
}) => {
  return (
    <aside className="prop-list-filter-sidebar">
      <h3>I'm looking to...</h3>
      <select
        id="propertyStatus"
        value={filters.status}
        onChange={(e) => onFilterChange("status", e.target.value)}
      >
        <option value="all">All Properties</option>
        <option value="rent">Rent Apartments</option>
        <option value="sale">Buy Apartments</option>
      </select>

      <h3>Location</h3>
      <div className="prop-list-location-container">
        <input
          type="text"
          id="locationFilter"
          placeholder="Enter city or area"
          className="prop-list-location-input"
          value={filters.location}
          onChange={onLocationChange}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {showSuggestions && (
          <div className="prop-list-location-suggestions">
            {locationSuggestions.map((location, index) => (
              <div
                key={index}
                className="prop-list-suggestion-item"
                onClick={() => {
                  onFilterChange("location", location);
                  setShowSuggestions(false);
                }}
              >
                {location}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="prop-list-price-range">
        <label htmlFor="price">Price Range:</label>
        <div className="prop-list-price-slider-container">
          <input
            type="range"
            id="minPriceRange"
            min="500"
            max="1000000"
            step="500"
            value={filters.minPrice}
            onChange={(e) =>
              onPriceUpdate(parseInt(e.target.value), filters.maxPrice)
            }
          />
          <input
            type="range"
            id="maxPriceRange"
            min="500"
            max="1000000"
            step="500"
            value={filters.maxPrice}
            onChange={(e) =>
              onPriceUpdate(filters.minPrice, parseInt(e.target.value))
            }
          />
        </div>
        <span id="prop-list-price-value">
          ${filters.minPrice.toLocaleString()} - $
          {filters.maxPrice.toLocaleString()}
          {filters.status === "rent" && (
            <span style={{ color: "#666" }}> /month</span>
          )}
        </span>
      </div>

      <h3>Bedrooms</h3>
      <select
        id="bedroomFilter"
        value={filters.bedrooms}
        onChange={(e) => onFilterChange("bedrooms", e.target.value)}
      >
        <option value="all">Any</option>
        <option value="1">1 Bedroom</option>
        <option value="2">2 Bedrooms</option>
        <option value="3">3 Bedrooms</option>
        <option value="4">4+ Bedrooms</option>
      </select>

      <div className="prop-list-amenities-grid">
        <h3>Amenities</h3>
        {[
          "A/C & Heating",
          "Garden",
          "Swimming Pool",
          "Parking",
          "Gym",
          "Security",
          "Wifi",
          "Pet Friendly",
        ].map((amenity) => (
          <label key={amenity} className="prop-list-custom-checkbox">
            <input
              type="checkbox"
              value={amenity}
              checked={filters.amenities.includes(amenity)}
              onChange={() => onAmenityChange(amenity)}
              className="prop-list-amenity-checkbox"
            />
            <span className="prop-list-checkmark"></span> {amenity}
          </label>
        ))}
      </div>

      <h3>Property Type</h3>
      <select
        id="propertyType"
        value={filters.propertyType}
        onChange={(e) => onFilterChange("propertyType", e.target.value)}
      >
        <option value="all">All Types</option>
        <option value="Apartment">Apartment</option>
        <option value="Villa">Villa</option>
        <option value="Condo">Condo</option>
        <option value="House">House</option>
      </select>

      <button
        id="filterButton"
        className="prop-list-search-btn"
        onClick={onApplyFilters}
      >
        <i className="fas fa-search" style={{ marginRight: "5px" }}></i> Search
        Properties
      </button>

      <button
        id="showAllButton"
        className="prop-list-show-all-btn"
        onClick={onResetFilters}
      >
        Show All Properties
      </button>

      <a href="/property/compare" className="prop-list-compare-properties-btn">
        <i className="fas fa-exchange-alt" style={{ marginRight: "5px" }}></i>{" "}
        Compare Properties
      </a>
    </aside>
  );
};

export default FilterSidebar;
