import React, { useState } from "react";
import DashboardStats from "../common/DashboardStats";
import OverviewCharts from "../common/OverviewCharts";
import AddFundsModal from "../common/AddFundsModal";
import { dashboardAPI } from "../../../services/api";
import toast from "react-hot-toast";
import "./SellerOverview.css"; // <-- Import new CSS

const SellerOverview = ({ user, stats, onUserUpdate }) => {
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);

  // Handle adding funds
  const handleAddFunds = async (amount) => {
    try {
      const response = await dashboardAPI.updateBalance(amount);

      if (response.data.success) {
        toast.success(`$${amount.toLocaleString()} added successfully!`);

        // Update user data if callback provided
        if (onUserUpdate) {
          onUserUpdate(response.data.user);
        }
      } else {
        throw new Error(response.data.message || "Failed to add funds");
      }
    } catch (error) {
      console.error("Error adding funds:", error);
      toast.error(error.response?.data?.message || "Failed to add funds");
      throw error;
    }
  };

  // Define stats for the Seller
  const sellerStats = {
    customStats: [
      {
        label: "Account Balance",
        value: `$${user?.accountBalance?.toLocaleString() || "0"}`,
        trend: "",
        icon: "fa-wallet",
        color: "purple",
        action: {
          label: "Add Funds",
          onClick: () => setShowAddFundsModal(true),
          icon: "fa-plus",
        },
      },
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

      {/* Add Funds Modal */}
      <AddFundsModal
        isOpen={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
        onAddFunds={handleAddFunds}
        currentBalance={user?.accountBalance || 0}
      />
    </section>
  );
};

export default SellerOverview;
