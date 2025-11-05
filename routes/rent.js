const express = require("express");
const router = express.Router();
const rentController = require("../controllers/rent");
const { requireAuth, requireBuyer } = require("../middleware/auth");

// Middleware to check if user is a seller
const requireSeller = (req, res, next) => {
  if (!req.user || req.user.role !== "seller") {
    return res.status(403).render("error", {
      message: "Access denied. Only sellers can access this page.",
    });
  }
  next();
};

// Rent payment routes (buyer)
router.get("/", requireAuth, requireBuyer, rentController.getRentPaymentPage);
router.post("/pay/:rentId", requireAuth, requireBuyer, rentController.payRent);

// Dashboard rented properties routes
router.get("/buyer-rented", requireAuth, requireBuyer, rentController.getBuyerRentedProperties);
router.get("/seller-rented", requireAuth, requireSeller, rentController.getSellerRentedProperties);
router.post("/cancel-by-buyer/:propertyId", requireAuth, requireBuyer, rentController.cancelRentalAgreementByBuyer);

// Seller property management routes
router.get(
  "/my-properties",
  requireAuth,
  requireSeller,
  rentController.getSellerProperties
);
router.post(
  "/generate/:propertyId",
  requireAuth,
  rentController.generateRentPayment
);
router.get(
  "/property/:propertyId/manage",
  requireAuth,
  rentController.getManageRentPage
);
router.post(
  "/settings/:propertyId",
  requireAuth,
  requireSeller,
  rentController.updateRentSettings
);
router.post(
  "/cancel-agreement/:propertyId",
  requireAuth,
  requireSeller,
  rentController.cancelRentalAgreement
);

// General rent record routes
router.get("/details/:rentId", requireAuth, rentController.getRentDetails);

module.exports = router;
