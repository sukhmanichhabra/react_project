const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const activityController = require("../controllers/activity");

// ----- Admin Log Page Route -----

// Activity log page
router.get("/log", requireAuth, adminAuth, activityController.getActivityLog);

// Get individual activity details
router.get(
  "/api/activity/:id",
  requireAuth,
  adminAuth,
  activityController.getActivityDetails
);

// ----- API Routes for Logging Activity -----

// Log a client-side activity
router.post("/log", activityController.logActivity);

// ----- Admin Analytics Routes -----

// Analytics dashboard
router.get(
  "/analytics",
  requireAuth,
  adminAuth,
  activityController.getAnalyticsDashboard
);

// Property analytics
router.get(
  "/property/:id",
  requireAuth,
  adminAuth,
  activityController.getPropertyAnalytics
);

// Agent analytics
router.get(
  "/agent/:id",
  requireAuth,
  adminAuth,
  activityController.getAgentAnalytics
);

// Advertisement analytics
router.get(
  "/advertisement/:id",
  requireAuth,
  adminAuth,
  activityController.getAdvertisementAnalytics
);

// User activity timeline
router.get(
  "/user/:id",
  requireAuth,
  adminAuth,
  activityController.getUserActivityTimeline
);

// ----- API Routes for Analytics -----

// Get user engagement metrics
router.get(
  "/api/metrics",
  requireAuth,
  adminAuth,
  activityController.getUserEngagementMetrics
);

// Get most viewed properties
router.get(
  "/api/properties/most-viewed",
  requireAuth,
  adminAuth,
  activityController.getMostViewedProperties
);

// Get property view statistics
router.get(
  "/api/property/:id/stats",
  requireAuth,
  adminAuth,
  activityController.getPropertyViewStats
);

// Get most viewed agents
router.get(
  "/api/agents/most-viewed",
  requireAuth,
  adminAuth,
  activityController.getMostViewedAgents
);

// Get agent view statistics
router.get(
  "/api/agent/:id/stats",
  requireAuth,
  adminAuth,
  activityController.getAgentViewStats
);

// Get most clicked advertisements
router.get(
  "/api/advertisements/most-clicked",
  requireAuth,
  adminAuth,
  activityController.getMostClickedAdvertisements
);

// Get advertisement click statistics
router.get(
  "/api/advertisement/:id/stats",
  requireAuth,
  adminAuth,
  activityController.getAdvertisementClickStats
);

// Get daily active users
router.get(
  "/api/users/daily-active",
  requireAuth,
  adminAuth,
  activityController.getDailyActiveUsers
);

// Get user timeline
router.get(
  "/api/user/:id/timeline",
  requireAuth,
  adminAuth,
  activityController.getUserTimeline
);

// Get user preferences
router.get(
  "/api/user/:id/preferences",
  requireAuth,
  adminAuth,
  activityController.getUserPreferences
);

// Get user authentication statistics
router.get(
  "/api/auth/stats",
  requireAuth,
  adminAuth,
  activityController.getUserAuthStats
);

// Authentication Activity Dashboard
router.get(
  "/auth",
  requireAuth,
  adminAuth,
  activityController.getAuthDashboard
);

// Export middleware for use in app.js
router.trackPageView = activityController.trackPageView;
router.extractDeviceInfo = activityController.extractDeviceInfo;

module.exports = router;
