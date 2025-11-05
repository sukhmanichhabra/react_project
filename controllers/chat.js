const { ChatModel, ChatMessage, ChatConversation } = require("../models/chat");
const User = require("../models/user");
const mongoose = require("mongoose");
const NotificationService = require("../service/notificationService");

// Import PropertyModel to get property details
const { PropertyModel } = require("../models");

// Helper function to format time for display
function formatTime(date) {
  const now = new Date();
  const diff = now - date;

  // If less than 24 hours ago, show time
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

  // Otherwise show date
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

// Get all conversations for the current user
const getAllConversations = async (req, res) => {
  try {
    console.log("GET /chat - User:", req.user._id);

    // Get all conversations for the current user
    const conversations = await ChatModel.getUserConversations(req.user._id);
    console.log("Conversations found:", conversations.length);

    // Get unread message count
    const unreadCount = await ChatModel.getTotalUnreadMessages(req.user._id);

    // Check if this is an AJAX request (for unread count updates)
    const isAjax = req.xhr || req.headers.accept.indexOf("json") > -1;

    if (isAjax) {
      return res.json({
        unreadCount,
        conversationsCount: conversations.length,
      });
    }

    // Format conversation timestamps for display
    const formattedConversations = conversations.map((conversation) => {
      const lastMessageTime =
        conversation.lastMessage && conversation.lastMessage.timestamp
          ? new Date(conversation.lastMessage.timestamp)
          : new Date(conversation.createdAt);

      return {
        ...conversation.toObject(),
        formattedTime: formatTime(lastMessageTime),
      };
    });

    res.json({
      success: true,
      data: {
        conversations: formattedConversations,
        unreadCount,
        activeConversation: null,
        messages: [],
        currentUser: req.user,
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

// Get a specific conversation with messages
const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log(`GET /chat/${conversationId} - User:`, req.user._id);

    // Check if valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      console.log("Invalid conversation ID format:", conversationId);
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    // Get the conversation
    const conversation = await ChatConversation.findById(
      conversationId
    ).populate("participants.userId", "name email role");

    if (!conversation) {
      console.log("Conversation not found:", conversationId);
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    console.log("Conversation found:", conversation._id);

    // Check if user is part of the conversation
    console.log("Checking participant authorization.");
    console.log("Current user ID:", req.user._id);
    console.log(
      "Participants:",
      conversation.participants.map((p) => ({
        id: p.userId ? p.userId.toString() : "undefined",
        name: p.name,
      }))
    );

    // More flexible participant check with detailed logging
    let isParticipant = false;
    const currentUserId = req.user._id.toString();

    for (const participant of conversation.participants) {
      if (!participant.userId) {
        console.log("Participant missing userId:", participant);
        continue;
      }

      const participantId = participant.userId._id
        ? participant.userId._id.toString() // If populated object
        : participant.userId.toString(); // If just ObjectId

      console.log("Comparing:", participantId, "with", currentUserId);

      if (participantId === currentUserId) {
        isParticipant = true;
        console.log("User is authorized as participant");
        break;
      }
    }

    if (!isParticipant) {
      console.log("User not authorized to view conversation");
      // Instead of showing an error, redirect to the main chat page
      return res.redirect("/chat");
    }

    // Get messages for the conversation
    console.log(
      "Looking for messages with conversationId:",
      conversation._id.toString()
    );
    const messages = await ChatMessage.find({
      conversationId: { $in: [conversation._id.toString(), conversation._id] },
    })
      .populate("senderId", "name email role")
      .sort({ timestamp: -1 });

    console.log(`Found ${messages.length} messages for conversation`);

    // Get all conversations for the user (for sidebar)
    const allConversations = await ChatModel.getUserConversations(req.user._id);

    // Format conversation timestamps for display
    const formattedConversations = allConversations.map((conv) => {
      const lastMessageTime =
        conv.lastMessage && conv.lastMessage.timestamp
          ? new Date(conv.lastMessage.timestamp)
          : new Date(conv.createdAt);

      return {
        ...conv.toObject(),
        formattedTime: formatTime(lastMessageTime),
      };
    });

    // Format message timestamps
    const formattedMessages = messages.map((message) => {
      return {
        ...message.toObject(),
        formattedTime: formatTime(new Date(message.timestamp)),
      };
    });

    // Mark messages as read
    await ChatModel.markMessagesAsRead(conversation._id, req.user._id);

    // Get total unread count for the user
    const unreadCount = await ChatModel.getTotalUnreadMessages(req.user._id);

    // Get property details if this conversation is about a property
    let property = null;
    if (conversation.propertyId) {
      property = await PropertyModel.getPropertyById(conversation.propertyId);
    }

    res.json({
      success: true,
      data: {
        conversations: formattedConversations,
        activeConversation: conversation,
        messages: formattedMessages,
        unreadCount,
        property,
        currentUser: req.user,
      },
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
      error: error.message,
    });
  }
};

// Get a specific conversation with messages (AJAX version)
const getConversationAjax = async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log(`AJAX GET /chat/${conversationId} - User:`, req.user._id);

    // Check if valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    // Get the conversation
    const conversation = await ChatConversation.findById(
      conversationId
    ).populate("participants.userId", "name email role");

    if (!conversation) {
      return res.json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if user is part of the conversation
    console.log("Checking participant authorization.");
    console.log("Current user ID:", req.user._id);
    console.log(
      "Participants:",
      conversation.participants.map((p) => ({
        id: p.userId ? p.userId.toString() : "undefined",
        name: p.name,
      }))
    );

    // More flexible participant check with detailed logging
    let isParticipant = false;
    const currentUserId = req.user._id.toString();

    for (const participant of conversation.participants) {
      if (!participant.userId) {
        console.log("Participant missing userId:", participant);
        continue;
      }

      const participantId = participant.userId._id
        ? participant.userId._id.toString() // If populated object
        : participant.userId.toString(); // If just ObjectId

      console.log("Comparing:", participantId, "with", currentUserId);

      if (participantId === currentUserId) {
        isParticipant = true;
        console.log("User is authorized as participant");
        break;
      }
    }

    if (!isParticipant) {
      console.log("User not authorized to view conversation");
      return res.json({
        success: false,
        message: "You are not authorized to view this conversation",
      });
    }

    // Get messages for the conversation
    console.log(
      "Looking for messages with conversationId:",
      conversation._id.toString()
    );
    const messages = await ChatMessage.find({
      conversationId: { $in: [conversation._id.toString(), conversation._id] },
    })
      .populate("senderId", "name email role")
      .sort({ timestamp: -1 });

    console.log(`Found ${messages.length} messages for conversation`);

    // Format message timestamps
    const formattedMessages = messages.map((message) => {
      return {
        ...message.toObject(),
        senderId: message.senderId._id || message.senderId,
        formattedTime: formatTime(new Date(message.timestamp)),
      };
    });

    // Mark messages as read (in background)
    ChatModel.markMessagesAsRead(conversation._id, req.user._id).catch((err) =>
      console.error("Error marking messages as read:", err)
    );

    return res.json({
      success: true,
      conversation: {
        _id: conversation._id,
        participants: conversation.participants.map((p) => ({
          userId: p.userId._id || p.userId,
          name: p.name,
          role: p.role,
        })),
        propertyId: conversation.propertyId,
        propertyTitle: conversation.propertyTitle,
        lastMessage: conversation.lastMessage,
      },
      messages: formattedMessages,
    });
  } catch (error) {
    console.error("Error fetching conversation via AJAX:", error);
    return res.json({
      success: false,
      message: "Failed to fetch conversation: " + error.message,
    });
  }
};

// Send a message in an existing conversation
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;

    // Validate input
    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Check if conversation exists
    const conversation = await ChatConversation.findById(
      conversationId
    ).populate("participants.userId", "name email role");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if user is part of the conversation
    let isParticipant = false;
    let receiver = null;

    for (const participant of conversation.participants) {
      if (!participant.userId) continue;

      const participantId = participant.userId._id
        ? participant.userId._id.toString()
        : participant.userId.toString();

      if (participantId === req.user._id.toString()) {
        isParticipant = true;
      } else {
        // Store the receiver for notification
        receiver = participant.userId;
      }
    }

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this conversation",
      });
    }

    // Create the message
    const newMessage = await ChatMessage.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      senderName: req.user.name, // Added
      senderRole: req.user.role, // Added
      receiverId: receiver._id, // Added
      receiverName: receiver.name, // Added
      receiverRole: receiver.role, // Added
      message: message,
      propertyId: conversation.propertyId,
      propertyTitle: conversation.propertyTitle || "",
      timestamp: new Date(),
    });

    // Update conversation with last message
    conversation.lastMessage = {
      text: message,
      timestamp: new Date(),
      senderId: req.user._id,
    };

    // Update unread count for all participants except the sender
    for (const participant of conversation.participants) {
      if (!participant.userId) continue;

      const participantId = participant.userId._id
        ? participant.userId._id.toString()
        : participant.userId.toString();

      if (participantId !== req.user._id.toString()) {
        const currentCount = conversation.unreadCount.get(participantId) || 0;
        conversation.unreadCount.set(participantId, currentCount + 1);
      }
    }

    await conversation.save();

    // Send notification to receiver
    if (receiver) {
      try {
        await NotificationService.newMessage({
          userId: receiver._id,
          messageId: newMessage._id,
          senderName: req.user.name,
          messagePreview: message,
        });
        console.log(`Message notification sent to user ${receiver._id}`);
      } catch (notificationError) {
        console.error("Error sending message notification:", notificationError);
        // Continue even if notification fails
      }
    }

    res.json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// Start a new conversation
