const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const visitController = require("../controllers/visit");

// Get schedule visit page for buyers
router.get(
  "/schedule",
  requireAuth,
  visitController.requireBuyer,
  visitController.getSchedulePage
);

// Get schedule visit page for a specific property
router.get(
  "/schedule/:propertyId",
  requireAuth,
  visitController.requireBuyer,
  visitController.getScheduleForProperty
);

// Create a new visit request
router.post(
  "/schedule",
  requireAuth,
  visitController.requireBuyer,
  visitController.scheduleVisit
);

// Get all visits for the logged-in buyer
router.get(
  "/my-visits",
  requireAuth,
  visitController.requireBuyer,
  visitController.getMyVisits
);

// Cancel a visit (buyer)
router.post(
  "/cancel/:visitId",
  requireAuth,
  visitController.requireBuyer,
  visitController.cancelVisit
);

// AGENT ROUTES

// Get agent dashboard for visits (HTML page)
router.get(
  "/agent",
  requireAuth,
  visitController.requireAgent,
  visitController.getAgentDashboard
);

// Get agent visits (JSON API for React)
router.get(
  "/agent-visits",
  requireAuth,
  visitController.requireAgent,
  visitController.getAgentVisitsAPI
);

// Get available time slots (JSON API)
router.get(
  "/available-slots",
  visitController.getAvailableSlotsAPI
);

// Approve a visit request (agent)
router.post(
  "/approve/:visitId",
  requireAuth,
  visitController.requireAgent,
  visitController.approveVisit
);

// Reject a visit request (agent)
router.post(
  "/reject/:visitId",
  requireAuth,
  visitController.requireAgent,
  visitController.rejectVisit
);

// Mark a visit as completed (agent)
router.post(
  "/complete/:visitId",
  requireAuth,
  visitController.requireAgent,
  visitController.completeVisit
);

// Get time slots API (used by the scheduling form)
router.get("/api/time-slots", visitController.getTimeSlots);

// Admin route to manually trigger auto-completion of past visits
router.post(
  "/api/process-overdue",
  requireAuth,
  visitController.processOverdueVisits
);

module.exports = router;
