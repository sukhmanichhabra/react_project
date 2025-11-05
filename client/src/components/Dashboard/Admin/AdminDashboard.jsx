import React, { useState, useEffect } from "react";
import Profile from "../common/Profile";
import AdminOverview from "./AdminOverview";
import AgentVerification from "./AgentVerification";
import LoanApproval from "./LoanApproval";
import ManageAgents from "./ManageAgents";
import PropertyApproval from "./PropertyApproval";
import GeolocationManager from "./GeolocationManager";

// In a real app, this data would come from API calls
const mockAdminData = {
  stats: {
    totalUsers: 2458,
    activeProperties: 1245,
    totalRevenue: 845012,
    pendingVerifications: 2, // Matched to mock data
  },
  pendingAgents: [
    {
      _id: "agent-mock-1",
      name: "New Agent 1 (Mock)",
      email: "agent1@example.com",
      phone: "123-456-7890",
      createdAt: new Date().toISOString(),
      documentUrl: "#",
    },
    {
      _id: "agent-mock-2",
      name: "New Agent 2 (Mock)",
      email: "agent2@example.com",
      phone: "098-765-4321",
      createdAt: new Date().toISOString(),
      documentUrl: "#",
    },
  ],
  allAgents: [
    {
      _id: "agent-all-1",
      name: "Verified Agent (Mock)",
      email: "verified@example.com",
      phone: "555-555-5555",
      listingCount: 12,
      verified: true,
    },
    {
      _id: "agent-all-2",
      name: "Pending Agent (Mock)",
      email: "pending@example.com",
      phone: "111-222-3333",
      listingCount: 1,
      verified: false,
    },
  ],
  loanApplications: [
    {
      _id: "loan-mock-1",
      userName: "Buyer User (Mock)",
      userEmail: "buyer@example.com",
      amount: 350000,
      propertyId: "prop-1",
      propertyTitle: "Modern City Loft",
      status: "pending",
    },
  ],
  pendingProperties: [
    {
      _id: "prop-mock-1",
      images: ["/assets/property-5.jpg"],
      title: "Pending Approval Villa (Mock)",
      location: "Waiting Room, Mock City",
      price: "$750,000",
      features: { beds: 5, baths: 4, sqft: 3200 },
      status: "pending",
      adPackage: { name: "Gold" },
    },
  ],
};

const AdminDashboard = ({ user, activeSection }) => {
  const [adminData, setAdminData] = useState(mockAdminData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchAdminData = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await fetch("/api/dashboard/admin-data"); // Example endpoint
  //       const result = await response.json();
  //       if (!result.success) throw new Error(result.message);
  //       setAdminData(result.data);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchAdminData();  // }, []);

  const handleProfileUpdate = (updatedUser) => {
    console.log("Admin profile updated:", updatedUser);
    // Here you could refresh admin-specific data if needed
    // For now, just log the update
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading Admin Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
        {error}
      </div>
    );
  }

  const {
    stats,
    pendingAgents,
    allAgents,
    loanApplications,
    pendingProperties,
  } = adminData;  switch (activeSection) {
    case "overview":
      return <AdminOverview user={user} stats={stats} />;
    case "agent-verification":
      return <AgentVerification />;
    case "manage-agents":
      return <ManageAgents allAgents={allAgents} />;
    case "loan-approval":
      return <LoanApproval loanApplications={loanApplications} />;
    case "property-approval":
      return <PropertyApproval properties={pendingProperties} />;
    case "geolocation-manager":
      return <GeolocationManager />;
    case "profile":
      return <Profile user={user} agentProfile={null} onProfileUpdate={handleProfileUpdate} />;
    default:
      return <AdminOverview user={user} stats={stats} />;
  }
};

export default AdminDashboard;
