const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const chatController = require("../controllers/chat");

// Get all conversations for the current user
router.get("/", requireAuth, chatController.getAllConversations);

// Get a specific conversation with messages
router.get("/:conversationId", requireAuth, chatController.getConversation);

// Get a specific conversation with messages (AJAX version)
router.get(
  "/:conversationId/ajax",
  requireAuth,
  chatController.getConversationAjax
);

// Send a message in an existing conversation
router.post("/:conversationId/send", requireAuth, chatController.sendMessage);

// Start a new conversation
router.post("/new", requireAuth, chatController.startNewConversation);

// Mark all messages in a conversation as read
router.post(
  "/:conversationId/mark-read",
  requireAuth,
  chatController.markMessagesAsRead
);

// Get available chat contacts based on user role
router.get("/contacts/list", requireAuth, chatController.getContactsList);

module.exports = router;
