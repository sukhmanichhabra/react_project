// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { useEffect } from "react";
// import { Toaster } from "react-hot-toast";
// import { useAppDispatch, useAppSelector } from "./store/hooks";
// import { checkAuthStatus, selectAuth } from "./store/slices/authSlice";
// import NavBar from "./components/partials/NavBar";
// import Header from "./components/partials/Header";
// import Footer from "./components/partials/Footer";
// import Login from "./components/auth/Login";
// import SignUp from "./components/auth/SignUp";
// import Home from "./components/Home";
// import AgentList from "./components/Agent/AgentList";
// import AgentDesc from "./components/Agent/AgentDesc";
// import PropertyList from "./components/property list/PropertyList";
// import PropertyOverview from "./components/property overview/PropertyOverview";
// // // import PropertyCompare from "./components/compareproperties/PropertyCompare";
// // // import AboutUs from "./components/about/AboutUs";
// // // import Contact from "./components/contact/Contact";
// import Dashboard from "./components/Dashboard/Dashboard";
// import BlogList from "./components/blog/BlogList";
// import BlogDetails from "./components/blog/BlogDetails";
// import AddBlog from "./components/blog/AddBlog";
// import EditBlog from "./components/blog/EditBlog";
// import "./App.css";
// function App() {
//   const dispatch = useAppDispatch();
//   const { isAuthenticated, isLoading } = useAppSelector(selectAuth);

//   // Check auth status on app load
//   useEffect(() => {
//     dispatch(checkAuthStatus());
//   }, [dispatch]);

//   if (isLoading) {
//     return (
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           height: "100vh",
//           fontSize: "18px",
//         }}
//       >
//         Loading...
//       </div>
//     );
//   }

//   return (
//     <Router>
//       <div className="App">
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             duration: 4000,
//             style: {
//               background: "#363636",
//               color: "#fff",
//             },
//             success: {
//               duration: 3000,
//               style: {
//                 background: "#10B981",
//               },
//             },
//             error: {
//               duration: 5000,
//               style: {
//                 background: "#EF4444",
//               },
//             },
//           }}
//         />
//         {isAuthenticated && <NavBar />}
//         {isAuthenticated && <Header />}
//         <main>
//           <Routes>
//             {/* Public routes */}
//             <Route
//               path="/auth/signin"
//               element={
//                 isAuthenticated ? <Navigate to="/" replace /> : <Login />
//               }
//             />
//             <Route
//               path="/auth/signup"
//               element={
//                 isAuthenticated ? <Navigate to="/" replace /> : <SignUp />
//               }
//             />

//             {/* Protected routes */}
//             <Route
//               path="/"
//               element={
//                 isAuthenticated ? (
//                   <Home />
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/dashboard"
//               element={
//                 isAuthenticated ? (
//                   <Dashboard />
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />

//             {/* Property routes */}
//             <Route
//               path="/properties"
//               element={
//                 isAuthenticated ? (
//                   <PropertyList />
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             {/* <Route
//               path="/properties/compare"
//               element={
//                 isAuthenticated ? (
//                   <PropertyCompare />
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             /> */}
//             <Route
//               path="/properties/listing"
//               element={
//                 isAuthenticated ? (
//                   <div>List Property</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/properties/my-properties"
//               element={
//                 isAuthenticated ? (
//                   <div>My Properties</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/properties/my-purchases"
//               element={
//                 isAuthenticated ? (
//                   <div>My Purchases</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/property/:id"
//               element={
//                 isAuthenticated ? (
//                   <PropertyOverview />
//                 ) : (
//                   // <div>Property Overview</div>
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />

//             {/* Agent routes */}
//             <Route
//               path="/agents"
//               element={
//                 isAuthenticated ? (
//                   <AgentList />
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/agent/:id"
//               element={
//                 isAuthenticated ? (
//                   <AgentDesc />
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />

//             {/* Finance routes */}
//             <Route
//               path="/loans/emi-calculator"
//               element={
//                 isAuthenticated ? (
//                   <div>Loan and EMI Calculator</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/loans/my-emis"
//               element={
//                 isAuthenticated ? (
//                   <div>Pay EMI</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/model"
//               element={
//                 isAuthenticated ? (
//                   <div>Price Prediction Model</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/pricing"
//               element={
//                 isAuthenticated ? (
//                   <div>Pricing</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/trend"
//               element={
//                 isAuthenticated ? (
//                   <div>Market Trends</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />

//             {/* Visit routes */}
//             <Route
//               path="/visits/my-visits"
//               element={
//                 isAuthenticated ? (
//                   <div>My Visits</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/visits/agent"
//               element={
//                 isAuthenticated ? (
//                   <div>Agent Visit Requests</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/schedule-visit/:id"
//               element={
//                 isAuthenticated ? (
//                   <div>Schedule Visit</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />

//             {/* Blog routes */}
//             <Route
//               path="/blogs"
//               element={
//                 isAuthenticated ? (
//                   <BlogList />
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/blog/add"
//               element={
//                 isAuthenticated ? (
//                   <AddBlog />
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/blog/edit/:id"
//               element={
//                 isAuthenticated ? (
//                   <EditBlog />
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/blog/:id"
//               element={
//                 isAuthenticated ? (
//                   <BlogDetails />
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />

