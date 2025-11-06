import React, { useState, useEffect } from "react";
import { loanAPI } from "../../../services/api";
import toast from "react-hot-toast";
import "./LoanApproval.css";

// Child component for each loan card
const LoanCard = ({ loan, onApprove, onReject, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(false);

  // Extract real data from loan object
  // Applicant data is at root level in the schema
  const applicantDetails = {
    fullName: loan.applicantName,
    email: loan.email,
    phone: loan.phone,
    dob: loan.dateOfBirth,
    maritalStatus: loan.maritalStatus
  };
  const employmentDetails = loan.employmentDetails || {};
  const loanDetails = loan.loanDetails || {};
  const documents = loan.documents || {};

  return (
    <div className="la-card">
      <div
        className={`la-card-header ${loan.status}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="la-header-item">
          <h4>Status</h4>
          <span className={`la-status-badge ${loan.applicationStatus}`}>
            {loan.applicationStatus?.toUpperCase()}
          </span>
        </div>
        <div className="la-header-item">
          <h4>Applicant</h4>
          <p>{loan.applicantName || "N/A"}</p>
        </div>
        <div className="la-header-item">
          <h4>Loan Amount</h4>
          <p>₹{(loanDetails.loanAmount || 0).toLocaleString("en-IN")}</p>
        </div>
        <div className="la-header-item">
          <h4>Loan Type</h4>
          <p>{loanDetails.loanType?.replace("_", " ").toUpperCase() || "HOME LOAN"}</p>
        </div>
        <div className="la-header-item">
          <h4>Submitted</h4>
          <p>
            {new Date(loan.createdAt).toLocaleDateString("en-IN")}
          </p>
        </div>
        <i
          className={`fas fa-chevron-down la-card-toggle ${
            isExpanded ? "expanded" : ""
          }`}
        ></i>
      </div>

      {isExpanded && (
        <div className="la-card-body">
          <div className="la-details-grid">
            <div className="la-detail-group">
              <h4>Applicant Details</h4>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Full Name:</span>
                <span className="la-detail-item-value">
                  {applicantDetails.fullName || "N/A"}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Email:</span>
                <span className="la-detail-item-value">
                  {applicantDetails.email || "N/A"}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Phone:</span>
                <span className="la-detail-item-value">
                  {applicantDetails.phone || "N/A"}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Date of Birth:</span>
                <span className="la-detail-item-value">
                  {applicantDetails.dob ? new Date(applicantDetails.dob).toLocaleDateString("en-IN") : "N/A"}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Marital Status:</span>
                <span className="la-detail-item-value">
                  {applicantDetails.maritalStatus || "N/A"}
                </span>
              </div>
            </div>

            <div className="la-detail-group">
              <h4>Employment Details</h4>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Employment Type:</span>
                <span className="la-detail-item-value">
                  {employmentDetails.employmentType || "N/A"}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Monthly Income:</span>
                <span className="la-detail-item-value">
                  ₹{(employmentDetails.monthlyIncome || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Work Experience:</span>
                <span className="la-detail-item-value">
                  {employmentDetails.workExperience || 0} years
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Employer:</span>
                <span className="la-detail-item-value">
                  {employmentDetails.employerName || "N/A"}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Designation:</span>
                <span className="la-detail-item-value">
                  {employmentDetails.designation || "N/A"}
                </span>
              </div>
            </div>

            <div className="la-detail-group">
              <h4>Loan Details</h4>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Loan Amount:</span>
                <span className="la-detail-item-value">
                  ₹{(loanDetails.loanAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Loan Tenure:</span>
                <span className="la-detail-item-value">
                  {loanDetails.loanTenure || 0} years
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Interest Rate:</span>
                <span className="la-detail-item-value">
                  {loanDetails.interestRate || 0}%
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Property Type:</span>
                <span className="la-detail-item-value">
                  {loanDetails.propertyType || "N/A"}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Property Value:</span>
                <span className="la-detail-item-value">
                  ₹{(loanDetails.propertyValue || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Property Address:</span>
                <span className="la-detail-item-value">
                  {loanDetails.propertyAddress || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="la-docs-section">
            <h4>Documents</h4>
            <div className="la-doc-list">
              {documents.identityProof && (
                <a href={documents.identityProof.path} target="_blank" rel="noopener noreferrer" className="la-doc-item">
                  <i className="fas fa-id-card"></i>
                  <span>Identity Proof</span>
                </a>
              )}
              {documents.addressProof && (
                <a href={documents.addressProof.path} target="_blank" rel="noopener noreferrer" className="la-doc-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Address Proof</span>
                </a>
              )}
              {documents.incomeProof && (
                <a href={documents.incomeProof.path} target="_blank" rel="noopener noreferrer" className="la-doc-item">
                  <i className="fas fa-file-invoice-dollar"></i>
                  <span>Income Proof</span>
                </a>
              )}
              {documents.propertyDocuments && (
                <a href={documents.propertyDocuments.path} target="_blank" rel="noopener noreferrer" className="la-doc-item">
                  <i className="fas fa-home"></i>
                  <span>Property Documents</span>
                </a>
              )}
              {documents.bankStatements && (
                <a href={documents.bankStatements.path} target="_blank" rel="noopener noreferrer" className="la-doc-item">
                  <i className="fas fa-university"></i>
                  <span>Bank Statements</span>
                </a>
              )}
            </div>
          </div>

          <div className="la-remarks-section">
            <h4>Admin Remarks:</h4>
            <textarea 
              placeholder="Add your remarks here..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            ></textarea>
          </div>

          {loan.applicationStatus === "pending" && (
            <div className="la-card-actions">
              <button
                className="av-action-btn approve"
                onClick={() => onApprove(loan._id, remarks)}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> Approve
                  </>
                )}
              </button>
              <button
                className="av-action-btn reject"
                onClick={() => onReject(loan._id, remarks)}
                disabled={processing}
              >
                <i className="fas fa-times"></i> Reject
              </button>
            </div>
          )}
          
          {loan.adminRemarks && (
            <div className="la-admin-remarks-display">
              <strong>Previous Remarks:</strong>
              <p>{loan.adminRemarks}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main component
const LoanApproval = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "pending",
    loanType: "all",
    search: ""
  });

  useEffect(() => {
    fetchLoans();
  }, [filters.status, filters.loanType]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const params = {
        status: filters.status,
        loanType: filters.loanType !== "all" ? filters.loanType : undefined,
        search: filters.search || undefined
      };
      
      const response = await loanAPI.getAdminApplications(params);
      
      if (response.data.success) {
        setLoans(response.data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching loan applications:", error);
      toast.error("Failed to load loan applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loanId, remarks) => {
    try {
      const response = await loanAPI.updateApplicationStatus(loanId, {
        status: "approved",
        remarks: remarks || "Loan approved"
      });
      
      if (response.data.success) {
        toast.success("Loan approved! Money has been credited to buyer's account.");
        toast.success("EMI cycle will start automatically.");
        fetchLoans(); // Refresh the list
      }
    } catch (error) {
      console.error("Error approving loan:", error);
      toast.error(error.response?.data?.message || "Failed to approve loan");
    }
  };

  const handleReject = async (loanId, remarks) => {
    if (!remarks || remarks.trim() === "") {
      toast.error("Please provide remarks for rejection");
      return;
    }
    
    try {
      const response = await loanAPI.updateApplicationStatus(loanId, {
        status: "rejected",
        remarks
      });
      
      if (response.data.success) {
        toast.success("Loan application rejected.");
        fetchLoans(); // Refresh the list
      }
    } catch (error) {
      console.error("Error rejecting loan:", error);
      toast.error(error.response?.data?.message || "Failed to reject loan");
    }
  };

  const handleSearch = () => {
    fetchLoans();
  };

  return (
    <section id="loan-approval" className="la-section">
      <div className="dash-section-header">
        <h2>Loan Applications</h2>
        <p>Review and manage loan applications</p>
      </div>

      <div className="la-header">
        <div className="la-filters">
          <label htmlFor="filter-status">Filter by:</label>
          <select 
            id="filter-status"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="under_review">Under Review</option>
            <option value="all">All Status</option>
          </select>
          <label htmlFor="filter-type">Loan Type:</label>
          <select 
            id="filter-type"
            value={filters.loanType}
            onChange={(e) => setFilters({...filters, loanType: e.target.value})}
          >
            <option value="all">All Types</option>
            <option value="affordable">Affordable</option>
            <option value="premium">Premium</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
        <div className="la-search">
          <input 
            type="text" 
            placeholder="Search by name or application ID"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="la-loading">
          <div className="spinner"></div>
          <p>Loading loan applications...</p>
        </div>
      ) : (
        <div className="la-list">
          {loans.length > 0 ? (
            loans.map((loan) => (
              <LoanCard
                key={loan._id}
                loan={loan}
                onApprove={handleApprove}
                onReject={handleReject}
                onRefresh={fetchLoans}
              />
            ))
          ) : (
            <div className="dash-empty-state">
              <i className="fas fa-hand-holding-dollar"></i>
              <h3>No Loan Applications Found</h3>
              <p>There are no loan applications matching your filters.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default LoanApproval;
