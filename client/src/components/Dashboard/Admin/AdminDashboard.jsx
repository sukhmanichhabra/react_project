import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../../../services/api";
import Profile from "../common/Profile";
import AdminOverview from "./AdminOverview";
import AgentVerification from "./AgentVerification";
import LoanApproval from "./LoanApproval";
import ManageAgents from "./ManageAgents";
import PropertyApproval from "./PropertyApproval";
import GeolocationManager from "./GeolocationManager";

const AdminDashboard = ({ user, activeSection, onUserUpdate }) => {
  const [adminData, setAdminData] = useState({
    stats: {},
    pendingAgents: [],
    allAgents: [],
    agents: [],
    loanApplications: [],
    pendingProperties: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch admin data from backend
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardAPI.getDashboardData();
      
      if (response.data.success) {
        const data = response.data.data;
        setAdminData({
          stats: data.stats || {},
          pendingAgents: data.pendingAgents || [],
          allAgents: data.agents || [],
          agents: data.agents || [],
          loanApplications: data.loanApplications || [],
          pendingProperties: data.stats?.pendingProperties || []
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch admin data");
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(err.response?.data?.message || err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchAdminData();
    }
  }, [user?._id]);

  const handleProfileUpdate = (updatedUser, updatedAgentProfile) => {
    console.log("Admin profile updated:", updatedUser);
    // Refresh user data in parent Dashboard component
    if (onUserUpdate && typeof onUserUpdate === 'function') {
      onUserUpdate();
    }
    // Refresh admin-specific data
    fetchAdminData();
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
