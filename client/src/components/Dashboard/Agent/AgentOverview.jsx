import React from "react";
import DashboardStats from "../common/DashboardStats";
import OverviewCharts from "../common/OverviewCharts";
import "./AgentOverview.css";

const AgentOverview = ({ user, stats = {} }) => {
  // Define stats for the Agent
  const agentStats = {
    customStats: [
      {
        label: "Managed Properties",
        value: stats?.managedProperties || 0,
        trend: stats?.managedPropertiesTrend || "+0",
        icon: "fa-building",
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
        label: "New Messages",
        value: stats?.newMessages || 0,
        trend: "",
        icon: "fa-envelope",
        color: "pink",
      },
    ],
  };

  return (
    <section id="overview" className="agent-overview-section">
      <div className="dash-section-header">
        <h2>Agent Overview</h2>
        <p>Here's a summary of your properties and activity.</p>
      </div>
      <DashboardStats user={user} stats={agentStats} />
      <OverviewCharts userRole="agent" />
    </section>
  );
};

export default AgentOverview;
