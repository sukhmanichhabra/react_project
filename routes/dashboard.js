const express = require("express");
const router = express.Router();
const { requireAuth, requireSeller } = require("../middleware/auth");
const dashboardController = require("../controllers/dashboard");
const multer = require("multer");
const path = require("path");

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/profiles");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

// Dashboard route
router.get("/", requireAuth, dashboardController.getDashboard);

// Update profile route
router.post(
  "/update-profile",
  requireAuth,
  upload.single("profileImage"),
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

module.exports = router;
