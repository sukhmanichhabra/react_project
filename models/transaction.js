const mongoose = require('mongoose');

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    propertyTitle: {
        type: String,
        required: true
    },
    propertyImage: {
        type: String,
        default: '/images/property-placeholder.jpg'
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerName: {
        type: String,
        required: true
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyerName: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['sale', 'rent', 'rental_cancellation'],
        required: true
    },
    propertyAddress: String,
    propertyType: String,
    propertyFeatures: {
        sqft: String,
        beds: String,
        baths: String,
        kitchen: String,
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'completed'
    },
    date: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        default: 'Direct Payment'
    },
    details: {
        type: String,
        default: 'Standard transaction'
    },
    transactionDetails: {
        totalAmount: Number,
        sellerAmount: Number,
        adminCommission: Number,
        agentCommission: Number
    }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

// Transaction Model
const TransactionModel = {
    // Create a new transaction
    createTransaction: async (data, session = null) => {
        try {
            // Create transaction object
            const transaction = new Transaction({
                propertyId: data.propertyId,
                propertyTitle: data.propertyTitle,
                propertyImage: data.propertyImage || '/images/property-placeholder.jpg',
                sellerId: data.sellerId,
                sellerName: data.sellerName,
                buyerId: data.buyerId,
                buyerName: data.buyerName,
                amount: data.amount,
                type: data.type,
                propertyAddress: data.propertyAddress,
                propertyType: data.propertyType,
                propertyFeatures: data.propertyFeatures,
                status: data.status || 'completed',
                date: data.date || new Date(),
                paymentMethod: data.paymentMethod || 'Direct Payment',
                details: data.details || 'Standard transaction',
                transactionDetails: data.transactionDetails || {}
            });
            
            // Save the transaction
            if (session) {
                await transaction.save({ session });
            } else {
                await transaction.save();
            }
            
            console.log(`Transaction created: ID ${transaction._id} for property ${data.propertyTitle}`);
            return transaction;
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    },
    
    // Get all transactions
    getAllTransactions: async () => {
        try {
            return await Transaction.find({}).sort({ date: -1 });
        } catch (error) {
            console.error('Error fetching all transactions:', error);
            return [];
        }
    },
    
    // Get transaction by ID
    getTransactionById: async (id) => {
        try {
            return await Transaction.findById(id);
        } catch (error) {
            console.error('Error fetching transaction by ID:', error);
            return null;
        }
    },
    
    // Get transactions by seller ID
    getTransactionsBySeller: async (sellerId) => {
        try {
        console.log(`Fetching transactions for seller: ${sellerId}`);
            const transactions = await Transaction.find({ sellerId }).sort({ date: -1 });
            console.log(`Found ${transactions.length} transactions for seller ${sellerId}`);
            return transactions;
        } catch (error) {
            console.error('Error fetching seller transactions:', error);
            return [];
        }
    },
    
    // Get transactions by buyer ID
    getTransactionsByBuyer: async (buyerId) => {
        try {
            return await Transaction.find({ buyerId }).sort({ date: -1 });
        } catch (error) {
            console.error('Error fetching buyer transactions:', error);
            return [];
        }
    },
    
    // Get transactions by property ID
    getTransactionsByProperty: async (propertyId) => {
        try {
            return await Transaction.find({ propertyId }).sort({ date: -1 });
        } catch (error) {
            console.error('Error fetching property transactions:', error);
            return [];
        }
    },
    
    // Get seller statistics
    getSellerStats: async (sellerId) => {
        try {
            // Get all transactions for the seller
            const transactions = await Transaction.find({ sellerId });
            
            if (!transactions || transactions.length === 0) {
                return {
                    totalTransactions: 0,
                    totalAmount: '$0',
                    soldProperties: 0,
                    rentedProperties: 0
                };
            }
    
            // Sort transactions chronologically
            const chronologicalTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
            
            const propertyStates = {}; // Map: propertyId -> { lastStatus: 'sale' | 'rent' | 'cancelled_rent', lastDate: Date }
            let totalAmount = 0;
            let totalTransactionsCount = 0; // Use a separate counter for transactions to display

            chronologicalTransactions.forEach(transaction => {
                const propertyId = transaction.propertyId.toString();
                const transactionDate = new Date(transaction.date);
                let currentStatus = transaction.type;

                // Increment transaction count unless it's a $0 cancellation
                if (!(transaction.type === 'rental_cancellation' && (transaction.amount === '0' || transaction.amount === '$0' || transaction.amount === '$0.00'))) {
                    totalTransactionsCount++;
                }

                // Add to total amount
                const amount = parseFloat(String(transaction.amount).replace(/[^0-9.-]+/g, ''));
                if (!isNaN(amount)) {
                    totalAmount += amount;
                }

                // Update the latest known state of the property
                if (!propertyStates[propertyId] || transactionDate >= propertyStates[propertyId].lastDate) {
                     // Use 'cancelled_rent' to distinguish from active rent
                    if(currentStatus === 'rental_cancellation') {
                        currentStatus = 'cancelled_rent';
                    }
                    propertyStates[propertyId] = { 
                        lastStatus: currentStatus, 
                        lastDate: transactionDate 
                    };
                }
            });

            // Calculate final counts based on the latest status of each property
            let soldPropertiesCount = 0;
            let rentedPropertiesCount = 0;

            Object.values(propertyStates).forEach(state => {
                if (state.lastStatus === 'sale') {
                    soldPropertiesCount++;
                } else if (state.lastStatus === 'rent') {
                    // Property is considered rented if the last relevant transaction was 'rent'
                    rentedPropertiesCount++;
                }
                // Properties ending in 'cancelled_rent' are not counted as currently rented
            });

            // Format total amount as currency
            const formattedTotalAmount = totalAmount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });

            return {
                totalTransactions: totalTransactionsCount,
                totalAmount: formattedTotalAmount,
                soldProperties: soldPropertiesCount,
                rentedProperties: rentedPropertiesCount
            };
            
        } catch (error) {
            console.error('Error calculating seller stats:', error);
            return {
                totalTransactions: 0,
                totalAmount: '$0',
                soldProperties: 0,
                rentedProperties: 0
            };
        }
    },
    
    // Get transaction stats for all users
    getGlobalStats: async () => {
        try {
            // Get transaction counts by type
            const countStats = await Transaction.aggregate([
                { 
                    $group: {
                        _id: null,
                        totalCount: { $sum: 1 },
                        saleCount: { 
                            $sum: { 
                                $cond: [{ $eq: ["$type", "sale"] }, 1, 0] 
                            } 
                        },
                        rentCount: { 
                            $sum: { 
                                $cond: [{ $eq: ["$type", "rent"] }, 1, 0] 
                            } 
                        },
                        totalAmount: { 
                            $sum: { 
                                $toDouble: { 
                                    $replaceAll: { 
                                        input: { $replaceAll: { input: "$amount", find: "$", replace: "" } }, 
                                        find: ",", 
                                        replace: "" 
                                    } 
                                } 
                            } 
                        }
                    }
                }
            ]);
            
            // Get recent transactions
            const recentTransactions = await Transaction.find({})
                .sort({ date: -1 })
                .limit(5);
            
            // If no transactions found, return default values
            if (!countStats.length) {
                return {
                    totalTransactions: 0,
                    saleTransactions: 0,
                    rentTransactions: 0,
                    totalAmount: '$0',
                    recentTransactions: []
                };
            }
            
            // Format results
            const stats = countStats[0];
            return {
                totalTransactions: stats.totalCount,
                saleTransactions: stats.saleCount,
                rentTransactions: stats.rentCount,
                totalAmount: stats.totalAmount.toLocaleString('en-US', { 
                    style: 'currency', 
                    currency: 'USD' 
                }),
                recentTransactions
            };
        } catch (error) {
            console.error('Error calculating global stats:', error);
        return {
                totalTransactions: 0,
                saleTransactions: 0,
                rentTransactions: 0,
                totalAmount: '$0',
                recentTransactions: []
            };
        }
    }
};

module.exports = TransactionModel; 