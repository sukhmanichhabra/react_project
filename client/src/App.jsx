import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation, // Import useLocation
} from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { checkAuthStatus, selectAuth } from "./store/slices/authSlice";
import NavBar from "./components/partials/NavBar";
import Header from "./components/partials/Header";
import Footer from "./components/partials/Footer";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";
import Home from "./components/Home";
import AgentList from "./components/Agent/AgentList";
import AgentDesc from "./components/Agent/AgentDesc";
import PropertyList from "./components/property list/PropertyList";
import PropertyOverview from "./components/property overview/PropertyOverview";
import PropertyCompare from "./components/property/PropertyCompare";
import CompareFloatingButton from "./components/partials/CompareFloatingButton";
import Dashboard from "./components/Dashboard/Dashboard";
import BlogList from "./components/blog/BlogList";
import BlogDetails from "./components/blog/BlogDetails";
import AddBlog from "./components/blog/AddBlog";
import EditBlog from "./components/blog/EditBlog";
import Settings from "./components/Settings/Settings";
import Setup2FA from "./components/Settings/Setup2FA";
import Model from "./components/Model/Model";
import Advertising from "./pages/Advertising";
import Messages from "./pages/Messages";
import Chatbot from "./pages/Chatbot";
import ChatbotAdmin from "./pages/ChatbotAdmin";
import Notifications from "./pages/Notifications";
import ActivityLog from "./pages/ActivityLog";
import PayRent from "./components/rent/PayRent";
import ManageRent from "./components/rent/ManageRent";
import PropertyRentManagement from "./components/rent/PropertyRentManagement";
import LoanApplication from "./components/loan/LoanApplication";
import MyLoans from "./components/loan/MyLoans";
import LoanDetails from "./components/loan/LoanDetails";
import PayEMI from "./components/loan/PayEMI";
import ScheduleVisit from "./components/visits/ScheduleVisit";
import ManageVisits from "./components/visits/ManageVisits";
import VisitVideoCall from "./components/visits/VisitVideoCall";
import { VideoCallProvider } from "./context/VideoCallContext";
import About from "./components/About/About";
import Contact from "./components/Contact/Contact";
import "./App.css";

