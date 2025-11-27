const { AgreementModel, PropertyModel, UserModel } = require('../models');

exports.createRentAgreement = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const {
      startDate,
      months,
      monthlyRent,
      securityDeposit,
      maintenance,
      tenantName,
      tenantPhone,
      tenantMaritalStatus,
      tenantGovtIdType,
      tenantGovtIdNumber,
    } = req.body;

    const property = await PropertyModel.getPropertyById(propertyId);
    if (!property || property.tag !== 'rent' || property.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for rent agreement',
      });
    }

    const seller = await UserModel.findById(property.sellerId);
    const buyer = await UserModel.findById(req.user._id);

    if (!seller || !buyer) {
      return res.status(400).json({
        success: false,
        message: 'Seller or buyer not found',
      });
    }

    const existingActive = await AgreementModel.getActiveAgreementForPropertyAndBuyer(
      propertyId,
      buyer._id,
    );

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active agreement for this property',
      });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const m = parseInt(months, 10) || 12;
    const end = new Date(start);
    end.setMonth(end.getMonth() + m);

    // Determine monthly rent: prefer explicit value, otherwise property rent settings or price
    let rentAmount = null;

    if (monthlyRent !== undefined && monthlyRent !== null && monthlyRent !== "") {
      const parsed = parseFloat(monthlyRent);
      if (!Number.isNaN(parsed)) {
        rentAmount = parsed;
      }
    }

    if (rentAmount === null && property.rentSettings && property.rentSettings.amount) {
      rentAmount = parseFloat(property.rentSettings.amount) || null;
    }

    if (rentAmount === null && property.price) {
      const numericPrice = parseFloat(
        String(property.price).replace(/[^0-9.-]+/g, ""),
      );
      if (!Number.isNaN(numericPrice)) {
        rentAmount = numericPrice;
      }
    }

    const agreementData = {
      propertyId: property._id,
      propertyTitle: property.title,
      propertyImage:
        property.images && property.images.length > 0
          ? property.images[0]
          : null,
      type: 'rent',
      sellerId: seller._id,
      sellerName: seller.name,
      sellerEmail: seller.email,
      sellerPhone: seller.phone,
      buyerId: buyer._id,
      buyerName: tenantName || buyer.name,
      buyerEmail: buyer.email,
      buyerPhone: tenantPhone || buyer.phone,
      buyerMaritalStatus: tenantMaritalStatus || "",
      buyerGovtIdType: tenantGovtIdType || "",
      buyerGovtIdNumber: tenantGovtIdNumber || "",
      monthlyRent: rentAmount || 0,
      securityDeposit: parseFloat(securityDeposit) || 0,
      maintenance: parseFloat(maintenance) || 0,
      startDate: start,
      endDate: end,
      lockInEndDate: end,
      status: 'pending_seller_approval',
      buyerSignedAt: new Date(),
    };

    const agreement = await AgreementModel.createAgreement(agreementData);

    return res.json({
      success: true,
      data: agreement,
    });
  } catch (error) {
    console.error('Error creating rent agreement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create rent agreement',
      error: error.message,
    });
  }
};

exports.getBuyerAgreements = async (req, res) => {
  try {
    const agreements = await AgreementModel.getAgreementsByBuyer(req.user._id);
    return res.json({ success: true, data: agreements });
  } catch (error) {
    console.error('Error fetching buyer agreements:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load agreements',
      error: error.message,
    });
  }
};

exports.getSellerAgreements = async (req, res) => {
  try {
    const agreements = await AgreementModel.getAgreementsBySeller(req.user._id);
    return res.json({ success: true, data: agreements });
  } catch (error) {
    console.error('Error fetching seller agreements:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load agreements',
      error: error.message,
    });
  }
};

exports.approveAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const agreement = await AgreementModel.getAgreementById(agreementId);

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found',
      });
    }

    if (
      agreement.sellerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to approve this agreement',
      });
    }

    const property = await PropertyModel.getPropertyById(agreement.propertyId);
    if (!property || property.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for this agreement',
      });
    }

    const updated = await AgreementModel.markApproved(agreementId);

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error approving agreement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve agreement',
      error: error.message,
    });
  }
};

exports.rejectAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { reason } = req.body;
    const agreement = await AgreementModel.getAgreementById(agreementId);

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found',
      });
    }

    if (
      agreement.sellerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this agreement',
      });
    }

    const updated = await AgreementModel.markRejected(agreementId, reason);

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error rejecting agreement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject agreement',
      error: error.message,
    });
  }
};

exports.getAgreementForProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const agreement =
      await AgreementModel.getLatestAgreementForPropertyAndUser(
        propertyId,
        req.user._id,
      );

    if (!agreement) {
      return res.json({ success: true, data: null });
    }

    return res.json({ success: true, data: agreement });
  } catch (error) {
    console.error('Error fetching agreement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load agreement',
      error: error.message,
    });
  }
};
