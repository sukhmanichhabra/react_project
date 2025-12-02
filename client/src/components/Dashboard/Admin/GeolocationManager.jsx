import React, { useState, useEffect } from "react";
import "./GeolocationManager.css";

const GeolocationManager = () => {
  const [properties, setProperties] = useState([]);
  const [missingGeoProperties, setMissingGeoProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [coordinates, setCoordinates] = useState({
    latitude: "",
    longitude: "",
    address: "",
  });
  const [agentCoordinates, setAgentCoordinates] = useState({
    latitude: "",
    longitude: "",
    serviceRadius: 50,
  });
  const [coverageAgent, setCoverageAgent] = useState(null);
  const [coverageProperties, setCoverageProperties] = useState([]);
  const [coverageLoading, setCoverageLoading] = useState(false);
  const [reassignProperty, setReassignProperty] = useState(null);
  const [reassignTargetAgentId, setReassignTargetAgentId] = useState("");
  const [reassignLoading, setReassignLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all properties
      const allPropertiesResponse = await fetch(
        "/api/property/admin/all-properties",
        {
          credentials: "include",
        }
      );
      const allPropertiesData = await allPropertiesResponse.json();

      console.log("All Properties Response:", allPropertiesData);

      // Fetch properties without geolocation
      const propertiesResponse = await fetch(
        "/api/property/admin/missing-geolocation",
        {
          credentials: "include",
        }
      );
      const propertiesData = await propertiesResponse.json();

      console.log("Missing Geo Properties Response:", propertiesData);

      // Fetch agents geolocation info
      const agentsResponse = await fetch(
        "/api/property/admin/agents/geolocation-info",
        {
          credentials: "include",
        }
      );
      const agentsData = await agentsResponse.json();

      console.log("Agents Response:", agentsData);

      if (allPropertiesData.success) {
        setProperties(allPropertiesData.properties || []);
        console.log(
          "Set properties:",
          allPropertiesData.properties?.length || 0
        );
      } else {
        console.error("Failed to fetch all properties:", allPropertiesData);
      }

      if (propertiesData.success) {
        setMissingGeoProperties(propertiesData.properties || []);
        console.log(
          "Set missing geo properties:",
          propertiesData.properties?.length || 0
        );
      } else {
        console.error(
          "Failed to fetch missing geo properties:",
          propertiesData
        );
      }

      if (agentsData.success) {
        setAgents(agentsData.agents);
        console.log("Set agents:", agentsData.agents?.length || 0);
      } else {
        console.error("Failed to fetch agents:", agentsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePropertyGeolocation = async (propertyId) => {
    try {
      if (!coordinates.latitude || !coordinates.longitude) {
        alert("Please enter both latitude and longitude");
        return;
      }

      const response = await fetch(
        `/api/property/admin/geolocation/${propertyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(coordinates),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Property geolocation updated successfully!");
        setSelectedProperty(null);
        setCoordinates({ latitude: "", longitude: "", address: "" });
        fetchData(); // Refresh the list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating property geolocation:", error);
      alert("Failed to update property geolocation");
    }
  };

  const updateAgentGeolocation = async (agentId) => {
    try {
      if (!agentCoordinates.latitude || !agentCoordinates.longitude) {
        alert("Please enter both latitude and longitude");
        return;
      }

      const response = await fetch(
        `/api/property/admin/agents/geolocation/${agentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(agentCoordinates),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Agent geolocation updated successfully!");
        setSelectedAgent(null);
        setAgentCoordinates({ latitude: "", longitude: "", serviceRadius: 50 });
        fetchData(); // Refresh the list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating agent geolocation:", error);
      alert("Failed to update agent geolocation");
    }
  };

  const handleViewCoverage = async (agent) => {
    setCoverageAgent(agent);
    setCoverageLoading(true);
    setCoverageProperties([]);

    try {
      const response = await fetch(
        `/api/property/admin/agents/${agent.id}/properties-with-distance`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setCoverageProperties(data.properties || []);
      } else {
        alert(data.message || "Failed to load agent coverage");
      }
    } catch (error) {
      console.error("Error loading agent coverage:", error);
      alert("Failed to load agent coverage");
    } finally {
      setCoverageLoading(false);
    }
  };

  const openReassignModal = (property) => {
    setReassignProperty(property);
    setReassignTargetAgentId(coverageAgent ? coverageAgent.id : "");
  };

  const closeReassignModal = () => {
    setReassignProperty(null);
    setReassignTargetAgentId("");
    setReassignLoading(false);
  };

  const submitReassign = async () => {
    if (!reassignProperty || !reassignTargetAgentId) {
      return;
    }

    try {
      setReassignLoading(true);

      const response = await fetch(
        `/api/property/admin/properties/${reassignProperty.id}/assign-agent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ agentId: reassignTargetAgentId }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Failed to update agent assignment");
        return;
      }

      // Refresh overall data and coverage view
      await fetchData();
      if (coverageAgent) {
        const refreshedAgent =
          agents.find((a) => a.id === coverageAgent.id) || coverageAgent;
        await handleViewCoverage(refreshedAgent);
      }

      closeReassignModal();
    } catch (error) {
      console.error("Error reassigning property agent:", error);
      alert("Failed to update agent assignment");
    } finally {
      setReassignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="geolocation-manager">
        <div className="loading">Loading geolocation data...</div>
      </div>
    );
  }

  return (
    <div className="geolocation-manager">
      <h2>Geolocation Manager</h2>

      <div className="tabs">
        <button
          className={activeTab === "properties" ? "active" : ""}
          onClick={() => setActiveTab("properties")}
        >
          All Properties ({properties.length} total,{" "}
          {missingGeoProperties.length} missing coords)
        </button>
        <button
          className={activeTab === "agents" ? "active" : ""}
          onClick={() => setActiveTab("agents")}
        >
          Agents ({agents.filter((a) => !a.hasGeolocation).length} missing)
        </button>
      </div>

      {activeTab === "properties" && (
        <div className="properties-section">
          <h3>Property Geolocation Management</h3>
          <p className="description">
            View and edit latitude and longitude coordinates for all properties
            to enable optimal agent assignment.
          </p>

          {properties.length === 0 ? (
            <div className="no-data">No properties found.</div>
          ) : (
            <div className="properties-list">
              {properties.map((property) => {
                const hasCoords =
                  property.geolocation &&
                  property.geolocation.latitude &&
                  property.geolocation.longitude;

                return (
                  <div key={property._id} className="property-item">
                    <div className="property-info">
                      <h4>{property.title}</h4>
                      <p className="location">{property.location}</p>
                      <div className="coordinates-display">
                        {hasCoords ? (
                          <div className="coords-info">
                            <span className="coord-item">
                              <strong>Lat:</strong>{" "}
                              {property.geolocation.latitude.toFixed(6)}
                            </span>
                            <span className="coord-item">
                              <strong>Lng:</strong>{" "}
                              {property.geolocation.longitude.toFixed(6)}
                            </span>
                            <span className="coords-status has-coords">
                              ✓ Has Coordinates
                            </span>
                          </div>
                        ) : (
                          <span className="coords-status missing-coords">
                            ⚠ Missing Coordinates
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className={
                        hasCoords ? "edit-location-btn" : "add-location-btn"
                      }
                      onClick={() => {
                        setSelectedProperty(property);
                        if (hasCoords) {
                          setCoordinates({
                            latitude: property.geolocation.latitude.toString(),
                            longitude:
                              property.geolocation.longitude.toString(),
                            address: property.geolocation.address || "",
                          });
                        } else {
                          setCoordinates({
                            latitude: "",
                            longitude: "",
                            address: "",
                          });
                        }
                      }}
                    >
                      {hasCoords ? "Edit Coordinates" : "Add Coordinates"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {selectedProperty && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>
                  {selectedProperty.geolocation?.latitude ? "Edit" : "Add"}{" "}
                  Geolocation for {selectedProperty.title}
                </h3>
                <div className="form-group">
                  <label>Latitude:</label>
                  <input
                    type="number"
                    step="any"
                    value={coordinates.latitude}
                    onChange={(e) =>
                      setCoordinates({
                        ...coordinates,
                        latitude: e.target.value,
                      })
                    }
                    placeholder="e.g., 28.6139"
                  />
                </div>
                <div className="form-group">
                  <label>Longitude:</label>
                  <input
                    type="number"
                    step="any"
                    value={coordinates.longitude}
                    onChange={(e) =>
                      setCoordinates({
                        ...coordinates,
                        longitude: e.target.value,
                      })
                    }
                    placeholder="e.g., 77.2090"
                  />
                </div>
                <div className="form-group">
                  <label>Address (optional):</label>
                  <input
                    type="text"
                    value={coordinates.address}
                    onChange={(e) =>
                      setCoordinates({
                        ...coordinates,
                        address: e.target.value,
                      })
                    }
                    placeholder="Detailed address"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    className="save-btn"
                    onClick={() =>
                      updatePropertyGeolocation(selectedProperty._id)
                    }
                  >
                    Save
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setSelectedProperty(null);
                      setCoordinates({
                        latitude: "",
                        longitude: "",
                        address: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "agents" && (
        <div className="agents-section">
          <h3>Agent Geolocation Management</h3>
          <p className="description">
            Set agent locations and service radius for optimal property
            assignment.
          </p>

          <div className="agents-list">
            {agents.map((agent) => (
              <div key={agent.id} className="agent-item">
                <div className="agent-info">
                  <h4>{agent.name}</h4>
                  <p className="location">{agent.location}</p>
                  <div className="agent-stats">
                    <span
                      className={`status ${
                        agent.verified ? "verified" : "unverified"
                      }`}
                    >
                      {agent.verified ? "Verified" : "Unverified"}
                    </span>
                    <span className="workload">
                      Workload: {agent.workload} properties
                    </span>
                    <span
                      className={`geolocation-status ${
                        agent.hasGeolocation
                          ? "has-location"
                          : "missing-location"
                      }`}
                    >
                      {agent.hasGeolocation
                        ? "Has Location"
                        : "Missing Location"}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    className="edit-location-btn"
                    onClick={() => {
                      setSelectedAgent(agent);
                      if (agent.hasGeolocation) {
                        setAgentCoordinates({
                          latitude: agent.geolocation.latitude || "",
                          longitude: agent.geolocation.longitude || "",
                          serviceRadius: agent.geolocation.serviceRadius || 50,
                        });
                      }
                    }}
                  >
                    {agent.hasGeolocation ? "Edit Location" : "Add Location"}
                  </button>
                  <button
                    className="coverage-btn"
                    onClick={() => handleViewCoverage(agent)}
                    style={{ marginLeft: "8px" }}
                  >
                    View Coverage
                  </button>
                </div>
              </div>
            ))}
          </div>

          {coverageAgent && (
            <div className="agent-coverage-panel">
              <h3>Agent Coverage: {coverageAgent.name}</h3>
              <p className="description">
                View all properties currently assigned to this agent, along with
                their distance from the agent's base location.
              </p>
              {coverageLoading ? (
                <div className="loading">Loading agent coverage...</div>
              ) : coverageProperties.length === 0 ? (
                <div className="no-data">
                  This agent has no assigned properties.
                </div>
              ) : (
                <div className="coverage-properties-list">
                  {coverageProperties.map((property) => (
                    <div key={property.id} className="coverage-property-item">
                      <div className="coverage-property-main">
                        <h4>{property.title}</h4>
                        <p className="location">{property.location}</p>
                        <div className="coverage-tags">
                          <span className="coverage-pill">{property.tag}</span>
                          <span className="coverage-pill">
                            {property.status}
                          </span>
                        </div>
                      </div>
                      <div className="coverage-property-meta">
                        <div className="distance-chip">
                          {property.distanceKm !== null ? (
                            <>
                              <strong>
                                {property.distanceKm.toFixed(1)} km
                              </strong>
                              {property.withinServiceRadius ? (
                                <span className="within-radius">
                                  within radius
                                </span>
                              ) : (
                                <span className="outside-radius">
                                  outside radius
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="no-distance">
                              No distance (missing coordinates)
                            </span>
                          )}
                        </div>
                        <button
                          className="reassign-btn"
                          onClick={() => openReassignModal(property)}
                        >
                          Change Agent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedAgent && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Set Geolocation for {selectedAgent.name}</h3>
                <div className="form-group">
                  <label>Latitude:</label>
                  <input
                    type="number"
                    step="any"
                    value={agentCoordinates.latitude}
                    onChange={(e) =>
                      setAgentCoordinates({
                        ...agentCoordinates,
                        latitude: e.target.value,
                      })
                    }
                    placeholder="e.g., 28.6139"
                  />
                </div>
                <div className="form-group">
                  <label>Longitude:</label>
                  <input
                    type="number"
                    step="any"
                    value={agentCoordinates.longitude}
                    onChange={(e) =>
                      setAgentCoordinates({
                        ...agentCoordinates,
                        longitude: e.target.value,
                      })
                    }
                    placeholder="e.g., 77.2090"
                  />
                </div>
                <div className="form-group">
                  <label>Service Radius (km):</label>
                  <input
                    type="number"
                    value={agentCoordinates.serviceRadius}
                    onChange={(e) =>
                      setAgentCoordinates({
                        ...agentCoordinates,
                        serviceRadius: parseInt(e.target.value) || 50,
                      })
                    }
                    placeholder="50"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    className="save-btn"
                    onClick={() => updateAgentGeolocation(selectedAgent.id)}
                  >
                    Save
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setSelectedAgent(null);
                      setAgentCoordinates({
                        latitude: "",
                        longitude: "",
                        serviceRadius: 50,
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {reassignProperty && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Change Agent for {reassignProperty.title}</h3>
            <div className="form-group">
              <label>Assign to agent:</label>
              <select
                value={reassignTargetAgentId}
                onChange={(e) => setReassignTargetAgentId(e.target.value)}
              >
                <option value="">Select agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} {agent.verified ? "(Verified)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button
                className="save-btn"
                onClick={submitReassign}
                disabled={reassignLoading || !reassignTargetAgentId}
              >
                {reassignLoading ? "Saving..." : "Save"}
              </button>
              <button className="cancel-btn" onClick={closeReassignModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeolocationManager;
