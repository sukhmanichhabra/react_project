import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { dashboardAPI } from "../../services/api";

// Import user-specific dashboards
import AdminDashboard from "./admin/AdminDashboard";
import AgentDashboard from "./agent/AgentDashboard";
import BuyerDashboard from "./buyer/BuyerDashboard";
import SellerDashboard from "./seller/SellerDashboard";

// Import common layout components
import Sidebar from "./layout/Sidebar";
import TopBar from "./layout/TopBar";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State to manage active section
  const [activeSection, setActiveSection] = useState("overview");
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch user data from backend
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch full dashboard data from backend
      const response = await dashboardAPI.getDashboardData();
      
      if (response.data.success) {
        const userData = response.data.data.user;
        const fullData = response.data.data;
        
        // Update state with fresh backend data
        setUser(userData);
        setDashboardData(fullData);
        
        // Update localStorage with fresh user data
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        throw new Error(response.data.message || "Failed to fetch user data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.response?.data?.message || err.message || "Failed to load dashboard");
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("user");
        navigate("/auth/signin");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch user data from backend on mount
    fetchUserData();

    // Sync active section with URL hash
    const hash = location.hash.replace("#", "");
    if (hash) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  // Function to refresh user data from backend
  const refreshUserData = () => {
    fetchUserData();
  };

  const handleNavClick = (section) => {
    setActiveSection(section);
  };

  const renderDashboard = () => {
    if (loading || !user) {
      return <div className="p-10 text-center">Loading Dashboard...</div>;
    }

    // Pass user, activeSection, and refreshUserData to the appropriate dashboard
    const props = { user, activeSection, onUserUpdate: refreshUserData };

    switch (user.role) {
      case "admin":
        return <AdminDashboard {...props} />;
      case "agent":
        return <AgentDashboard {...props} />;
      case "buyer":
        return <BuyerDashboard {...props} />;
      case "seller":
        return <SellerDashboard {...props} />;
      default:
        return (
          <div className="p-10 text-center text-red-500">
            Error: User role not recognized.
          </div>
        );
    }
  };

  if (loading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    // We use h-screen on the outer container, not flex-1
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar
        user={user}
        activeSection={activeSection}
        onNavClick={handleNavClick}
      />

      {/* This main content area is now a flex-column */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar is fixed and will NOT scroll */}
        <TopBar user={user} />

        {/* This div is the ONLY scrollable part */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderDashboard()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
