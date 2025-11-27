const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  propertyTitle: {
    type: String,
    required: true,
  },
  propertyImage: {
    type: String,
  },
  type: {
    type: String,
    enum: ['rent', 'sale'],
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sellerName: String,
  sellerEmail: String,
  sellerPhone: String,
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  buyerName: String,
  buyerEmail: String,
  buyerPhone: String,
  buyerMaritalStatus: String,
  buyerGovtIdType: String,
  buyerGovtIdNumber: String,
  monthlyRent: Number,
  securityDeposit: Number,
  maintenance: Number,
  startDate: Date,
  endDate: Date,
  lockInEndDate: Date,
  status: {
    type: String,
    enum: [
      'pending_seller_approval',
      'active',
      'rejected',
      'cancelled',
      'expired',
    ],
    default: 'pending_seller_approval',
  },
  notes: String,
  rejectionReason: String,
  buyerSignedAt: Date,
  sellerSignedAt: Date,
}, { timestamps: true });

const Agreement = mongoose.model('Agreement', agreementSchema);

const AgreementModel = {
  createAgreement: async (data) => {
    const doc = new Agreement(data);
    return await doc.save();
  },

  getAgreementById: async (id) => {
    return await Agreement.findById(id);
  },

  getActiveAgreementForPropertyAndBuyer: async (propertyId, buyerId) => {
    return await Agreement.findOne({
      propertyId,
      buyerId,
      status: 'active',
    }).sort({ createdAt: -1 });
  },

  getPendingAgreementsForSeller: async (sellerId) => {
    return await Agreement.find({
      sellerId,
      status: 'pending_seller_approval',
    }).sort({ createdAt: -1 });
  },

  getAgreementsBySeller: async (sellerId) => {
    return await Agreement.find({ sellerId }).sort({ createdAt: -1 });
  },

  getAgreementsByBuyer: async (buyerId) => {
    return await Agreement.find({ buyerId }).sort({ createdAt: -1 });
  },

  getLatestAgreementForPropertyAndUser: async (propertyId, userId) => {
    return await Agreement.findOne({
      propertyId,
      $or: [{ buyerId: userId }, { sellerId: userId }],
    }).sort({ createdAt: -1 });
  },

  markApproved: async (id) => {
    return await Agreement.findByIdAndUpdate(
      id,
      {
        status: 'active',
        sellerSignedAt: new Date(),
      },
      { new: true },
    );
  },

  markRejected: async (id, reason) => {
    return await Agreement.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        rejectionReason: reason || '',
      },
      { new: true },
    );
  },

  cancelAgreementByBuyer: async (propertyId, buyerId) => {
    return await Agreement.updateMany(
      {
        propertyId,
        buyerId,
        status: { $in: ['pending_seller_approval', 'active'] },
      },
      { $set: { status: 'cancelled' } },
    );
  },

  cancelAgreementBySeller: async (propertyId, sellerId) => {
    return await Agreement.updateMany(
      {
        propertyId,
        sellerId,
        status: { $in: ['pending_seller_approval', 'active'] },
      },
      { $set: { status: 'cancelled' } },
    );
  },
};

module.exports = AgreementModel;
