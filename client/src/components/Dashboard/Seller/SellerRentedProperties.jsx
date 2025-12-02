import React, { useState, useEffect } from "react";
import SimplePropertyCard from "../common/PropertyCard";
import "./SellerRentedProperties.css";
import { agreementsAPI } from "../../../services/api";
import { generateRentAgreementPdf } from "../../agreements/rentAgreementPdf";

// Specialized card component for seller's rented properties
const SellerRentedPropertyCard = ({ property }) => {
  const [isGeneratingRent, setIsGeneratingRent] = useState(false);
  const hasAgreement = !!property.agreement;
  const agreementStatus = property.agreement?.status || "active";

  const handleDownloadAgreement = async () => {
    try {
      const response = await agreementsAPI.getAgreementForProperty(
        property._id
      );
      const agreement = response.data?.data;
      if (!agreement) {
        alert("No agreement found for this property.");
        return;
      }
      generateRentAgreementPdf({ property, agreement, role: "owner" });
    } catch (error) {
      console.error("Error downloading agreement:", error);
      alert("Failed to download agreement PDF.");
    }
  };

  const handleGenerateRent = async () => {
    if (!confirm("Generate next rent payment for this property?")) return;

    try {
      setIsGeneratingRent(true);
      const response = await fetch(`/api/rent/generate/${property._id}`, {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        alert("Rent payment generated successfully!");
        // Optionally refresh the component
        window.location.reload();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error generating rent:", error);
      alert("Failed to generate rent payment");
    } finally {
      setIsGeneratingRent(false);
    }
  };

  const handleContactTenant = () => {
    const tenantEmail =
      property.tenantEmail || property.buyer?.email || "tenant@example.com";
    const subject = `Regarding your rental: ${property.title}`;
    const body = `Hello ${
      property.tenantName || "Tenant"
    },\n\nI hope you are well. I wanted to discuss your rental property at ${
      property.location
    }.\n\nBest regards,`;
    window.location.href = `mailto:${tenantEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="seller-rented-property-card">
      <figure className="seller-rented-property-card__image">
        <img
          src={property.images?.[0] || "/assets/property-1.jpg"}
          alt={property.title}
        />
        <span className="seller-rented-property-card__tag">Rented Out</span>
      </figure>

      <div className="seller-rented-property-card__content">
        <h3 className="seller-rented-property-card__title">{property.title}</h3>
        <p className="seller-rented-property-card__location">
          <i className="fas fa-map-marker-alt"></i>
          <span>{property.location}</span>
        </p>
        <p className="seller-rented-property-card__price">{property.price}</p>

        {/* Rental Information Block */}
        <div className="seller-rented-property-card__info-block">
          <h4 className="seller-rented-property-card__info-title">
            <i className="fas fa-info-circle"></i>
            <span>Rental Information</span>
          </h4>
          <div className="seller-rented-property-card__info-details">
            <p>
              <strong>Tenant:</strong> {property.tenantName || "N/A"}
            </p>
            <p>
              <strong>Rented Since:</strong> {formatDate(property.rentedSince)}
            </p>
            <p>
              <strong>Total Collected:</strong> ₹
              {(property.totalCollected || 0).toLocaleString()}
            </p>
            <p>
              <strong>Last Payment:</strong> {formatDate(property.lastRentDate)}
            </p>
            {hasAgreement && (
              <>
                <p>
                  <strong>Agreement Status:</strong> {agreementStatus}
                </p>
                <p>
                  <strong>Lease Start:</strong>{" "}
                  {formatDate(property.agreement.startDate)}
                </p>
                <p>
                  <strong>Lease End:</strong>{" "}
                  {formatDate(property.agreement.endDate)}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="seller-rented-property-card__actions">
          <button onClick={handleContactTenant} className="dash-btn blue">
            <i className="fas fa-envelope"></i>
            <span>Contact Tenant</span>
          </button>
          {hasAgreement && (
            <button
              type="button"
              className="dash-btn green"
              onClick={handleDownloadAgreement}
            >
              <i className="fas fa-file-download"></i>
              <span>Download Agreement</span>
            </button>
          )}
          <button
            onClick={handleGenerateRent}
            className="dash-btn green"
            disabled={isGeneratingRent}
          >
            {isGeneratingRent ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-plus-circle"></i>
            )}
            <span>{isGeneratingRent ? "Generating..." : "Generate Rent"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const SellerRentedProperties = ({ properties = [] }) => {
  const [rentedProperties, setRentedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, totalRevenue: 0 });
  const [agreements, setAgreements] = useState([]);
  const [agreementsLoading, setAgreementsLoading] = useState(true);
  const [agreementsError, setAgreementsError] = useState(null);

  // Fetch rented properties from backend
  useEffect(() => {
    const fetchRentedProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/rent/seller-rented", {
          credentials: "include",
        });

        const result = await response.json();

        if (result.success) {
          setRentedProperties(result.data.properties);
          setStats({
            total: result.data.total,
            totalRevenue: result.data.totalRevenue || 0,
          });
        } else {
          throw new Error(
            result.message || "Failed to fetch rented properties"
          );
        }
      } catch (err) {
        console.error("Error fetching rented properties:", err);
        setError(err.message);
        // Fallback to filter from props if API fails
        const fallbackProperties = properties.filter(
          (p) => p.tag === "rent" && p.status === "rented"
        );
        setRentedProperties(fallbackProperties);
      } finally {
        setLoading(false);
      }
    };

    fetchRentedProperties();
  }, [properties]);

  useEffect(() => {
    const fetchSellerAgreements = async () => {
      try {
        setAgreementsLoading(true);
        const response = await agreementsAPI.getSellerAgreements();
        if (response.data?.success) {
          setAgreements(response.data.data || []);
        } else {
          setAgreementsError(
            response.data?.message || "Failed to load agreements"
          );
        }
      } catch (err) {
        console.error("Error fetching seller agreements:", err);
        setAgreementsError(err.message);
      } finally {
        setAgreementsLoading(false);
      }
    };

    fetchSellerAgreements();
  }, []);

  const refreshAgreements = async () => {
    try {
      const response = await agreementsAPI.getSellerAgreements();
      if (response.data?.success) {
        setAgreements(response.data.data || []);
      }
    } catch (err) {
      console.error("Error refreshing agreements:", err);
    }
  };

  const pendingAgreements = agreements.filter(
    (a) => a.status === "pending_seller_approval"
  );

  const handleApprove = async (agreementId) => {
    try {
      await agreementsAPI.approveAgreement(agreementId);
      await refreshAgreements();
      alert("Agreement approved successfully.");
    } catch (error) {
      console.error("Error approving agreement:", error);
      alert("Failed to approve agreement.");
    }
  };

  const handleReject = async (agreementId) => {
    const reason = window.prompt(
      "Please enter a reason for rejection (optional):"
    );
    try {
      await agreementsAPI.rejectAgreement(agreementId, reason || "");
      await refreshAgreements();
      alert("Agreement rejected.");
    } catch (error) {
      console.error("Error rejecting agreement:", error);
      alert("Failed to reject agreement.");
    }
  };

  return (
    <section
      id="seller-rented-properties"
      className="seller-rented-properties-section"
    >
      <div className="seller-rented-properties-header">
        <h2>My Rented Properties</h2>
        <p>Properties you own that are currently rented out.</p>
        {stats.total > 0 && (
          <div className="seller-rented-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Properties Rented</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                ₹{stats.totalRevenue.toLocaleString()}
              </span>
              <span className="stat-label">Total Revenue</span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="dash-loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading rented properties...</p>
        </div>
      ) : error ? (
        <div className="dash-error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Properties</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="seller-rented-properties-grid">
          {rentedProperties.length > 0 ? (
            rentedProperties.map((prop) => (
              <SellerRentedPropertyCard key={prop._id} property={prop} />
            ))
          ) : (
            <div className="dash-empty-state">
              <i className="fas fa-key"></i>
              <h3>No Rented Properties</h3>
              <p>You do not have any properties currently rented out.</p>
            </div>
          )}
        </div>
      )}

      <div className="seller-pending-agreements">
        <h3>Pending Rent Agreements</h3>
        {agreementsLoading ? (
          <div className="dash-loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading agreements...</p>
          </div>
        ) : agreementsError ? (
          <div className="dash-error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Error Loading Agreements</h3>
            <p>{agreementsError}</p>
          </div>
        ) : pendingAgreements.length > 0 ? (
          <div className="seller-agreements-list">
            {pendingAgreements.map((agreement) => {
              const startDate = new Date(agreement.startDate);
              const endDate = new Date(agreement.endDate);
              const durationMonths = Math.round(
                (endDate - startDate) / (1000 * 60 * 60 * 24 * 30)
              );
              const totalContractValue =
                (agreement.monthlyRent || 0) * durationMonths;
              const submittedDate = agreement.createdAt
                ? new Date(agreement.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A";

              return (
                <div key={agreement._id} className="seller-agreement-card">
                  <div className="seller-agreement-card__header">
                    <div className="seller-agreement-card__title-section">
                      <h4 className="seller-agreement-card__property-title">
                        <i className="fas fa-home"></i>
                        {agreement.propertyTitle}
                      </h4>
                      <span className="seller-agreement-card__status-badge pending">
                        <i className="fas fa-clock"></i>
                        Pending Your Approval
                      </span>
                    </div>
                    <div className="seller-agreement-card__submitted-date">
                      <small>Submitted: {submittedDate}</small>
                    </div>
                  </div>

                  <div className="seller-agreement-card__body">
                    <div className="seller-agreement-card__info-grid">
                      <div className="seller-agreement-info-item">
                        <i className="fas fa-user"></i>
                        <div className="info-content">
                          <span className="info-label">Tenant</span>
                          <span className="info-value">
                            {agreement.buyerName}
                          </span>
                        </div>
                      </div>

                      <div className="seller-agreement-info-item">
                        <i className="fas fa-envelope"></i>
                        <div className="info-content">
                          <span className="info-label">Email</span>
                          <span className="info-value">
                            {agreement.buyerEmail || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="seller-agreement-info-item">
                        <i className="fas fa-phone"></i>
                        <div className="info-content">
                          <span className="info-label">Phone</span>
                          <span className="info-value">
                            {agreement.buyerPhone || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="seller-agreement-info-item">
                        <i className="fas fa-calendar-alt"></i>
                        <div className="info-content">
                          <span className="info-label">Lease Period</span>
                          <span className="info-value">
                            {startDate.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {" - "}
                            {endDate.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="seller-agreement-info-item">
                        <i className="fas fa-hourglass-half"></i>
                        <div className="info-content">
                          <span className="info-label">Duration</span>
                          <span className="info-value">
                            {durationMonths} months
                          </span>
                        </div>
                      </div>

                      <div className="seller-agreement-info-item highlight">
                        <i className="fas fa-rupee-sign"></i>
                        <div className="info-content">
                          <span className="info-label">Monthly Rent</span>
                          <span className="info-value">
                            ₹
                            {(agreement.monthlyRent || 0).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="seller-agreement-info-item highlight">
                        <i className="fas fa-shield-alt"></i>
                        <div className="info-content">
                          <span className="info-label">Security Deposit</span>
                          <span className="info-value">
                            ₹
                            {(agreement.securityDeposit || 0).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="seller-agreement-info-item highlight">
                        <i className="fas fa-chart-line"></i>
                        <div className="info-content">
                          <span className="info-label">
                            Total Contract Value
                          </span>
                          <span className="info-value">
                            ₹{totalContractValue.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {agreement.specialTerms && (
                      <div className="seller-agreement-card__special-terms">
                        <h5>
                          <i className="fas fa-file-contract"></i>
                          Special Terms & Conditions
                        </h5>
                        <p>{agreement.specialTerms}</p>
                      </div>
                    )}

                    <div className="seller-agreement-card__notice">
                      <i className="fas fa-info-circle"></i>
                      <p>
                        Please review all details carefully before approving.
                        Once approved, the tenant will be notified and the rent
                        payment schedule will be activated.
                      </p>
                    </div>
                  </div>

                  <div className="seller-agreement-card__actions">
                    <button
                      type="button"
                      className="dash-btn green"
                      onClick={() => handleApprove(agreement._id)}
                    >
                      <i className="fas fa-check-circle"></i>
                      <span>Approve Agreement</span>
                    </button>
                    <button
                      type="button"
                      className="dash-btn red"
                      onClick={() => handleReject(agreement._id)}
                    >
                      <i className="fas fa-times-circle"></i>
                      <span>Reject Agreement</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="seller-no-pending-agreements">
            You have no pending rent agreement requests.
          </p>
        )}
      </div>
    </section>
  );
};

export default SellerRentedProperties;
