import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LoanApproval.css"; // <-- Import new CSS

// Child component for each loan card
const LoanCard = ({ loan, onApprove, onReject }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock data for the expanded view
  const applicantDetails = {
    email: loan.userEmail,
    phone: "9267924499",
    dob: "22/06/1995",
    maritalStatus: "single",
  };
  const employmentDetails = {
    type: "salaried",
    income: "₹1,22,223",
    experience: "12 years",
    employer: "ARRGA",
  };
  const loanDetails = {
    amount: `₹${loan.amount.toLocaleString()}`,
    tenure: "12 years",
    interest: "8.5%",
    propType: "apartment",
    propValue: "₹1,32,32,323",
  };
  const documents = [
    { name: "Identity Proof", icon: "fa-id-card" },
    { name: "Address Proof", icon: "fa-map-marker-alt" },
    { name: "Income Proof", icon: "fa-file-invoice-dollar" },
    { name: "Bank Statements", icon: "fa-university" },
  ];

  return (
    <div className="la-card">
      <div
        className={`la-card-header ${loan.status}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="la-header-item">
          <h4>Status</h4>
          <span className={`la-status-badge ${loan.status}`}>
            {loan.status}
          </span>
        </div>
        <div className="la-header-item">
          <h4>Applicant</h4>
          <p>{loan.userName}</p>
        </div>
        <div className="la-header-item">
          <h4>Loan Amount</h4>
          <p>₹{loan.amount.toLocaleString()}</p>
        </div>
        <div className="la-header-item">
          <h4>Loan Type</h4>
          <p>{loan.type || "premium"}</p>
        </div>
        <div className="la-header-item">
          <h4>Submitted</h4>
          <p>
            {new Date(loan.submittedDate || Date.now()).toLocaleDateString()}
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
                <span className="la-detail-item-label">Email:</span>
                <span className="la-detail-item-value">
                  {applicantDetails.email}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Phone:</span>
                <span className="la-detail-item-value">
                  {applicantDetails.phone}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Date of Birth:</span>
                <span className="la-detail-item-value">
                  {applicantDetails.dob}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Marital Status:</span>
                <span className="la-detail-item-value">
                  {applicantDetails.maritalStatus}
                </span>
              </div>
            </div>

            <div className="la-detail-group">
              <h4>Employment Details</h4>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Employment Type:</span>
                <span className="la-detail-item-value">
                  {employmentDetails.type}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Monthly Income:</span>
                <span className="la-detail-item-value">
                  {employmentDetails.income}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Work Experience:</span>
                <span className="la-detail-item-value">
                  {employmentDetails.experience}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Employer:</span>
                <span className="la-detail-item-value">
                  {employmentDetails.employer}
                </span>
              </div>
            </div>

            <div className="la-detail-group">
              <h4>Loan Details</h4>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Loan Amount:</span>
                <span className="la-detail-item-value">
                  {loanDetails.amount}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Loan Tenure:</span>
                <span className="la-detail-item-value">
                  {loanDetails.tenure}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Interest Rate:</span>
                <span className="la-detail-item-value">
                  {loanDetails.interest}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Property Type:</span>
                <span className="la-detail-item-value">
                  {loanDetails.propType}
                </span>
              </div>
              <div className="la-detail-item">
                <span className="la-detail-item-label">Property Value:</span>
                <span className="la-detail-item-value">
                  {loanDetails.propValue}
                </span>
              </div>
            </div>
          </div>

          <div className="la-docs-section">
            <h4>Documents</h4>
            <div className="la-doc-list">
              {documents.map((doc) => (
                <a href="#" className="la-doc-item" key={doc.name}>
                  <i className={`fas ${doc.icon}`}></i>
                  <span>{doc.name}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="la-remarks-section">
            <h4>Admin Remarks:</h4>
            <textarea placeholder="Add your remarks here..."></textarea>
          </div>

          {loan.status === "pending" && (
            <div className="la-card-actions">
              <button
                className="av-action-btn approve"
                onClick={() => onApprove(loan._id)}
              >
                <i className="fas fa-check"></i> Approve
              </button>
              <button
                className="av-action-btn reject"
                onClick={() => onReject(loan._id)}
              >
                <i className="fas fa-times"></i> Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main component
const LoanApproval = ({ loanApplications = [] }) => {
  const [loans, setLoans] = useState(loanApplications);

  const handleApprove = (loanId) => {
    console.log(`Approving loan ${loanId}`);
    setLoans(
      loans.map((loan) =>
        loan._id === loanId ? { ...loan, status: "approved" } : loan
      )
    );
  };

  const handleReject = (loanId) => {
    console.log(`Rejecting loan ${loanId}`);
    setLoans(
      loans.map((loan) =>
        loan._id === loanId ? { ...loan, status: "rejected" } : loan
      )
    );
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
          <select id="filter-status">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <label htmlFor="filter-type">Loan Type:</label>
          <select id="filter-type">
            <option value="all">All Types</option>
            <option value="premium">Premium</option>
            <option value="standard">Standard</option>
          </select>
        </div>
        <div className="la-search">
          <input type="text" placeholder="Search by name or application ID" />
          <button>
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      <div className="la-list">
        {loans.length > 0 ? (
          loans.map((loan) => (
            <LoanCard
              key={loan._id}
              loan={loan}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        ) : (
          <div className="dash-empty-state">
            {" "}
            {/* Re-using this class */}
            <i className="fas fa-hand-holding-dollar"></i>
            <h3>No Pending Loan Applications</h3>
            <p>There are no new loan applications at this time.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LoanApproval;
