import React, { useEffect, useState, useRef } from "react";
import "./ActivityLog.css";

const defaultFilters = {
  userRole: "",
  targetType: "",
  days: 30,
  deviceType: "",
};

const roleOptions = [
  { value: "", label: "All Roles" },
  { value: "anonymous", label: "Anonymous" },
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "agent", label: "Agent" },
  { value: "admin", label: "Admin" },
];

const targetTypeOptions = [
  { value: "", label: "All Targets" },
  { value: "property", label: "Property" },
  { value: "agent", label: "Agent" },
  { value: "blog", label: "Blog" },
  { value: "advertisement", label: "Advertisement" },
  { value: "page", label: "Page" },
  { value: "form", label: "Form" },
  { value: "chatbot", label: "Chatbot" },
];

const deviceOptions = [
  { value: "", label: "All Devices" },
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" },
];

const dayOptions = [
  { value: 1, label: "Last 24 Hours" },
  { value: 7, label: "Last 7 Days" },
  { value: 30, label: "Last 30 Days" },
  { value: 90, label: "Last 90 Days" },
];

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [totalActivities, setTotalActivities] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const trendsRef = useRef(null);
  const actionTypeRef = useRef(null);
  const deviceRef = useRef(null);
  const chartInstancesRef = useRef({ trends: null, action: null, device: null });

  const fetchActivityLog = async (page = 1, overrides = {}) => {
    try {
      setLoading(true);
      setError(null);

      const effectiveFilters = { ...filters, ...overrides };
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "50");
      if (effectiveFilters.userRole) params.set("userRole", effectiveFilters.userRole);
      if (effectiveFilters.targetType) params.set("targetType", effectiveFilters.targetType);
      if (effectiveFilters.deviceType) params.set("deviceType", effectiveFilters.deviceType);
      if (effectiveFilters.days) params.set("days", String(effectiveFilters.days));

      const res = await fetch(`/api/activity/log?${params.toString()}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Failed to load activity log (HTTP ${res.status})`);
      }

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.message || "Unexpected activity log response");
      }

      const data = json.data;
      setActivities(data.activities || []);
      setTotalActivities(data.totalActivities || 0);
      setCurrentPage(data.currentPage || page);
      setTotalPages(data.totalPages || 1);
      setFilters(data.filter || effectiveFilters);
      setStatistics(data.statistics || null);
      setChartData(data.chartData || null);
    } catch (e) {
      console.error("Error loading activity log:", e);
      setError(e.message || "Failed to load activity log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLog(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!chartData || typeof window === "undefined" || !window.Chart) return;

    const Chart = window.Chart;
    const { dailyActivity = [], actionTypes = [], devices = [] } = chartData;

    // Destroy previous charts if any
    Object.values(chartInstancesRef.current).forEach((instance) => {
      if (instance) instance.destroy();
    });
    chartInstancesRef.current = { trends: null, action: null, device: null };

    // Daily trends
    if (trendsRef.current) {
      const ctx = trendsRef.current.getContext("2d");
      const labels = dailyActivity.map((day) => {
        const date = new Date(day._id);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      });
      const pageViewsData = dailyActivity.map((d) => d.pageViews || 0);
      const propertyViewsData = dailyActivity.map((d) => d.propertyViews || 0);

      chartInstancesRef.current.trends = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Page Views",
              data: pageViewsData,
              borderColor: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.08)",
              tension: 0.4,
              fill: true,
            },
            {
              label: "Property Views",
              data: propertyViewsData,
              borderColor: "#22c55e",
              backgroundColor: "rgba(34, 197, 94, 0.08)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
          },
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    }

    // Action type chart (doughnut)
    if (actionTypeRef.current) {
      const ctx = actionTypeRef.current.getContext("2d");
      const top = (actionTypes || []).slice(0, 5);
      const labels = top.map((item) =>
        (item._id || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      );
      const counts = top.map((item) => item.count || 0);

      chartInstancesRef.current.action = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              data: counts,
              backgroundColor: [
                "#2563eb",
                "#22c55e",
                "#f97316",
                "#ef4444",
                "#6b7280",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: { boxWidth: 12, padding: 15 },
            },
          },
        },
      });
    }

    // Device chart (pie)
    if (deviceRef.current) {
      const ctx = deviceRef.current.getContext("2d");
      const labels = (devices || []).map((item) => {
        const id = item._id || "unknown";
        return id.charAt(0).toUpperCase() + id.slice(1);
      });
      const counts = (devices || []).map((item) => item.count || 0);

      chartInstancesRef.current.device = new Chart(ctx, {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              data: counts,
              backgroundColor: ["#22c55e", "#f97316", "#6366f1"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: { boxWidth: 12, padding: 15 },
            },
          },
        },
      });
    }
  }, [chartData]);

  useEffect(() => {
    return () => {
      Object.values(chartInstancesRef.current).forEach((instance) => {
        if (instance) instance.destroy();
      });
    };
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name === "days" ? Number(value) : value,
    }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchActivityLog(1, filters);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
    fetchActivityLog(1, defaultFilters);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) return;
    fetchActivityLog(nextPage, filters);
  };

  const handleShowDetails = async (activityId) => {
    try {
      setModalOpen(true);
      setModalLoading(true);
      setSelectedActivity(null);

      // Note: controller is mounted under /api/activity and details route path is /api/activity/:id
      const res = await fetch(`/api/activity/api/activity/${activityId}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load activity details");
      }

      setSelectedActivity(json.activity);
    } catch (e) {
      console.error("Error loading activity details:", e);
      setError(e.message || "Failed to load activity details");
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedActivity(null);
  };

  const renderTopPages = () => {
    if (!chartData || !chartData.topPages || chartData.topPages.length === 0) {
      return <p className="activity-empty-text">No page data available.</p>;
    }

    const sorted = [...chartData.topPages].sort((a, b) => (b.count || 0) - (a.count || 0));
    const maxValue = Math.max(...sorted.map((item) => item.count || 0), 1);

    return (
      <div className="bar-chart-container">
        {sorted.map((item) => {
          const name = item.pageName || item._id || "Page";
          const label = name === "/" ? "Homepage" : name.replace(/^\//, "");
          const percentage = ((item.count || 0) / maxValue) * 100;

          return (
            <div key={item._id} className="bar-item">
              <div className="bar-label" title={label}>
                {label}
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${percentage}%` }} />
              </div>
              <div className="bar-value">{item.count || 0}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const formatActionType = (type) => {
    if (!type) return "-";
    return type.replace(/_/g, " ");
  };

  const getUserRoleBadgeClass = (role) => {
    if (role === "admin") return "badge-admin";
    if (role === "agent") return "badge-agent-role";
    if (role === "seller") return "badge-seller";
    if (role === "buyer") return "badge-buyer";
    if (role === "anonymous") return "badge-anonymous";
    return "badge-anonymous";
  };

  const getTargetTypeBadgeClass = (targetType) => {
    if (targetType === "property") return "badge-property";
    if (targetType === "agent") return "badge-agent";
    if (targetType === "blog") return "badge-blog";
    if (targetType === "advertisement") return "badge-advertisement";
    if (targetType === "form") return "badge-form";
    if (targetType === "chat" || targetType === "chatbot") return "badge-chat";
    return "badge-page";
  };

  return (
    <div className="activity-page">
      <div className="activity-container">
        <h1 className="activity-title">User Activity Log</h1>

        {error && <div className="activity-error">{error}</div>}

        {/* Summary statistics */}
        {statistics && (
          <div className="activity-card">
            <div className="activity-card-header">Summary (Last {filters.days || 30} Days)</div>
            <div className="activity-card-body">
              <div className="summary-grid">
                <div className="summary-box">
                  <h3>Page Views</h3>
                  <div className="number">{statistics.totalPageViews}</div>
                </div>
                <div className="summary-box">
                  <h3>Property Views</h3>
                  <div className="number">{statistics.propertyViews}</div>
                </div>
                <div className="summary-box">
                  <h3>Ad Views</h3>
                  <div className="number">{statistics.advertisementViews}</div>
                </div>
                <div className="summary-box">
                  <h3>Blog Views</h3>
                  <div className="number">{statistics.blogViews}</div>
                </div>
                <div className="summary-box">
                  <h3>Active Users</h3>
                  <div className="number">{statistics.activeUsers}</div>
                </div>
                <div className="summary-box">
                  <h3>Ad Clicks</h3>
                  <div className="number">{statistics.advertisementClicks || 0}</div>
                </div>
                <div className="summary-box">
                  <h3>Redirects</h3>
                  <div className="number">{statistics.redirects || 0}</div>
                </div>
                <div className="summary-box">
                  <h3>Unique Visitors</h3>
                  <div className="number">{statistics.totalUniqueVisitors || 0}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="activity-card">
          <div className="activity-card-header">Activity Insights</div>
          <div className="activity-card-body">
            <div className="charts-container">
              <div className="chart-row">
                <div className="chart-box">
                  <h3>Daily Activity Trends</h3>
                  <canvas ref={trendsRef} />
                </div>
                <div className="chart-box">
                  <h3>User Engagement by Type</h3>
                  <canvas ref={actionTypeRef} />
                </div>
              </div>
              <div className="chart-row">
                <div className="chart-box">
                  <h3>Device Distribution</h3>
                  <canvas ref={deviceRef} />
                </div>
                <div className="chart-box">
                  <h3>Top Viewed Pages</h3>
                  {renderTopPages()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="activity-card">
          <div className="activity-card-header">Filter Activity Log</div>
          <div className="activity-card-body">
            <form className="filter-form" onSubmit={handleApplyFilters}>
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="userRole">User Role</label>
                  <select
                    id="userRole"
                    name="userRole"
                    value={filters.userRole}
                    onChange={handleFilterChange}
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value || "all"} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="targetType">Target Type</label>
                  <select
                    id="targetType"
                    name="targetType"
                    value={filters.targetType}
                    onChange={handleFilterChange}
                  >
                    {targetTypeOptions.map((opt) => (
                      <option key={opt.value || "all"} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="days">Time Period</label>
                  <select
                    id="days"
                    name="days"
                    value={filters.days}
                    onChange={handleFilterChange}
                  >
                    {dayOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="deviceType">Device Type</label>
                  <select
                    id="deviceType"
                    name="deviceType"
                    value={filters.deviceType}
                    onChange={handleFilterChange}
                  >
                    {deviceOptions.map((opt) => (
                      <option key={opt.value || "all"} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group filter-actions">
                  <button type="submit" className="btn btn-primary">
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleResetFilters}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Activity table */}
        <div className="activity-card">
          <div className="activity-card-header activity-card-header-flex">
            <span>Activity Log</span>
            <span className="activity-count">
              Showing {activities.length} of {totalActivities} activities
            </span>
          </div>
          <div className="activity-card-body">
            {loading ? (
              <div className="activity-loading">
                <div className="spinner" />
                <p>Loading activity log...</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Target</th>
                      <th>URL</th>
                      <th>Device</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity) => (
                      <tr key={activity._id}>
                        <td className="timestamp">
                          {activity.timestamp
                            ? new Date(activity.timestamp).toLocaleString()
                            : "-"}
                        </td>
                        <td>
                          {activity.userId ? (
                            <>
                              <span className="activity-user-name">
                                {activity.userName}
                              </span>
                              <span
                                className={`badge ${getUserRoleBadgeClass(
                                  activity.userRole
                                )}`}
                              >
                                {activity.userRole}
                              </span>
                            </>
                          ) : (
                            <>
                              Anonymous
                              <span className="badge badge-anonymous">anonymous</span>
                            </>
                          )}
                        </td>
                        <td>{formatActionType(activity.actionType)}</td>
                        <td>
                          {activity.targetType ? (
                            <>
                              <span
                                className={`badge ${getTargetTypeBadgeClass(
                                  activity.targetType
                                )}`}
                              >
                                {activity.targetType}
                              </span>
                              {activity.targetName && (
                                <span className="target-name">
                                  {activity.targetName}
                                </span>
                              )}
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="url-cell">{activity.url}</td>
                        <td>{activity.deviceType || "unknown"}</td>
                        <td>
                          <button
                            type="button"
                            className="details-btn"
                            onClick={() => handleShowDetails(activity._id)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {activities.length === 0 && !loading && (
                      <tr>
                        <td colSpan={7} className="activity-empty-text">
                          No activities found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className="activity-pagination">
                    <button
                      type="button"
                      className="page-btn"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </button>
                    <div className="page-info">
                      Page {currentPage} of {totalPages}
                    </div>
                    <button
                      type="button"
                      className="page-btn"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Activity details modal */}
        {modalOpen && (
          <div className="activity-modal-overlay" onClick={handleCloseModal}>
            <div
              className="activity-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={handleCloseModal}>
                &times;
              </button>
              <h2>Activity Details</h2>
              {modalLoading && (
                <div className="activity-loading">
                  <div className="spinner" />
                  <p>Loading details...</p>
                </div>
              )}
              {!modalLoading && selectedActivity && (
                <div className="activity-details-grid">
                  <div className="details-column">
                    <h4>Basic Information</h4>
                    <ul className="metadata-list">
                      <li>
                        <span className="metadata-key">Action Type:</span>
                        {formatActionType(selectedActivity.actionType)}
                      </li>
                      <li>
                        <span className="metadata-key">Timestamp:</span>
                        {selectedActivity.timestamp
                          ? new Date(
                              selectedActivity.timestamp
                            ).toLocaleString()
                          : "-"}
                      </li>
                      <li>
                        <span className="metadata-key">User:</span>
                        {selectedActivity.userName || "Anonymous"}
                      </li>
                      <li>
                        <span className="metadata-key">User Role:</span>
                        {selectedActivity.userRole || "-"}
                      </li>
                      <li>
                        <span className="metadata-key">URL:</span>
                        {selectedActivity.url}
                      </li>
                      <li>
                        <span className="metadata-key">Referrer:</span>
                        {selectedActivity.referrer || "Direct"}
                      </li>
                    </ul>
                  </div>
                  <div className="details-column">
                    <h4>Target Information</h4>
                    <ul className="metadata-list">
                      <li>
                        <span className="metadata-key">Target Type:</span>
                        {selectedActivity.targetType || "N/A"}
                      </li>
                      <li>
                        <span className="metadata-key">Target Name:</span>
                        {selectedActivity.targetName || "N/A"}
                      </li>
                      <li>
                        <span className="metadata-key">Target ID:</span>
                        {selectedActivity.targetId || "N/A"}
                      </li>
                      <li>
                        <span className="metadata-key">Duration:</span>
                        {selectedActivity.duration
                          ? `${(selectedActivity.duration / 1000).toFixed(
                              2
                            )} seconds`
                          : "N/A"}
                      </li>
                      <li>
                        <span className="metadata-key">Device Type:</span>
                        {selectedActivity.deviceType || "unknown"}
                      </li>
                      <li>
                        <span className="metadata-key">IP Address:</span>
                        {selectedActivity.ipAddress || "N/A"}
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {!modalLoading && selectedActivity && selectedActivity.metadata &&
              Object.keys(selectedActivity.metadata).length > 0 ? (
                <div className="details-section">
                  <h4>Additional Metadata</h4>
                  <ul className="metadata-list">
                    {Object.entries(selectedActivity.metadata).map(
                      ([key, value]) => (
                        <li key={key}>
                          <span className="metadata-key">{key}:</span>
                          {" "}
                          {typeof value === "string"
                            ? value
                            : JSON.stringify(value)}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ) : null}

              {!modalLoading && selectedActivity && selectedActivity.userAgent && (
                <div className="details-section">
                  <h4>User Agent</h4>
                  <div className="user-agent-box">
                    <code>{selectedActivity.userAgent}</code>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
