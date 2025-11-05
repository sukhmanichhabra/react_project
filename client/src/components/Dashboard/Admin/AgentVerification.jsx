import React, { useState, useEffect } from "react";
import { agentAPI } from "../../../services/api";
import "./AgentVerification.css";

// Child component for each agent card
const AgentCard = ({ agent, onApprove, onReject, onOpenRejectModal, isProcessing }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get documents from agent data
  const documents = [
    { 
      name: "ID Proof", 
      icon: "fa-id-card", 
      url: agent.documents?.idProof?.path,
      available: !!agent.documents?.idProof 
    },
    {
      name: "Real Estate License",
      icon: "fa-file-contract",
      url: agent.documents?.license?.path,
      available: !!agent.documents?.license
    },
    {
      name: "Business Verification",
      icon: "fa-briefcase",
      url: agent.documents?.businessProof?.path,
      available: !!agent.documents?.businessProof
    },
    { 
      name: "Professional Photo", 
      icon: "fa-user-tie", 
      url: agent.documents?.profilePhoto?.path,
      available: !!agent.documents?.profilePhoto
    },
  ];

  return (
    <div className="av-card">
      <div
        className="av-card-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >        <img
          src={agent.userId?.profileImage || "/images/default-avatar.png"}
          alt={agent.name}
          className="av-card-avatar"
        />
        <div className="av-card-agent-info">
          <h3>{agent.name}</h3>
          <p>{agent.userId?.email}</p>
        </div>        <span className="av-card-submitted">
          Submitted: {agent.documentsSubmittedAt 
            ? new Date(agent.documentsSubmittedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'Not yet submitted'
          }
        </span>
        <i
          className={`fas fa-chevron-down av-card-toggle ${
            isExpanded ? "expanded" : ""
          }`}
        ></i>
      </div>

      {isExpanded && (
        <div className="av-card-body">
          <div className="av-card-info-grid">            <div className="av-card-info-item">
              <h4>Phone Number</h4>
              <p>{agent.phone || agent.userId?.phone || "Not provided"}</p>
            </div>
            <div className="av-card-info-item">
              <h4>Location</h4>
              <p>{agent.location || agent.userId?.location || "Not provided"}</p>
            </div>
            <div className="av-card-info-item">
              <h4>Qualification</h4>
              <p>{agent.qualification || "Not specified"}</p>
            </div>
          </div>

          <div className="av-card-docs">
            <h4>Submitted Documents</h4>            <div className="av-doc-grid">
              {documents.map((doc) => (
                <div className={`av-doc-item ${!doc.available ? 'unavailable' : ''}`} key={doc.name}>
                  <i className={`fas ${doc.icon}`}></i>
                  <p>{doc.name}</p>
                  {doc.available && doc.url ? (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  ) : (
                    <span className="not-provided">Not provided</span>
                  )}
                </div>
              ))}
            </div>
          </div>          <div className="av-card-actions">
            {agent.verificationStatus === 'pending' && (
              <>
                <button
                  className="av-action-btn approve"
                  onClick={() => onApprove(agent._id)}
                  disabled={isProcessing}
                >
                  <i className="fas fa-check"></i> {isProcessing ? 'Processing...' : 'Approve'}
                </button>
                <button
                  className="av-action-btn reject"
                  onClick={() => onOpenRejectModal(agent)}
                  disabled={isProcessing}
                >
                  <i className="fas fa-times"></i> Reject
                </button>
              </>
            )}
            {agent.verificationStatus === 'verified' && (
              <div className="av-status-badge verified">
                <i className="fas fa-check-circle"></i> Verified
              </div>
            )}
            {agent.verificationStatus === 'rejected' && (
              <div className="av-status-badge rejected">
                <i className="fas fa-times-circle"></i> Rejected
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main component
const AgentVerification = ({ pendingAgents = [] }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [filter, setFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Fetch agents on component mount and when filter changes
  useEffect(() => {
    fetchAgents();
  }, [filter]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await agentAPI.getPendingVerifications({ 
        status: filter === 'all' ? undefined : filter 
      });
      
      if (response.data.success) {
        setAgents(response.data.agents);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      setStatusMessage({
        type: 'error',
        text: 'Failed to fetch agent verification requests'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleApprove = async (agentId) => {
    try {
      setIsProcessing(true);
      const response = await agentAPI.updateVerificationStatus(agentId, {
        status: 'verified',
        message: 'Your agent account has been verified. You can now access all agent features.'
      });

      if (response.data.success) {
        // Remove the agent from the list immediately
        setAgents(prevAgents => prevAgents.filter(a => a._id !== agentId));
        setStatusMessage({
          type: 'success',
          text: 'Agent verified successfully!'
        });
        
        // Clear the message after 3 seconds
        setTimeout(() => {
          setStatusMessage({ type: '', text: '' });
        }, 3000);
      }
    } catch (error) {
      console.error("Error approving agent:", error);
      setStatusMessage({
        type: 'error',
        text: 'Failed to approve agent verification'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenRejectModal = (agent) => {
    setSelectedAgent(agent);
    setModalOpen(true);
  };
  const handleReject = async () => {
    if (!rejectionMessage.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please provide a rejection reason'
      });
      return;
    }

    try {
      setIsProcessing(true);
      const response = await agentAPI.updateVerificationStatus(selectedAgent._id, {
        status: 'rejected',
        message: rejectionMessage
      });

      if (response.data.success) {
        // Remove the agent from the list immediately
        setAgents(prevAgents => prevAgents.filter(a => a._id !== selectedAgent._id));
        setModalOpen(false);
        setRejectionMessage("");
        setStatusMessage({
          type: 'success',
          text: 'Agent verification rejected'
        });
        
        // Clear the message after 3 seconds
        setTimeout(() => {
          setStatusMessage({ type: '', text: '' });
        }, 3000);
      }
    } catch (error) {
      console.error("Error rejecting agent:", error);
      setStatusMessage({
        type: 'error',
        text: 'Failed to reject agent verification'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter agents based on search query
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.userId?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <section id="agent-verification">
      <div className="dash-section-header">
        <h2>Agent Verification</h2>
        <p>Review and verify agent applications</p>
      </div>

      {/* Status Message */}
      {statusMessage.text && (
        <div className={`dash-alert dash-alert-${statusMessage.type}`}>
          <i className={`fas ${statusMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
          {statusMessage.text}
          <button 
            onClick={() => setStatusMessage({ type: '', text: '' })}
            className="dash-alert-close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="av-header">
        <div className="av-filters">
          <label htmlFor="filter-status">Filter by:</label>
          <select 
            id="filter-status" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
        <div className="av-search">
          <input 
            type="text" 
            placeholder="Search by name or email" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button>
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="dash-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading verification requests...</p>
        </div>
      ) : (
        <div className="av-list">
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent) => (
              <AgentCard
                key={agent._id}
                agent={agent}
                onApprove={handleApprove}
                onOpenRejectModal={handleOpenRejectModal}
                isProcessing={isProcessing}
              />
            ))
          ) : (
            <div className="dash-empty-state">
              <i className="fas fa-user-check"></i>
              <h3>No {filter === 'all' ? '' : filter} Verifications</h3>
              <p>
                {filter === 'pending' 
                  ? 'All agent applications have been reviewed.' 
                  : `No ${filter} agent verifications found.`
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Rejection Modal (using classes from AgentVerification.css) */}
      {modalOpen && (
        <div className="dash-modal show">
          <div className="dash-modal-content">
            <span
              className="dash-close-modal"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </span>
            <h3>Reject Agent: {selectedAgent?.name}</h3>
            <p>
              Please provide a reason for rejection (this will be sent to the
              agent).
            </p>
            <div className="dash-form-group">
              <label htmlFor="rejectionMessage">Rejection Message</label>
              <textarea
                id="rejectionMessage"
                rows="4"
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
                placeholder="e.g., ID proof is unclear, please re-upload."
              ></textarea>
            </div>
            <div className="dash-form-actions">
              <button
                onClick={handleReject}
                className="dash-submit-btn dash-reject-btn"
              >
                Confirm Rejection
              </button>
              <button
                type="button"
                className="dash-reset-btn"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AgentVerification;
