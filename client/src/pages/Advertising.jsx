import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import advertisingAPI from "../services/advertisingAPI";
import { getPropertyImageUrl } from "../utils/imageUtils";
import "./Advertising.css";

const Advertising = () => {
  // const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sellerProperties, setSellerProperties] = useState([]);
  const [isSeller, setIsSeller] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [currentStep, setCurrentStep] = useState("properties");
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetchAdvertisingData();
  }, []);

  const fetchAdvertisingData = async () => {
    try {
      setLoading(true);
      const response = await advertisingAPI.getAdvertisingData();

      if (response.success) {
        setSellerProperties(response.data.sellerProperties || []);
        setIsSeller(response.data.isSeller);
        setPackages(response.data.packages || []);
      }
    } catch (error) {
      console.error("Error fetching advertising data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProperty = (property) => {
    setSelectedProperty(property);
    setCurrentStep("packages");
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleBackToProperties = () => {
    setCurrentStep("properties");
    setSelectedProperty(null);
    setSelectedPackage(null);
  };

  const handleFinalizeAdvertising = async () => {
    if (!selectedProperty || !selectedPackage) {
      alert("Please select both a property and a package");
      return;
    }

    try {
      const response = await advertisingAPI.createPackage({
        propertyId: selectedProperty._id,
        packageType: selectedPackage.type,
      });

      if (response.success) {
        alert("Advertising package created successfully!");
        // Refresh data
        await fetchAdvertisingData();
        // Reset selection
        setCurrentStep("properties");
        setSelectedProperty(null);
        setSelectedPackage(null);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create advertising package";
      alert(message);
    }
  };

  const handleCancelPackage = async (advertisingId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this advertising package?"
      )
    ) {
      return;
    }

    try {
      const response = await advertisingAPI.cancelPackage(advertisingId);
      if (response.success) {
        alert("Package cancelled successfully");
        await fetchAdvertisingData();
      }
    } catch (error) {
      alert("Failed to cancel package");
      console.error("Error canceling package:", error);
    }
  };

  const handleGetStarted = () => {
    const servicesSection = document.querySelector(".services");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const calculateTimeRemaining = (advertising) => {
    const now = new Date();
    const endDate = new Date(advertising.endDate);
    const startDate = new Date(advertising.startDate);
    const totalDuration = endDate - startDate;
    const timeRemaining = endDate - now;

    const percentRemaining =
      timeRemaining > 0 && totalDuration > 0
        ? Math.max(
            0,
            Math.min(100, Math.round((timeRemaining / totalDuration) * 100))
          )
        : 0;

    const daysRemaining = Math.max(
      0,
      Math.ceil(timeRemaining / (1000 * 60 * 60 * 24))
    );

    return { percentRemaining, daysRemaining };
  };

  const activeProperties = sellerProperties.filter(
    (p) => p.status === "active" && p.approvalStatus === "approved"
  );
  // const propertiesWithoutAds = activeProperties.filter((p) => !p.advertising);
  const showNoPropertiesMessage = activeProperties.every((p) => p.advertising);

  return (
    <div className="advertising-page">
      {/* Hero Banner */}
      <div className="hero-banner">
        <img
          src="/assets/hero-banner.png"
          alt="Hero Banner"
          className="banner-image"
        />
        <div className="content">
          <h1>Advertise your Property with Max Visibility</h1>
          <p>
            Here, posting a listing is just the beginning. Connect with people,
            seamless onboarding and more.
          </p>
          <div className="features">
            <div className="feature-item">
              <i className="fas fa-check"></i>
              <span className="adv-text-dark">
                Fill vacancies and manage properties
              </span>
            </div>
            <div className="feature-item">
              <i className="fas fa-check"></i>
              <span className="adv-text-dark">
                Over 30 million visitors each month
              </span>
            </div>
            <div className="feature-item">
              <i className="fas fa-check"></i>
              <span className="adv-text-dark">A brand you can trust</span>
            </div>
          </div>
          <button id="getStartedBtn" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
      </div>

      {/* Seller Properties Section */}
      {isSeller && sellerProperties.length > 0 && (
        <div className="seller-properties reveal">
          <h2>Your Properties</h2>
          <p>
            Select a property to advertise and choose from our premium packages
            to increase visibility
          </p>

          {/* Step 1: Property Selection */}
          {currentStep === "properties" && (
            <div id="property-selection" className="selection-step active-step">
              <h3 className="step-title">
                <span className="step-number">1</span> Select a Property
              </h3>

              {!showNoPropertiesMessage ? (
                <div className="property-grid">
                  {activeProperties.map((property) => (
                    <div
                      key={property._id}
                      className="property-card"
                      data-property-id={property._id}
                    >
                      <div className="adv-property-image">
                        <img
                          src={getPropertyImageUrl(property.images?.[0])}
                          alt={property.title}
                          onError={(e) =>
                            (e.target.src = "/assets/property-1.jpg")
                          }
                        />
                        {property.tag && (
                          <div
                            className={`property-tag ${property.tag.toLowerCase()}`}
                          >
                            FOR {property.tag.toUpperCase()}
                          </div>
                        )}
                        {property.advertising && (
                          <div className="advertising-badge">
                            <i className="fas fa-ad"></i> Advertised
                          </div>
                        )}
                      </div>
                      <div className="property-details">
                        <h3>{property.title}</h3>
                        <p className="property-location">
                          <i className="fas fa-map-marker-alt"></i>{" "}
                          {property.location}
                        </p>
                        <p className="adv-property-price">{property.price}</p>
                        <div className="property-features">
                          <span>
                            <i className="fas fa-bed"></i>{" "}
                            {property.features?.beds} Beds
                          </span>
                          <span>
                            <i className="fas fa-bath"></i>{" "}
                            {property.features?.baths} Baths
                          </span>
                          <span>
                            <i className="fas fa-ruler-combined"></i>{" "}
                            {property.features?.sqft} sqft
                          </span>
                        </div>

                        {property.advertising ? (
                          <div className="current-package">
                            <p>
                              Current Package:{" "}
                              <strong>
                                {property.advertising.packageType
                                  ?.charAt(0)
                                  .toUpperCase() +
                                  property.advertising.packageType?.slice(1) ||
                                  "Standard"}
                              </strong>
                            </p>
                            <p>
                              Expires:{" "}
                              {new Date(
                                property.advertising.endDate
                              ).toLocaleDateString()}
                            </p>

                            {(() => {
                              const { percentRemaining, daysRemaining } =
                                calculateTimeRemaining(property.advertising);
                              return (
                                <>
                                  <div className="time-remaining-container">
                                    <p className="time-remaining-text">
                                      {daysRemaining} day
                                      {daysRemaining !== 1 ? "s" : ""} remaining
                                    </p>
                                    <div className="time-remaining-bar">
                                      <div
                                        className="time-remaining-progress"
                                        style={{
                                          width: `${percentRemaining}%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                  <button
                                    className="cancel-package-btn"
                                    onClick={() =>
                                      handleCancelPackage(
                                        property.advertising._id
                                      )
                                    }
                                  >
                                    Cancel Package
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <button
                            className="select-property-btn"
                            onClick={() => handleSelectProperty(property)}
                          >
                            Select This Property
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div id="no-advertising-properties" className="active-step">
                  <div className="empty-state">
                    <i className="fas fa-ad empty-icon"></i>
                    <h3>No Properties Available for Advertising</h3>
                    <p>
                      All your properties already have active advertising
                      packages.
                    </p>
                    <p>You can cancel existing packages to create new ones.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Package Selection */}
          {currentStep === "packages" && selectedProperty && (
            <div id="package-selection" className="selection-step active-step">
              <h3 className="step-title">
                <span className="step-number">2</span> Choose an Advertising
                Package
              </h3>
              <button
                id="back-to-properties"
                className="back-button"
                onClick={handleBackToProperties}
              >
                <i className="fas fa-arrow-left"></i> Back to Properties
              </button>

              <div className="selected-property-preview">
                <h4>
                  Selected Property:{" "}
                  <span id="selected-property-title">
                    {selectedProperty.title}
                  </span>
                </h4>
                <p id="selected-property-location">
                  {selectedProperty.location}
                </p>
              </div>

              <div className="packages-container">
                {packages.map((pkg) => (
                  <div
                    key={pkg.type}
                    className={`package ${
                      pkg.type === "premium" ? "recommended" : ""
                    } ${selectedPackage?.type === pkg.type ? "selected" : ""}`}
                  >
                    {pkg.type === "premium" && (
                      <div className="recommended-badge">RECOMMENDED</div>
                    )}
                    <h5>{pkg.name}</h5>
                    <p className="price">${pkg.price}</p>
                    <p className="duration">{pkg.duration} days</p>
                    <ul>
                      {pkg.features.map((feature, index) => (
                        <li key={index}>
                          <i className="fas fa-check"></i> {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      className="package-option"
                      onClick={() => handleSelectPackage(pkg)}
                    >
                      Select {pkg.name}
                    </button>
                  </div>
                ))}
              </div>

              <div className="package-summary">
                <h4>Your Selection</h4>
                <div id="selected-package-info">
                  {selectedPackage ? (
                    <div>
                      <p>
                        <strong>Package:</strong> {selectedPackage.name}
                      </p>
                      <p>
                        <strong>Duration:</strong> {selectedPackage.duration}{" "}
                        days
                      </p>
                      <p>
                        <strong>Price:</strong> ${selectedPackage.price}
                      </p>
                    </div>
                  ) : (
                    <p>No package selected</p>
                  )}
                </div>
                <button
                  id="finalize-btn"
                  className="finalize-button"
                  disabled={!selectedPackage}
                  onClick={handleFinalizeAdvertising}
                >
                  Finalize Advertising
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Services Section */}
      <div className="services reveal">
        <h2>Our Services</h2>
        <p>
          Maximize your property's exposure with our premium marketing tools
        </p>

        <div className="service-container">
          <div className="service-box reveal">
            <i className="fas fa-home"></i>
            <h3>Featured Listing</h3>
            <p>
              Get premium placement in search results and enhanced visibility
              for your property listing
            </p>
          </div>

          <div
            className="service-box reveal"
            style={{ animationDelay: "0.2s" }}
          >
            <i className="fas fa-eye"></i>
            <h3>Enhanced Visibility</h3>
            <p>
              Stand out with professional photos and detailed property
              information to attract quality tenants
            </p>
          </div>

          <div
            className="service-box reveal"
            style={{ animationDelay: "0.4s" }}
          >
            <i className="fas fa-tags"></i>
            <h3>Keyword Tagging</h3>
            <p>
              Optimize your listing with relevant keywords to reach the right
              audience searching for your property
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="comparison-section reveal">
        <h2>How it stacks up against the competition</h2>
        <div className="comparison-table">
          <div className="table-header">
            <div className="col">What's included</div>
            <div className="col">Homescape Service</div>
            <div className="col">Typical Advertising services*</div>
          </div>

          <div className="table-row">
            <div className="col">Ongoing rental pricing guidance</div>
            <div className="col">
              <i className="fas fa-check"></i>
            </div>
            <div className="col"></div>
          </div>

          <div className="table-row">
            <div className="col">Homescape Premium listings</div>
            <div className="col">
              <i className="fas fa-check"></i>
            </div>
            <div className="col"></div>
          </div>

          <div className="table-row">
            <div className="col">Real estate agent-led tours</div>
            <div className="col">
              <i className="fas fa-check"></i>
              <span className="subtitle">Fast availability</span>
            </div>
            <div className="col">
              <i className="fas fa-check"></i>
            </div>
          </div>

          <div className="table-row">
            <div className="col">Tenant screening</div>
            <div className="col">
              <i className="fas fa-check"></i>
            </div>
            <div className="col">
              <i className="fas fa-check"></i>
            </div>
          </div>

          <div className="table-row">
            <div className="col">Lease preparation</div>
            <div className="col">
              <i className="fas fa-check"></i>
            </div>
            <div className="col">
              <i className="fas fa-check"></i>
            </div>
          </div>

          <div className="table-row">
            <div className="col">Owner dashboard</div>
            <div className="col">
              <i className="fas fa-check"></i>
            </div>
            <div className="col"></div>
          </div>

          <div className="table-row">
            <div className="col">Competitive pricing</div>
            <div className="col">
              <i className="fas fa-check"></i>
              <span className="subtitle">50% first month's rent</span>
            </div>
            <div className="col">
              <span className="subtitle">75-100% first month's rent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="statistics reveal">
        <h2>Reach serious home shoppers</h2>
        <div className="stats-container">
          <div className="stat">
            <i className="fas fa-users"></i>
            <h3>73M</h3>
            <p>Unique visitors</p>
          </div>
          <div className="stat">
            <i className="fas fa-calendar-alt"></i>
            <h3>31%</h3>
            <p>Monthly adults reached</p>
          </div>
          <div className="stat">
            <i className="fas fa-clock"></i>
            <h3>90%</h3>
            <p>Listings updated every 15 min</p>
          </div>
          <img
            src="/assets/img-side.png"
            alt="Side Image"
            className="side-image"
          />
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default Advertising;
