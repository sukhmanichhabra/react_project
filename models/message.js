const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderEmail: {
      type: String,
      required: true,
    },
    senderPhone: {
      type: String,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyId: {
      type: String,
      required: true,
    },
    propertyTitle: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      default: "Property Inquiry",
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["unread", "read", "replied"],
      default: "unread",
    },
    readAt: {
      type: Date,
    },
    repliedAt: {
      type: Date,
    },
    reply: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

// Get all messages for a user (either sender or receiver)
async function getUserMessages(userId) {
  try {
    return await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error getting user messages:", error);
    return [];
  }
}

// Get all received messages for a user
async function getReceivedMessages(userId) {
  try {
    return await Message.find({ receiverId: userId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error getting received messages:", error);
    return [];
  }
}

// Get messages for a specific property
async function getPropertyMessages(propertyId) {
  try {
    return await Message.find({ propertyId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error getting property messages:", error);
    return [];
  }
}

// Get unread messages count for a user
async function getUnreadCount(userId) {
  try {
    return await Message.countDocuments({
      receiverId: userId,
      status: "unread",
    });
  } catch (error) {
    console.error("Error counting unread messages:", error);
    return 0;
  }
}

// Create a new message
async function createMessage(messageData) {
  try {
    const newMessage = new Message(messageData);
    await newMessage.save();
    return newMessage;
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
}

// Mark message as read
async function markAsRead(messageId) {
  try {
    return await Message.findByIdAndUpdate(
      messageId,
      {
        status: "read",
        readAt: new Date(),
      },
      { new: true }
    );
  } catch (error) {
    console.error("Error marking message as read:", error);
    return null;
  }
}

// Mark message as replied
async function markAsReplied(messageId, replyText) {
  try {
    return await Message.findByIdAndUpdate(
      messageId,
      {
        status: "replied",
        repliedAt: new Date(),
        reply: replyText,
      },
      { new: true }
    );
  } catch (error) {
    console.error("Error marking message as replied:", error);
    return null;
  }
}

// Delete a message
async function deleteMessage(messageId) {
  try {
    const result = await Message.findByIdAndDelete(messageId);
    return !!result;
  } catch (error) {
    console.error("Error deleting message:", error);
    return false;
  }
}

module.exports = {
  Message,
  getUserMessages,
  getReceivedMessages,
  getPropertyMessages,
  getUnreadCount,
  createMessage,
  markAsRead,
  markAsReplied,
  deleteMessage,
};
