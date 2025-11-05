import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ContactForm from "./partials/AgentDesc/contactForm";
import AgentProperty from "./partials/AgentDesc/AgentProperty";
import AgentReview from "./partials/AgentDesc/AgentReview";
import "./styles/AgentDesc/AgentDesc.css";

function AgentDesc() {
  const { id } = useParams();

  // State
  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch agent data ONCE
  useEffect(() => {
    async function fetchAgentData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/agent/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch agent data");
        }

        const result = await response.json();

        if (result.success && result.data) {
          setAgent(result.data.agent);
          setProperties(result.data.properties || []);
          setUser(result.data.user); // Assuming user data is part of this response
        } else {
          throw new Error(result.message || "Agent not found");
        }
      } catch (error) {
        console.error("Error fetching agent:", error);
        setAgent(null); // Set to null on error
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchAgentData();
    }
  }, [id]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return <div className="agt-desc-loading">Loading...</div>;
  }

  if (!agent) {
    return <div className="agt-desc-error">Agent not found.</div>;
  }

  return (
    <div className="agt-desc-page-container">
      <div className="agt-desc-upper-container">
        <div className="agt-desc-agent-container">
          {/* Agent Header */}
          <div className="agt-desc-agent-header">
            <div className="agt-desc-image-container">
              <span className="agt-desc-listing-badge">
                {agent.listingCount || 0} LISTING
              </span>
              <img
                src={agent.image || "/images/default-avatar.png"}
                alt={agent.name}
                className="agt-desc-agent-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/default-avatar.png";
                }}
              />
            </div>
            <div className="agt-desc-agent-info">
              <h1>{agent.name}</h1>
              <p className="agt-desc-agent-title">{agent.title}</p>

              <div className="agt-desc-info-grid">
                <div className="agt-desc-info-item">
                  <span className="agt-desc-info-label">Location</span>
                  <span className="agt-desc-info-value">
                    <strong>{agent.location}</strong>
                  </span>
                </div>
                <div className="agt-desc-info-item">
                  <span className="agt-desc-info-label">Phone:</span>
                  <span className="agt-desc-info-value">
                    <strong>{agent.phone}</strong>
                  </span>
                </div>
                <div className="agt-desc-info-item">
                  <span className="agt-desc-info-label">Email</span>
                  <span className="agt-desc-info-value">
                    <strong>{agent.email}</strong>
                  </span>
                </div>
                <div className="agt-desc-info-item">
                  <span className="agt-desc-info-label">Qualification:</span>
                  <span className="agt-desc-info-value">
                    <strong>{agent.qualification}</strong>
                  </span>
                </div>
              </div>

              <div className="agt-desc-social-icons">
                {agent.socialLinks ? (
                  <>
                    {agent.socialLinks.twitter && (
                      <a
                        href={agent.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Twitter"
                      >
                        <i className="fab fa-twitter"></i>
                      </a>
                    )}
                    {agent.socialLinks.instagram && (
                      <a
                        href={agent.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Instagram"
                      >
                        <i className="fab fa-instagram"></i>
                      </a>
                    )}
                    {agent.socialLinks.facebook && (
                      <a
                        href={agent.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Facebook"
                      >
                        <i className="fab fa-facebook"></i>
                      </a>
                    )}
                    {agent.socialLinks.linkedin && (
                      <a
                        href={agent.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="LinkedIn"
                      >
                        <i className="fab fa-linkedin"></i>
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <i className="fab fa-whatsapp"></i>
                    <i className="fab fa-twitter"></i>
                    <i className="fab fa-instagram"></i>
                    <i className="fab fa-viber"></i>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <div className="agt-desc-overview">
            <h2>Overview</h2>
            <p>{agent.overview}</p>
          </div>
        </div>

        {/* Contact Form Section */}
        <ContactForm />
      </div>

      {/* Agent Property Section - PASSING PROPS */}
      <AgentProperty properties={properties} />

      {/* Agent Review Section - PASSING PROPS */}
      <AgentReview agent={agent} user={user} />
    </div>
  );
}

export default AgentDesc;
