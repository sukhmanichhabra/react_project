import React, { useState, useEffect } from "react";
import Profile from "../common/Profile";
import SellerOverview from "./SellerOverview";
import AddListing from "./AddListing";
import SellerMyProperties from "./SellerMyProperties";
import SellerRentedProperties from "./SellerRentedProperties";
import AdvertisedProperties from "./AdvertisedProperties";
import Transactions from "./Transactions"; // Make sure this path is correct

// In a real app, this data would come from API calls
const mockSellerData = {
  properties: [
    /* ... list of seller's properties ... */
  ],
  advertisedProperties: [
    /* ... list of advertised properties ... */
  ],
  transactions: [
    /* ... list of transactions ... */
  ],
};

const SellerDashboard = ({ user, activeSection }) => {
  // You would replace mockSellerData with fetched data
  const [sellerData, setSellerData] = useState(mockSellerData);
  const [loading, setLoading] = useState(false); // Set to true when fetching
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchSellerData = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await fetch("/api/dashboard/seller-data");
  //       const result = await response.json();
  //       if (!result.success) throw new Error(result.message);
  //       setSellerData(result.data);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchSellerData();  // }, []);

  const handleProfileUpdate = (updatedUser) => {
    console.log("Profile updated:", updatedUser);
    // Here you could refresh seller-specific data if needed
    // For now, just log the update
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