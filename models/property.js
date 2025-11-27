const mongoose = require('mongoose');
const TransactionModel = require('./transaction');
const User = require('./user');
const AgreementModel = require('./agreement');

// Forward declarations to avoid circular dependencies
let AgentModel;
let UserModel = User;

// Property Schema
const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Property title is required'],
        trim: true
    },
    price: {
        type: String,
        required: [true, 'Price is required']
    },
    estPayment: {
        type: String
    },    location: {
        type: String,
        required: [true, 'Location is required']
    },
    geolocation: {
        latitude: {
            type: Number,
            required: false
        },
        longitude: {
            type: Number,
            required: false
        },
        address: {
            type: String,
            default: ''
        }
    },
    tag: {
        type: String,
        enum: ['sale', 'rent'],
        required: [true, 'Property type (sale/rent) is required']
    },
        features: {
        sqft: String,
        beds: String,
        baths: String,
        kitchen: String,
        type: {
            type: String,
            enum: ['Apartment', 'House', 'Villa', 'Townhouse', 'Studio', 'Loft', 'Cottage', 'Cabin'],
            required: true
        },
        yearBuilt: String,
        furnishing: String,
        parking: String,
        floor: String,
        totalFloors: String,
        facing: String
        },
    amenities: [{
        type: String
    }],
    legal: {
        propertyId: String,
        reraId: String,
        documentSummary: String
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    images: [{
        type: String
    }],
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Seller ID is required']
    },
    seller: {
        id: mongoose.Schema.Types.ObjectId,
        name: String,
        email: String,
        phone: String
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    buyer: {
        id: mongoose.Schema.Types.ObjectId,
        name: String,
        email: String,
        phone: String
    },
    status: {
        type: String,
        enum: ['active', 'sold', 'rented'],
        default: 'active'
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        default: ''
    },
    reviews: [{
        userName: String,
        rating: Number,
        title: String,
        text: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    purchaseDate: {
        type: Date
    },
    cancellationDate: {
        type: Date
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);

// Set the agent model (called from index.js to avoid circular dependency)
function setAgentModel(model) {
    AgentModel = model;
}

// Set the user model (called from index.js to avoid circular dependency)
function setUserModel(model) {
    UserModel = model;
}

// CRUD operations for properties
const PropertyModel = {
    // Get all properties
    getAllProperties: async () => {
        return await Property.find({});
    },
    
    // Get property by ID
    getPropertyById: async (id) => {
        return await Property.findById(id);
    },
    
    // Get properties by tag (sale or rent)
    getPropertiesByTag: async (tag) => {
        if (!tag || tag.toLowerCase() === 'all') {
            return await Property.find({});
        }
        return await Property.find({ tag: tag.toLowerCase() });
    },
    
    // Get all available amenities
    getAllAmenities: async () => {
        try {
            // Use distinct to get unique amenities directly from the database
            // This is more efficient than fetching all properties and then filtering
            const amenities = await Property.distinct('amenities');
            return amenities.sort();
        } catch (error) {
            console.error('Error getting all amenities:', error);
            return [];
        }
    },
    
    // Filter properties by amenities
    filterByAmenities: async (amenities) => {
        if (!amenities || !Array.isArray(amenities) || amenities.length === 0) {
            return await Property.find({});
        }
        
        return await Property.find({ amenities: { $all: amenities } });
    },
    
    // Get agent for a property
    getPropertyAgent: async function(propertyId) {
        if (!AgentModel) {
            console.warn('Agent model not set. Call setAgentModel first.');
            return null;
        }
        
        try {
            const property = await Property.findById(propertyId);
            if (!property || !property.agent) return null;
            
            return await AgentModel.Agent.findById(property.agent).populate('userId');
        } catch (error) {
            console.error('Error getting property agent:', error);
            return null;
        }
    },
    
    // Update a property's agent
    updatePropertyAgent: async function(propertyId, agentId) {
        try {
            const result = await Property.findByIdAndUpdate(
                propertyId,
                { agent: agentId },
                { new: true }
            );
            
            console.log(`Updated agent for property ${propertyId} to ${agentId}`);
            return result;
        } catch (error) {
            console.error(`Error updating agent for property ${propertyId}:`, error);
            return null;
        }
    },
    
    // Get properties for an agent
    getAgentProperties: async (agentId) => {
        if (!AgentModel) {
            console.warn('Agent model not set. Call setAgentModel first.');
            return [];
        }
        
        try {
            return await Property.find({ agent: agentId });
        } catch (error) {
            console.error('Error getting agent properties:', error);
            return [];
        }
    },
    
    // Add a new property
    addProperty: async (propertyData, sellerId) => {
        try {
            // Verify seller exists and has seller role
            const seller = await UserModel.findById(sellerId);
            if (!seller || seller.role !== 'seller') {
                throw new Error('Only sellers can list properties');
            }

            // Create property data object with seller details
            const newPropertyData = {
                ...propertyData,
                sellerId: sellerId,
                seller: {
                    id: seller._id,
                    name: seller.name,
                    email: seller.email,
                    phone: seller.phone
                },
                status: 'active',
                approvalStatus: 'pending'
            };
            
            // Create and save the new property
            const newProperty = new Property(newPropertyData);
            await newProperty.save();
            
            // Agent will be assigned after admin approval
            
            return newProperty;
        } catch (error) {
            console.error('Error adding property:', error);
            throw error;
        }
    },    // Get properties by seller ID
    getPropertiesBySeller: async (sellerId, approvalStatus = null) => {
        try {
            const query = { sellerId };
            if (approvalStatus) {
                query.approvalStatus = approvalStatus;
            }
            return await Property.find(query);
        } catch (error) {
            console.error('Error getting seller properties:', error);
            return [];
        }
    },

    // Get approved properties by seller ID for My Properties section
    getApprovedPropertiesBySeller: async (sellerId) => {
        try {
            const properties = await Property.find({ 
                sellerId, 
                approvalStatus: 'approved' 
            });
            
            // Populate agent data for each property
            const AgentModel = require('./agent');
            const propertiesWithAgents = await Promise.all(
                properties.map(async (property) => {
                    const propertyObj = property.toObject();
                    if (propertyObj.agent) {
                        try {
                            const agent = await AgentModel.getAgentById(propertyObj.agent);
                            propertyObj.agent = agent || null;
                        } catch (err) {
                            console.error(`Error fetching agent for property ${propertyObj._id}:`, err);
                            propertyObj.agent = null;
                        }
                    }
                    return propertyObj;
                })
            );
            
            return propertiesWithAgents;
        } catch (error) {
            console.error('Error getting approved seller properties:', error);
            return [];
        }
    },
    
    // Update a property
    updateProperty: async (id, updateData, userId) => {
        try {
            const property = await Property.findById(id);
            if (!property) {
                throw new Error('Property not found');
            }

            // Verify user is the seller or an admin
            const user = await UserModel.findById(userId);
            if (!user || (user.role !== 'admin' && property.sellerId.toString() !== userId.toString())) {
                throw new Error('Unauthorized to update this property');
            }

            // If we're updating images, add them to the existing array
            if (updateData.images) {
                // Either use the new images or keep the existing ones
                property.images = updateData.images;
                delete updateData.images;
            }

            // Update the property
            Object.assign(property, updateData);
            
            // Update seller info if needed
            if (property.sellerId.toString() === userId.toString()) {
                property.seller = {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                };
                }
            
            await property.save();
            return property;
        } catch (error) {
            console.error('Error updating property:', error);
            throw error;
        }
    },
    
    // Delete a property
    deleteProperty: async (id, userId) => {
        try {
            const property = await Property.findById(id);
            if (!property) {
                throw new Error('Property not found');
            }

            // Verify user is the seller or an admin
            const user = await UserModel.findById(userId);
            if (!user || (user.role !== 'admin' && property.sellerId.toString() !== userId.toString())) {
                throw new Error('Unauthorized to delete this property');
            }

            // If the property has an assigned agent, store the agent ID
            const agentId = property.agent;
            
            // Delete the property
            await Property.findByIdAndDelete(id);
            
            // If there was an agent assigned, update their listing count
            if (agentId && AgentModel) {
                await AgentModel.updateAgentListingCount(agentId);
                console.log(`Updated listing count for agent ${agentId} after property deletion`);
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting property:', error);
            throw error;
        }
    },
    
    // Add a review to a property
    addReview: async (propertyId, review) => {
        try {
            const property = await Property.findById(propertyId);
        if (!property) {
            return false;
        }
        
        // Create review object with proper structure
        const newReview = {
            userName: review.userName || 'Anonymous',
            rating: parseInt(review.rating) || 0,
            title: review.title || '',
            text: review.text || '',
            date: new Date()
        };
        
        // Add review to property
        property.reviews.unshift(newReview);
        
        // Calculate average rating
        const totalRating = property.reviews.reduce((sum, review) => sum + review.rating, 0);
        property.averageRating = totalRating / property.reviews.length;
        
            await property.save();
        return true;
        } catch (error) {
            console.error('Error adding review:', error);
            return false;
        }
    },
    
    // Get reviews for a property
    getPropertyReviews: async (propertyId) => {
        try {
            const property = await Property.findById(propertyId);
        if (!property || !property.reviews) {
            return [];
        }
        
        return property.reviews;
        } catch (error) {
            console.error('Error getting property reviews:', error);
            return [];
        }
    },
    
    // Purchase or rent a property
    purchaseProperty: async (propertyId, buyerId) => {
        try {
            // Verify buyer exists and has buyer role
            const buyer = await UserModel.findById(buyerId);
            if (!buyer || buyer.role !== 'buyer') {
                throw new Error('Only buyers can purchase properties');
            }

            const property = await Property.findById(propertyId);
            if (!property) {
                throw new Error('Property not found');
            }

            if (property.status !== 'active') {
                throw new Error('This property is no longer available');
            }

            // For rentals, enforce that an active agreement exists between buyer and seller
            if (property.tag === 'rent') {
                const activeAgreement = await AgreementModel.getActiveAgreementForPropertyAndBuyer(
                    propertyId,
                    buyerId
                );

                if (!activeAgreement) {
                    throw new Error('You must have an approved rent agreement with the owner before renting this property');
                }
            }
            
            // Get numeric price value for calculations
            const priceValue = parseFloat(property.price.replace(/[^0-9.-]+/g, ""));
            if (isNaN(priceValue)) {
                throw new Error('Invalid property price');
            }
            
            // Check if buyer has enough balance
            if (buyer.accountBalance < priceValue) {
                throw new Error('Insufficient funds to complete this purchase');
            }
            
            // Start transaction
            const session = await mongoose.startSession();
            session.startTransaction();
            
            try {
                // Find seller
                const seller = await UserModel.findById(property.sellerId);
                if (!seller) {
                    throw new Error('Seller not found');
                }
                
                // Update buyer's balance
                buyer.accountBalance -= priceValue;
                await buyer.save({ session });
                
                // Update seller's balance (94% of the sale price)
                const sellerAmount = priceValue * 0.94; // 94% after commissions
                seller.accountBalance = (seller.accountBalance || 0) + sellerAmount;
                await seller.save({ session });
                
                // Find admin user (assuming one admin in the system)
                const admin = await UserModel.findOne({ role: 'admin' });
                if (admin) {
                    // Admin gets 5% commission
                    const adminCommission = priceValue * 0.05;
                    admin.accountBalance = (admin.accountBalance || 0) + adminCommission;
                    await admin.save({ session });
                }
                
                // Find agent for this property
                let agentUser = null;
                if (property.agent) {
                    const agent = await AgentModel.Agent.findById(property.agent);
                    if (agent && agent.userId) {
                        agentUser = await UserModel.findById(agent.userId);
                        if (agentUser) {
                            // Agent gets 1% commission
                            const agentCommission = priceValue * 0.01;
                            agentUser.accountBalance = (agentUser.accountBalance || 0) + agentCommission;
                            await agentUser.save({ session });
                        }
                    }
                }

                // Update property with buyer information
                property.buyerId = buyerId;
                property.buyer = {
                    id: buyer._id,
                    name: buyer.name,
                    email: buyer.email,
                    phone: buyer.phone
                };
                property.status = property.tag === 'sale' ? 'sold' : 'rented';
                property.purchaseDate = new Date();
                await property.save({ session });
                
                // Create transaction record
                await TransactionModel.createTransaction({
                    propertyId: property._id,
                    propertyTitle: property.title,
                    propertyImage: property.images && property.images.length > 0 ? property.images[0] : null,
                    sellerId: property.sellerId,
                    sellerName: seller.name || 'Unknown Seller',
                    buyerId: buyer._id,
                    buyerName: buyer.name || 'Unknown Buyer',
                    amount: property.price,
                    type: property.tag,
                    propertyAddress: property.location,
                    propertyType: property.features.type,
                    propertyFeatures: property.features,
                    status: 'completed',
                    date: new Date(),
                    transactionDetails: {
                        totalAmount: priceValue,
                        sellerAmount: sellerAmount,
                        adminCommission: admin ? priceValue * 0.05 : 0,
                        agentCommission: agentUser ? priceValue * 0.01 : 0
                    }
                }, session);
                
                // Commit transaction
                await session.commitTransaction();
                session.endSession();

            return property;
            } catch (error) {
                // Abort transaction on error
                await session.abortTransaction();
                session.endSession();
                throw error;
            }
        } catch (error) {
            console.error('Error purchasing property:', error);
            throw error;
        }
    },
    
    // Get properties owned by a buyer
    getBuyerProperties: async (buyerId) => {
        try {
            return await Property.find({ buyerId });
        } catch (error) {
            console.error('Error getting buyer properties:', error);
            return [];
        }
    },
    
    // Get available properties (not sold or rented and approved)
    getAvailableProperties: async () => {
        try {
            return await Property.find({ 
                status: 'active',
                approvalStatus: 'approved'
            });
        } catch (error) {
            console.error('Error getting available properties:', error);
            return [];
        }
    },
    
    // Set the agent model (exposed in the module exports)
    setAgentModel,
    
    // Set the user model (exposed in the module exports)
    setUserModel,
    
    // Get all properties with pending approval status
    getPendingProperties: async () => {
        return await Property.find({ approvalStatus: 'pending' });
    },
    
    // Get all properties with rejected approval status
    getRejectedProperties: async () => {
        return await Property.find({ approvalStatus: 'rejected' });
    },
    
    // Get all approved properties
    getApprovedProperties: async () => {
        return await Property.find({ approvalStatus: 'approved' });
    },
      // Approve a property and optionally assign an agent
    approveProperty: async (propertyId, adminId, notes = '', agentId = null) => {
        try {
            // Verify admin
            const admin = await UserModel.findById(adminId);
            if (!admin || admin.role !== 'admin') {
                throw new Error('Only admins can approve properties');
            }
            
            const property = await Property.findById(propertyId);
            if (!property) {
                throw new Error('Property not found');
            }
            
            // Update approval status
            property.approvalStatus = 'approved';
            property.adminNotes = notes;
            
            // Assign agent - either provided agentId or auto-assign based on geolocation
            if (agentId) {
                // Manual agent assignment
                property.agent = agentId;
                console.log(`Manually assigned agent ${agentId} to property ${propertyId}`);
                
                // Update agent's listing count
                if (AgentModel) {
                    await AgentModel.updateAgentListingCount(agentId);
                }
            } else if (AgentModel && AgentModel.assignAgentByGeolocation) {
                // Auto-assign agent based on geolocation
                console.log('Attempting geolocation-based agent assignment...');
                
                let latitude = null;
                let longitude = null;
                
                // Check if property has geolocation coordinates
                if (property.geolocation && property.geolocation.latitude && property.geolocation.longitude) {
                    latitude = property.geolocation.latitude;
                    longitude = property.geolocation.longitude;
                    console.log(`Using property geolocation: ${latitude}, ${longitude}`);
                } else {
                    console.log('Property has no geolocation coordinates, using fallback assignment');
                }
                
                // Assign agent using geolocation (will fall back to round-robin if no coordinates)
                const assignedAgent = await AgentModel.assignAgentByGeolocation(propertyId, latitude, longitude);
                
                if (assignedAgent) {
                    property.agent = assignedAgent._id;
                    console.log(`Auto-assigned agent ${assignedAgent.name} (${assignedAgent._id}) to property ${propertyId}`);
                } else {
                    console.log('No agent could be assigned to the property');
                }
            }
            
            await property.save();
            console.log(`Property ${propertyId} approved successfully`);
            return property;
        } catch (error) {
            console.error('Error approving property:', error);
            throw error;
        }
    },
    
    // Reject a property
    rejectProperty: async (propertyId, adminId, notes = '') => {
        try {
            // Verify admin
            const admin = await UserModel.findById(adminId);
            if (!admin || admin.role !== 'admin') {
                throw new Error('Only admins can reject properties');
            }
            
            const property = await Property.findById(propertyId);
            if (!property) {
                throw new Error('Property not found');
            }
            
            // Update approval status
            property.approvalStatus = 'rejected';
            property.adminNotes = notes;
            
            await property.save();
            return property;
        } catch (error) {
            console.error('Error rejecting property:', error);
            throw error;
        }
    },
    
    // Cancel a rental agreement and revert the property back to active
    cancelRental: async (propertyId, buyerId) => {
        try {
            // Verify buyer exists and has buyer role
            const buyer = await UserModel.findById(buyerId);
            if (!buyer || buyer.role !== 'buyer') {
                throw new Error('Only buyers can cancel rental agreements');
            }

            const property = await Property.findById(propertyId);
            if (!property) {
                throw new Error('Property not found');
            }

            // Verify property is rented and by this buyer
            if (property.status !== 'rented' || property.buyerId.toString() !== buyerId.toString()) {
                throw new Error('You can only cancel agreements for properties you have rented');
            }
            
            // Verify property is a rental property
            if (property.tag !== 'rent') {
                throw new Error('Only rental properties can have agreements cancelled');
            }

            // Start transaction for the cancellation
            const session = await mongoose.startSession();
            session.startTransaction();
            
            try {
                // Update property status back to active (available for rent again)
                property.status = 'active';
                property.buyerId = null;
                property.buyer = null;
                
                // Maintain the purchase date as cancellation reference
                const cancellationDate = new Date();
                property.cancellationDate = cancellationDate;
                
                await property.save({ session });
                
                // Try to import the rent model and update any pending rents
                try {
                    const RentModel = require('./rent');
                    // Mark any pending rent as cancelled
                    await mongoose.connection.db.collection('rents').updateMany(
                        { 
                            propertyId: new mongoose.Types.ObjectId(property._id.toString()),
                            status: { $in: ['pending', 'overdue'] } 
                        },
                        {
                            $set: { 
                                status: 'cancelled',
                                notes: 'Cancelled due to agreement termination by tenant'
                            }
                        }
                    );
                } catch (rentError) {
                    console.error('Error updating rent records (non-critical):', rentError);
                    // Continue with the transaction even if this fails
                }
                
                // Record the transaction
                try {
                    await TransactionModel.createTransaction({
                        propertyId: property._id,
                        propertyTitle: property.title,
                        propertyImage: property.images && property.images.length > 0 ? property.images[0] : null,
                        sellerId: property.sellerId,
                        sellerName: property.seller ? property.seller.name : 'Unknown',
                        buyerId: buyerId,
                        buyerName: buyer ? buyer.name : 'Unknown',
                        amount: '$0.00',
                        type: 'rental_cancellation',
                        propertyAddress: property.location || 'Unknown',
                        status: 'completed',
                        date: new Date(),
                        paymentMethod: 'n/a',
                        details: 'Rental agreement cancelled by tenant',
                        transactionDetails: {
                            totalAmount: 0,
                            sellerAmount: 0,
                            adminCommission: 0,
                            agentCommission: 0
                        }
                    }, session);
                } catch (transactionError) {
                    console.error('Error creating transaction record (non-critical):', transactionError);
                    // Continue with the transaction even if this fails
                }
                
                // Commit the transaction
                await session.commitTransaction();
                session.endSession();
                
                return property;
            } catch (error) {
                // Abort transaction on error
                await session.abortTransaction();
                session.endSession();
                throw error;
            }
        } catch (error) {
            console.error('Error cancelling rental agreement:', error);
            throw error;
        }
    },

    // Get property approval statistics for the admin dashboard
    getPropertyApprovalStats: async function() {
        try {
            // Get counts of properties by approval status
            const pendingPropertiesCount = await Property.countDocuments({ approvalStatus: 'pending' });
            const approvedPropertiesCount = await Property.countDocuments({ approvalStatus: 'approved' });
            const rejectedPropertiesCount = await Property.countDocuments({ approvalStatus: 'rejected' });
            
            // Get the actual property data with populate for seller info
            const pendingProperties = await Property.find({ approvalStatus: 'pending' })
                .sort({ createdAt: -1 }) // Sort by newest first
                .limit(10); // Limit to 10 properties for performance
                
            const approvedProperties = await Property.find({ approvalStatus: 'approved' })
                .sort({ createdAt: -1 })
                .limit(10);
                
            const rejectedProperties = await Property.find({ approvalStatus: 'rejected' })
                .sort({ createdAt: -1 })
                .limit(10);
            
            // Enhance the properties with seller information
            const enhancedPendingProperties = await Promise.all(pendingProperties.map(async (property) => {
                const seller = await UserModel.findById(property.sellerId);
                return {
                    ...property.toObject(),
                    seller: seller ? {
                        name: seller.name,
                        email: seller.email,
                        phone: seller.phone || 'N/A'
                    } : null
                };
            }));
            
            const enhancedApprovedProperties = await Promise.all(approvedProperties.map(async (property) => {
                const seller = await UserModel.findById(property.sellerId);
                return {
                    ...property.toObject(),
                    seller: seller ? {
                        name: seller.name,
                        email: seller.email,
                        phone: seller.phone || 'N/A'
                    } : null
                };
            }));
            
            const enhancedRejectedProperties = await Promise.all(rejectedProperties.map(async (property) => {
                const seller = await UserModel.findById(property.sellerId);
                return {
                    ...property.toObject(),
                    seller: seller ? {
                        name: seller.name,
                        email: seller.email,
                        phone: seller.phone || 'N/A'
                    } : null
                };
            }));
            
            return {
                pendingPropertiesCount,
                approvedPropertiesCount,
                rejectedPropertiesCount,
                pendingProperties: enhancedPendingProperties,
                approvedProperties: enhancedApprovedProperties,
                rejectedProperties: enhancedRejectedProperties
            };
        } catch (error) {
            console.error('Error getting property approval stats:', error);
            return {
                pendingPropertiesCount: 0,
                approvedPropertiesCount: 0,
                rejectedPropertiesCount: 0,
                pendingProperties: [],
                approvedProperties: [],
                rejectedProperties: []
            };        }
    },
    
    // Update property geolocation coordinates
    updatePropertyGeolocation: async (propertyId, latitude, longitude, address = '') => {
        try {
            const property = await Property.findById(propertyId);
            if (!property) {
                throw new Error('Property not found');
            }
            
            property.geolocation = {
                latitude: latitude,
                longitude: longitude,
                address: address || property.geolocation?.address || ''
            };
            
            await property.save();
            console.log(`Updated geolocation for property ${propertyId}: ${latitude}, ${longitude}`);
            return property;
        } catch (error) {
            console.error('Error updating property geolocation:', error);
            throw error;
        }
    },
    
    // Batch update geolocation for multiple properties
    batchUpdateGeolocation: async (updates) => {
        try {
            const results = [];
            for (const update of updates) {
                const { propertyId, latitude, longitude, address } = update;
                try {
                    const updatedProperty = await PropertyModel.updatePropertyGeolocation(
                        propertyId, latitude, longitude, address
                    );
                    results.push({ success: true, propertyId, property: updatedProperty });
                } catch (error) {
                    results.push({ success: false, propertyId, error: error.message });
                }
            }
            return results;
        } catch (error) {
            console.error('Error in batch geolocation update:', error);
            throw error;
        }
    }
};

module.exports = PropertyModel; 