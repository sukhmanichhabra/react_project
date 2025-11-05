import React, { useState, useEffect } from "react";
import { agentAPI } from "../../../services/api";
import Profile from "../common/Profile";
import AgentOverview from "./AgentOverview";
import ManagedProperties from "./ManagedProperties";
import Verification from "./Verification";
import Messages from "./Messages";

// Mock data as fallback
const mockAgentData = {
  agentProfile: {
    title: "Senior Agent",
    qualification: "Licensed Realtor",
    overview: "10 years of experience...",
    verified: false,
    verificationStatus: "pending",
    verificationMessage: "Your documents are being reviewed.",
  },
  properties: [],
  messages: [],
  stats: {},
};

const AgentDashboard = ({ user, activeSection }) => {
  const [agentData, setAgentData] = useState(mockAgentData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchAgentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the current agent profile data from backend
      const response = await agentAPI.getCurrentAgentProfile();
      
      if (response.data.success) {
        setAgentData({
          agentProfile: response.data.agentProfile,
          properties: [],
          messages: [],
          stats: {},
        });
      } else {
        // If no agent profile found, use mock data
        setAgentData(mockAgentData);
      }
    } catch (err) {
      console.error("Error fetching agent data:", err);
      // If error occurs, fall back to mock data
      setAgentData(mockAgentData);
      setError(err.response?.data?.message || "Failed to fetch agent data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchAgentData();
    }
  }, [user?._id]);

  const handleProfileUpdate = () => {
    // Refresh agent data after profile update
    fetchAgentData();
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading Agent Dashboard...
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

  // Use fetched data, falling back to mock data
  const { agentProfile, properties, messages, stats } = agentData;
  switch (activeSection) {
    case "overview":
      return <AgentOverview user={user} stats={stats} />;
    case "managed-properties":
      return <ManagedProperties properties={properties} />;
    case "verification":
      return <Verification agentProfile={agentProfile} onProfileUpdate={handleProfileUpdate} />;
    case "messages":
      return <Messages messages={messages} />;    case "profile":
      return <Profile user={user} agentProfile={agentProfile} onProfileUpdate={handleProfileUpdate} />;
    default:
      return <AgentOverview user={user} stats={stats} />;
  }
};

export default AgentDashboard;