//             {/* Communication routes */}
//             <Route
//               path="/chat"
//               element={
//                 isAuthenticated ? (
//                   <div>Messages</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/chatbot"
//               element={
//                 isAuthenticated ? (
//                   <div>Chatbot</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/chatbot/admin"
//               element={
//                 isAuthenticated ? (
//                   <div>Chatbot Admin</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />

//             {/* Notification routes */}
//             <Route
//               path="/notifications"
//               element={
//                 isAuthenticated ? (
//                   <div>Notifications</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />

//             {/* Advertising routes */}
//             <Route
//               path="/advertising"
//               element={
//                 isAuthenticated ? (
//                   <div>Advertise with Us</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />

//             {/* Admin routes */}
//             <Route
//               path="/approve-property"
//               element={
//                 isAuthenticated ? (
//                   <div>Property Approvals</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/activity/log"
//               element={
//                 isAuthenticated ? (
//                   <div>Activity Log</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />

//             {/* Settings and account routes */}
//             <Route
//               path="/settings"
//               element={
//                 isAuthenticated ? (
//                   <div>Settings</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/auth/setup-2fa"
//               element={
//                 isAuthenticated ? (
//                   <div>Setup 2FA</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />

//             {/* Information pages */}
//             {/* <Route
//               path="/about"
//               element={
//                 isAuthenticated ? (
//                   <AboutUs />
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/contact"
//               element={
//                 isAuthenticated ? (
//                   <Contact />
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             /> */}
//             <Route
//               path="/faq"
//               element={
//                 isAuthenticated ? (
//                   <div>FAQ</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/terms"
//               element={
//                 isAuthenticated ? (
//                   <div>Terms & Conditions</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />

//             {/* Rent management routes */}
//             <Route
//               path="/rent/manage"
//               element={
//                 isAuthenticated ? (
//                   <div>Manage Rent</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />
//             <Route
//               path="/rent/pay"
//               element={
//                 isAuthenticated ? (
//                   <div>Pay Rent</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />

//             {/* Transaction routes */}
//             <Route
//               path="/transactions"
//               element={
//                 isAuthenticated ? (
//                   <div>Transactions</div>
//                 ) : (
//                   <Navigate to="/auth/signin" replace />
//                 )
//               }
//             />

//             {/* Fallback route */}
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </Routes>
//         </main>
//         {isAuthenticated && <Footer />}
//       </div>
//     </Router>
//   );
// }

// export default App;

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation, // Import useLocation
} from "react-router-dom";
import { useEffect } from "react";
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
import Dashboard from "./components/Dashboard/Dashboard";
import BlogList from "./components/blog/BlogList";
import BlogDetails from "./components/blog/BlogDetails";
import AddBlog from "./components/blog/AddBlog";
import EditBlog from "./components/blog/EditBlog";
import Advertising from "./pages/Advertising";
import PayRent from "./components/rent/PayRent";
import ManageRent from "./components/rent/ManageRent";
import PropertyRentManagement from "./components/rent/PropertyRentManagement";
import LoanApplication from "./components/loan/LoanApplication";
import MyLoans from "./components/loan/MyLoans";
import PayEMI from "./components/loan/PayEMI";
import ScheduleVisit from "./components/visits/ScheduleVisit";
import ManageVisits from "./components/visits/ManageVisits";
import "./App.css";

// This new component handles all layout and routing logic
function AppLayout() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAppSelector(selectAuth);

  // Check for different route types
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  // --- ADD THIS LINE ---
  const isAuthRoute = location.pathname.startsWith("/auth/");

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
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
        path="/model"
        element={
          isAuthenticated ? (
            <div>Price Prediction Model</div>
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

      {/* Rent management routes */}
      <Route
        path="/rent/pay"
        element={
          isAuthenticated ? (
            <PayRent />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
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
          isAuthenticated ? (
            <MyLoans />
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
          isAuthenticated ? (
            <PayEMI />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
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

      {/* Show Nav/Header only if NOT dashboard AND NOT auth AND logged in */}
      {!isDashboardRoute && !isAuthRoute && isAuthenticated && <NavBar />}
      {!isDashboardRoute && !isAuthRoute && isAuthenticated && <Header />}

      {/* Show routes wrapper logic */}
      {isDashboardRoute || isAuthRoute ? (
        // For Dashboard and Auth pages, render routes directly.
        // These components (Login.jsx, Dashboard.jsx) must manage their own layout.
        appRoutes
      ) : (
        // For all other content pages (Home, Properties), wrap in a padded <main>
        <main className="pt-20 sm:pt-24 md:pt-32 px-1 sm:px-2 lg:px-4 xl:px-5">
          {appRoutes}
        </main>
      )}

      {/* Show Footer only if NOT dashboard AND NOT auth AND logged in */}
      {!isDashboardRoute && !isAuthRoute && isAuthenticated && <Footer />}
    </div>
  );
}

// This App component is now simpler
function App() {
  const dispatch = useAppDispatch();

  // Check auth status on app load
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <Router>
      <AppLayout /> {/* Render the new layout component */}
    </Router>
  );
}

export default App;
