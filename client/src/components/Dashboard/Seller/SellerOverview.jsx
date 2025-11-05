import React from "react";
import DashboardStats from "../common/DashboardStats";
import OverviewCharts from "../common/OverviewCharts";
import "./SellerOverview.css"; // <-- Import new CSS

const SellerOverview = ({ user, stats }) => {
  // Define stats for the Seller
  const sellerStats = {
    customStats: [
      {
        label: "Active Listings",
        value: stats?.activeListings || 0,
        trend: stats?.activeListingsTrend || "+0",
        icon: "fa-home",
        color: "blue",
      },
      {
        label: "Total Sales",
        value: `$${stats?.totalSales?.toLocaleString() || "0"}`,
        trend: stats?.salesTrend || "+0%",
        icon: "fa-dollar-sign",
        color: "green",
      },
      {
        label: "Total Views",
        value: stats?.totalViews?.toLocaleString() || "0",
        trend: stats?.viewsTrend || "+0%",
        icon: "fa-eye",
        color: "orange",
      },
      {
        label: "Pending Approvals",
        value: stats?.pendingApprovals || 0,
        trend: "",
        icon: "fa-clock",
        color: "red",
      },
    ],
  };

  return (
    <section id="overview" className="seller-overview-section">
      <div className="dash-section-header">
        <h2>Seller Overview</h2>
        <p>Here's a summary of your listings and sales activity.</p>
      </div>
      <DashboardStats user={user} stats={sellerStats} />
      <OverviewCharts userRole="seller" />
    </section>
  );
};

export default SellerOverview;