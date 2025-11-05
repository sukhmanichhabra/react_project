import React, { useState, useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import {
  selectAuth,
  fetchUserBalance,
  updateUserBalance,
} from "../../../store/slices/authSlice.js";

// Import Sections
import Profile from "../common/Profile";
import BuyerOverview from "./BuyerOverview";
import MyProperties from "./MyProperties";
import RentedProperties from "./RentedProperties";

// Removed: import "../dashboard.css"; (Assuming Tailwind is used)

// This is the main component for the Buyer
const BuyerDashboard = ({ user, activeSection }) => {
  const dispatch = useAppDispatch();

  // State for data
  const [properties, setProperties] = useState([]);
  const [loanRequests, setLoanRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all dashboard data for the buyer on load
  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        setLoading(true);

        // 1. Fetch from the main dashboard endpoint
        const response = await fetch("/api/dashboard");
        const result = await response.json();

        // 2. Handle errors from the backend's JSON response
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch dashboard data.");
        }

        // 3. Get the nested data object
        const { data } = result;

        // 4. Extract data from the correct paths
        const userProperties = data.properties || [];
        const userLoanRequests = data.user?.loanRequests || []; // Pulled from populated user
        const userTransactions = data.transactions || []; // Used for stats

        setProperties(userProperties);
        setLoanRequests(userLoanRequests);

        // 5. Calculate stats based on the fetched data
        const bought = userProperties.filter(
          (p) => p.status === "sold"
        ).length;
        const rented = userProperties.filter(
          (p) => p.status === "rented"
        ).length;
        
        // Calculate totalSpent from the transactions array
        const totalSpent = userTransactions.reduce(
          (acc, tx) => acc + (tx.amount || 0),
          0
        );
        
        const loanStatus = userLoanRequests.find(
          (l) => l.status === "pending"
        )
          ? "Pending"
          : "N/A";

        setStats({
          bought,
          rented,
          totalSpent,
          loanStatus,
        });

        // 6. Dispatch Redux action to sync balance
        // This is good practice as it keeps the Redux store (used by TopBar) in sync
        dispatch(fetchUserBalance());
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyerData();
  }, [dispatch]);
  // --- Logic from dash1.js ---
  // This function is correct. It dispatches a Redux thunk,
  // which (in authSlice.js) should be configured to call
  // the `POST /api/dashboard/update-balance` endpoint.
  const handleAddFunds = async () => {
    const amount = window.prompt("Enter amount to add to your account:");
    if (!amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return alert("Please enter a valid amount.");
    }

    try {
      // Dispatch the Redux action to update balance
      await dispatch(updateUserBalance(parsedAmount)).unwrap();
      alert("Funds added successfully!");
      // The user balance in the TopBar/Overview will update automatically via Redux
    } catch (err) {
      alert("Failed to add funds. " + err.message);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    // This could trigger a re-fetch of user data or update Redux state
    console.log("Profile updated:", updatedUser);
    
    // Refresh the dashboard data to get the latest user info
    const fetchBuyerData = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/dashboard");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch dashboard data.");
        }

        const { data } = result;
        const userProperties = data.properties || [];
        const userLoanRequests = data.user?.loanRequests || [];
        const userTransactions = data.transactions || [];

        setProperties(userProperties);
        setLoanRequests(userLoanRequests);

        const bought = userProperties.filter((p) => p.status === "sold").length;
        const rented = userProperties.filter((p) => p.status === "rented").length;
        const totalSpent = userTransactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);
        const loanStatus = userLoanRequests.find((l) => l.status === "pending") ? "Pending" : "N/A";

        setStats({ bought, rented, totalSpent, loanStatus });
        dispatch(fetchUserBalance());
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

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
            onAddFunds={handleAddFunds}
          />
        );
      case "my-properties":
        return (
          <MyProperties
            properties={properties.filter((p) => p.status === "sold")}
          />
        );      case "rented-properties":
        return (
          <RentedProperties
            properties={properties.filter((p) => p.status === "rented")}
          />
        );
      case "profile":
        return <Profile user={user} agentProfile={null} onProfileUpdate={handleProfileUpdate} />;
      default:
        return (
          <BuyerOverview
            user={user}
            stats={stats}
            loanRequests={loanRequests}
            onAddFunds={handleAddFunds}
          />
        );
    }
  };

  return <>{renderSection()}</>;
};

export default BuyerDashboard;