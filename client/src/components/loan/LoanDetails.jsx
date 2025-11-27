import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { loanAPI } from "../../services/api";
import toast from "react-hot-toast";
import "./LoanDetails.css";

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [loan, setLoan] = useState(null);

  // Fallback method to get loan data from the MyLoans API
  const tryFallbackFromMyLoans = useCallback(async () => {
    try {
      console.log("Trying fallback method...");
      const response = await loanAPI.getMyApplications();
      if (response.data.success) {
        const applications = response.data.applications || [];
        const foundApplication = applications.find((app) => app._id === id);

        if (foundApplication) {
          console.log("Found loan in MyLoans data:", foundApplication);
          setLoan(foundApplication);
          toast.success("Loan details loaded successfully");
          return;
        }
      }

      // If fallback also fails, navigate away
      setTimeout(() => {
        navigate("/loans/my-applications");
      }, 3000);
    } catch (fallbackError) {
      console.error("Fallback method also failed:", fallbackError);
      setTimeout(() => {
        navigate("/loans/my-applications");
      }, 2000);
    }
  }, [id, navigate]);

  const fetchLoanDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await loanAPI.getApplicationDetails(id);
      if (response.data.success) {
        setLoan(response.data.application);
      } else {
        toast.error("Loan application not found");
        navigate("/loans/my-applications");
      }
    } catch (error) {
      console.error("Error fetching loan details:", error);

      // More specific error handling
      if (error.response?.status === 403) {
        toast.error(
          "Access denied. You can only view your own loan applications."
        );
      } else if (error.response?.status === 404) {
        toast.error("Loan application not found");
      } else if (error.response?.status === 401) {
        toast.error("Please log in to view loan details");
      } else {
        toast.error("Failed to load loan details. Please try again.");
      }

      // Instead of immediately navigating away, let's try to get the application
      // from the MyLoans data as a fallback
      console.log("Attempting fallback: trying to get loan from MyLoans data");
      await tryFallbackFromMyLoans();
    } finally {
      setLoading(false);
    }
  }, [id, navigate, tryFallbackFromMyLoans]);

  useEffect(() => {
    // First check if loan data was passed through navigation state
    if (location.state?.loanData) {
      console.log("Using loan data from navigation state");
      setLoan(location.state.loanData);
      setLoading(false);
    } else if (id) {
      fetchLoanDetails();
    }
  }, [id, location.state, fetchLoanDetails]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ff9800",
      under_review: "#2196f3",
      approved: "#4caf50",
      rejected: "#f44336",
      disbursed: "#9c27b0",
    };
    return colors[status] || "#666";
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="loan-details-loading">
        <div className="spinner"></div>
        <p>Loading loan application details...</p>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="loan-details-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Loan Application Not Found</h3>
        <p>
          The requested loan application could not be found or you don't have
          permission to view it.
        </p>
        <div className="error-details">
          <p>
            <strong>Application ID:</strong> {id}
          </p>
          <p>
            <strong>Note:</strong> You can only view your own loan applications.
          </p>
        </div>
        <div className="error-actions">
          <button onClick={() => navigate("/loans/my-applications")}>
            <i className="fas fa-arrow-left"></i> Back to My Applications
          </button>
          <button onClick={() => window.location.reload()}>
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  // Extract data similar to admin component
  const applicantDetails = {
    fullName: loan.applicantName,
    email: loan.email,
    phone: loan.phone,
    dob: loan.dateOfBirth,
    maritalStatus: loan.maritalStatus,
  };
  const employmentDetails = loan.employmentDetails || {};
  const loanDetails = loan.loanDetails || {};
  const documents = loan.documents || {};

  return (
    <div className="loan-details-container">
      {/* Header */}
      <div className="loan-details-header">
        <button
          className="back-btn"
          onClick={() => navigate("/loans/my-applications")}
        >
          <i className="fas fa-arrow-left"></i> Back to Applications
        </button>
        <div className="header-info">
          <h1>Loan Application Details</h1>
          <div className="application-id">Application ID: {loan._id}</div>
        </div>
        <div
          className="status-badge"
          style={{ backgroundColor: getStatusColor(loan.applicationStatus) }}
        >
          {loan.applicationStatus?.replace("_", " ").toUpperCase()}
        </div>
      </div>

      {/* Main Content */}
      <div className="loan-details-content">
        {/* Overview Card */}
        <div className="overview-card">
          <div className="overview-header">
            <h3>Loan Overview</h3>
            <div className="loan-type-badge">
              {loanDetails.loanType?.replace("_", " ").toUpperCase() ||
                "HOME LOAN"}
            </div>
          </div>
          <div className="overview-grid">
            <div className="overview-item">
              <span className="label">Loan Amount</span>
              <span className="value amount">
                {formatCurrency(loanDetails.loanAmount)}
              </span>
            </div>
            <div className="overview-item">
              <span className="label">Loan Tenure</span>
              <span className="value">{loanDetails.loanTenure || 0} years</span>
            </div>
            <div className="overview-item">
              <span className="label">Interest Rate</span>
              <span className="value">{loanDetails.interestRate || 0}%</span>
            </div>
            <div className="overview-item">
              <span className="label">Applied On</span>
              <span className="value">{formatDate(loan.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="details-grid">
          {/* Applicant Details */}
          <div className="detail-section">
            <h4>
              <i className="fas fa-user"></i> Applicant Details
            </h4>
            <div className="detail-items">
              <div className="detail-item">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">
                  {applicantDetails.fullName || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">
                  {applicantDetails.email || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">
                  {applicantDetails.phone || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date of Birth:</span>
                <span className="detail-value">
                  {applicantDetails.dob
                    ? formatDate(applicantDetails.dob)
                    : "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Marital Status:</span>
                <span className="detail-value">
                  {applicantDetails.maritalStatus || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="detail-section">
            <h4>
              <i className="fas fa-briefcase"></i> Employment Details
            </h4>
            <div className="detail-items">
              <div className="detail-item">
                <span className="detail-label">Employment Type:</span>
                <span className="detail-value">
                  {employmentDetails.employmentType || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Monthly Income:</span>
                <span className="detail-value">
                  {formatCurrency(employmentDetails.monthlyIncome)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Work Experience:</span>
                <span className="detail-value">
                  {employmentDetails.workExperience || 0} years
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Employer:</span>
                <span className="detail-value">
                  {employmentDetails.employerName || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Designation:</span>
                <span className="detail-value">
                  {employmentDetails.designation || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Loan Requirements */}
          <div className="detail-section full-width">
            <h4>
              <i className="fas fa-home"></i> Loan Requirements
            </h4>
            <div className="detail-items">
              <div className="detail-item">
                <span className="detail-label">Property Type:</span>
                <span className="detail-value">
                  {loanDetails.propertyType || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Property Value:</span>
                <span className="detail-value">
                  {formatCurrency(loanDetails.propertyValue)}
                </span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Property Address:</span>
                <span className="detail-value">
                  {loanDetails.propertyAddress || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="documents-section">
          <h4>
            <i className="fas fa-folder-open"></i> Uploaded Documents
          </h4>
          <div className="documents-grid">
            {documents.identityProof && (
              <div className="document-item">
                <div className="doc-icon">
                  <i className="fas fa-id-card"></i>
                </div>
                <div className="doc-info">
                  <span className="doc-name">Identity Proof</span>
                  <a
                    href={documents.identityProof.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doc-link"
                  >
                    <i className="fas fa-external-link-alt"></i> View Document
                  </a>
                </div>
              </div>
            )}
            {documents.addressProof && (
              <div className="document-item">
                <div className="doc-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="doc-info">
                  <span className="doc-name">Address Proof</span>
                  <a
                    href={documents.addressProof.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doc-link"
                  >
                    <i className="fas fa-external-link-alt"></i> View Document
                  </a>
                </div>
              </div>
            )}
            {documents.incomeProof && (
              <div className="document-item">
                <div className="doc-icon">
                  <i className="fas fa-file-invoice-dollar"></i>
                </div>
                <div className="doc-info">
                  <span className="doc-name">Income Proof</span>
                  <a
                    href={documents.incomeProof.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doc-link"
                  >
                    <i className="fas fa-external-link-alt"></i> View Document
                  </a>
                </div>
              </div>
            )}
            {documents.propertyDocuments && (
              <div className="document-item">
                <div className="doc-icon">
                  <i className="fas fa-home"></i>
                </div>
                <div className="doc-info">
                  <span className="doc-name">Property Documents</span>
                  <a
                    href={documents.propertyDocuments.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doc-link"
                  >
                    <i className="fas fa-external-link-alt"></i> View Document
                  </a>
                </div>
              </div>
            )}
            {documents.bankStatements && (
              <div className="document-item">
                <div className="doc-icon">
                  <i className="fas fa-university"></i>
                </div>
                <div className="doc-info">
                  <span className="doc-name">Bank Statements</span>
                  <a
                    href={documents.bankStatements.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doc-link"
                  >
                    <i className="fas fa-external-link-alt"></i> View Document
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Remarks */}
        {loan.adminRemarks && (
          <div className="remarks-section">
            <h4>
              <i className="fas fa-comment-alt"></i> Admin Remarks
            </h4>
            <div className="remarks-content">
              <p>{loan.adminRemarks}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          {loan.applicationStatus === "approved" && (
            <button
              className="emi-btn"
              onClick={() => navigate(`/loans/my-emis?loanId=${loan._id}`)}
            >
              <i className="fas fa-calendar-check"></i> View EMI Schedule
            </button>
          )}
          <button
            className="applications-btn"
            onClick={() => navigate("/loans/my-applications")}
          >
            <i className="fas fa-list"></i> All Applications
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;
