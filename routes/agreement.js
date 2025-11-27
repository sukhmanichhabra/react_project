const express = require('express');
const router = express.Router();
const agreementController = require('../controllers/agreement');
const { requireAuth } = require('../middleware/auth');

const requireBuyer = (req, res, next) => {
  if (!req.user || req.user.role !== 'buyer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only buyers can perform this action.',
    });
  }
  next();
};

const requireSeller = (req, res, next) => {
  if (!req.user || req.user.role !== 'seller') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only sellers can perform this action.',
    });
  }
  next();
};

router.post(
  '/rent/:propertyId',
  requireAuth,
  requireBuyer,
  agreementController.createRentAgreement,
);

router.get(
  '/buyer',
  requireAuth,
  requireBuyer,
  agreementController.getBuyerAgreements,
);

router.get(
  '/seller',
  requireAuth,
  requireSeller,
  agreementController.getSellerAgreements,
);

router.post(
  '/:agreementId/approve',
  requireAuth,
  requireSeller,
  agreementController.approveAgreement,
);

router.post(
  '/:agreementId/reject',
  requireAuth,
  requireSeller,
  agreementController.rejectAgreement,
);

router.get(
  '/property/:propertyId',
  requireAuth,
  agreementController.getAgreementForProperty,
);

module.exports = router;
