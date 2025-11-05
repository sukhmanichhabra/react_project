const mongoose = require('mongoose');
const PropertyModel = require('./property');
const User = require('./user');
const TransactionModel = require('./transaction');

// Rent Schema
const rentSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Property ID is required']
    },
    propertyTitle: {
        type: String,
        required: [true, 'Property title is required']
    },
    propertyImage: {
        type: String
    },
    renterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Renter ID is required']
    },
    renterName: {
        type: String,
        required: [true, 'Renter name is required']
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner ID is required']
    },
    ownerName: {
        type: String,
        required: [true, 'Owner name is required']
    },
    amount: {
        type: Number,
        required: [true, 'Rent amount is required']
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    paidDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['account', 'credit_card', 'bank_transfer'],
        default: 'account'
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Rent = mongoose.model('Rent', rentSchema);

// Rent Model functions
const RentModel = {
    // Create a new rent record
    createRent: async (rentData, session = null) => {
        try {
            const rentDoc = new Rent(rentData);
            if (session) {
                return await rentDoc.save({ session });
            }
            return await rentDoc.save();
        } catch (error) {
            console.error('Error creating rent record:', error);
            throw error;
        }
    },

    // Get all rent records
    getAllRents: async () => {
        try {
            return await Rent.find({}).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error getting all rent records:', error);
            return [];
        }
    },

    // Get rent record by ID
    getRentById: async (id) => {
        try {
            return await Rent.findById(id);
        } catch (error) {
            console.error('Error getting rent record by ID:', error);
            return null;
        }
    },

    // Get rent records by renter ID
    getRentsByRenterId: async (renterId) => {
        try {
            return await Rent.find({ renterId }).sort({ dueDate: -1 });
        } catch (error) {
            console.error('Error getting rent records by renter ID:', error);
            return [];
        }
    },

    // Get rent records by owner ID
    getRentsByOwnerId: async (ownerId) => {
        try {
            return await Rent.find({ ownerId }).sort({ dueDate: -1 });
        } catch (error) {
            console.error('Error getting rent records by owner ID:', error);
            return [];
        }
    },

    // Get rent records by property ID
    getRentsByPropertyId: async (propertyId) => {
        try {
            return await Rent.find({ propertyId }).sort({ dueDate: -1 });
        } catch (error) {
            console.error('Error getting rent records by property ID:', error);
            return [];
        }
    },

    // Get rent records with status
    getRentsByStatus: async (status) => {
        try {
            return await Rent.find({ status }).sort({ dueDate: -1 });
        } catch (error) {
            console.error('Error getting rent records by status:', error);
            return [];
        }
    },

    // Get overdue rent records
    getOverdueRents: async () => {
        try {
            const currentDate = new Date();
            return await Rent.find({
                status: 'pending',
                dueDate: { $lt: currentDate }
            }).sort({ dueDate: 1 });
        } catch (error) {
            console.error('Error getting overdue rent records:', error);
            return [];
        }
    },

    // Get upcoming rent records for a renter
    getUpcomingRentsByRenterId: async (renterId) => {
        try {
            const currentDate = new Date();
            return await Rent.find({
                renterId,
                status: 'pending',
                dueDate: { $gte: currentDate }
            }).sort({ dueDate: 1 });
        } catch (error) {
            console.error('Error getting upcoming rent records by renter ID:', error);
            return [];
        }
    },

    // Generate next rent payment for a property
    generateNextRentPayment: async (propertyId) => {
        try {
            // Get property details
            const property = await PropertyModel.getPropertyById(propertyId);
            if (!property) {
                throw new Error('Property not found');
            }

            // Verify it's a rental property with an active renter
            if (property.tag !== 'rent' || property.status !== 'rented' || !property.buyerId) {
                throw new Error('Property is not an active rental');
            }

            // Get renter and owner details
            const renter = await User.findById(property.buyerId);
            const owner = await User.findById(property.sellerId);
            if (!renter || !owner) {
                throw new Error('Renter or owner not found');
            }

            // Calculate next due date (1 month from now)
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + 1);
            
            // Extract rent amount from property price (remove non-numeric characters)
            const rentAmount = parseFloat(property.price.replace(/[^0-9.-]+/g, ""));
            if (isNaN(rentAmount)) {
                throw new Error('Invalid rent amount');
            }

            // Create rent data
            const rentData = {
                propertyId: property._id,
                propertyTitle: property.title,
                propertyImage: property.images && property.images.length > 0 ? property.images[0] : null,
                renterId: renter._id,
                renterName: renter.name,
                ownerId: owner._id,
                ownerName: owner.name,
                amount: rentAmount,
                dueDate: dueDate,
                status: 'pending'
            };

            // Create and return the rent record
            return await RentModel.createRent(rentData);
        } catch (error) {
            console.error('Error generating next rent payment:', error);
            throw error;
        }
    },

    // Pay rent
    payRent: async (rentId, renterId, paymentMethod = 'account') => {
        try {
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // Get rent details
                const rent = await Rent.findById(rentId).session(session);
                if (!rent) {
                    throw new Error('Rent record not found');
                }

                // Verify rent belongs to the renter
                if (rent.renterId.toString() !== renterId.toString()) {
                    throw new Error('Unauthorized to pay this rent');
                }

                // Verify rent is not already paid
                if (rent.status === 'paid') {
                    throw new Error('Rent has already been paid');
                }

                // Get renter and owner
                const renter = await User.findById(renterId).session(session);
                const owner = await User.findById(rent.ownerId).session(session);
                if (!renter || !owner) {
                    throw new Error('Renter or owner not found');
                }

                // Check if renter has enough balance
                if (renter.accountBalance < rent.amount) {
                    throw new Error('Insufficient funds to pay rent');
                }

                // Update renter's balance
                renter.accountBalance -= rent.amount;
                await renter.save({ session });

                // Update owner's balance (95% of the rent amount - 5% platform fee)
                const ownerAmount = rent.amount * 0.95;
                owner.accountBalance = (owner.accountBalance || 0) + ownerAmount;
                await owner.save({ session });

                // Update rent record
                rent.status = 'paid';
                rent.paidDate = new Date();
                rent.paymentMethod = paymentMethod;
                await rent.save({ session });

                // Find admin for platform fee
                const admin = await User.findOne({ role: 'admin' }).session(session);
                if (admin) {
                    // Admin gets 5% commission
                    const adminCommission = rent.amount * 0.05;
                    admin.accountBalance = (admin.accountBalance || 0) + adminCommission;
                    await admin.save({ session });
                }
                
                // Create transaction record for rent payment
                await TransactionModel.createTransaction({
                    propertyId: rent.propertyId,
                    propertyTitle: rent.propertyTitle,
                    propertyImage: rent.propertyImage,
                    sellerId: rent.ownerId,
                    sellerName: rent.ownerName,
                    buyerId: rent.renterId,
                    buyerName: rent.renterName,
                    amount: `$${rent.amount.toFixed(2)}`,
                    type: 'rent',
                    propertyAddress: await getPropertyAddress(rent.propertyId),
                    status: 'completed',
                    date: new Date(),
                    paymentMethod: paymentMethod,
                    details: 'Monthly rent payment',
                    transactionDetails: {
                        totalAmount: rent.amount,
                        sellerAmount: ownerAmount,
                        adminCommission: admin ? rent.amount * 0.05 : 0,
                        agentCommission: 0
                    }
                }, session);

                await session.commitTransaction();
                return rent;
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } catch (error) {
            console.error('Error paying rent:', error);
            throw error;
        }
    },

    // Check for overdue rents and update status
    updateOverdueRents: async () => {
        try {
            const currentDate = new Date();
            const result = await Rent.updateMany(
                {
                    status: 'pending',
                    dueDate: { $lt: currentDate }
                },
                {
                    $set: { status: 'overdue' }
                }
            );
            return result.nModified;
        } catch (error) {
            console.error('Error updating overdue rents:', error);
            return 0;
        }
    },

    // Check if a property has any pending or overdue rent
    hasRentDue: async (propertyId) => {
        try {
            const count = await Rent.countDocuments({
                propertyId,
                status: { $in: ['pending', 'overdue'] }
            });
            return count > 0;
        } catch (error) {
            console.error('Error checking for rent due:', error);
            return false;
        }
    },
    
    // Update multiple rent records
    updateMany: async (filter, update, options = {}) => {
        try {
            return await Rent.updateMany(filter, update, options);
        } catch (error) {
            console.error('Error updating multiple rent records:', error);
            throw error;
        }
    }
};

// Helper function to get property address
async function getPropertyAddress(propertyId) {
    try {
        const property = await PropertyModel.getPropertyById(propertyId);
        return property ? property.location : 'Unknown location';
    } catch (error) {
        console.error('Error getting property address:', error);
        return 'Unknown location';
    }
}

module.exports = RentModel; 