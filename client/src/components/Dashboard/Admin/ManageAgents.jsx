import React, { useState } from "react";
import "./ManageAgents.css"; // <-- Import new CSS

const ManageAgents = ({ allAgents = [] }) => {
  const [agents, setAgents] = useState(allAgents);

  const handleDelete = (agentId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this agent? This action cannot be undone."
      )
    ) {
      console.log(`Deleting agent ${agentId}`);
      // API call to delete
      setAgents(agents.filter((a) => a._id !== agentId));
    }
  };

  return (
    <section id="manage-agents">
      <div className="dash-section-header">
        <h2>Manage Agents</h2>
        <p>View, edit, or remove agent accounts from the platform.</p>
      </div>
      <div className="dash-table-container">
        <table className="dash-data-table">
          <thead>
            <tr>
              <th>Agent Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Properties</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.length > 0 ? (
              agents.map((agent) => (
                <tr key={agent._id}>
                  <td>{agent.name}</td>
                  <td>{agent.email}</td>
                  <td>{agent.phone}</td>
                  <td>{agent.listingCount || 0}</td>
                  <td>
                    <span
                      className={`dash-status-badge ${
                        agent.verified ? "verified" : "pending"
                      }`}
                    >
                      {agent.verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="dash-table-actions">
                    <button
                      onClick={() => handleDelete(agent._id)}
                      className="dash-action-btn dash-delete-btn"
                    >
                      <i className="fas fa-trash-alt"></i> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "1.5rem" }}
                >
                  No agents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ManageAgents;