const startNewConversation = async (req, res) => {
  try {
    const { receiverId, message, propertyId } = req.body;

    // Validate input
    if (!receiverId || !message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and message are required",
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Get property details if provided
    let property = null;
    if (propertyId) {
      property = await PropertyModel.getPropertyById(propertyId);
    }

    // Find or create a conversation between the users
    const conversation = await ChatModel.findOrCreateConversation(
      req.user,
      receiver,
      property
    );

    // Create the message
    const newMessage = await ChatMessage.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      receiverId: receiver._id,
      receiverName: receiver.name,
      receiverRole: receiver.role,
      message: message,
      propertyId: property ? property._id : null,
      propertyTitle: property ? property.title : "",
    });

    // Update conversation with last message
    conversation.lastMessage = {
      text: message,
      timestamp: new Date(),
      senderId: req.user._id,
    };

    // Increment unread count for receiver
    const receiverIdStr = receiver._id.toString();
    const currentCount = conversation.unreadCount.get(receiverIdStr) || 0;
    conversation.unreadCount.set(receiverIdStr, currentCount + 1);

    await conversation.save();

    // Send notification to receiver
    try {
      await NotificationService.newMessage({
        userId: receiver._id,
        messageId: newMessage._id,
        senderName: req.user.name,
        messagePreview: message,
      });
      console.log(
        `New conversation message notification sent to user ${receiver._id}`
      );
    } catch (notificationError) {
      console.error(
        "Error sending new conversation notification:",
        notificationError
      );
      // Continue even if notification fails
    }

    res.json({
      success: true,
      message: "Conversation started successfully",
      data: {
        message: newMessage,
        conversation: conversation,
      },
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start conversation",
      error: error.message,
    });
  }
};

