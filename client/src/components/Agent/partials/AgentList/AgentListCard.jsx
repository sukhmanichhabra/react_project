import React from "react";
import "../../styles/AgentList/AgentListCard.css";
import { Link } from "react-router-dom";

function AgentListCard({ agent }) {
  if (!agent) return null;
  return (
    <Link to={`/agent/${agent._id}`} className="agt-list-card-link">
      <div className="agt-list-card">
        <div className="agt-list-card-image-container">
          {agent.verified ? (
            <div className="agt-list-card-verified-tag">
              <i className="fas fa-check-circle"></i> Verified
            </div>
          ) : (
            <div className="agt-list-card-unverified-tag">
              <i className="fas fa-times-circle"></i> Not Verified
            </div>
          )}
          <div className="agt-list-card-listing-tag">
            <i className="fas fa-list-ul"></i> {agent.listingCount || 0}{" "}
            {agent.listingCount === 1 ? "LISTING" : "LISTINGS"}
          </div>
          {agent.image ? (
            <img
              src={agent.image}
              alt={agent.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/default-avatar.png";
              }}
            />
          ) : (
            <div className="agt-list-card-no-image">
              <i className="fas fa-user-circle"></i>
            </div>
          )}
        </div>
        <div className="agt-list-card-agent-info">
          <h3>
            <a href={`/agent/${agent._id}`}>{agent.name}</a>
          </h3>
          <p className="agt-list-card-role">
            {agent.title || "Real Estate Agent"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default AgentListCard;