// Loading component for page transitions
function PageLoader() {
  return (
    <div className="page-loader">
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
}

// This new component handles all layout and routing logic
function AppLayout() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAppSelector(selectAuth);
  const [pageLoading, setPageLoading] = useState(false);

  // Handle page transition loading
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500); // Show loading for 500ms on route change

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Check for different route types
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const isAuthRoute = location.pathname.startsWith("/auth/");
  const isModelRoute = location.pathname === "/model";

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (pageLoading) {
    return <PageLoader />;
  }

  // Define all your routes in one place
  const appRoutes = (
    <Routes>
      {/* Public routes */}
      <Route
        path="/auth/signin"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/auth/signup"
        element={isAuthenticated ? <Navigate to="/" replace /> : <SignUp />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Home /> : <Navigate to="/auth/signin" replace />
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Dashboard />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />

      {/* ... (all your other routes remain the same) ... */}

      {/* Property routes */}
      <Route
        path="/properties"
        element={
          isAuthenticated ? (
            <PropertyList />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/properties/compare"
        element={
          isAuthenticated ? (
            <PropertyCompare />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/properties/listing"
        element={
          isAuthenticated ? (
            <div>List Property</div>
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/properties/my-properties"
        element={
          isAuthenticated ? (
            <div>My Properties</div>
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/properties/my-purchases"
        element={
          isAuthenticated ? (
            <div>My Purchases</div>
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/property/:id"
        element={
          isAuthenticated ? (
            <PropertyOverview />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />

      {/* Agent routes */}
      <Route
        path="/agents"
        element={
          isAuthenticated ? (
            <AgentList />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/agent/:id"
        element={
          isAuthenticated ? (
            <AgentDesc />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />

      {/* Finance routes */}
      <Route
        path="/loans/emi-calculator"
        element={
          isAuthenticated ? (
            <div>Loan and EMI Calculator</div>
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/pricing"
        element={
          isAuthenticated ? (
            <div>Pricing</div>
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/trend"
        element={
          isAuthenticated ? (
            <div>Market Trends</div>
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />

      {/* Visit routes */}
      <Route
        path="/visits/my-visits"
        element={
          isAuthenticated ? (
            <ScheduleVisit />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/visits/agent"
        element={
          isAuthenticated ? (
            <ManageVisits />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/schedule-visit/:id"
        element={
          isAuthenticated ? (
            <ScheduleVisit />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />

      {/* Blog routes */}
      <Route
        path="/blogs"
        element={
          isAuthenticated ? (
            <BlogList />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/blog/add"
        element={
          isAuthenticated ? <AddBlog /> : <Navigate to="/auth/signin" replace />
        }
      />
      <Route
        path="/blog/edit/:id"
        element={
          isAuthenticated ? (
            <EditBlog />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/blog/:id"
        element={
          isAuthenticated ? (
            <BlogDetails />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />

      {/* Admin Activity Log route */}
      <Route
        path="/activity/log"
        element={
          isAuthenticated ? (
            <ActivityLog />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />

      {/* Advertising route */}
      <Route
        path="/advertising"
        element={
          isAuthenticated ? (
            <Advertising />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />

      {/* Notifications route */}
      <Route
        path="/notifications"
        element={
          isAuthenticated ? (
            <Notifications />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />

      {/* Messages route */}
      <Route
        path="/chat"
        element={
          isAuthenticated ? (
            <Messages />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />

      {/* Chatbot routes */}
      <Route
        path="/chatbot"
        element={
          isAuthenticated ? <Chatbot /> : <Navigate to="/auth/signin" replace />
        }
      />
      <Route
        path="/chatbot/admin"
        element={
          isAuthenticated ? (
            <ChatbotAdmin />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />

      {/* Rent management routes */}
      <Route
        path="/rent/pay"
        element={
          isAuthenticated ? <PayRent /> : <Navigate to="/auth/signin" replace />
        }
      />
      <Route
        path="/rent/manage"
        element={
          isAuthenticated ? (
            <ManageRent />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/rent/manage/:propertyId"
        element={
          isAuthenticated ? (
            <PropertyRentManagement />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />

      {/* Loan management routes */}
      <Route
        path="/loans/apply"
        element={
          isAuthenticated ? (
            <LoanApplication />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/loans/my-applications"
        element={
          isAuthenticated ? <MyLoans /> : <Navigate to="/auth/signin" replace />
        }
      />
      <Route
        path="/loans/application/:id"
        element={
          isAuthenticated ? (
            <LoanDetails />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/loans/emi-calculator"
        element={<Navigate to="/loan/emi-calculator" replace />}
      />
      <Route
        path="/loans/my-emis"
        element={
          isAuthenticated ? <PayEMI /> : <Navigate to="/auth/signin" replace />
        }
      />

      {/* Visit management routes */}
      <Route
        path="/visits/schedule"
        element={
          isAuthenticated ? (
            <ScheduleVisit />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/visits/manage"
        element={
          isAuthenticated ? (
            <ManageVisits />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/visits/video/:visitId"
        element={
          isAuthenticated ? (
            <VisitVideoCall />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />

      {/* Settings and account routes */}
      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            <Settings />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />
      <Route
        path="/auth/setup-2fa"
        element={
          isAuthenticated ? (
            <Setup2FA />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        }
      />

      {/* About route */}
      <Route
        path="/about"
        element={
          isAuthenticated ? <About /> : <Navigate to="/auth/signin" replace />
        }
      />

      {/* Contact route */}
      <Route
        path="/contact"
        element={
          isAuthenticated ? <Contact /> : <Navigate to="/auth/signin" replace />
        }
      />

      {/* Model/Price Prediction route */}
      <Route path="/model" element={<Model />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  return (
    <div className="App">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#363636", color: "#fff" },
          success: { duration: 3000, style: { background: "#10B981" } },
          error: { duration: 5000, style: { background: "#EF4444" } },
        }}
      />

      {/* --- UPDATE THIS LOGIC --- */}

      {/* Show Nav/Header only if NOT dashboard AND NOT auth AND NOT model AND logged in */}
      {!isDashboardRoute &&
        !isAuthRoute &&
        !isModelRoute &&
        isAuthenticated && <NavBar />}
      {!isDashboardRoute &&
        !isAuthRoute &&
        !isModelRoute &&
        isAuthenticated && <Header />}

      {/* Show routes wrapper logic */}
      {isDashboardRoute || isAuthRoute || isModelRoute ? (
        <main>{appRoutes}</main>
      ) : (
        <main className="main-content">{appRoutes}</main>
      )}

      {/* Show Footer only if NOT dashboard AND NOT auth AND NOT model AND logged in */}
      {!isDashboardRoute &&
        !isAuthRoute &&
        !isModelRoute &&
        isAuthenticated && <Footer />}

      {/* Show Compare Floating Button on property-related pages */}
      {!isDashboardRoute &&
        !isAuthRoute &&
        !isModelRoute &&
        isAuthenticated && <CompareFloatingButton />}
    </div>
  );
}

// This App component is now simpler
function App() {
  const dispatch = useAppDispatch();

  // Check auth status on app load
  useEffect(() => {
    // Small delay to prevent race conditions during fast refreshes
    const checkAuth = async () => {
      await dispatch(checkAuthStatus());
    };
    checkAuth();
  }, [dispatch]);

  return (
    <Router>
      <VideoCallProvider>
        <AppLayout /> {/* Render the new layout component */}
      </VideoCallProvider>
    </Router>
  );
}

export default App;