// Mark all messages in a conversation as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Mark messages as read
    await ChatModel.markMessagesAsRead(conversationId, req.user._id);

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};

// Get available chat contacts based on user role
const getContactsList = async (req, res) => {
  try {
    const userRole = req.user.role;
    let contacts = [];

    // Helper function to get admin users for support
    const getAdminSupport = async () => {
      const admins = await User.find({ role: "admin" });
      return admins.map((admin) => ({
        userId: admin._id,
        name: admin.name,
        role: admin.role,
        category: "Support",
      }));
    };

    switch (userRole) {
      case "buyer":
        // Buyers can chat with sellers of properties they've purchased and their agents
        const buyerProperties = await PropertyModel.getBuyerProperties(
          req.user._id
        );

        for (const property of buyerProperties) {
          // Add seller
          if (property.sellerId) {
            const seller = await User.findById(property.sellerId);
            if (seller) {
              contacts.push({
                userId: seller._id,
                name: seller.name,
                role: seller.role,
                propertyId: property._id,
                propertyTitle: property.title,
              });
            }
          }

          // Add agent
          if (property.agent) {
            const agent = await mongoose
              .model("Agent")
              .findById(property.agent)
              .populate("userId");
            if (agent && agent.userId) {
              contacts.push({
                userId: agent.userId._id,
                name: agent.userId.name,
                role: agent.userId.role,
                propertyId: property._id,
                propertyTitle: property.title,
              });
            }
          }
        }

        // Buyers can also contact admins for support
        const buyerAdmins = await getAdminSupport();
        contacts = contacts.concat(buyerAdmins);
        break;

      case "seller":
        // Sellers can chat with buyers of their properties and their agents
        const sellerProperties = await PropertyModel.getPropertiesBySeller(
          req.user._id
        );

        for (const property of sellerProperties) {
          // Add buyer
          if (property.buyerId) {
            const buyer = await User.findById(property.buyerId);
            if (buyer) {
              contacts.push({
                userId: buyer._id,
                name: buyer.name,
                role: buyer.role,
                propertyId: property._id,
                propertyTitle: property.title,
              });
            }
          }

          // Add agent
          if (property.agent) {
            const agent = await mongoose
              .model("Agent")
              .findById(property.agent)
              .populate("userId");
            if (agent && agent.userId) {
              contacts.push({
                userId: agent.userId._id,
                name: agent.userId.name,
                role: agent.userId.role,
                propertyId: property._id,
                propertyTitle: property.title,
              });
            }
          }
        }

        // Sellers can also contact admins for support
        const sellerAdmins = await getAdminSupport();
        contacts = contacts.concat(sellerAdmins);
        break;

      case "agent":
        // Agents can chat with buyers and sellers of properties they manage
        const agentInfo = await mongoose
          .model("Agent")
          .findOne({ userId: req.user._id });

        if (agentInfo) {
          const agentProperties = await PropertyModel.getAgentProperties(
            agentInfo._id
          );

          for (const property of agentProperties) {
            // Add seller
            if (property.sellerId) {
              const seller = await User.findById(property.sellerId);
              if (seller) {
                contacts.push({
                  userId: seller._id,
                  name: seller.name,
                  role: seller.role,
                  propertyId: property._id,
                  propertyTitle: property.title,
                });
              }
            }

            // Add buyer if the property is sold/rented
            if (property.buyerId) {
              const buyer = await User.findById(property.buyerId);
              if (buyer) {
                contacts.push({
                  userId: buyer._id,
                  name: buyer.name,
                  role: buyer.role,
                  propertyId: property._id,
                  propertyTitle: property.title,
                });
              }
            }
          }
        }

        // Agents can also chat with admins
        const admins = await getAdminSupport();
        contacts = contacts.concat(admins);
        break;

      case "admin":
        // Admins can chat with everyone
        const allUsers = await User.find({ _id: { $ne: req.user._id } });
        contacts = allUsers.map((user) => ({
          userId: user._id,
          name: user.name,
          role: user.role,
        }));
        break;
    }

    // Remove duplicates by userId
    const uniqueContacts = contacts.filter(
      (contact, index, self) =>
        index ===
        self.findIndex((c) => c.userId.toString() === contact.userId.toString())
    );

    res.json({
      success: true,
      contacts: uniqueContacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
      error: error.message,
    });
  }
};

module.exports = {
  getAllConversations,
  getConversation,
  getConversationAjax,
  sendMessage,
  startNewConversation,
  markMessagesAsRead,
  getContactsList,
};
