const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const chatbotController = require("../controllers/chatbot");

// Main chatbot page
router.get("/", chatbotController.getChatbotPage);

// Get questions by category
router.get("/category/:category", chatbotController.getQuestionsByCategory);

// Submit a question (API endpoint)
router.post("/ask", chatbotController.askQuestion);

// ADMIN ROUTES

// Admin chatbot management page
router.get("/admin", requireAuth, adminAuth, chatbotController.getAdminPage);

// Add new Q&A
router.post("/admin/add", requireAuth, adminAuth, chatbotController.addQA);

// Update existing Q&A
router.post(
  "/admin/update/:id",
  requireAuth,
  adminAuth,
  chatbotController.updateQA
);

// Get single Q&A by ID
router.get(
  "/admin/getqa/:id",
  requireAuth,
  adminAuth,
  chatbotController.getQAById
);

// Delete Q&A
router.delete(
  "/admin/delete/:id",
  requireAuth,
  adminAuth,
  chatbotController.deleteQA
);

// Get user chat sessions (for admin dashboard)
router.get(
  "/admin/sessions",
  requireAuth,
  adminAuth,
  chatbotController.getChatSessions
);

module.exports = router;
