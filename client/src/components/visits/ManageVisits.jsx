import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { visitAPI } from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import "./ManageVisits.css";

const ManageVisits = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(selectAuth);
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });
  const [activeTab, setActiveTab] = useState("pending");
  const [processingId, setProcessingId] = useState(null);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await visitAPI.getAgentVisits();

      if (response.data.success) {
        const allVisits = response.data.visits || [];
        setVisits(allVisits);

        // Calculate stats
        const newStats = {
          pending: allVisits.filter(v => v.status === "pending").length,
          upcoming: allVisits.filter(v => v.status === "approved").length,
          completed: allVisits.filter(v => v.status === "completed").length,
          cancelled: allVisits.filter(v => v.status === "cancelled" || v.status === "rejected").length
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast.error("Failed to load visits");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (visitId) => {
    try {
      setProcessingId(visitId);
      const response = await visitAPI.approveVisit(visitId, {
        notes: notes[visitId] || ""
      });

      if (response.data.success) {
        toast.success("Visit approved successfully!");
        fetchVisits();
        setNotes(prev => ({ ...prev, [visitId]: "" }));
      }
    } catch (error) {
      console.error("Error approving visit:", error);
      toast.error(error.response?.data?.message || "Failed to approve visit");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (visitId) => {
    if (!notes[visitId] || notes[visitId].trim() === "") {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessingId(visitId);
      const response = await visitAPI.rejectVisit(visitId, {
        notes: notes[visitId]
      });

      if (response.data.success) {
        toast.success("Visit rejected");
        fetchVisits();
        setNotes(prev => ({ ...prev, [visitId]: "" }));
      }
    } catch (error) {
      console.error("Error rejecting visit:", error);
      toast.error(error.response?.data?.message || "Failed to reject visit");
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (visitId) => {
    try {
      setProcessingId(visitId);
      const response = await visitAPI.completeVisit(visitId, {
        notes: notes[visitId] || ""
      });

      if (response.data.success) {
        toast.success("Visit marked as completed!");
        fetchVisits();
        setNotes(prev => ({ ...prev, [visitId]: "" }));
      }
    } catch (error) {
      console.error("Error completing visit:", error);
      toast.error(error.response?.data?.message || "Failed to complete visit");
    } finally {
      setProcessingId(null);
    }
  };

  const handleProcessOverdue = async () => {
    try {
      const response = await visitAPI.processOverdueVisits();

      if (response.data.success) {
        toast.success(`Processed ${response.data.processedCount} overdue visits`);
        fetchVisits();
      }
    } catch (error) {
      console.error("Error processing overdue visits:", error);
      toast.error("Failed to process overdue visits");
    }
  };

  const getFilteredVisits = () => {
    switch (activeTab) {
      case "pending":
        return visits.filter(v => v.status === "pending");
      case "upcoming":
        return visits.filter(v => v.status === "approved");
      case "completed":
        return visits.filter(v => v.status === "completed");
      case "cancelled":
        return visits.filter(v => v.status === "cancelled" || v.status === "rejected");
      default:
        return visits;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="manage-visits-loading">
        <div className="spinner"></div>
        <p>Loading visits...</p>
      </div>
    );
  }

  const filteredVisits = getFilteredVisits();

  return (
    <div className="manage-visits-container">
      <div className="page-header">
        <h1 className="page-title">Property Visit Management</h1>
        <button onClick={handleProcessOverdue} className="btn-process-overdue">
          <i className="fas fa-sync"></i> Process Overdue Visits
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="dashboard-stats">
        <div className="stat-card stat-pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card stat-upcoming">
          <div className="stat-value">{stats.upcoming}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card stat-cancelled">
          <div className="stat-value">{stats.cancelled}</div>
          <div className="stat-label">Cancelled/Rejected</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="visit-tabs">
        <button
          className={`visit-tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <i className="fas fa-clock"></i> Pending ({stats.pending})
        </button>
        <button
          className={`visit-tab ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          <i className="fas fa-calendar-alt"></i> Upcoming ({stats.upcoming})
        </button>
        <button
          className={`visit-tab ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          <i className="fas fa-check-circle"></i> Completed ({stats.completed})
        </button>
        <button
          className={`visit-tab ${activeTab === "cancelled" ? "active" : ""}`}
          onClick={() => setActiveTab("cancelled")}
        >
          <i className="fas fa-times-circle"></i> Cancelled ({stats.cancelled})
        </button>
      </div>

      {/* Visits List */}
      <div className="visits-list">
        {filteredVisits.length > 0 ? (
          filteredVisits.map(visit => (
            <div key={visit._id} className={`visit-card ${visit.status}`}>
              <img
                src={visit.propertyId?.images?.[0] || "/assets/property-1.jpg"}
                alt={visit.propertyId?.title}
                className="visit-image"
              />

              <div className="visit-content">
                <div className="visit-header">
                  <h3 className="visit-property">{visit.propertyId?.title}</h3>
                  <span className={`visit-status status-${visit.status}`}>
                    {visit.status?.toUpperCase()}
                  </span>
                </div>

                <div className="visit-meta">
                  <div className="visit-meta-item">
                    <i className="fas fa-map-marker-alt"></i>
                    {visit.propertyId?.location}
                  </div>
                  <div className="visit-meta-item">
                    <i className="far fa-calendar"></i>
                    {formatDate(visit.visitDate)}
                  </div>
                  <div className="visit-meta-item">
                    <i className="far fa-clock"></i>
                    {visit.timeSlot}
                  </div>
                </div>

                <div className="visit-buyer">
                  <div className="buyer-avatar">
                    {visit.buyerId?.name?.charAt(0) || "B"}
                  </div>
                  <div className="buyer-details">
                    <div className="buyer-name">{visit.buyerId?.name}</div>
                    <div className="buyer-contact">
                      <i className="fas fa-envelope"></i> {visit.buyerId?.email}
                      {visit.buyerId?.phone && (
                        <>
                          {" | "}
                          <i className="fas fa-phone"></i> {visit.buyerId?.phone}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {visit.buyerNotes && (
                  <div className="visit-notes buyer-notes">
                    <strong>Buyer Notes:</strong>
                    <p>{visit.buyerNotes}</p>
                  </div>
                )}

                {visit.agentNotes && (
                  <div className="visit-notes agent-notes">
                    <strong>Your Notes:</strong>
                    <p>{visit.agentNotes}</p>
                  </div>
                )}

                {/* Actions based on status */}
                {visit.status === "pending" && (
                  <div className="visit-actions">
                    <div className="notes-input-group">
                      <textarea
                        value={notes[visit._id] || ""}
                        onChange={(e) => setNotes({ ...notes, [visit._id]: e.target.value })}
                        placeholder="Add notes (optional for approval, required for rejection)"
                        className="notes-textarea"
                      />
                    </div>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleApprove(visit._id)}
                        disabled={processingId === visit._id}
                        className="btn-approve"
                      >
                        {processingId === visit._id ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i> Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check"></i> Approve Visit
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(visit._id)}
                        disabled={processingId === visit._id}
                        className="btn-reject"
                      >
                        <i className="fas fa-times"></i> Reject Visit
                      </button>
                    </div>
                  </div>
                )}

                {visit.status === "approved" && (
                  <div className="visit-actions">
                    <div className="notes-input-group">
                      <textarea
                        value={notes[visit._id] || ""}
                        onChange={(e) => setNotes({ ...notes, [visit._id]: e.target.value })}
                        placeholder="Add completion notes (optional)"
                        className="notes-textarea"
                      />
                    </div>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleComplete(visit._id)}
                        disabled={processingId === visit._id}
                        className="btn-complete"
                      >
                        <i className="fas fa-check-circle"></i> Mark as Completed
                      </button>
                      <button
                        onClick={() => navigate(`/property/${visit.propertyId?._id}`)}
                        className="btn-view-property"
                      >
                        <i className="fas fa-eye"></i> View Property
                      </button>
                    </div>
                  </div>
                )}

                {(visit.status === "completed" || visit.status === "cancelled" || visit.status === "rejected") && (
                  <div className="visit-actions">
                    <button
                      onClick={() => navigate(`/property/${visit.propertyId?._id}`)}
                      className="btn-view-property"
                    >
                      <i className="fas fa-eye"></i> View Property
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <i className="far fa-calendar-times"></i>
            <h3>No {activeTab} visits</h3>
            <p>There are no {activeTab} visits at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageVisits;
