import React from "react";

const NoResults = ({ onResetFilters }) => {
  return (
    <div id="noResultsMessage" className="prop-list-no-results-message">
      <div className="prop-list-no-results-icon">
        <i className="fas fa-search"></i>
      </div>
      <h3>No properties match your search criteria</h3>
      <p>
        We couldn't find any properties that match all your selected filters.
      </p>
      <div className="prop-list-filter-suggestions">
        <p>Try these suggestions:</p>
        <ul>
          <li>
            <i className="fas fa-check-circle"></i>
            Expand your price range
          </li>
          <li>
            <i className="fas fa-check-circle"></i>
            Try a different location
          </li>
          <li>
            <i className="fas fa-check-circle"></i>
            Select fewer amenities
          </li>
        </ul>
      </div>
      <div className="prop-list-action-buttons">
        <button
          className="prop-list-reset-filters-btn"
          onClick={onResetFilters}
        >
          <i className="fas fa-redo-alt"></i> Reset All Filters
        </button>
      </div>
    </div>
  );
};

export default NoResults;
