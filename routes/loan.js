const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const loanController = require("../controllers/loan");
const { loanDocumentUpload } = require("../config/cloudinary");

// Configure multer fields for different document types with Cloudinary
const documentUpload = loanDocumentUpload.fields([
  { name: "identityProof", maxCount: 1 },
  { name: "addressProof", maxCount: 1 },
  { name: "incomeProof", maxCount: 1 },
  { name: "propertyDocuments", maxCount: 1 },
  { name: "bankStatements", maxCount: 1 },
  { name: "additionalDocs", maxCount: 3 },
]);

// Render loan EMI calculator page
router.get("/emi-calculator", loanController.getEmiCalculator);

// Submit loan application form
router.post(
  "/apply",
  requireAuth,
  documentUpload,
  loanController.submitLoanApplication
);

// Get loan applications for logged in user
router.get("/my-applications", requireAuth, loanController.getMyApplications);

// Get all loan applications (admin only)
router.get(
  "/admin/applications",
  requireAuth,
  loanController.getAdminApplications
);

// Update loan application status
router.put(
  "/admin/applications/:id/status",
  requireAuth,
  loanController.updateApplicationStatus
);

// Get loan application details
router.get(
  "/applications/:id",
  requireAuth,
  loanController.getApplicationDetails
);

// Route to view all EMI payments for a user
router.get("/my-emis", requireAuth, loanController.getMyEmis);

// Generate EMI schedule for an approved loan
router.post(
  "/generate-emi-schedule/:loanId",
  requireAuth,
  loanController.generateEmiSchedule
);

// Pay EMI
router.post("/pay-emi/:emiId", requireAuth, loanController.payEmi);

// Get all pending EMIs for a user
router.get("/pending-emis", requireAuth, loanController.getPendingEmis);

// Check if user has any approved loans
router.get("/has-approved-loans", requireAuth, loanController.hasApprovedLoans);

// Get overdue EMIs
router.get("/overdue-emis", requireAuth, loanController.getOverdueEmis);

// Get EMI summary for user
router.get("/emi-summary", requireAuth, loanController.getEmiSummary);

// Get loan summary
router.get("/loan-summary/:loanId", requireAuth, loanController.getLoanSummary);

// Get missed EMIs
router.get("/missed-emis", requireAuth, loanController.getMissedEmis);

// Get full EMI schedule for a loan
router.get("/emi-schedule/:loanId", requireAuth, loanController.getEmiSchedule);

// Admin route to check all missed payments
router.get(
  "/check-missed-payments",
  adminAuth,
  loanController.checkMissedPayments
);

module.exports = router;
