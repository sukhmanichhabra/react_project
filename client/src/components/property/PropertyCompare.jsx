import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PropertyCompare.css";

const PropertyCompare = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [compareData, setCompareData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const searchTerm = watch("search");

  useEffect(() => {
    console.log(
      "PropertyCompare useEffect triggered, location:",
      location.search
    );

    // Check for property IDs from URL
    const urlParams = new URLSearchParams(location.search);
    const propertyIds = urlParams.get("propertyIds");

    if (propertyIds) {
      console.log("Found propertyIds in URL:", propertyIds);
      const ids = propertyIds.split(",").filter((id) => id.trim());
      if (ids.length > 0) {
        // Create minimal property objects from IDs for immediate display
        const minimalProperties = ids.map((id) => ({
          id,
          title: `Property ${id}`,
          price: "Loading...",
          location: "Loading...",
        }));
        setSelectedProperties(minimalProperties);

        // Trigger fetching by setting a state that will cause the second useEffect to run
        setCompareData([]);
      }
    } else {
      console.log("No propertyIds in URL, loading from localStorage");
      // Load from localStorage inline
      const saved = localStorage.getItem("compareList");
      console.log("Loading saved comparisons from localStorage:", saved);

      if (saved) {
        try {
          const compareList = JSON.parse(saved);
          console.log("Parsed compare list:", compareList);

          if (compareList.length > 0) {
            const ids = compareList.map((item) => item.id);
            console.log(
              "Setting selected properties and fetching comparison data for IDs:",
              ids
            );

            setSelectedProperties(compareList);

            // Automatically fetch comparison data if we have properties
            // This will be handled by the second useEffect when selectedProperties changes
          }
        } catch (error) {
          console.error("Error loading saved comparisons:", error);
        }
      }
    }
  }, [location]);

  // Separate useEffect to watch for selectedProperties changes and auto-fetch if needed
  useEffect(() => {
    console.log("Selected properties changed:", selectedProperties);

    // If we have 2+ selected properties but no compare data, fetch it
    if (
      selectedProperties.length >= 2 &&
      compareData.length === 0 &&
      !isLoading
    ) {
      const ids = selectedProperties.map((p) => p.id);
      console.log("Auto-fetching comparison data for:", ids);

      // Inline fetch to avoid dependency issues
      const fetchData = async () => {
        setIsLoading(true);
        console.log("Fetching properties for comparison:", ids);

        try {
          let properties = [];

          // Try individual property fetches
          const propertyPromises = ids.map(async (id) => {
            try {
              const propResponse = await axios.get(`/api/property/${id}`);
              return (
                propResponse.data.property ||
                propResponse.data.data ||
                propResponse.data
              );
            } catch (error) {
              console.error(`Failed to fetch property ${id}:`, error);
              return null;
            }
          });

          const fetchedProperties = await Promise.all(propertyPromises);
          properties = fetchedProperties.filter((prop) => prop !== null);

          // If we still don't have properties, try getting all and filtering
          if (properties.length === 0) {
            console.log("Trying to get all properties and filter...");
            try {
              const allPropsResponse = await axios.get("/api/property/all");
              const allProperties =
                allPropsResponse.data.properties ||
                allPropsResponse.data.data ||
                allPropsResponse.data ||
                [];
              properties = allProperties.filter(
                (prop) => ids.includes(prop._id) || ids.includes(prop.id)
              );
            } catch (allError) {
              console.error("Failed to fetch all properties:", allError);
            }
          }

          console.log("Fetched properties for comparison:", properties);
          setCompareData(properties);
        } catch (error) {
          console.error("Error fetching properties for comparison:", error);
          setCompareData([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [selectedProperties, compareData.length, isLoading]);

  const fetchPropertiesForComparison = async (propertyIds) => {
    if (!propertyIds || propertyIds.length === 0) return;

    setIsLoading(true);
    console.log("Fetching properties for comparison:", propertyIds);

    try {
      // Try the compare endpoint first
      let response;
      let properties = [];

      try {
        response = await axios.get(
          `/property/compare?propertyIds=${propertyIds.join(",")}`
        );
        if (response.data.properties) {
          properties = response.data.properties;
        }
      } catch (compareError) {
        console.warn(
          "Compare endpoint failed, trying individual fetches:",
          compareError
        );

        // Fallback: fetch individual properties
        const propertyPromises = propertyIds.map(async (id) => {
          try {
            const propResponse = await axios.get(`/api/property/${id}`);
            return (
              propResponse.data.property ||
              propResponse.data.data ||
              propResponse.data
            );
          } catch (error) {
            console.error(`Failed to fetch property ${id}:`, error);
            return null;
          }
        });

        const fetchedProperties = await Promise.all(propertyPromises);
        properties = fetchedProperties.filter((prop) => prop !== null);
      }

      // If we still don't have properties, try getting all and filtering
      if (properties.length === 0) {
        console.log("Trying to get all properties and filter...");
        try {
          const allPropsResponse = await axios.get("/api/property/all");
          const allProperties =
            allPropsResponse.data.properties ||
            allPropsResponse.data.data ||
            allPropsResponse.data ||
            [];
          properties = allProperties.filter(
            (prop) =>
              propertyIds.includes(prop._id) || propertyIds.includes(prop.id)
          );
        } catch (allError) {
          console.error("Failed to fetch all properties:", allError);
        }
      }

      console.log("Fetched properties for comparison:", properties);
      setCompareData(properties);

      // If we still have no properties but have selectedProperties with basic data,
      // use the selectedProperties as a fallback for basic comparison
      if (properties.length === 0 && selectedProperties.length >= 2) {
        console.log(
          "Using selectedProperties as fallback for comparison:",
          selectedProperties
        );
        setCompareData(selectedProperties);
      }
    } catch (error) {
      console.error("Error fetching properties for comparison:", error);

      // Fallback to selectedProperties if all API calls failed
      if (selectedProperties.length >= 2) {
        console.log(
          "API failed, using selectedProperties as fallback:",
          selectedProperties
        );
        setCompareData(selectedProperties);
      } else {
        setCompareData([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!data.search || data.search.trim().length < 2) {
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      // Try multiple search approaches
      const searchTerm = data.search.trim();

      // First try the API search
      let response;
      try {
        response = await axios.get(
          `/property/api/search?q=${encodeURIComponent(searchTerm)}`
        );
      } catch (apiError) {
        console.warn("API search failed, trying alternative:", apiError);
        // Fallback to getting all properties and filtering client-side
        response = await axios.get("/api/property/all");
      }

      let properties = [];

      if (response.data.properties) {
        properties = response.data.properties;
      } else if (response.data.data) {
        properties = response.data.data;
      } else if (Array.isArray(response.data)) {
        properties = response.data;
      }

      // If we got all properties, filter them client-side
      if (response.config.url.includes("/api/property/all")) {
        const searchLower = searchTerm.toLowerCase();
        properties = properties.filter((property) => {
          return (
            property.title?.toLowerCase().includes(searchLower) ||
            property.location?.toLowerCase().includes(searchLower) ||
            property.description?.toLowerCase().includes(searchLower) ||
            property.features?.type?.toLowerCase().includes(searchLower) ||
            (property.amenities &&
              property.amenities.some((amenity) =>
                amenity.toLowerCase().includes(searchLower)
              ))
          );
        });
      }

      setSearchResults(properties);
    } catch (error) {
      console.error("Error searching properties:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addPropertyToComparison = (property) => {
    if (selectedProperties.length >= 4) {
      alert("You can compare up to 4 properties at a time");
      return;
    }

    if (selectedProperties.some((p) => p.id === property._id)) {
      alert("Property already added to comparison");
      return;
    }

    const newProperty = {
      id: property._id,
      title: property.title,
      price: property.price,
      image: property.images[0],
      location: property.location,
    };

    const updatedSelection = [...selectedProperties, newProperty];
    setSelectedProperties(updatedSelection);

    // Save to localStorage
    localStorage.setItem("compareList", JSON.stringify(updatedSelection));
  };

  const removePropertyFromComparison = (propertyId) => {
    const updatedSelection = selectedProperties.filter(
      (p) => p.id !== propertyId
    );
    setSelectedProperties(updatedSelection);

    // Update localStorage
    localStorage.setItem("compareList", JSON.stringify(updatedSelection));

    // Update compare data
    const updatedCompareData = compareData.filter((p) => p._id !== propertyId);
    setCompareData(updatedCompareData);
  };

  const handleCompare = () => {
    if (selectedProperties.length < 2) {
      alert("Please select at least 2 properties to compare");
      return;
    }

    const propertyIds = selectedProperties.map((p) => p.id);
    console.log("Comparing properties with IDs:", propertyIds);
    console.log("Selected properties:", selectedProperties);

    // Update URL and fetch comparison data
    navigate(`/properties/compare?propertyIds=${propertyIds.join(",")}`);
    fetchPropertiesForComparison(propertyIds);
  };

  const clearAllSelections = () => {
    // Show confirmation dialog
    const confirmClear = window.confirm(
      `Are you sure you want to remove all ${selectedProperties.length} properties from comparison?\n\nThis action cannot be undone.`
    );

    if (confirmClear) {
      setSelectedProperties([]);
      setCompareData([]);
      localStorage.removeItem("compareList");

      // Trigger floating button update
      window.dispatchEvent(new CustomEvent("compareListUpdated"));

      // Show success feedback
      const successMessage = document.createElement("div");
      successMessage.className = "clear-success-message";
      successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        All properties cleared successfully
      `;
      successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideIn 0.3s ease-out;
      `;

      document.body.appendChild(successMessage);

      // Remove message after 3 seconds
      setTimeout(() => {
        successMessage.style.animation = "slideOut 0.3s ease-out";
        setTimeout(() => {
          if (document.body.contains(successMessage)) {
            document.body.removeChild(successMessage);
          }
        }, 300);
      }, 3000);

      navigate("/properties/compare");
    }
  };

  const formatPrice = (price) => {
    if (typeof price === "string") {
      return price;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="property-compare-container">
      <div className="compare-header">
        {/* <h1 className="page-title">Compare Properties</h1> */}
        <p className="page-subtitle">
          Find and compare up to 4 properties side by side to make the best
          decision
        </p>
      </div>

      {/* Selected Properties */}
      {selectedProperties.length > 0 && (
        <div className="selected-section">
          <div className="selected-header">
            <h2 className="selected-title">
              <i className="fas fa-exchange-alt"></i>
              Selected Properties ({selectedProperties.length}/4)
            </h2>
            <div className="selected-actions">
              {/* <button 
                className="compare-btn"
                onClick={handleCompare}
                disabled={selectedProperties.length < 2}
              >
                <i className="fas fa-balance-scale"></i>
                Compare Properties
              </button> */}
              <button
                className="enhanced-clear-btn"
                onClick={clearAllSelections}
                title={`Remove all ${selectedProperties.length} properties from comparison`}
              >
                <i className="fas fa-trash-alt"></i>
                <span className="clear-btn-text">Clear All</span>
                <span className="clear-btn-count">
                  ({selectedProperties.length})
                </span>
              </button>
            </div>
          </div>

          <div className="selected-properties-grid">
            {selectedProperties.map((property) => (
              <div key={property.id} className="selected-property-card">
                <img
                  src={property.image}
                  alt={property.title}
                  className="selected-property-image"
                  onError={(e) => (e.target.src = "/assets/house.jpg")}
                />
                <div className="selected-property-content">
                  <h4 className="selected-property-title">{property.title}</h4>
                  <p className="selected-property-price">
                    {formatPrice(property.price)}
                  </p>
                  <p className="selected-property-location">
                    <i className="fas fa-map-marker-alt"></i>
                    {property.location}
                  </p>
                </div>
                <button
                  className="remove-property-btn"
                  onClick={() => removePropertyFromComparison(property.id)}
                  title="Remove from comparison"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {isLoading ? (
        <div className="loading-section">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading comparison data...</p>
          </div>
        </div>
      ) : compareData.length > 0 || selectedProperties.length >= 2 ? (
        <div className="comparison-section">
          <h2 className="comparison-title">
            <i className="fas fa-chart-bar"></i>
            Property Comparison
          </h2>

          <div className="comparison-table-container">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="feature-column">Features</th>
                  {(compareData.length > 0
                    ? compareData
                    : selectedProperties
                  ).map((property) => (
                    <th
                      key={property._id || property.id}
                      className="property-column"
                    >
                      <div className="property-header">
                        <img
                          src={
                            property.images?.[0] ||
                            property.image ||
                            "/assets/house.jpg"
                          }
                          alt={property.title}
                          className="property-header-image"
                          onError={(e) => (e.target.src = "/assets/house.jpg")}
                        />
                        <div className="property-header-content">
                          <h4 className="property-header-title">
                            {property.title}
                          </h4>
                          <p className="property-header-price">
                            {property.price
                              ? formatPrice(property.price)
                              : "Price not available"}
                          </p>
                          <a
                            href={`/property/${property._id || property.id}`}
                            className="view-property-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="fas fa-external-link-alt"></i>
                            View Details
                          </a>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="feature-name">
                    <i className="fas fa-map-marker-alt"></i>
                    Location
                  </td>
                  {(compareData.length > 0
                    ? compareData
                    : selectedProperties
                  ).map((property) => (
                    <td key={property._id || property.id}>
                      {property.location || "Location not specified"}
                    </td>
                  ))}
                </tr>

                <tr className="alternate-row">
                  <td className="feature-name">
                    <i className="fas fa-home"></i>
                    Property Type
                  </td>
                  {(compareData.length > 0
                    ? compareData
                    : selectedProperties
                  ).map((property) => (
                    <td key={property._id || property.id}>
                      {property.features?.type ||
                        property.propertyType ||
                        "N/A"}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="feature-name">
                    <i className="fas fa-tag"></i>
                    Status
                  </td>
                  {(compareData.length > 0
                    ? compareData
                    : selectedProperties
                  ).map((property) => (
                    <td key={property._id || property.id}>
                      <span
                        className={`status-badge ${property.tag || "sale"}`}
                      >
                        {(property.tag || "sale") === "rent"
                          ? "FOR RENT"
                          : "FOR SALE"}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="alternate-row">
                  <td className="feature-name">
                    <i className="fas fa-ruler-combined"></i>
                    Square Feet
                  </td>
                  {(compareData.length > 0
                    ? compareData
                    : selectedProperties
                  ).map((property) => (
                    <td key={property._id || property.id}>
                      {property.features?.sqft || property.squareFeet || "N/A"}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="feature-name">
                    <i className="fas fa-bed"></i>
                    Bedrooms
                  </td>
                  {(compareData.length > 0
                    ? compareData
                    : selectedProperties
                  ).map((property) => (
                    <td key={property._id || property.id}>
                      {property.features?.beds || property.bedrooms || "N/A"}
                    </td>
                  ))}
                </tr>

                <tr className="alternate-row">
                  <td className="feature-name">
                    <i className="fas fa-bath"></i>
                    Bathrooms
                  </td>
                  {(compareData.length > 0
                    ? compareData
                    : selectedProperties
                  ).map((property) => (
                    <td key={property._id || property.id}>
                      {property.features?.baths || property.bathrooms || "N/A"}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="feature-name">
                    <i className="fas fa-utensils"></i>
                    Kitchen
                  </td>
                  {(compareData.length > 0
                    ? compareData
                    : selectedProperties
                  ).map((property) => (
                    <td key={property._id || property.id}>
                      {property.features?.kitchen || property.kitchen || "N/A"}
                    </td>
                  ))}
                </tr>

                <tr className="alternate-row">
                  <td className="feature-name">
                    <i className="fas fa-calendar-alt"></i>
                    Listed Date
                  </td>
                  {(compareData.length > 0
                    ? compareData
                    : selectedProperties
                  ).map((property) => (
                    <td key={property._id || property.id}>
                      {property.createdAt
                        ? formatDate(property.createdAt)
                        : "N/A"}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="feature-name">
                    <i className="fas fa-star"></i>
                    Rating
                  </td>
                  {(compareData.length > 0
                    ? compareData
                    : selectedProperties
                  ).map((property) => (
                    <td key={property._id || property.id}>
                      <div className="rating-display">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`fas fa-star ${
                              star <= Math.round(property.averageRating || 0)
                                ? "filled"
                                : "empty"
                            }`}
                          ></i>
                        ))}
                        <span className="rating-count">
                          ({property.reviews?.length || 0} reviews)
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="alternate-row">
                  <td className="feature-name">
                    <i className="fas fa-list"></i>
                    Amenities
                  </td>
                  {(compareData.length > 0
                    ? compareData
                    : selectedProperties
                  ).map((property) => (
                    <td key={property._id || property.id}>
                      {property.amenities && property.amenities.length > 0 ? (
                        <div className="amenities-list">
                          {property.amenities
                            .slice(0, 3)
                            .map((amenity, index) => (
                              <span key={index} className="amenity-tag">
                                <i className="fas fa-check"></i>
                                {amenity}
                              </span>
                            ))}
                          {property.amenities.length > 3 && (
                            <span className="amenity-more">
                              +{property.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="no-amenities">
                          No amenities listed
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedProperties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-content">
            <i className="fas fa-exchange-alt"></i>
            <h3>No Properties Selected</h3>
            <p>
              Search and select properties above to start comparing their
              features side by side.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PropertyCompare;
