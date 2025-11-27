import React, { useEffect, useState } from "react";
import "./Notifications.css";

const typeFilterOptions = [
  { value: "all", label: "All Notifications" },
  { value: "rent_due", label: "Rent Alerts" },
  { value: "emi_due", label: "EMI Alerts" },
  { value: "property", label: "Property Updates" },
  { value: "loan", label: "Loan Status" },
  { value: "visit", label: "Visit Updates" },
  { value: "message", label: "Messages" },
  { value: "system", label: "System Notifications" },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async (page = 1, unread = unreadOnly) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", 20);
      if (unread) params.set("unreadOnly", "true");

      const res = await fetch(`/api/notifications?${params.toString()}`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load notifications");
      }

      const json = await res.json();
      if (!json || !json.notifications || !json.pagination) {
        // Controller sometimes wraps data when Accept is not JSON, but here we explicitly asked for JSON
        if (json && json.success && json.data) {
          const data = json.data;
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
          setPagination(data.pagination || { page: 1, totalPages: 1 });
          setUnreadOnly(Boolean(data.unreadOnly));
          return;
        }
        throw new Error("Unexpected notifications response format");
      }

      setNotifications(json.notifications);
      setPagination({
        page: json.pagination.page,
        totalPages: json.pagination.totalPages,
      });
      setUnreadCount(json.pagination.unreadCount || 0);
      setUnreadOnly(unread);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1, unreadOnly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (typeFilter === "all") return true;
    const t = n.type || "";
    if (typeFilter === "system") return t === "system";
    if (typeFilter === "rent_due") return t.includes("rent");
    if (typeFilter === "emi_due") return t.includes("emi");
    if (typeFilter === "property") return t.includes("property");
    if (typeFilter === "loan") return t.includes("loan");
    if (typeFilter === "visit") return t.includes("visit");
    if (typeFilter === "message") return t.includes("message");
    return true;
  });

  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}/mark-read`, {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to mark as read");
      }

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError(err.message || "Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to mark all as read");
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setUnreadOnly(false);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError(err.message || "Failed to mark all as read");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete notification");
      }
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError(err.message || "Failed to delete notification");
    }
  };

  const handleToggleUnreadOnly = () => {
    const nextUnread = !unreadOnly;
    setUnreadOnly(nextUnread);
    fetchNotifications(1, nextUnread);
  };

  const handlePageChange = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > (pagination.totalPages || 1) ||
      nextPage === pagination.page
    ) {
      return;
    }
    fetchNotifications(nextPage, unreadOnly);
  };

  const renderIcon = (type) => {
    if (!type) return <i className="fas fa-bell" />;
    if (type.includes("rent")) return <i className="fas fa-home text-warning" />;
    if (type.includes("emi"))
      return <i className="fas fa-money-bill-wave text-success" />;
    if (type.includes("property"))
      return <i className="fas fa-building text-primary" />;
    if (type.includes("loan"))
      return <i className="fas fa-hand-holding-usd text-info" />;
    if (type.includes("visit"))
      return <i className="fas fa-calendar-check text-secondary" />;
    if (type.includes("message"))
      return <i className="fas fa-envelope text-danger" />;
    return <i className="fas fa-bell" />;
  };

  return (
    <div className="notifications-page">
      <section className="notification-section">
        <div className="notification-card">
          <div className="notification-card-header">
            <h2>Notifications &amp; Alerts</h2>
            <div className="notification-header-actions">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={handleMarkAllAsRead}
                >
                  <i className="fa fa-check-double" /> Mark All as Read
                </button>
              )}
              <button
                type="button"
                className={`btn btn-toggle-unread ${
                  unreadOnly ? "btn-active" : ""
                }`}
                onClick={handleToggleUnreadOnly}
              >
                <i className="fa fa-bell" /> {unreadOnly ? "All Notifications" : "Unread Only"}
              </button>
            </div>
          </div>

          <div className="notification-card-body">
            <div className="notification-filter">
              <div className="filter-left">
                <h5>
                  <span className="badge badge-pill badge-primary">
                    {unreadCount}
                  </span>{" "}
                  Unread notifications
                </h5>
              </div>
              <div className="filter-right">
                <select
                  id="notification-type-filter"
                  className="notification-type-select"
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                >
                  {typeFilterOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <div className="notification-error">{error}</div>}

            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
                <p>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="notification-list">
                {filteredNotifications.map((n) => (
                  <div
                    key={n._id}
                    className={`notification-item ${
                      n.isRead ? "" : "unread"
                    } priority-${n.priority || "medium"} type-${
                      n.type && n.type.includes("_")
                        ? n.type.split("_")[0]
                        : n.type || "generic"
                    }`}
                  >
                    <div className="notification-item-inner">
                      <div className="notification-icon-wrapper">
                        <div className="notification-icon">{renderIcon(n.type)}</div>
                      </div>
                      <div className="notification-content">
                        <div className="notification-title-row">
                          <h5 className="notification-title">
                            {n.title}
                            {!n.isRead && (
                              <span className="badge badge-danger">New</span>
                            )}
                            {n.priority === "high" && (
                              <span className="badge badge-warning">Important</span>
                            )}
                          </h5>
                          <small className="notification-time">
                            {n.createdAt
                              ? new Date(n.createdAt).toLocaleString()
                              : ""}
                          </small>
                        </div>
                        <p className="notification-message">{n.message}</p>
                        <div className="notification-actions-row">
                          <div>
                            {n.link && (
                              <a
                                href={n.link}
                                className="btn btn-outline-primary btn-sm"
                              >
                                <i className="fas fa-external-link-alt" /> View
                                Details
                              </a>
                            )}
                          </div>
                          <div className="notification-buttons">
                            {!n.isRead && (
                              <button
                                type="button"
                                className="btn btn-outline-success btn-sm w-48"
                                onClick={() => handleMarkAsRead(n._id)}
                              >
                                <i className="fas fa-check" /> Mark as Read
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(n._id)}
                            >
                              <i className="fas fa-trash" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {pagination.totalPages > 1 && (
                  <div className="notification-pagination">
                    <button
                      type="button"
                      className="page-btn"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Previous
                    </button>

                    <span className="page-info">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                      type="button"
                      className="page-btn"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="notification-empty-state">
                <i className="fas fa-bell-slash" />
                <h4>No notifications found</h4>
                <p>
                  You don't have any {unreadOnly ? "unread" : ""} notifications at
                  the moment.
                </p>
                {unreadOnly && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleToggleUnreadOnly}
                  >
                    View All Notifications
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Notifications;
