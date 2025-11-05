import React from "react";
import DashboardStats from "../common/DashboardStats";
import OverviewCharts from "../common/OverviewCharts";
import "./AdminOverview.css";

const AdminOverview = ({ user, stats }) => {
  // Define stats for the Admin
  const adminStats = {
    customStats: [
      {
        label: "Total Users",
        value: stats?.totalUsers || 0,
        trend: "+2.5%",
        icon: "fa-users",
        color: "blue",
      },
      {
        label: "Active Properties",
        value: stats?.activeProperties || 0,
        trend: "+15",
        icon: "fa-home",
        color: "green",
      },
      {
        label: "Total Revenue",
        value: `$${stats?.totalRevenue?.toLocaleString() || "0"}`,
        trend: "+5.2%",
        icon: "fa-dollar-sign",
        color: "orange",
      },
      {
        label: "Pending Verifications",
        value: stats?.pendingVerifications || 0,
        trend: "",
        icon: "fa-clock",
        color: "red",
      },
    ],
  };

  return (
    <section id="overview" className="admin-overview-section">
      <div className="dash-section-header">
        <h2>Admin Overview</h2>
        <p>Welcome, {user.name}. Here's a summary of platform activity.</p>
      </div>
      <DashboardStats user={user} stats={adminStats} />
      <OverviewCharts userRole="admin" />
    </section>
  );
};

export default AdminOverview;
