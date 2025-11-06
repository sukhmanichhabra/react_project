import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import {
  selectAuth,
  fetchUserBalance,
  updateUserBalance,
} from "../../store/slices/authSlice";
import "./propertyOverview.css";
import Gallery from "./Gallery";
import PropertyFeatures from "./PropertyFeatures";
import PropertyDetailsSection from "./PropertyDetailsSection";
import AgentDetails from "./AgentDetails";
import ReviewSection from "./ReviewSection";
import ShareModal from "./ShareModal";

const PropertyOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const [property, setProperty] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [rentInfo, setRentInfo] = useState(null);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        console.log("Fetching property with ID:", id);

        // Import API service
        const { propertyAPI } = await import("../../services/api");

        // Fetch property data
        const response = await propertyAPI.getPropertyById(id);
        console.log("Property response:", response.data);

        // Handle both direct property data and nested response
        const propertyData = response.data.property || response.data;
        const agentData = response.data.agent || null;
        const rentInfoData = response.data.rentInfo || null;

        setProperty(propertyData);
        setAgent(agentData);
        setRentInfo(rentInfoData);

        // Set main image
        if (propertyData.images && propertyData.images.length > 0) {
          setMainImage(propertyData.images[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching property:", error);
        setLoading(false);
        // You might want to show an error message to the user
      }
    };

    fetchPropertyData();
  }, [id]);

  // Fetch fresh user balance from database when component mounts
  useEffect(() => {
    if (user) {
      console.log("Fetching latest user balance from database...");
      dispatch(fetchUserBalance());
    }
  }, [dispatch]);

  const handleThumbnailClick = (image) => {
    setMainImage(image);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePurchase = async (e) => {
    e.preventDefault();

    if (!property || !user) {
      alert("Unable to process purchase. Please try again.");
      return;
    }

    // Confirm purchase
    const actionText = property.tag === "rent" ? "rent" : "buy";
    const confirmMessage =
      property.tag === "rent"
        ? `Are you sure you want to rent this property for ${property.price}?`
        : `Are you sure you want to buy this property for ${property.price}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      console.log("Processing purchase for property:", property._id);

      // Import API service
      const { propertyAPI } = await import("../../services/api");

      // Make purchase request
      const response = await propertyAPI.purchaseProperty(property._id);

      console.log("Purchase response:", response.data);

      // Show success message
      const successMessage =
        property.tag === "rent"
          ? "Property rented successfully! Redirecting to your purchases..."
          : "Property purchased successfully! Redirecting to your purchases...";

      alert(successMessage);

      // Redirect to property list or refresh page
      setTimeout(() => {
        navigate("/properties");
      }, 1000);
    } catch (error) {
      console.error("Error purchasing property:", error);

      // Handle specific error cases
      if (error.response) {
        const errorData = error.response.data;

        if (error.response.status === 400) {
          // Property not available or insufficient funds
          if (errorData.message) {
            alert(errorData.message);
          } else {
            alert(
              "Unable to complete purchase. Please check your balance and try again."
            );
          }
        } else if (error.response.status === 404) {
          alert("Property not found.");
        } else {
          alert(
            "Failed to purchase property: " +
              (errorData.message || "Unknown error")
          );
        }
      } else {
        alert("Network error. Please check your connection and try again.");
      }

      // Refresh balance and property data
      dispatch(fetchUserBalance());
      window.location.reload();
    }
  };

  const handleCancelRental = async (e) => {
    e.preventDefault();
    if (
      window.confirm(
        "Are you sure you want to cancel this rental agreement? This action cannot be undone."
      )
    ) {
      // TODO: Implement cancel rental API call
      console.log("Cancelling rental for property:", property.id);
      alert("Cancel rental functionality will be implemented with backend API");
    }
  };

  const handleCancelAgreement = async (e) => {
    e.preventDefault();
    if (
      window.confirm(
        "Are you sure you want to cancel this rental agreement? This action cannot be undone."
      )
    ) {
      // TODO: Implement cancel agreement API call
      console.log("Cancelling agreement for property:", property.id);
      alert(
        "Cancel agreement functionality will be implemented with backend API"
      );
    }
  };

  const handleAddFunds = async () => {
    const amount = window.prompt("Enter amount to add to your account:");

    if (!amount) {
      return; // User cancelled
    }

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    if (parsedAmount > 1000000) {
      alert("Maximum amount is $1,000,000 per transaction");
      return;
    }

    try {
      // Show loading state
      console.log("Adding funds:", parsedAmount);

      // Dispatch the update balance action
      await dispatch(updateUserBalance(parsedAmount)).unwrap();

      // Show success message
      alert(
        `Successfully added $${parsedAmount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} to your account!`
      );

      // Refresh balance to make sure we have the latest
      dispatch(fetchUserBalance());
    } catch (error) {
      console.error("Error adding funds:", error);
      alert("Failed to add funds: " + error);
    }
  };

  // Calculate balance and price
  const getPriceValue = (priceString) => {
    return parseFloat(priceString.replace(/[^0-9.-]+/g, ""));
  };

  const getUserBalance = () => {
    return user && typeof user.accountBalance === "number"
      ? user.accountBalance
      : 0;
  };

  const priceValue = property ? getPriceValue(property.price) : 0;
  const userBalance = getUserBalance();
  const hasEnoughBalance = userBalance >= priceValue;
  const amountNeeded = priceValue - userBalance;

  if (loading) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>Loading...</div>
    );
  }

  if (!property) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        Property not found
      </div>
    );
  }

  return (
    <div className="prop-overview-main">
      <div className="prop-overview-listing-container">
        <div className="prop-overview-listing-details">
          <h1>{property.title}</h1>
          <div className="prop-overview-listing-info">
            <span className="prop-overview-for-sale">
              {property.tag === "rent" ? "FOR RENT" : "FOR SALE"}
            </span>
            <span className="prop-overview-location">
              📍 {property.location}
            </span>
          </div>
        </div>

        <div className="prop-overview-listing-price">
          <h2>Price: {property.price}</h2>
          <p>
            Est. Payment <span>{property.estPayment}</span>
          </p>
          <div className="prop-overview-icons-container">
            <span
              className="prop-overview-share-icon"
              onClick={() => setShowShareModal(true)}
            >
              <i className="fas fa-share-alt"></i> Share
            </span>
            <div className="prop-overview-icons">
              <button>❤️</button>
              <button>🔖</button>
              <button>➕</button>
            </div>
          </div>

          {/* Rent Management Link for Buyers who rented this property */}
          {user && user.role === "buyer" && property.status === "rented" && property.buyerId === user._id && (
            <div className="prop-overview-buyer-actions-sidebar">
              <a
                href="/rent/pay"
                className="prop-overview-action-btn-sidebar"
                style={{ backgroundColor: "#2196f3", color: "white" }}
              >
                <i className="fas fa-file-invoice-dollar"></i> PAY RENT
              </a>
            </div>
          )}

          {/* Seller Rent Management Link */}
          {user && user.role === "seller" && property.status === "rented" && property.sellerId === user._id && (
            <div className="prop-overview-buyer-actions-sidebar">
              <a
                href="/rent/manage"
                className="prop-overview-action-btn-sidebar"
                style={{ backgroundColor: "#9c27b0", color: "white" }}
              >
                <i className="fas fa-cog"></i> MANAGE RENT
              </a>
            </div>
          )}

          {/* Buyer Action Buttons - Right Side */}
          {user && user.role === "buyer" && property.status === "active" && (
            <div className="prop-overview-buyer-actions-sidebar">
              {/* Balance Info */}
              <div className="prop-overview-balance-info-sidebar">
                <span>
                  Your Balance: $
                  {userBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <button
                  className="prop-overview-refresh-balance-btn"
                  onClick={() => dispatch(fetchUserBalance())}
                  title="Refresh balance from database"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>

              {!hasEnoughBalance ? (
                <>
                  {/* Insufficient Funds Warning */}
                  <div className="prop-overview-insufficient-funds-sidebar">
                    <i className="fas fa-exclamation-circle"></i> Insufficient
                    funds! You need $
                    {amountNeeded.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    more.
                  </div>
                  <button
                    onClick={handleAddFunds}
                    className="prop-overview-action-btn-sidebar prop-overview-add-funds-btn"
                  >
                    <i className="fas fa-wallet"></i> ADD FUNDS
                  </button>
                </>
              ) : (
                <>
                  {/* Buy/Rent Button */}
                  <form onSubmit={handlePurchase}>
                    <button
                      type="submit"
                      className={`prop-overview-action-btn-sidebar ${
                        property.tag === "rent"
                          ? "prop-overview-rent-btn"
                          : "prop-overview-buy-btn"
                      }`}
                    >
                      <i
                        className={`fas ${
                          property.tag === "rent"
                            ? "fa-key"
                            : "fa-shopping-cart"
                        }`}
                      ></i>
                      {property.tag === "rent" ? "RENT NOW" : "BUY NOW"}
                    </button>
                  </form>

                  {/* Schedule Visit Button */}
                  <a
                    href={`/visit/schedule/${property._id}`}
                    className="prop-overview-action-btn-sidebar prop-overview-schedule-btn"
                  >
                    <i className="far fa-calendar-alt"></i> SCHEDULE VISIT
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Buttons Row */}
      <div className="prop-overview-property-actions">
        <div className="prop-overview-action-grid">
          <button
            className="prop-overview-action-btn"
            style={{ backgroundColor: "#4caf50", color: "white" }}
          >
            <i className="fas fa-shopping-cart"></i> Buy Property
          </button>
          <button className="prop-overview-action-btn prop-overview-schedule-btn">
            <i className="fas fa-calendar-alt"></i> Schedule Visit
          </button>
          <button className="prop-overview-action-btn prop-overview-compare-btn">
            <i className="fas fa-exchange-alt"></i> Add to Compare
          </button>
          <a
            href={`/property/${property._id}/neighbourhood`}
            className="prop-overview-action-btn prop-overview-neighborhood-btn"
          >
            <i className="fas fa-map-marker-alt"></i> Neighbourhood Info
          </a>
        </div>
      </div>

      {/* Gallery */}
      <Gallery
        images={property.images}
        title={property.title}
        mainImage={mainImage}
        onThumbnailClick={handleThumbnailClick}
      />

      {/* Property Overview Icons */}
      <PropertyFeatures features={property.features} />

      {/* Main Container */}
      <div className="prop-overview-layout-container">
        {/* Left Side */}
        <div className="prop-overview-left-container">
          {/* Overview Description */}
          <div className="prop-overview-section-box">
            <h2>Overview</h2>
            <p>{property.description}</p>
          </div>

          {/* Property Details */}
          <PropertyDetailsSection
            property={property}
            amenities={property.amenities || []}
          />

          {/* Reviews */}
          <ReviewSection
            reviews={property.reviews || []}
            propertyId={property._id}
          />
        </div>

        {/* Right Side */}
        <div className="prop-overview-right-container">
          <AgentDetails agent={agent} propertyId={property._id} />
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        property={property}
      />

      {/* Back to Top Button */}
      <button
        id="prop-overview-backToTop"
        aria-label="Back to top"
        onClick={scrollToTop}
      >
        <a href="#top" aria-label="Scroll to top">
          <i className="fas fa-chevron-up"></i>
        </a>
      </button>
    </div>
  );
};

export default PropertyOverview;
