import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { visitAPI } from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import { useVideoCall } from "../../context/VideoCallContext";
import "./MyVisits.css";

const MyVisits = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(selectAuth);
  const { startVisitCall } = useVideoCall();
  const [loading, setLoading] = useState(true);
  const [myVisits, setMyVisits] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchMyVisits();
  }, []);

  const fetchMyVisits = async () => {
    try {
      setLoading(true);
      const visitsRes = await visitAPI.getMyVisits();
      console.log("Visits API response:", visitsRes.data);

      if (visitsRes.data.success) {
        const visitsData =
          visitsRes.data.data?.visits || visitsRes.data.visits || [];
        console.log("Extracted visits data:", visitsData);
        setMyVisits(visitsData);
      }
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast.error("Failed to load visits");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      pending: "status-pending",
      approved: "status-approved",
      rejected: "status-rejected",
      cancelled: "status-cancelled",
      completed: "status-completed",
    };
    return statusMap[status] || "";
  };

  const cancelVisit = async (visitId) => {
    try {
      const response = await visitAPI.cancelVisit(visitId);
      if (response.data.success) {
        toast.success("Visit cancelled successfully");
        fetchMyVisits();
      }
    } catch (error) {
      console.error("Error cancelling visit:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to cancel visit";
      toast.error(errorMessage);
    }
  };

  const filterVisitsByTab = (visits) => {
    const now = new Date();

    switch (activeTab) {
      case "upcoming":
        return visits.filter((visit) => {
          const visitDate = new Date(visit.visitDate);
          const status = visit.status?.toLowerCase();
          return (
            visitDate >= now && (status === "pending" || status === "approved")
          );
        });

      case "past":
        return visits.filter((visit) => {
          const visitDate = new Date(visit.visitDate);
          const status = visit.status?.toLowerCase();
          return (
            visitDate < now ||
            status === "completed" ||
            status === "rejected" ||
            status === "cancelled"
          );
        });

      case "all":
      default:
        return visits;
    }
  };

  const filteredVisits = filterVisitsByTab(myVisits);

  if (loading) {
    return (
      <div className="my-visits-loading">
        <div className="spinner"></div>
        <p>Loading your visits...</p>
      </div>
    );
  }

  return (
    <div className="my-visits-container">
      <div className="my-visits-header">
        <h1 className="page-title">My Property Visits</h1>
        <button
          className="schedule-new-btn"
          onClick={() => navigate("/visits/schedule")}
        >
          <i className="fas fa-plus"></i> Schedule New Visit
        </button>
      </div>

      {/* Tabs */}
      <div className="visits-tabs">
        <button
          className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          <i className="fas fa-calendar-alt"></i> Upcoming Visits
        </button>
        <button
          className={`tab-btn ${activeTab === "past" ? "active" : ""}`}
          onClick={() => setActiveTab("past")}
        >
          <i className="fas fa-history"></i> Past Visits
        </button>
        <button
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <i className="fas fa-list"></i> All Visits
        </button>
      </div>

      {/* Visits List */}
      <div className="visits-content">
        {filteredVisits.length > 0 ? (
          <div className="visits-grid">
            {filteredVisits.map((visit) => (
              <div key={visit._id} className="visit-card">
                <div className="visit-card-header">
                  <img
                    src={
                      visit.propertyId?.images?.[0] || "/assets/property-1.jpg"
                    }
                    alt={visit.propertyId?.title}
                    className="visit-property-image"
                  />
                  <div className="visit-status-badge">
                    <span
                      className={`visit-status ${getStatusClass(visit.status)}`}
                    >
                      {visit.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="visit-card-body">
                  <h3
                    className="visit-property-title"
                    title={visit.propertyId?.title}
                  >
                    {visit.propertyId?.title || "Property"}
                  </h3>

                  <div className="visit-details">
                    <div className="visit-detail-item">
                      <i className="fas fa-calendar"></i>
                      <span>
                        {new Date(visit.visitDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="visit-detail-item">
                      <i className="fas fa-clock"></i>
                      <span>{visit.timeSlot}</span>
                    </div>

                    {visit.propertyId?.location && (
                      <div className="visit-detail-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{visit.propertyId.location}</span>
                      </div>
                    )}

                    {visit.propertyId?.price && (
                      <div className="visit-detail-item">
                        <i className="fas fa-tag"></i>
                        <span>
                          ₹{visit.propertyId.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}

                    {visit.agentId && (
                      <div className="visit-detail-item">
                        <i className="fas fa-user-tie"></i>
                        <span>
                          {visit.agentId?.userId?.name ||
                            visit.agentId?.name ||
                            "N/A"}
                        </span>
                      </div>
                    )}
                  </div>

                  {visit.notes && (
                    <div className="visit-notes">
                      <strong>Your Notes:</strong>
                      <p>{visit.notes}</p>
                    </div>
                  )}

                  {visit.agentNotes && (
                    <div className="visit-agent-notes">
                      <strong>Agent Notes:</strong>
                      <p>{visit.agentNotes}</p>
                    </div>
                  )}
                </div>

                <div className="visit-card-footer">
                  <div className="visit-actions">
                    {visit.status?.toLowerCase() === "approved" && (
                      <button
                        onClick={() => {
                          const otherUserId =
                            visit.agentId?.userId?._id || visit.agentId?.userId;
                          const otherName =
                            visit.agentId?.userId?.name || visit.agentId?.name;
                          if (otherUserId) {
                            startVisitCall({
                              visitId: visit._id,
                              otherUserId,
                              otherName,
                            });
                          } else {
                            navigate(`/visits/video/${visit._id}`);
                          }
                        }}
                        className="btn-primary"
                      >
                        <i className="fas fa-video"></i> Join Video Call
                      </button>
                    )}

                    <button
                      onClick={() =>
                        navigate(`/property/${visit.propertyId?._id}`)
                      }
                      className="btn-secondary"
                    >
                      <i className="fas fa-eye"></i> View Property
                    </button>

                    {(visit.status?.toLowerCase() === "pending" ||
                      visit.status?.toLowerCase() === "approved") &&
                      new Date(visit.visitDate) > new Date() && (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to cancel this visit?"
                              )
                            ) {
                              cancelVisit(visit._id);
                            }
                          }}
                          className="btn-danger"
                        >
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-calendar-times"></i>
            <h3>No visits found</h3>
            <p>
              {activeTab === "upcoming"
                ? "You have no upcoming visits scheduled."
                : activeTab === "past"
                ? "You have no past visits."
                : "You haven't scheduled any visits yet."}
            </p>
            <button
              className="schedule-first-btn"
              onClick={() => navigate("/visits/schedule")}
            >
              <i className="fas fa-plus"></i> Schedule Your First Visit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVisits;
