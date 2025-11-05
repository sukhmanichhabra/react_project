const mongoose = require('mongoose');

// Define the advertising schema
const advertisingSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Property ID is required']
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Seller ID is required']
    },
    packageType: {
        type: String,
        enum: ['basic', 'premium', 'featured'],
        required: [true, 'Package type is required']
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    priority: {
        type: Number,
        default: 1 // Higher number means higher priority
    },
    lastFeatured: {
        type: Date,
        default: null // Track when this property was last featured
    }
}, { timestamps: true });

// Create the Advertising model
const Advertising = mongoose.model('Advertising', advertisingSchema);

// Define the Advertising model methods
const AdvertisingModel = {
    // Create a new advertising package
    createAdvertising: async (advertisingData) => {
        try {
            // Set priority based on package type
            if (!advertisingData.priority) {
                switch (advertisingData.packageType) {
                    case 'featured':
                        advertisingData.priority = 10; // Highest priority
                        break;
                    case 'premium':
                        advertisingData.priority = 5; // Medium priority
                        break;
                    case 'basic':
                    default:
                        advertisingData.priority = 1; // Lowest priority
                        break;
                }
            }
            
            const newAdvertising = new Advertising(advertisingData);
            return await newAdvertising.save();
        } catch (error) {
            console.error('Error creating advertising package:', error);
            throw error;
        }
    },

    // Get all advertising packages for a seller
    getSellerAdvertising: async (sellerId) => {
        try {
            return await Advertising.find({ sellerId }).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error getting seller advertising packages:', error);
            throw error;
        }
    },

    // Get advertising package by ID
    getAdvertisingById: async (advertisingId) => {
        try {
            return await Advertising.findById(advertisingId);
        } catch (error) {
            console.error('Error getting advertising package by ID:', error);
            throw error;
        }
    },

    // Get advertising package for a property
    getPropertyAdvertising: async (propertyId) => {
        try {
            return await Advertising.findOne({ 
                propertyId, 
                status: 'active',
                endDate: { $gte: new Date() }
            });
        } catch (error) {
            console.error('Error getting property advertising:', error);
            throw error;
        }
    },

    // Update advertising package
    updateAdvertising: async (advertisingId, updateData) => {
        try {
            // If package type is being updated, update priority accordingly
            if (updateData.packageType && !updateData.priority) {
                switch (updateData.packageType) {
                    case 'featured':
                        updateData.priority = 10;
                        break;
                    case 'premium':
                        updateData.priority = 5;
                        break;
                    case 'basic':
                    default:
                        updateData.priority = 1;
                        break;
                }
            }
            
            return await Advertising.findByIdAndUpdate(
                advertisingId,
                updateData,
                { new: true, runValidators: true }
            );
        } catch (error) {
            console.error('Error updating advertising package:', error);
            throw error;
        }
    },

    // Cancel advertising package
    cancelAdvertising: async (advertisingId) => {
        try {
            return await Advertising.findByIdAndUpdate(
                advertisingId,
                { status: 'cancelled' },
                { new: true }
            );
        } catch (error) {
            console.error('Error cancelling advertising package:', error);
            throw error;
        }
    },

    // Check for expired advertising packages and update their status
    checkExpiredAdvertising: async () => {
        try {
            const now = new Date();
            return await Advertising.updateMany(
                { status: 'active', endDate: { $lt: now } },
                { status: 'expired' }
            );
        } catch (error) {
            console.error('Error checking expired advertising packages:', error);
            throw error;
        }
    },

    // Get featured properties for homepage
    getFeaturedProperties: async (limit = 4) => {
        try {
            // Get all active advertising packages
            const activeAds = await Advertising.find({
                status: 'active',
                endDate: { $gte: new Date() }
            }).populate('propertyId').sort({ priority: -1, lastFeatured: 1 });
            
            // Filter out any ads where propertyId is null or not active
            const validAds = activeAds.filter(ad => 
                ad.propertyId && 
                ad.propertyId.status === 'active'
            );
            
            // If we have fewer than the limit, return all of them
            if (validAds.length <= limit) {
                // Update lastFeatured for all returned ads
                const now = new Date();
                await Promise.all(validAds.map(ad => 
                    Advertising.findByIdAndUpdate(ad._id, { lastFeatured: now })
                ));
                
                return validAds.map(ad => ad.propertyId);
            }
            
            // Otherwise, use a weighted selection algorithm based on priority
            const selectedAds = [];
            const remainingAds = [...validAds];
            
            // First, always include the highest priority ads that haven't been featured recently
            remainingAds.sort((a, b) => {
                // Sort by priority (high to low)
                if (b.priority !== a.priority) return b.priority - a.priority;
                // Then by lastFeatured (oldest first, null is considered oldest)
                if (!a.lastFeatured) return -1;
                if (!b.lastFeatured) return 1;
                return a.lastFeatured - b.lastFeatured;
            });
            
            // Take the top ads based on priority and last featured time
            while (selectedAds.length < limit && remainingAds.length > 0) {
                const ad = remainingAds.shift();
                selectedAds.push(ad);
            }
            
            // Update lastFeatured for all selected ads
            const now = new Date();
            await Promise.all(selectedAds.map(ad => 
                Advertising.findByIdAndUpdate(ad._id, { lastFeatured: now })
            ));
            
            return selectedAds.map(ad => ad.propertyId);
        } catch (error) {
            console.error('Error getting featured properties:', error);
            return [];
        }
    },
    
    // Temporarily decrease priority of a property (after it's been shown)
    decreasePriority: async (advertisingId, amount = 1) => {
        try {
            const ad = await Advertising.findById(advertisingId);
            if (!ad) return null;
            
            // Calculate new priority (don't go below 1)
            const newPriority = Math.max(1, ad.priority - amount);
            
            return await Advertising.findByIdAndUpdate(
                advertisingId,
                { priority: newPriority },
                { new: true }
            );
        } catch (error) {
            console.error('Error decreasing property priority:', error);
            return null;
        }
    },
    
    // Reset priority to original value based on package type
    resetPriority: async (advertisingId) => {
        try {
            const ad = await Advertising.findById(advertisingId);
            if (!ad) return null;
            
            // Determine original priority based on package type
            let originalPriority;
            switch (ad.packageType) {
                case 'featured':
                    originalPriority = 10;
                    break;
                case 'premium':
                    originalPriority = 5;
                    break;
                case 'basic':
                default:
                    originalPriority = 1;
                    break;
            }
            
            return await Advertising.findByIdAndUpdate(
                advertisingId,
                { priority: originalPriority },
                { new: true }
            );
        } catch (error) {
            console.error('Error resetting property priority:', error);
            return null;
        }
    },

    // Get featured properties with their advertising IDs for homepage
    getFeaturedPropertiesWithAdInfo: async (limit = 4) => {
        try {
            // Get all active advertising packages
            const activeAds = await Advertising.find({
                status: 'active',
                endDate: { $gte: new Date() }
            }).populate('propertyId').sort({ priority: -1, lastFeatured: 1 });
            
            // Filter out any ads where propertyId is null or not active
            const validAds = activeAds.filter(ad => 
                ad.propertyId && 
                ad.propertyId.status === 'active'
            );
            
            // Select ads to display
            let selectedAds = [];
            
            // If we have fewer than the limit, use all of them
            if (validAds.length <= limit) {
                selectedAds = validAds;
            } else {
                // Otherwise, use a weighted selection algorithm based on priority
                const remainingAds = [...validAds];
                
                // Sort by priority and lastFeatured
                remainingAds.sort((a, b) => {
                    // Sort by priority (high to low)
                    if (b.priority !== a.priority) return b.priority - a.priority;
                    // Then by lastFeatured (oldest first, null is considered oldest)
                    if (!a.lastFeatured) return -1;
                    if (!b.lastFeatured) return 1;
                    return a.lastFeatured - b.lastFeatured;
                });
                
                // Take the top ads based on priority and last featured time
                while (selectedAds.length < limit && remainingAds.length > 0) {
                    const ad = remainingAds.shift();
                    selectedAds.push(ad);
                }
            }
            
            // Update lastFeatured for all selected ads
            const now = new Date();
            await Promise.all(selectedAds.map(ad => 
                Advertising.findByIdAndUpdate(ad._id, { lastFeatured: now })
            ));
            
            // Return property and ad ID
            return selectedAds.map(ad => ({
                property: ad.propertyId,
                advertisingId: ad._id
            }));
        } catch (error) {
            console.error('Error getting featured properties with ad info:', error);
            return [];
        }
    },
    
    // Get advertisement by ID
    getAdvertisementById: async (advertisementId) => {
        try {
            return await Advertising.findById(advertisementId).populate('propertyId');
        } catch (error) {
            console.error('Error getting advertisement by ID:', error);
            return null;
        }
    },
    
    // Increment click count for an advertisement
    incrementClickCount: async (advertisementId) => {
        try {
            // Currently we don't store click counts in the database
            // This is a placeholder for future implementation
            return true;
        } catch (error) {
            console.error('Error incrementing click count:', error);
            return false;
        }
    }
};

module.exports = AdvertisingModel;