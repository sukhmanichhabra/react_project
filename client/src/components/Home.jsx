import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logoutUser, selectAuth } from "../store/slices/authSlice";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import BlogList from "./blog/BlogList";
import { useEffect } from "react";

function Home() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  useEffect(() => {
    document.title = "Home - Real Estate Platform";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          borderBottom: "1px solid #eee",
          paddingBottom: "20px",
        }}
      >
        <h1>Welcome to Real Estate Platform</h1>
        <div>
          <Link to="/blogs" style={{ marginRight: "15px" }}>
            blogs
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span>Hello, {user?.name || "User"}</span>
          <span
            style={{
              padding: "4px 8px",
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            {user?.role?.toUpperCase()}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "white" /* Changed from #f8f9fa to white */,
            }}
          >
            <h3>Dashboard</h3>
            <p>View your properties, transactions, and analytics.</p>
            <button
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Go to Dashboard
            </button>
          </div>

          <div
            style={{
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "white" /* Changed from #f8f9fa to white */,
            }}
          >
            <h3>Properties</h3>
            <p>Browse available properties or manage your listings.</p>
            <button
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              View Properties
            </button>
          </div>

          <div
            style={{
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "white" /* Changed from #f8f9fa to white */,
            }}
          >
            <h3>Messages</h3>
            <p>Chat with agents, buyers, or sellers.</p>
            <button
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Open Messages
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "30px",
            textAlign: "center",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h2>Your MERN Stack Real Estate Platform</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Successfully logged in! The authentication system is working with
            Redux Toolkit.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "6px 12px",
                backgroundColor: "#e9ecef",
                borderRadius: "15px",
                fontSize: "14px",
              }}
            >
              ✅ Redux Authentication
            </span>
            <span
              style={{
                padding: "6px 12px",
                backgroundColor: "#e9ecef",
                borderRadius: "15px",
                fontSize: "14px",
              }}
            >
              ✅ React Frontend
            </span>
            <span
              style={{
                padding: "6px 12px",
                backgroundColor: "#e9ecef",
                borderRadius: "15px",
                fontSize: "14px",
              }}
            >
              ✅ Node.js Backend
            </span>
            <span
              style={{
                padding: "6px 12px",
                backgroundColor: "#e9ecef",
                borderRadius: "15px",
                fontSize: "14px",
              }}
            >
              ✅ MongoDB Database
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
