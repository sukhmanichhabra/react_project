const express = require("express");
const router = express.Router();
const { requireAuth, requireSeller } = require("../middleware/auth");
const dashboardController = require("../controllers/dashboard");
const { profileUpload } = require("../config/cloudinary");

// Dashboard route
router.get("/", requireAuth, dashboardController.getDashboard);

// Update profile route
router.post(
  "/update-profile",
  requireAuth,
  profileUpload.single("profileImage"),
  dashboardController.updateProfile
);

// Debug route to check user data
router.get("/debug-user", requireAuth, dashboardController.debugUser);

// Delete agent route
router.get("/delete-agent/:id", requireAuth, dashboardController.deleteAgent);

// Get agent messages
router.get("/messages", requireAuth, dashboardController.getAgentMessages);

// Mark message as read
router.put(
  "/messages/:id/read",
  requireAuth,
  dashboardController.markMessageAsRead
);

// Mark message as replied
router.put(
  "/messages/:id/reply",
  requireAuth,
  dashboardController.replyToMessage
);

// Delete message
router.delete("/messages/:id", requireAuth, dashboardController.deleteMessage);

// Update account balance route
router.post(
  "/update-balance",
  requireAuth,
  dashboardController.updateAccountBalance
);

// Geocode address to get coordinates
router.post(
  "/geocode",
  requireAuth,
  dashboardController.geocodeAddress
);

module.exports = router;
