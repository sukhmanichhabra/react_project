const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const loanController = require("../controllers/loan");

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/uploads/loans";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "loan-" + uniqueSuffix + ext);
  },
});

// File filter - allow only pdfs and images
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files and PDFs are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

// Configure multer fields for different document types
const documentUpload = upload.fields([
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
