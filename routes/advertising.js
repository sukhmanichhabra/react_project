const express = require("express");
const router = express.Router();
const advertisingController = require("../controllers/advertising");
const { requireAuth, requireSeller } = require("../middleware/auth");

// Main advertising page
router.get("/", advertisingController.getAdvertisingPage);

// Advertising package management (seller only)
router.post(
  "/create",
  requireAuth,
  requireSeller,
  advertisingController.createAdvertisingPackage
);
router.get(
  "/my-packages",
  requireAuth,
  requireSeller,
  advertisingController.getMyPackages
);
router.get(
  "/advertised-properties",
  requireAuth,
  requireSeller,
  advertisingController.getAdvertisedProperties
);
router.post(
  "/cancel/:id",
  requireAuth,
  requireSeller,
  advertisingController.cancelPackage
);

// Advertisement viewing and tracking
router.get("/:id", advertisingController.getAdvertisementById);
router.post("/click/:id", advertisingController.trackAdvertisementClick);

module.exports = router;
