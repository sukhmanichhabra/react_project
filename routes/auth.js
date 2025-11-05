const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// Authentication routes - Only API routes, no page rendering
// router.get("/signin", authController.getSignin); // Removed - handled by React
router.post("/signin", authController.postSignin);
router.post("/verify-2fa", authController.postVerify2FA);

// router.get("/signup", authController.getSignup); // Removed - handled by React
router.post("/signup", authController.postSignup);

router.get("/logout", authController.logout);

// 2FA routes
router.get("/setup-2fa", authController.getSetup2FA);
router.post("/enable-2fa", authController.postEnable2FA);
router.post("/disable-2fa", authController.postDisable2FA);

module.exports = router;
