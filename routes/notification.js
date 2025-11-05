const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const notificationController = require("../controllers/notification");

// Test route to create sample notifications of all types
router.get(
  "/create-test-all",
  requireAuth,
  notificationController.createTestAll
);

// Get all notifications for the logged-in user
router.get("/", requireAuth, notificationController.getAllNotifications);

// Mark a notification as read
router.post("/:id/mark-read", requireAuth, notificationController.markAsRead);

// Mark all notifications as read
router.post(
  "/mark-all-read",
  requireAuth,
  notificationController.markAllAsRead
);

// Delete a notification
router.delete("/:id", requireAuth, notificationController.deleteNotification);

// Test route to create a notification
router.get("/create-test", requireAuth, notificationController.createTest);

module.exports = router;
