import React from "react";
import { Link } from "react-router-dom";
import DashboardStats from "../common/DashboardStats";
import OverviewCharts from "../common/OverviewCharts";
import "./BuyerOverview.css";
import "../Admin/DashboardTable.css";

const BuyerOverview = ({ user, stats, loanRequests, onAddFunds }) => {
  // Debug logging for loan requests
  console.log("BuyerOverview - loanRequests prop:", loanRequests);
  console.log("BuyerOverview - user prop:", user);

  // Define stats for the Buyer
  const buyerStats = {
    customStats: [
      {
        label: "Properties Bought",
        value: stats?.bought || 0,
        trend: "",
        icon: "fa-building",
        color: "blue",
      },
      {
        label: "Properties Rented",
        value: stats?.rented || 0,
        trend: "",
        icon: "fa-key",
        color: "green",
      },
      {
        label: "Total Spent",
        value: `$${stats?.totalSpent?.toLocaleString() || "0"}`,
        trend: "",
        icon: "fa-dollar-sign",
        color: "orange",
      },
      {
        label: "Loan Status",
        value: stats?.loanStatus || "N/A",
        trend: "",
        icon: "fa-money-check-alt",
        color: "pink",
      },
    ],
  };

  const activeLoan =
    loanRequests.find(
      (l) => (l.applicationStatus || l.status) === "approved"
    ) || // Prefer 'approved' for the label
    loanRequests.find((l) => (l.applicationStatus || l.status) === "pending") ||
    loanRequests[0];

  console.log("BuyerOverview - activeLoan:", activeLoan);
  console.log(
    "BuyerOverview - loanRequests length:",
    loanRequests?.length || 0
  );

  // Match screenshot stats
  const screenshotStats = {
    customStats: [
      {
        label: "Active Listings",
        value: stats?.activeListings || 12,
        trend: "+8.3%",
        icon: "fa-home",
        color: "blue",
      },
      {
        label: "Total Sales",
        value: `$${stats?.totalSales?.toLocaleString() || "847,000"}`,
        trend: "+12.5%",
        icon: "fa-dollar-sign",
        color: "green",
      },
      {
        label: "Total Views",
        value: stats?.totalViews?.toLocaleString() || "2,318",
        trend: "+23.1%",
        icon: "fa-eye",
        color: "orange",
      },
      {
        label: "Completed Sales",
        value: stats?.completedSales || 8,
        trend: "+5.2%",
        icon: "fa-check-circle",
        color: "pink",
      },
    ],
  };

  const getLoanStatusClass = (status) => {
    if (status === "approved") return "approved";
    if (status === "pending" || status === "under_review") return "pending";
    if (status === "rejected") return "rejected";
    if (status === "disbursed") return "disbursed";
    return "default";
  };

  const getLoanStatusText = (status) => {
    if (status === "approved") return "Loan approved!";
    if (status === "pending") return "Pending";
    if (status === "under_review") return "Under Review";
    if (status === "rejected") return "Rejected";
    if (status === "disbursed") return "Disbursed";
    return "N/A";
  };

  return (
    <section id="overview" className="buyer-overview-section">
      {/* Use the common stats grid */}
      <DashboardStats user={user} stats={screenshotStats} />

      {/* Buyer-specific financial overview */}
      <div className="dash-section-header">
        <h2>Financial Overview</h2>
        <p>Your account balance and loan status</p>
      </div>
      <div className="dash-financial-grid">
        <div className="dash-financial-card">
          <div className="dash-financial-card-icon green">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="dash-financial-card-details">
            <h3>Account Balance</h3>
            <p className="balance-amount">
              $
              {user.accountBalance
                ? user.accountBalance.toLocaleString()
                : "0.00"}
            </p>
            <div className="dash-loan-buttons">
              <button
                onClick={onAddFunds}
                className="dash-loan-btn dash-add-funds-btn"
              >
                <i className="fas fa-plus-circle"></i> Add Funds
              </button>
            </div>
          </div>
        </div>

        <div className="dash-financial-card">
          <div className="dash-financial-card-icon blue">
            <i className="fas fa-money-check-alt"></i>
          </div>
          <div className="dash-financial-card-details">
            <h3>My Loan Requests</h3>
            {activeLoan ? (
              <>
                <span
                  className={`dash-loan-status-badge ${getLoanStatusClass(
                    activeLoan.applicationStatus || activeLoan.status
                  )}`}
                >
                  {getLoanStatusText(
                    activeLoan.applicationStatus || activeLoan.status
                  )}
                </span>
                <div className="dash-loan-buttons">
                  <Link
                    to="/loans/my-applications"
                    className="dash-loan-btn dash-view-details-btn"
                  >
                    <i className="fas fa-eye"></i> View Details
                  </Link>
                  {/* <Link
                    to="/apply-loan"
                    className="dash-loan-btn dash-apply-loan-btn"
                  >
                    <i className="fas fa-file-alt"></i> Apply for a New Loan
                  </Link> */}
                </div>
              </>
            ) : (
              <>
                <span className="dash-loan-status-badge default">
                  No Active Loans
                </span>
                <div className="dash-loan-buttons">
                  <Link
                    to="/apply-loan"
                    className="dash-loan-btn dash-apply-loan-btn"
                  >
                    <i className="fas fa-file-alt"></i> Apply for a New Loan
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <OverviewCharts userRole="buyer" />

      {/* Recent Loan History */}
      <div className="dash-table-container">
        <h3>My Loan History</h3>
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loanRequests.length > 0 ? (
                loanRequests.map((loan) => (
                  <tr key={loan._id}>
                    <td>
                      {loan.loanDetails?.propertyAddress ||
                        loan.propertyTitle ||
                        "N/A"}
                    </td>
                    <td>
                      $
                      {loan.loanDetails?.loanAmount
                        ? loan.loanDetails.loanAmount.toLocaleString()
                        : loan.amount
                        ? loan.amount.toLocaleString()
                        : "N/A"}
                    </td>
                    <td>{loan.loanDetails?.loanType || loan.type || "N/A"}</td>
                    <td>
                      <span
                        className={`dash-status-badge ${getLoanStatusClass(
                          loan.applicationStatus || loan.status
                        )}`}
                      >
                        {loan.applicationStatus || loan.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      padding: "1.5rem",
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    You have not applied for any loans.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default BuyerOverview;
