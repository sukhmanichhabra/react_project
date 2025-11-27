import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loanAPI } from "../../services/api";
import toast from "react-hot-toast";
import "./MyLoans.css";

const MyLoans = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await loanAPI.getMyApplications();
      if (response.data.success) {
        setApplications(response.data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load loan applications");
    } finally {
      setLoading(false);
    }
  };

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
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="my-loans-loading">
        <div className="spinner"></div>
        <p>Loading your loan applications...</p>
      </div>
    );
  }

  return (
    <div className="my-loans-container">
      <div className="my-loans-header">
        <div>
          <h1>My Loan Applications</h1>
          <p>Track and manage your loan applications</p>
        </div>
        <button
          className="apply-new-btn"
          onClick={() => navigate("/loans/apply")}
        >
          <i className="fas fa-plus"></i> Apply for New Loan
        </button>
      </div>

      {applications.length > 0 ? (
        <div className="loans-grid">
          {applications.map((app) => (
            <div key={app._id} className="loan-card">
              <div className="loan-card-header">
                <div className="loan-type-badge">
                  {app.loanDetails?.loanType?.replace("_", " ").toUpperCase() ||
                    "HOME LOAN"}
                </div>
                <div
                  className="loan-status-badge"
                  style={{
                    backgroundColor: getStatusColor(app.applicationStatus),
                  }}
                >
                  {app.applicationStatus.replace("_", " ").toUpperCase()}
                </div>
              </div>

              <div className="loan-card-body">
                <div className="loan-amount">
                  {formatCurrency(app.loanDetails?.loanAmount || 0)}
                </div>
                <div className="loan-details-grid">
                  <div className="detail-item">
                    <span className="label">Tenure:</span>
                    <span className="value">
                      {app.loanDetails?.loanTenure || 0} years
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Interest Rate:</span>
                    <span className="value">
                      {app.loanDetails?.interestRate || 0}%
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Applied On:</span>
                    <span className="value">{formatDate(app.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Property Type:</span>
                    <span className="value">
                      {app.loanDetails?.propertyType || "N/A"}
                    </span>
                  </div>
                </div>

                {app.applicationStatus === "approved" && (
                  <div className="approval-info">
                    <i className="fas fa-check-circle"></i>
                    <span>Loan Approved! Amount credited to your account.</span>
                  </div>
                )}

                {app.adminRemarks && (
                  <div className="admin-remarks">
                    <strong>Admin Remarks:</strong>
                    <p>{app.adminRemarks}</p>
                  </div>
                )}
              </div>

              <div className="loan-card-footer">
                <button
                  className="view-details-btn"
                  onClick={() =>
                    navigate(`/loans/application/${app._id}`, {
                      state: { loanData: app },
                    })
                  }
                >
                  View Details
                </button>
                {app.applicationStatus === "approved" && (
                  <button
                    className="view-emis-btn"
                    onClick={() => navigate(`/loans/my-emis?loanId=${app._id}`)}
                  >
                    View EMIs
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <i className="fas fa-file-invoice-dollar"></i>
          <h3>No Loan Applications</h3>
          <p>You haven't applied for any loans yet.</p>
          <button
            className="apply-btn"
            onClick={() => navigate("/loans/apply")}
          >
            Apply for Loan
          </button>
        </div>
      )}
    </div>
  );
};

export default MyLoans;
