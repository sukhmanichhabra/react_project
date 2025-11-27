import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Messages.css";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAsRead, setMarkingAsRead] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/dashboard/messages", {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.data.success) {
        setMessages(response.data.messages || []);
        setUnreadCount(response.data.unreadCount || 0);
      } else {
        setError("Failed to load messages");
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      setMarkingAsRead((prev) => ({ ...prev, [messageId]: true }));

      const response = await axios.put(
        `/api/dashboard/messages/${messageId}/read`,
        {},
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        // Update message status in state
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, status: "read" } : msg
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error marking message as read:", err);
    } finally {
      setMarkingAsRead((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  const handleReply = async (messageId, senderEmail) => {
    if (!replyText.trim()) {
      alert("Please enter a reply message");
      return;
    }

    try {
      const response = await axios.put(
        `/api/dashboard/messages/${messageId}/reply`,
        { replyText: replyText },
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        // Update message in state with the response from server
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  status: "replied",
                  reply: replyText,
                  repliedAt: new Date(),
                }
              : msg
          )
        );
        setReplyingTo(null);
        setReplyText("");
        alert("Reply sent successfully!");
      }
    } catch (err) {
      console.error("Error sending reply:", err);
      alert("Failed to send reply");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `/api/dashboard/messages/${messageId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Failed to delete message");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "read":
        return <span className="status-badge read">Read</span>;
      case "replied":
        return <span className="status-badge replied">Replied</span>;
      case "unread":
        return <span className="status-badge unread">Unread</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Unknown date";

      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <section id="messages" className="messages-section">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading messages...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="messages" className="messages-section">
      <div className="dash-section-header">
        <div className="header-content">
          <h2>
            <i className="fas fa-envelope"></i>
            Messages
          </h2>
          <p>Inquiries from potential buyers and renters.</p>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="dash-messages-list">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`dash-message-item ${
                msg.status === "unread" ? "unread" : ""
              }`}
            >
              <div className="dash-message-header">
                <div className="sender-info">
                  <span className="dash-message-sender">{msg.senderName}</span>
                  <span className="dash-message-email">{msg.senderEmail}</span>
                </div>
                <div className="message-meta">
                  {getStatusBadge(msg.status)}
                  <span className="dash-message-date">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
              </div>

              <div className="dash-message-property">
                <i className="fas fa-home"></i>
                Inquiry about: <strong>{msg.propertyTitle}</strong>
              </div>

              <p className="dash-message-body">{msg.message}</p>

              {msg.reply && (
                <div className="message-reply">
                  <div className="reply-header">
                    <i className="fas fa-reply-all"></i>
                    Your Reply:
                  </div>
                  <p className="reply-text">{msg.reply}</p>
                </div>
              )}

              <div className="message-actions">
                {msg.status === "unread" && (
                  <button
                    onClick={() => handleMarkAsRead(msg._id)}
                    disabled={markingAsRead[msg._id]}
                    className="action-btn mark-read-btn"
                  >
                    <i className="fas fa-check"></i>
                    {markingAsRead[msg._id] ? "Marking..." : "Mark as Read"}
                  </button>
                )}

                {replyingTo === msg._id ? (
                  <div className="reply-form">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      className="reply-textarea"
                    />
                    <div className="reply-form-actions">
                      <button
                        onClick={() => handleReply(msg._id, msg.senderEmail)}
                        className="action-btn send-btn"
                      >
                        <i className="fas fa-paper-plane"></i> Send Reply
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                        className="action-btn cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setReplyingTo(msg._id)}
                      className="action-btn reply-btn"
                    >
                      <i className="fas fa-reply"></i> Reply
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="action-btn delete-btn"
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="dash-empty-state">
            <i className="fas fa-inbox"></i>
            <h3>No Messages</h3>
            <p>You have no messages from clients yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Messages;
