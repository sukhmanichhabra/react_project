import React, { useEffect, useState, useRef } from "react";
import "./Messages.css";

// Helper to format time similar to views/chat.ejs
const formatTime = (input) => {
  if (!input) return "";
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // If less than 24 hours ago, show time HH:MM
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  // If less than 7 days ago, show day name
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  }

  // Otherwise show date DD/MM/YYYY
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [error, setError] = useState(null);

  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [newChatReceiverId, setNewChatReceiverId] = useState("");
  const [newChatMessage, setNewChatMessage] = useState("");
  const [creatingConversation, setCreatingConversation] = useState(false);

  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef(null);
  const previousMessagesLengthRef = useRef(0);

  useEffect(() => {
    loadInitialData();

    // Periodically refresh conversations/unread counts (similar to EJS checkUnreadMessages)
    const intervalId = setInterval(() => {
      refreshConversationsSilently();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Auto-scroll only when new messages are added, and jump instantly (no smooth animation)
  useEffect(() => {
    if (
      messages.length > previousMessagesLengthRef.current &&
      messagesEndRef.current
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
    }
    previousMessagesLengthRef.current = messages.length;
  }, [messages]);

  const loadInitialData = async () => {
    try {
      setLoadingInitial(true);
      setError(null);

      // Do NOT send an explicit Accept: 'application/json' header here,
      // otherwise the backend treats this as an AJAX summary request
      // and only returns { unreadCount, conversationsCount }.
      // Instead, send an Accept header without the word "json" so we get
      // the full conversations payload.
      const res = await fetch("/api/chat", {
        headers: {
          Accept: "text/html, */*;q=0.9",
        },
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`HTTP ${res.status}:`, errorText);
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      console.log("Chat response:", json);

      // When Accept does NOT contain 'json', the controller returns
      // the full shape: { success: true, data: { conversations, unreadCount, currentUser, ... } }
      if (json && json.success && json.data) {
        const data = json.data;
        const convs = (data.conversations || []).map((conv) => {
          const lastTimestamp = conv.lastMessage?.timestamp || conv.createdAt;
          return {
            ...conv,
            formattedTime: conv.formattedTime || formatTime(lastTimestamp),
          };
        });

        console.log("Conversations loaded:", convs);
        setConversations(convs);
        setCurrentUser(data.currentUser || null);
        setActiveConversation(null);
        setMessages([]);
      } else if (json && typeof json.conversationsCount === "number") {
        // Fallback: if we somehow still hit the AJAX summary path,
        // just show an empty list instead of throwing.
        console.warn(
          "Received summary chat payload, no conversations array:",
          json
        );
        setConversations([]);
        setCurrentUser(null);
        setActiveConversation(null);
        setMessages([]);
      } else {
        throw new Error("Unexpected chat response format");
      }
    } catch (e) {
      console.error("Error loading conversations:", e);
      setError("Failed to load chat messages");
    } finally {
      setLoadingInitial(false);
    }
  };

  const refreshConversationsSilently = async () => {
    try {
      const res = await fetch("/api/chat", {
        headers: {
          Accept: "text/html, */*;q=0.9",
        },
        credentials: "include",
      });
      if (!res.ok) return;
      const json = await res.json();

      if (
        json &&
        json.success &&
        json.data &&
        Array.isArray(json.data.conversations)
      ) {
        const data = json.data;
        const updated = data.conversations.map((conv) => {
          const lastTimestamp = conv.lastMessage?.timestamp || conv.createdAt;
          return {
            ...conv,
            formattedTime: conv.formattedTime || formatTime(lastTimestamp),
          };
        });

        setConversations((prev) => {
          // Merge by _id to avoid losing local fields
          const map = new Map();
          prev.forEach((c) => map.set(c._id, c));
          updated.forEach((c) => map.set(c._id, c));
          return Array.from(map.values());
        });
      }
    } catch (e) {
      console.error("Error refreshing conversations:", e);
    }
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation || !currentUser) return null;
    const currentId = String(currentUser._id);
    if (!Array.isArray(conversation.participants)) return null;

    return (
      conversation.participants.find((p) => {
        const id = p.userId && p.userId._id ? p.userId._id : p.userId;
        return id && String(id) !== currentId;
      }) || null
    );
  };

  const getUnreadCountForConversation = (conversation) => {
    if (!conversation || !currentUser || !conversation.unreadCount) return 0;

    // unreadCount is stored as a Map in MongoDB; serialized to plain object in JSON
    const mapObj = conversation.unreadCount;
    const key = String(currentUser._id);
    return mapObj[key] || 0;
  };

  const handleConversationClick = async (conversationId) => {
    if (!conversationId || !currentUser) return;

    try {
      setLoadingConversation(true);
      setError(null);

      const res = await fetch(`/api/chat/${conversationId}/ajax`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load conversation");
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to load conversation");
      }

      const { conversation, messages: rawMessages } = json;

      const formattedMessages = (rawMessages || [])
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map((m) => ({
          ...m,
          formattedTime: m.formattedTime || formatTime(m.timestamp),
        }));

      setActiveConversation(conversation);
      setMessages(formattedMessages);

      // Mark messages as read (fire and forget)
      fetch(`/api/chat/${conversationId}/mark-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }).catch((err) => console.error("Error marking messages as read:", err));

      // Locally clear unread count for this conversation
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id !== conversationId) return c;
          const key = String(currentUser._id);
          const unreadCount = { ...(c.unreadCount || {}) };
          unreadCount[key] = 0;
          return { ...c, unreadCount };
        })
      );
    } catch (e) {
      console.error("Error loading conversation:", e);
      setError(e.message);
    } finally {
      setLoadingConversation(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!activeConversation || !messageInput.trim()) return;

    const text = messageInput.trim();

    try {
      setSendingMessage(true);
      setMessageInput("");

      const res = await fetch(`/api/chat/${activeConversation._id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to send message");
      }

      // Build local message object
      const newMsg = {
        _id: json.data?._id || Math.random().toString(36).slice(2),
        senderId: currentUser._id,
        senderName: currentUser.name,
        message: text,
        timestamp: new Date(),
        formattedTime: formatTime(new Date()),
      };

      setMessages((prev) => [...prev, newMsg]);

      // Update last message in conversation list and move it to top
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c._id !== activeConversation._id) return c;
          return {
            ...c,
            lastMessage: {
              ...(c.lastMessage || {}),
              text,
              timestamp: new Date().toISOString(),
            },
            formattedTime: formatTime(new Date()),
          };
        });

        // Move active conversation to top (after header if needed)
        updated.sort((a, b) => {
          const ta = new Date(
            a.lastMessage?.timestamp || a.createdAt
          ).getTime();
          const tb = new Date(
            b.lastMessage?.timestamp || b.createdAt
          ).getTime();
          return tb - ta;
        });

        return updated;
      });
    } catch (e) {
      console.error("Error sending message:", e);
      setError(e.message || "Failed to send message");
      // Restore text on failure
      setMessageInput(text);
    } finally {
      setSendingMessage(false);
    }
  };

  const openNewChatModal = () => {
    setShowNewChatModal(true);
    if (!contacts.length) {
      loadContacts();
    }
  };

  const closeNewChatModal = () => {
    setShowNewChatModal(false);
    setNewChatReceiverId("");
    setNewChatMessage("");
  };

  const loadContacts = async () => {
    try {
      setContactsLoading(true);
      const res = await fetch("/api/chat/contacts/list", {
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.contacts)) {
        setContacts(json.contacts);
      } else {
        setContacts([]);
      }
    } catch (e) {
      console.error("Error loading contacts:", e);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleCreateConversation = async (e) => {
    e.preventDefault();
    if (!newChatReceiverId || !newChatMessage.trim()) return;

    const selectedContact = contacts.find(
      (c) => String(c.userId) === String(newChatReceiverId)
    );

    const payload = {
      receiverId: newChatReceiverId,
      message: newChatMessage.trim(),
    };

    if (selectedContact && selectedContact.propertyId) {
      payload.propertyId = selectedContact.propertyId;
    }

    try {
      setCreatingConversation(true);

      const res = await fetch("/api/chat/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to start conversation");
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to start conversation");
      }

      const { conversation } = json.data || {};
      if (!conversation) {
        throw new Error("No conversation returned from server");
      }

      // Add/merge conversation in list
      const convWithTime = {
        ...conversation,
        formattedTime: formatTime(new Date()),
      };

      setConversations((prev) => {
        const exists = prev.find((c) => c._id === conversation._id);
        let updated;
        if (exists) {
          updated = prev.map((c) =>
            c._id === conversation._id ? convWithTime : c
          );
        } else {
          updated = [convWithTime, ...prev];
        }
        return updated;
      });

      // Set active conversation immediately so UI updates
      setActiveConversation(conversation);

      // Load full conversation + messages
      await handleConversationClick(conversation._id);

      closeNewChatModal();
    } catch (e) {
      console.error("Error creating conversation:", e);
      setError(e.message || "Failed to start conversation");
    } finally {
      setCreatingConversation(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="messages-page">
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  const renderConversationList = () => (
    <div className="conversation-list">
      <div className="conversation-header">
        <h2>Messages</h2>
        <button className="new-chat-btn" onClick={openNewChatModal}>
          <i className="fas fa-plus" /> New
        </button>
      </div>

      {conversations && conversations.length > 0 ? (
        <div className="conversation-items">
          {conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const unread = getUnreadCountForConversation(conv);
            const isActive =
              activeConversation && conv._id === activeConversation._id;

            return (
              <button
                key={conv._id}
                type="button"
                className={`conversation-item ${isActive ? "active" : ""} ${
                  unread > 0 ? "unread" : ""
                }`}
                onClick={() => handleConversationClick(conv._id)}
              >
                <div className="conversation-name">
                  <div>
                    {other ? (
                      <>
                        {other.name}
                        {other.role && (
                          <span className={`user-role role-${other.role}`}>
                            {other.role}
                          </span>
                        )}
                      </>
                    ) : (
                      <span>Conversation</span>
                    )}
                  </div>
                  {unread > 0 && <span className="unread-badge">{unread}</span>}
                </div>
                <div className="conversation-lastMsg">
                  {conv.lastMessage?.text || "Start a conversation"}
                </div>
                <div className="conversation-time">{conv.formattedTime}</div>
                {conv.propertyTitle && (
                  <div className="chat-property-badge">
                    <i className="fas fa-home" /> {conv.propertyTitle}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <i className="far fa-comments" />
          <h3>No conversations yet</h3>
          <p>Start a new conversation by clicking the button above.</p>
        </div>
      )}
    </div>
  );

  const renderChatMain = () => {
    if (loadingConversation) {
      return (
        <div className="chat-main">
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading conversation...</p>
          </div>
        </div>
      );
    }

    if (!activeConversation) {
      return (
        <div className="chat-main">
          <div className="empty-state">
            <i className="far fa-comments" />
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the sidebar or start a new one.</p>
            <button className="new-chat-btn" onClick={openNewChatModal}>
              <i className="fas fa-plus" /> New Conversation
            </button>
          </div>
        </div>
      );
    }

    const other = getOtherParticipant(activeConversation);

    return (
      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-title">
            <div>
              <h2>
                {other ? (
                  <>
                    {other.name}
                    {other.role && (
                      <span className={`user-role role-${other.role}`}>
                        {other.role}
                      </span>
                    )}
                  </>
                ) : (
                  "Conversation"
                )}
              </h2>
              {activeConversation.propertyTitle && (
                <div className="chat-property">
                  <i className="fas fa-home" />{" "}
                  {activeConversation.propertyTitle}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="chat-messages" id="chatMessages">
          {messages && messages.length > 0 ? (
            messages.map((msg) => {
              const senderId =
                msg.senderId && msg.senderId._id
                  ? msg.senderId._id
                  : msg.senderId;
              const isSentByMe =
                currentUser && String(senderId) === String(currentUser._id);

              return (
                <div
                  key={msg._id}
                  className={`message ${isSentByMe ? "sent" : "received"}`}
                >
                  <div className="message-content">{msg.message}</div>
                  <div className="message-info">
                    <span>{isSentByMe ? "You" : msg.senderName}</span>
                    <span>{msg.formattedTime}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <i className="far fa-comment-dots" />
              <h3>No messages yet</h3>
              <p>Start the conversation by sending a message below.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="message-form" onSubmit={handleSendMessage}>
          <textarea
            className="message-input"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            required
          />
          <button
            type="submit"
            className="message-send"
            disabled={sendingMessage}
          >
            <i className="fas fa-paper-plane" />
          </button>
        </form>
      </div>
    );
  };

  const supportContacts = contacts.filter((c) => c.category === "Support");
  const propertyContacts = contacts.filter((c) => !c.category);

  return (
    <div className="messages-page">
      {error && (
        <div className="messages-error">
          <i className="fas fa-exclamation-circle" /> {error}
        </div>
      )}

      <div className="chat-container">
        {renderConversationList()}
        {renderChatMain()}
      </div>

      {showNewChatModal && (
        <div className="modal-overlay" onClick={closeNewChatModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Conversation</h2>
              <button className="close-modal" onClick={closeNewChatModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateConversation}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="contactSelect">Select Contact</label>
                  {contactsLoading ? (
                    <div className="loading-inline">Loading contacts...</div>
                  ) : (
                    <select
                      id="contactSelect"
                      value={newChatReceiverId}
                      onChange={(e) => setNewChatReceiverId(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select a contact
                      </option>
                      {supportContacts.length > 0 && (
                        <optgroup label="Support">
                          {supportContacts.map((c) => (
                            <option key={c.userId} value={c.userId}>
                              {c.name} ({c.role})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {propertyContacts.length > 0 && (
                        <optgroup label="Property-related Contacts">
                          {propertyContacts.map((c) => (
                            <option key={c.userId} value={c.userId}>
                              {c.name} ({c.role})
                              {c.propertyTitle ? ` - ${c.propertyTitle}` : ""}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="firstMessage">Message</label>
                  <textarea
                    id="firstMessage"
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                    placeholder="Type your message..."
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={closeNewChatModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-send"
                  disabled={creatingConversation}
                >
                  {creatingConversation ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
