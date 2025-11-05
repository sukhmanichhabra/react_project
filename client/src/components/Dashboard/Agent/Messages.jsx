import React from "react";
import { Link } from "react-router-dom";
import "./Messages.css";

// 1. Mock data added
const mockMessage = {
  _id: "msg-mock-1",
  senderName: "John Doe (Mock)",
  senderEmail: "john.doe@example.com",
  date: new Date().toISOString(),
  propertyId: "mock-property-id",
  propertyTitle: "Modern City Loft (Mock)",
  message:
    "Hello, I'm very interested in this property. Is it still available for a viewing this weekend? Please let me know.",
};

const Messages = ({ messages = [] }) => {
  // 2. Combined mock data with prop data
  const allMessages = [mockMessage, ...messages];

  return (
    <section id="messages">
      <div className="dash-section-header">
        <h2>Messages</h2>
        <p>Inquiries from potential buyers and renters.</p>
      </div>
      <div className="dash-messages-list">
        {allMessages.length > 0 ? (
          // 3. Mapped over the combined array
          allMessages.map((msg) => (
            <div className="dash-message-item" key={msg._id}>
              <div className="dash-message-header">
                <span className="dash-message-sender">{msg.senderName}</span>
                <span className="dash-message-date">
                  {new Date(msg.date).toLocaleString()}
                </span>
              </div>
              <div className="dash-message-property">
                Inquiry about:{" "}
                <Link to={`/property/${msg.propertyId}`}>
                  {msg.propertyTitle}
                </Link>
              </div>
              <p className="dash-message-body">{msg.message}</p>
              <a href={`mailto:${msg.senderEmail}`} className="dash-reply-btn">
                <i className="fas fa-reply"></i> Reply
              </a>
            </div>
          ))
        ) : (
          <div className="dash-empty-state">
            <i className="fas fa-envelope-open"></i>
            <h3>No Messages</h3>
            <p>You have no new messages from clients.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Messages;
