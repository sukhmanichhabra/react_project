import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Import user-specific dashboards
import AdminDashboard from "./admin/AdminDashboard";
import AgentDashboard from "./agent/AgentDashboard";
import BuyerDashboard from "./buyer/BuyerDashboard";
import SellerDashboard from "./seller/SellerDashboard";

// Import common layout components
import Sidebar from "./layout/Sidebar";
import TopBar from "./layout/TopBar";

const Dashboard = () => {
  // In a real app, you'd get this from context or a Redux store
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State to manage active section
  const [activeSection, setActiveSection] = useState("overview");
  const location = useLocation();

  useEffect(() => {
    // Get user from local storage or API
    const storedUser = JSON.parse(localStorage.getItem("user"));

    // This is just an example. You should fetch the full user object
    // from your API to get agentProfile, properties, etc.
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);

    // Sync active section with URL hash
    const hash = location.hash.replace("#", "");
    if (hash) {
      setActiveSection(hash);
    }
  }, [location]);

  const handleNavClick = (section) => {
    setActiveSection(section);
  };

  const renderDashboard = () => {
    if (loading || !user) {
      return <div className="p-10 text-center">Loading Dashboard...</div>;
    }

    // Pass user and activeSection to the appropriate dashboard
    const props = { user, activeSection };

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
