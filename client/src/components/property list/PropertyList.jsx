import React, { useEffect, useMemo } from "react";
import FilterSidebar from "./FilterSidebar";
import PropertyGrid from "./PropertyGrid";
import FeaturedSection from "./FeaturedSection";
import NoResults from "./NoResults";
import { usePropertyFilters } from "./usePropertyFilters";
import { useProperties } from "./useProperties";
import "./PropertyList.css";

const PropertyList = () => {
  // Fetch properties from database
  const { properties: dbProperties, loading, error } = useProperties("all");

  // Filter out sold and rented properties
  const availableProperties = useMemo(() => {
    if (!dbProperties) return [];

    return dbProperties.filter((property) => {
      const status = (property.status || "").toLowerCase();
      // Only show active, available, pending, or properties without status
      return (
        status === "active" ||
        status === "available" ||
        status === "pending" ||
        !status
      );
    });
  }, [dbProperties]);

  // Use the custom hook for filters - pass available properties only
  const {
    filters,
    filteredProperties,
    noResults,
    locationSuggestions,
    showSuggestions,
    handleLocationChange,
    handleFilterChange,
    handleAmenityChange,
    updatePriceValues,
    applyFilters,
    resetFilters,
    setShowSuggestions,
  } = usePropertyFilters(availableProperties);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="prop-list-page">
      {/* Show loading state */}
      {loading && (
        <div className="prop-list-loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          Loading properties...
        </div>
      )}

      {/* Show error state */}
      {error && (
        <div className="prop-list-error-container">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Show content when loaded */}
      {!loading && !error && (
        <div className="prop-list-container">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onAmenityChange={handleAmenityChange}
            onLocationChange={handleLocationChange}
            onPriceUpdate={updatePriceValues}
            onApplyFilters={applyFilters}
            onResetFilters={resetFilters}
            locationSuggestions={locationSuggestions}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
          />

          {/* Property Grid or No Results */}
          {noResults ? (
            <NoResults onResetFilters={resetFilters} />
          ) : (
            <PropertyGrid properties={filteredProperties} />
          )}
        </div>
      )}

      {/* Featured Section can remain if desired */}
      <FeaturedSection />
    </div>
  );
};

export default PropertyList;
