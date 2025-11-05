const express = require("express");
const router = express.Router();
const propertyApprovalController = require("../controllers/propertyApproval");
const { requireAuth } = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// Middleware to check if user is an admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only admins can approve properties.",
    });
  }
  next();
};

// Property approval routes (admin only)
router.post(
  "/approve/:id",
  requireAuth,
  requireAdmin,
  propertyApprovalController.approveProperty
);
router.post(
  "/reject/:id",
  requireAuth,
  requireAdmin,
  propertyApprovalController.rejectProperty
);

module.exports = router;
