import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../../../services/api";
import Profile from "../common/Profile";
import SellerOverview from "./SellerOverview";
import AddListing from "./AddListing";
import SellerMyProperties from "./SellerMyProperties";
import SellerRentedProperties from "./SellerRentedProperties";
import AdvertisedProperties from "./AdvertisedProperties";
import Transactions from "./Transactions";

const SellerDashboard = ({ user, activeSection, onUserUpdate }) => {
  const [sellerData, setSellerData] = useState({
    properties: [],
    advertisedProperties: [],
    transactions: [],
    stats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch seller data from backend
  const fetchSellerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardAPI.getDashboardData();
      
      if (response.data.success) {
        const data = response.data.data;
        setSellerData({
          properties: data.properties || [],
          advertisedProperties: data.advertisedProperties || [],
          transactions: data.transactions || [],
          stats: data.stats || {}
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch seller data");
      }
    } catch (err) {
      console.error("Error fetching seller data:", err);
      setError(err.response?.data?.message || err.message || "Failed to load seller data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchSellerData();
    }
  }, [user?._id]);

  const handleProfileUpdate = (updatedUser, updatedAgentProfile) => {
    console.log("Profile updated:", updatedUser);
    // Refresh user data in parent Dashboard component
    if (onUserUpdate && typeof onUserUpdate === 'function') {
      onUserUpdate();
    }
    // Refresh seller-specific data
    fetchSellerData();
  };

  if (loading) {
    return <div className="p-10 text-center">Loading Seller Dashboard...</div>;
  }
  
  if (error) {
     return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  switch (activeSection) {
    case "overview":
      return <SellerOverview user={user} stats={sellerData.stats || {}} />;
    case "add-listing":
      return <AddListing />;
    case "my-properties":
      return <SellerMyProperties properties={sellerData.properties} />;
    case "seller-rented-properties":
      return <SellerRentedProperties properties={sellerData.properties} />;
    case "advertised-properties":
      return (
        <AdvertisedProperties
          advertisedProperties={sellerData.advertisedProperties}
        />
      );
    case "transactions":
      return <Transactions transactions={sellerData.transactions} />;    case "profile":
      return <Profile user={user} agentProfile={null} onProfileUpdate={handleProfileUpdate} />; // Sellers are not agents
    default:
      return <SellerOverview user={user} stats={sellerData.stats || {}} />;
  }
};

export default SellerDashboard;