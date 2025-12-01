import React, { useState, useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import {
  selectAuth,
  fetchUserBalance,
  updateUserBalance,
} from "../../../store/slices/authSlice.js";
import { dashboardAPI, propertyAPI } from "../../../services/api";

// Import Sections
import Profile from "../common/Profile";
import BuyerOverview from "./BuyerOverview";
import MyProperties from "./MyProperties";
import RentedProperties from "./RentedProperties";
import AddFundsModal from "../common/AddFundsModal";

// This is the main component for the Buyer
const BuyerDashboard = ({ user, activeSection, onUserUpdate }) => {
  const dispatch = useAppDispatch();

  // State for data
  const [properties, setProperties] = useState([]);
  const [loanRequests, setLoanRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);

  // Fetch all dashboard data for the buyer on load
  const fetchBuyerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from both dashboard and property endpoints to get complete data
      const [dashboardResponse, propertiesResponse] = await Promise.all([
        dashboardAPI.getDashboardData(),
        propertyAPI.getAllProperties(),
      ]);

      if (dashboardResponse.data.success) {
        // Get the nested data object from dashboard
        const { data } = dashboardResponse.data;

        // Debug logging to see what's actually in the response
        console.log("Dashboard API Response:", dashboardResponse.data);
        console.log("User object:", data.user);
        console.log("User loanRequests:", data.user?.loanRequests);

        // Get properties with agent data from property API
        const allPropertiesWithAgents = Array.isArray(propertiesResponse.data)
          ? propertiesResponse.data
          : propertiesResponse.data?.properties || [];

        // Filter to get only user's properties (you might need to adjust this logic based on your data structure)
        const userPropertyIds = (data.properties || []).map((p) => p._id);
        const userPropertiesWithAgents = allPropertiesWithAgents.filter((p) =>
          userPropertyIds.includes(p._id)
        );

        console.log("Properties with agent data:", userPropertiesWithAgents);

        // Extract data from the correct paths
        const userLoanRequests = data.user?.loanRequests || [];
        const userTransactions = data.transactions || [];

        setProperties(userPropertiesWithAgents);
        setLoanRequests(userLoanRequests);

        // Calculate stats based on the fetched data
        const bought = userPropertiesWithAgents.filter(
          (p) => p.status === "sold"
        ).length;
        const rented = userPropertiesWithAgents.filter(
          (p) => p.status === "rented"
        ).length;
        const totalSpent = userTransactions.reduce(
          (acc, tx) => acc + (tx.amount || 0),
          0
        );
        const loanStatus = userLoanRequests.find(
          (l) =>
            (l.applicationStatus || l.status) === "pending" ||
            (l.applicationStatus || l.status) === "under_review"
        )
          ? "Pending"
          : "N/A";

        setStats({
          bought,
          rented,
          totalSpent,
          loanStatus,
        });

        // Dispatch Redux action to sync balance
        dispatch(fetchUserBalance());
      } else {
        throw new Error(
          response.data.message || "Failed to fetch dashboard data"
        );
      }
    } catch (err) {
      console.error("Error fetching buyer data:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load buyer data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchBuyerData();
    }
  }, [user?._id]);
  // --- Logic from dash1.js ---
  // Open the Add Funds modal
  const handleAddFundsClick = () => {
    setIsAddFundsModalOpen(true);
  };

  // Handle adding funds from the modal
  const handleAddFunds = async (amount) => {
    try {
      // Dispatch the Redux action to update balance
      await dispatch(updateUserBalance(amount)).unwrap();

      // Refresh user data to get updated balance
      if (onUserUpdate && typeof onUserUpdate === "function") {
        onUserUpdate();
      }

      // Refresh buyer-specific data
      fetchBuyerData();

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const handleProfileUpdate = (updatedUser, updatedAgentProfile) => {
    console.log("Profile updated:", updatedUser);

    // Refresh user data in parent Dashboard component
    if (onUserUpdate && typeof onUserUpdate === "function") {
      onUserUpdate();
    }

    // Refresh buyer-specific data
    fetchBuyerData();
  };

  // Render the active section based on the prop
  const renderSection = () => {
    if (loading) {
      return (
        <div className="text-center p-10 text-gray-500">
          Loading Dashboard...
        </div>
      );
    }

    if (error) {
      return <div className="text-center p-10 text-red-500">{error}</div>;
    }

    // This logic remains the same, passing the fetched state to the children
    switch (activeSection) {
      case "overview":
        return (
          <BuyerOverview
            user={user}
            stats={stats}
            loanRequests={loanRequests}
            onAddFunds={handleAddFundsClick}
          />
        );
      case "my-properties":
        return (
          <MyProperties
            properties={properties.filter((p) => p.status === "sold")}
          />
        );
      case "rented-properties":
        return (
          <RentedProperties
            properties={properties.filter((p) => p.status === "rented")}
          />
        );
      case "profile":
        return (
          <Profile
            user={user}
            agentProfile={null}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      default:
        return (
          <BuyerOverview
            user={user}
            stats={stats}
            loanRequests={loanRequests}
            onAddFunds={handleAddFundsClick}
          />
        );
    }
  };

  return (
    <>
      {renderSection()}
      <AddFundsModal
        isOpen={isAddFundsModalOpen}
        onClose={() => setIsAddFundsModalOpen(false)}
        onAddFunds={handleAddFunds}
        currentBalance={user?.accountBalance || 0}
      />
    </>
  );
};

export default BuyerDashboard;
