const express = require('express');
const router = express.Router();
const { PropertyModel, AgentModel } = require('../models');
const TransactionModel = require('../models/transaction');
const { requireAuth, requireSeller } = require('../middleware/auth');
const UserModel = require('../models/user');
const MessageModel = require('../models/message');
const mongoose = require('mongoose');
const geocodingService = require('../service/geocoding');
const { propertyUpload } = require('../config/cloudinary');

// Middleware to check if user is a buyer
const requireBuyer = (req, res, next) => {
    if (!req.user || req.user.role !== 'buyer') {
        return res.status(403).render('error', { 
            message: 'Access denied. Only buyers can access this page.' 
        });
    }
    next();
};

// Middleware to check if user is an admin
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).render('error', { 
            message: 'Access denied. Only admins can access this page.' 
        });
    }
    next();
};

// Get all properties (only show available ones)
router.get('/', async (req, res) => {
    try {
        let properties = [];
        
        // If user is admin, allow filtering by approval status
        if (req.user && req.user.role === 'admin') {
            // Get approval status from query parameter, default to 'approved'
            const approvalStatus = req.query.status || 'approved';
            
            // Get properties based on approval status
            if (approvalStatus === 'all') {
                // Get all properties regardless of approval status
                properties = await PropertyModel.getAllProperties();
            } else if (approvalStatus === 'pending') {
                // Get pending properties
                properties = await PropertyModel.getPendingProperties();
            } else if (approvalStatus === 'rejected') {
                // Get rejected properties
                properties = await PropertyModel.getRejectedProperties();
            } else {
                // Default to approved properties
                properties = await PropertyModel.getApprovedProperties();
            }
        } else {
            // Regular users only see approved properties
            properties = await PropertyModel.getApprovedProperties();
        }
        
        // Ensure properties is an array
        if (!Array.isArray(properties)) {
            properties = [];
        }
        
        // Get agent for each property
        const propertiesWithAgents = await Promise.all(properties.map(async (property) => {
            let agent = null;
            if (property.agent) {
                agent = await AgentModel.getAgentById(property.agent);
            }
            
            // Convert to plain object if it's a Mongoose document
            const propertyObj = property.toObject ? property.toObject() : property;
            
            return {
                ...propertyObj,
                agent: agent || { 
                    name: "No Agent Assigned", 
                    image: "/images/default-avatar.png" 
                }
            };
        }));
        
        // Check if request wants JSON (from React frontend)
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(propertiesWithAgents);
        }
        
        // Otherwise render EJS view (for traditional server-side rendering)
        res.render('property_list', { 
            properties: propertiesWithAgents,
            activeTag: 'all',
            approvalStatus: req.user?.role === 'admin' ? (req.query.status || 'approved') : 'approved',
            isAdmin: req.user?.role === 'admin'
        });
    } catch (error) {
        console.error('Error fetching properties:', error);
        
        // Check if request wants JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ 
                error: 'Failed to fetch properties',
                message: error.message 
            });
        }
        
        res.status(500).render('error', { 
            message: 'Failed to fetch properties',
            error: error.message 
        });
    }
});

// Get properties by approval status
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        let properties = [];
        
        if (status === 'pending') {
            properties = await PropertyModel.getPendingProperties();
        } else if (status === 'rejected') {
            properties = await PropertyModel.getRejectedProperties();
        } else if (status === 'approved') {
            properties = await PropertyModel.getAvailableProperties();
        } else {
            // Default to all properties
            properties = await PropertyModel.getAllProperties();
        }
        
        // Get agent for each property
        const propertiesWithAgents = Array.isArray(properties) 
            ? await Promise.all(properties.map(async (property) => {
                let agent = await AgentModel.getAgentById(property.agent);
                return {
                    ...property.toObject(),
                    agent: agent || { 
                        name: "No Agent Assigned", 
                        image: "/images/default-avatar.png" 
                    }
                };
            }))
            : [];
        
        res.render('property_list', { 
            properties: propertiesWithAgents,
            activeTag: 'all',
            approvalStatus: status
        });
    } catch (error) {
        console.error('Error fetching properties by approval status:', error);
        res.status(500).render('error', { 
            message: 'Failed to fetch properties by approval status',
            error: error.message
        });
    }
});

// Property comparison route
router.get('/compare', async (req, res) => {
    try {
        // Get property IDs from query parameters
        const propertyIds = req.query.propertyIds ? req.query.propertyIds.split(',') : [];
        
        // If no property IDs provided, render the empty comparison page
        if (!propertyIds.length) {
            // Check if request wants JSON
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.json({ properties: [] });
            }
            return res.render('propertyCompare', { properties: [] });
        }
        
        // Validate property IDs
        const validIds = propertyIds.filter(id => mongoose.Types.ObjectId.isValid(id));
        
        if (validIds.length === 0) {
            // Check if request wants JSON
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.json({ properties: [] });
            }
            return res.render('propertyCompare', { properties: [] });
        }
        
        // Fetch properties by IDs
        const properties = await Promise.all(
            validIds.map(async (id) => {
                try {
                    const property = await PropertyModel.getPropertyById(id);
                    return property;
                } catch (err) {
                    console.error(`Error fetching property ${id}:`, err);
                    return null;
                }
            })
        );
        
        // Filter out null values (properties that couldn't be fetched)
        const validProperties = properties.filter(p => p !== null);
        
        // Check if request wants JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ properties: validProperties });
        }
        
        // Render comparison page with properties
        res.render('propertyCompare', { properties: validProperties });
    } catch (error) {
        console.error('Error in property comparison:', error);
        
        // Check if request wants JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ 
                error: 'Failed to compare properties',
                message: error.message 
            });
        }
        
        res.status(500).render('error', { 
            message: 'Failed to compare properties',
            error: error.message 
        });
    }
});

// Get property listing form (seller only)
router.get('/listing', requireAuth, requireSeller, (req, res) => {
    res.render('property_listing');
});

// Get seller's properties
router.get('/my-properties', requireAuth, requireSeller, async (req, res) => {
    try {
        // Get all seller properties
        const allSellerProperties = await PropertyModel.getPropertiesBySeller(req.user._id);
          // Filter to show active properties or approved properties
        const sellerProperties = Array.isArray(allSellerProperties) 
            ? allSellerProperties.filter(property => 
                property.status === 'active' || property.approvalStatus === 'approved'
            )
            : [];
        
        // Import RentModel
        const RentModel = require('../models/rent');
        
        // Get agent for each property and check rent status
        const propertiesWithAgents = Array.isArray(sellerProperties)
            ? await Promise.all(sellerProperties.map(async (property) => {
                let agent = await AgentModel.getAgentById(property.agent);
                
                // Check if property has pending/overdue rent
                let hasPendingRent = false;
                if (property.tag === 'rent' && property.status === 'rented') {
                    hasPendingRent = await RentModel.hasRentDue(property._id);
                }
                
                return {
                    ...property.toObject(),
                    agent: agent || { 
                        name: "No Agent Assigned", 
                        image: "/images/default-avatar.png" 
                    },
                    hasPendingRent
                };
            }))
            : [];
        
        res.render('property_list', { 
            properties: propertiesWithAgents,
            title: 'My Properties',
            isMyProperties: true,
            activeTag: 'all'
        });
    } catch (error) {
        console.error('Error fetching seller properties:', error);
        res.status(500).render('error', { 
            message: 'Failed to fetch your properties',
            error: error.message
        });
    }
});

// Get seller's transactions
router.get('/my-transactions', requireAuth, requireSeller, async (req, res) => {
    try {
        const transactions = await TransactionModel.getTransactionsBySeller(req.user._id);
        const stats = await TransactionModel.getSellerStats(req.user._id);

        console.log('Transactions:', JSON.stringify(transactions, null, 2));
        console.log('Stats:', JSON.stringify(stats, null, 2));
        
        res.render('transactions', { 
            transactions,
            stats,
            title: 'My Transactions'
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).render('error', { 
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
});

// Get buyer's purchased/rented properties
router.get('/my-purchases', requireAuth, requireBuyer, async (req, res) => {
    try {
        const buyerProperties = await PropertyModel.getBuyerProperties(req.user._id);
        
        // Import RentModel
        const RentModel = require('../models/rent');
        
        // Get agent for each property and check rent status
        const propertiesWithAgents = Array.isArray(buyerProperties)
            ? await Promise.all(buyerProperties.map(async (property) => {
                let agent = await AgentModel.getAgentById(property.agent);
                
                // Check if property has pending/overdue rent
                let hasPendingRent = false;
                if (property.tag === 'rent' && property.status === 'rented') {
                    hasPendingRent = await RentModel.hasRentDue(property._id);
                }
                
                return {
                    ...property.toObject(),
                    agent: agent || { 
                        name: "No Agent Assigned", 
                        image: "/images/default-avatar.png" 
                    },
                    hasPendingRent
                };
            }))
            : [];
        
        res.render('property_list', { 
            properties: propertiesWithAgents,
            title: 'My Purchases',
            isPurchases: true,
            activeTag: 'all'
        });
    } catch (error) {
        console.error('Error fetching buyer properties:', error);
        res.status(500).render('error', { 
            message: 'Failed to fetch your purchases',
            error: error.message
        });
    }
});

// Get properties by tag (sale or rent)
router.get('/tag/:tag', async (req, res) => {
    try {
        const { tag } = req.params;
        
        // Validate tag parameter
        if (!['sale', 'rent'].includes(tag)) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(400).json({ 
                    error: 'Invalid tag',
                    message: 'Tag must be either "sale" or "rent"'
                });
            }
            return res.status(400).render('error', { message: 'Invalid tag parameter' });
        }
        
        // Get only approved properties for this tag
        const properties = await PropertyModel.getPropertiesByTag(tag);
        
        // Ensure properties is an array
        if (!Array.isArray(properties)) {
            return res.json([]);
        }
        
        // Get agent for each property
        const propertiesWithAgents = await Promise.all(properties.map(async (property) => {
            let agent = null;
            if (property.agent) {
                agent = await AgentModel.getAgentById(property.agent);
            }
            
            // Convert to plain object if it's a Mongoose document
            const propertyObj = property.toObject ? property.toObject() : property;
            
            return {
                ...propertyObj,
                agent: agent || { 
                    name: "No Agent Assigned", 
                    image: "/images/default-avatar.png" 
                }
            };
        }));
        
        // Check if request wants JSON (from React frontend)
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(propertiesWithAgents);
        }
        
        // Otherwise render EJS view
        res.render('property_list', { 
            properties: propertiesWithAgents, 
            activeTag: tag,
            title: tag === 'sale' ? 'Properties for Sale' : 'Properties for Rent' 
        });
    } catch (error) {
        console.error('Error fetching properties by tag:', error);
        
        // Check if request wants JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ 
                error: 'Failed to fetch properties by tag',
                message: error.message 
            });
        }
        
        res.status(500).render('error', { 
            message: 'Failed to fetch properties by tag',
            error: error.message
        });
    }
});

// Handle property listing submission (seller only)
router.post('/listing', requireAuth, requireSeller, propertyUpload.array('images', 10), async (req, res) => {
    try {        
        console.log("Property submission initiated");
        console.log("Full req.body:", req.body);
        
        const {
            title,
            type,
            tag,
            price,
            location,
            sqft,
            beds,
            baths,
            kitchen,
            description,
            latitude,
            longitude,
            address
        } = req.body;
        
        console.log("Extracted values:", { title, type, tag, price, location });
        
        // Validate required fields
        if (!tag || (tag !== 'sale' && tag !== 'rent')) {
            console.error("❌ Invalid or missing tag:", tag);
            return res.status(400).json({
                success: false,
                message: 'Property type (sale/rent) is required'
            });
        }
        
        // Handle amenities which might come as amenities[] or amenities
        let amenities = req.body['amenities[]'] || req.body.amenities || [];

        console.log("Raw amenities received:", amenities);
        console.log("Amenities type:", typeof amenities);
        console.log("Amenities is array:", Array.isArray(amenities));

        console.log("Form data received:", { 
            title, type, tag, price, 
            location, sqft, beds, baths, 
            kitchen, description, 
            amenitiesProvided: !!amenities,
            amenitiesCount: Array.isArray(amenities) ? amenities.length : (amenities ? 1 : 0),
            imagesProvided: !!(req.files && req.files.length)
        });

        // Check if description is present and valid
        if (!description || description.trim() === '') {
            throw new Error('Property description is required');
        }

        // Process uploaded images from Cloudinary
        const images = req.files && Array.isArray(req.files) 
            ? req.files.map(file => file.path) // Cloudinary provides the full URL in file.path
            : [];

        console.log("Processed images from Cloudinary:", images.length);

        // Process amenities properly - flatten any nested arrays and ensure strings only
        let processedAmenities = [];
        if (amenities) {
            // Function to recursively flatten arrays and extract strings only
            const flattenAmenities = (arr) => {
                const result = [];
                if (Array.isArray(arr)) {
                    arr.forEach(item => {
                        if (typeof item === 'string' && item.trim() !== '') {
                            result.push(item.trim());
                        } else if (Array.isArray(item)) {
                            result.push(...flattenAmenities(item));
                        }
                    });
                } else if (typeof arr === 'string' && arr.trim() !== '') {
                    result.push(arr.trim());
                }
                return result;
            };

            processedAmenities = flattenAmenities(amenities);
            // Remove duplicates
            processedAmenities = [...new Set(processedAmenities)];
        }

        console.log("Processed amenities:", processedAmenities);        // Create property data object
        const propertyData = {
            title,
            description, // Ensure description is included
            type,
            tag,
            price: tag === 'sale' ? `$${price}` : `$${price}/month`,
            estPayment: tag === 'sale' ? `$${(price * 0.05).toFixed(2)}/mo*` : `$${price}/mo*`,
            location,
            features: {
                sqft,
                beds: String(beds).padStart(2, '0'),
                baths: String(baths).padStart(2, '0'),
                kitchen: String(kitchen).padStart(2, '0'),
                type
            },
            amenities: processedAmenities,
            images: images.length > 0 ? images : ['/assets/3.jpg', '/assets/4.jpg', '/assets/5.jpg', '/assets/6.jpg', '/assets/7.jpg']        };
          // Automatically geocode the address to get coordinates
        let geocodingSuccessful = false;
        let geocodingMessage = '';
        
        try {
            // Use the location field or address field for geocoding
            const addressToGeocode = address || location;
            
            if (addressToGeocode && addressToGeocode.trim() !== '') {
                console.log("Attempting to geocode address:", addressToGeocode);
                
                // Get coordinates from the address
                const geocodeResult = await geocodingService.getCoordinatesFromAddress(addressToGeocode);
                
                propertyData.geolocation = {
                    latitude: geocodeResult.latitude,
                    longitude: geocodeResult.longitude,
                    address: geocodeResult.formattedAddress
                };
                
                geocodingSuccessful = true;
                geocodingMessage = 'Address geocoded successfully';
                console.log("Geocoding successful:", propertyData.geolocation);
            } else {
                geocodingMessage = 'No address provided for automatic geocoding';
                console.log("No address provided for geocoding");
            }
        } catch (geocodeError) {
            console.error("Geocoding failed:", geocodeError.message);
            geocodingMessage = `Geocoding failed: ${geocodeError.message}. Property created without coordinates - admin can add them later.`;
            // Continue without geocoding - property can still be created
            // Admin can add coordinates later if needed
        }

        console.log("Calling PropertyModel.addProperty");
        // Add property with seller ID
        const newProperty = await PropertyModel.addProperty(propertyData, req.user._id);
          console.log("Property added successfully, ID:", newProperty.id);
          // Check if this is an API request (JSON) or traditional form submission
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            // API response for React frontend
            return res.status(201).json({
                success: true,
                message: 'Property submitted successfully and is pending admin approval',
                data: newProperty,
                geocoding: {
                    successful: geocodingSuccessful,
                    message: geocodingMessage
                }
            });
        } else {
            // Traditional form submission - redirect to dashboard
            const successMessage = geocodingSuccessful 
                ? 'Property has been listed and is pending admin approval. Location was automatically geocoded.'
                : `Property has been listed and is pending admin approval. ${geocodingMessage}`;
            res.redirect(`/dashboard?section=my-properties&success=${encodeURIComponent(successMessage)}`);
        }
    } catch (error) {
        console.error('Error listing property:', error);
        
        // Check if this is an API request (JSON) or traditional form submission
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            // API error response for React frontend
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to submit property'
            });
        } else {
            // Traditional form submission - render error page
            res.status(400).render('property_listing', { 
                error: error.message,
                formData: req.body
            });
        }
    }
});

// Purchase a property
router.post('/:id/purchase', requireAuth, requireBuyer, async (req, res) => {
    try {
        // Get property details
        const property = await PropertyModel.getPropertyById(req.params.id);
        
        if (!property) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Property not found' 
                });
            }
            return res.status(404).render('error', { message: 'Property not found' });
        }
        
        // Check if property is available for purchase
        if (property.status !== 'active') {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'This property is no longer available' 
                });
            }
            return res.redirect(`/property/${req.params.id}?error=notAvailable`);
        }
        
        // Get price as number for balance check
        const priceValue = parseFloat(property.price.replace(/[^0-9.-]+/g, ""));
        if (isNaN(priceValue)) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid property price' 
                });
            }
            return res.redirect(`/property/${req.params.id}?error=invalidPrice`);
        }

        // Check if buyer has enough balance
        const buyer = await UserModel.findById(req.user._id);
        if (!buyer) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Buyer account not found' 
                });
            }
            return res.redirect(`/property/${req.params.id}?error=buyerNotFound`);
        }

        if (buyer.accountBalance < priceValue) {
            const amountNeeded = priceValue - buyer.accountBalance;
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Insufficient funds to complete this purchase',
                    amountNeeded: amountNeeded,
                    currentBalance: buyer.accountBalance,
                    requiredAmount: priceValue
                });
            }
            return res.redirect(`/property/${req.params.id}?error=insufficientFunds&amountNeeded=${amountNeeded}`);
        }

        // Purchase the property (this will handle balances and commissions)
        await PropertyModel.purchaseProperty(req.params.id, req.user._id);
        
        // Check if request wants JSON response
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ 
                success: true, 
                message: property.tag === 'rent' ? 'Property rented successfully!' : 'Property purchased successfully!',
                propertyId: req.params.id,
                propertyTitle: property.title,
                transactionType: property.tag
            });
        }
        
        // Redirect to the appropriate page for traditional requests
        if (buyer.role === 'buyer') {
            res.redirect('/property/my-purchases');
        } else {
            res.redirect('/property/my-transactions');
        }
    } catch (error) {
        console.error('Error purchasing property:', error);
        
        // Check if request wants JSON response
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ 
                success: false, 
                message: error.message || 'Failed to purchase property'
            });
        }
        
        res.redirect(`/property/${req.params.id}?error=purchaseError&message=${encodeURIComponent(error.message)}`);
    }
});

// Add a new specialized route for rental agreement cancellation
router.post('/:id/cancel-rental', requireAuth, requireBuyer, async (req, res) => {
    try {
        const propertyId = req.params.id;
        
        // Get property details first to validate
        const property = await PropertyModel.getPropertyById(propertyId);
        
        if (!property) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Property not found'
                });
            }
            return res.status(404).render('error', { message: 'Property not found' });
        }
        
        // Check if the property is actually rented by this buyer
        if (property.status !== 'rented' || !property.buyerId || property.buyerId.toString() !== req.user._id.toString()) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only cancel agreements for properties you have rented'
                });
            }
            return res.status(403).render('error', { message: 'You can only cancel agreements for properties you have rented' });
        }
        
        // Wrap the cancellation in a try-catch to handle timeouts and other errors
        try {
            // Set a timeout for the operation
            const timeoutMs = 15000; // 15 seconds max
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
            );
            
            // Perform the actual cancellation
            const cancellationPromise = PropertyModel.cancelRental(propertyId, req.user._id);
            
            // Use Promise.race to handle potential timeout
            await Promise.race([cancellationPromise, timeoutPromise]);
            
            // If we get here, the operation succeeded
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.json({
                    success: true,
                    message: 'Rental agreement cancelled successfully'
                });
            }
            
            return res.redirect('/dashboard?section=my-purchases&success=Rental agreement cancelled successfully');
        } catch (operationError) {
            console.error('Error during rental cancellation operation:', operationError);
            
            // Handle timeout errors
            if (operationError.message === 'Operation timed out') {
                if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                    return res.status(408).json({
                        success: false,
                        message: 'The cancellation request is taking longer than expected. Please refresh your dashboard in a moment to check the status.'
                    });
                }
                return res.redirect('/dashboard?section=my-purchases&warning=The cancellation request is taking longer than expected. Please refresh after a few moments to check the status.');
            }
            
            // Check if error is related to the ObjectId or rent updates (non-critical)
            if (operationError.message && (
                operationError.message.includes('ObjectId') || 
                operationError.message.includes('rent records')
            )) {
                console.log('Non-critical error during cancellation, attempting to verify if cancellation succeeded');
                
                try {
                    // Verify if the property was actually updated despite the error
                    const property = await PropertyModel.getPropertyById(propertyId);
                    
                    if (property && property.status === 'active' && !property.buyerId) {
                        console.log('Cancellation succeeded despite error, returning success');
                        
                        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                            return res.json({
                                success: true,
                                message: 'Rental agreement cancelled successfully'
                            });
                        }
                        
                        return res.redirect('/dashboard?section=my-purchases&success=Rental agreement cancelled successfully');
                    }
                } catch (verifyError) {
                    console.error('Error verifying cancellation status:', verifyError);
                    // Continue to the error response below
                }
            }
            
            // For other errors
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to cancel rental agreement: ' + operationError.message
                });
            }
            
            return res.status(500).render('error', {
                message: 'Failed to cancel rental agreement',
                error: operationError.message
            });
        }
        
    } catch (error) {
        console.error('Error in cancel-rental-improved handler:', error);
        
        // If we haven't sent a response yet, send an error
        if (!res.headersSent) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to initiate rental cancellation: ' + error.message
                });
            }
            
            return res.status(500).render('error', {
                message: 'Failed to initiate rental cancellation',
                error: error.message
            });
        }
    }
});

// Get property by ID - property overview page
router.get('/:id', async (req, res) => {
    try {
        const propertyId = req.params.id;
        const property = await PropertyModel.getPropertyById(propertyId);
        
        if (!property) {
            return res.status(404).render('error', {
                message: 'Property not found',
                details: 'The property you are looking for could not be found.'
            });
        }
        
        // Track property view with property name
        if (req.app.locals.trackActivity) {
            const Activity = require('../models/activity');
            const userId = req.user ? req.user._id : null;
            const userName = req.user ? req.user.name : 'Anonymous';
            const userRole = req.user ? req.user.role : 'anonymous';
            
            const activityData = {
                userId,
                userName,
                userRole,
                actionType: 'property_view',
                targetType: 'property',
                targetId: propertyId,
                targetName: property.title || 'Property',
                url: req.originalUrl,
                referrer: req.headers.referer || '',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                deviceType: req.deviceInfo ? req.deviceInfo.deviceType : 'unknown',
                sessionId: req.session ? req.session.id : null,
                timestamp: new Date()
            };
            
            Activity.logActivity(activityData).catch(err => {
                console.error('Error logging property view:', err);
            });
        }
        
        // Get agent for this property
        let agent = null;
        if (property.agent) {
            agent = await AgentModel.getAgentById(property.agent);
        }
        
        // Calculate average rating
        let totalRating = 0;
        if (property.reviews && property.reviews.length > 0) {
            property.reviews.forEach(review => {
                totalRating += review.rating;
            });
            property.averageRating = totalRating / property.reviews.length;
        } else {
            property.averageRating = 0;
        }
        
        // Get complete user data if logged in
        let userData = null;
        if (req.user) {
            userData = await UserModel.findById(req.user._id);
        }
        
        // Get rent information if it's a rental property
        let rentInfo = null;
        if (property.tag === 'rent' && property.status === 'rented') {
            // Import RentModel
            const RentModel = require('../models/rent');
            
            // Check if property has pending/overdue rent
            const hasPendingRent = await RentModel.hasRentDue(property._id);
            
            // Get rent history for this property
            const rentHistory = await RentModel.getRentsByPropertyId(property._id);
            
            rentInfo = {
                hasPendingRent,
                rentHistory
            };
        }
        
        // Return JSON if requested (check both query param and accept header)
        if (req.query.format === 'json' || (req.headers.accept && req.headers.accept.includes('application/json'))) {
            return res.json({
                success: true,
                property: property,
                agent: agent,
                rentInfo: rentInfo,
                user: userData || req.user
            });
        }
        
        // Otherwise render the property page
        res.render('property_overview', { 
            property, 
            agent,
            user: userData || req.user,
            rentInfo,
            query: req.query
        });
    } catch (error) {
        console.error('Error getting property details:', error);
        
        // Check if request wants JSON
        if (req.query.format === 'json' || (req.headers.accept && req.headers.accept.includes('application/json'))) {
            return res.status(500).json({ 
                error: 'Error loading property',
                message: error.message 
            });
        }
        
        res.status(500).render('error', {
            message: 'Error loading property',
            details: error.message
        });
    }
});

// Add a review to a property
router.post('/:id/reviews', async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({ 
            error: 'Authentication required',
            redirectUrl: `/auth/signin?redirect=/property/${req.params.id}`
        });
    }

    try {
        // Add user name to the review data
        const reviewData = {
            ...req.body,
            userName: req.user.name || req.user.username || 'User'
        };
        
        const success = await PropertyModel.addReview(req.params.id, reviewData);
        if (!success) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        // Get the newly added review to return to the client
        const property = await PropertyModel.getPropertyById(req.params.id);
        const newReview = property.reviews[0];
        
        res.status(201).json({ 
            message: 'Review added successfully',
            success: true,
            review: newReview
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

// Edit property (seller only)
router.get('/:id/edit', requireAuth, requireSeller, async (req, res) => {
    try {
        const property = await PropertyModel.getPropertyById(req.params.id);
        if (!property) {
            return res.status(404).render('error', { message: 'Property not found' });
        }

        // Verify user is the seller
        if (property.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).render('error', { message: 'Unauthorized' });
        }

        res.render('property_listing', { property: property.toObject() });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

// Update property (seller only)
router.post('/:id/edit', requireAuth, requireSeller, propertyUpload.array('images', 5), async (req, res) => {
    try {
        const {
            title,
            type,
            tag,
            price,
            location,
            sqft,
            beds,
            baths,
            kitchen,
            description,
            amenities
        } = req.body;

        // Process uploaded images from Cloudinary
        const images = req.files && Array.isArray(req.files) 
            ? req.files.map(file => file.path) // Cloudinary provides the full URL in file.path
            : [];

        const updateData = {
            title,
            type,
            tag,
            price: tag === 'sale' ? `$${price}` : `$${price}/month`,
            estPayment: tag === 'sale' ? `$${(price * 0.05).toFixed(2)}/mo*` : `$${price}/mo*`,
            location,
            features: {
                sqft,
                beds: String(beds).padStart(2, '0'),
                baths: String(baths).padStart(2, '0'),
                kitchen: String(kitchen).padStart(2, '0'),
                type
            },
            amenities: Array.isArray(amenities) ? amenities : [amenities],
            description,
            images: images.length > 0 ? images : undefined
        };

        await PropertyModel.updateProperty(req.params.id, updateData, req.user._id);
        res.redirect(`/property/${req.params.id}`);
    } catch (error) {
        res.status(400).render('property_listing', { 
            error: error.message,
            property: req.body
        });
    }
});

// Delete property (seller only)
router.post('/:id/delete', requireAuth, requireSeller, async (req, res) => {
    try {
        await PropertyModel.deleteProperty(req.params.id, req.user._id);
        res.redirect('/property/my-properties');
    } catch (error) {
        res.status(400).render('error', { message: error.message });
    }
});

// Add contact form submission handler
router.post('/:id/contact', async (req, res) => {
    try {
        const propertyId = req.params.id;
        const { name, email, phone, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email, and message are required' 
            });
        }

        // Get the property
        const property = await PropertyModel.getPropertyById(propertyId);
        if (!property) {
            return res.status(404).json({ 
                success: false, 
                message: 'Property not found' 
            });
        }

        // Get the agent for this property
        const agent = await AgentModel.getPropertyAgent(propertyId);
        if (!agent) {
            return res.status(404).json({ 
                success: false, 
                message: 'No agent assigned to this property' 
            });
        }

        // Create a sender ID (if user is logged in) or use a temporary ID
        const senderId = req.user ? req.user._id : null;

        // Create the message
        const messageData = {
            senderId: senderId || new mongoose.Types.ObjectId(), // Create a temporary ID if no user is logged in
            senderName: name,
            senderEmail: email,
            senderPhone: phone || '',
            receiverId: agent.userId, // The agent's user ID
            propertyId: propertyId,
            propertyTitle: property.title,
            message: message,
            status: 'unread'
        };

        const newMessage = await MessageModel.createMessage(messageData);

        // Return success response
        res.status(201).json({ 
            success: true, 
            message: 'Your message has been sent to the agent' 
        });
    } catch (error) {
        console.error('Error sending contact message:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message. Please try again later.' 
        });
    }
});

// Get property approval management page (admin only)
router.get('/admin/approval', requireAuth, requireAdmin, async (req, res) => {
    try {
        // Get pending properties by default
        const properties = await PropertyModel.getPendingProperties();
        
        // Get all available agents for assignment
        const agents = await AgentModel.getVerifiedAgents();
        
        res.render('property_approval', { 
            properties,
            agents,
            currentTab: 'pending'
        });
    } catch (error) {
        console.error('Error fetching pending properties:', error);
        res.status(500).render('error', { 
            message: 'Failed to fetch pending properties',
            error: error.message 
        });
    }
});

// Handle property approval (admin only)
router.post('/admin/approve/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const notes = '';
        
        // Get all verified agents
        const verifiedAgents = await AgentModel.getVerifiedAgents();
        
        // If no agents are available, return an error
        if (!verifiedAgents || verifiedAgents.length === 0) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No verified agents available for assignment'
                });
            }
            return res.redirect('/dashboard?error=No verified agents available&section=property-approval');
        }
        
        // Get all approved properties to determine current agent assignments
        const approvedProperties = await PropertyModel.getApprovedProperties();
        
        // Count properties assigned to each agent
        const agentPropertyCounts = {};
        verifiedAgents.forEach(agent => {
            agentPropertyCounts[agent._id.toString()] = 0;
        });
        
        // Count existing property assignments
        if (approvedProperties && approvedProperties.length > 0) {
            approvedProperties.forEach(property => {
                if (property.agent) {
                    const agentId = property.agent.toString();
                    if (agentPropertyCounts[agentId] !== undefined) {
                        agentPropertyCounts[agentId]++;
                    }
                }
            });
        }
        
        // Find the agent with the least number of properties
        let minPropertyCount = Infinity;
        let selectedAgentId = null;
        
        for (const agent of verifiedAgents) {
            const agentIdStr = agent._id.toString();
            if (agentPropertyCounts[agentIdStr] < minPropertyCount) {
                minPropertyCount = agentPropertyCounts[agentIdStr];
                selectedAgentId = agent._id;
            }
        }
        
        // Approve the property with the selected agent
        const approvedProperty = await PropertyModel.approveProperty(id, req.user._id, notes, selectedAgentId);
        
        // Update the agent's listing count
        if (selectedAgentId) {
            await AgentModel.updateAgentListingCount(selectedAgentId);
        }
        
        // Check if the request is AJAX
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({
                success: true,
                message: 'Property has been approved successfully',
                property: approvedProperty,
                agentId: selectedAgentId
            });
        }
        
        // Redirect back to the approval page with a success message
        return res.redirect('/dashboard?success=Property has been approved&section=property-approval');
    } catch (error) {
        console.error('Error approving property:', error);
        
        // Check if the request is AJAX
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to approve property',
                error: error.message 
            });
        }
        
        res.status(500).render('error', { 
            message: 'Failed to approve property',
            error: error.message 
        });
    }
});

// Handle property rejection (admin only)
router.post('/admin/reject/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get notes from request body
        const notes = req.body.notes || 'Rejected by admin';
        
        // Validate notes
        if (!notes || notes.trim() === '') {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Rejection notes are required'
                });
            }
            return res.redirect('/dashboard?error=Rejection notes are required&section=property-approval');
        }
        
        // Reject the property
        const rejectedProperty = await PropertyModel.rejectProperty(id, req.user._id, notes);
        
        // Check if the request is AJAX
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({
                success: true,
                message: 'Property has been rejected',
                property: rejectedProperty
            });
        }
        
        // Redirect back to the approval page with a success message
        return res.redirect('/dashboard?success=Property has been rejected&section=property-approval');
    } catch (error) {
        console.error('Error rejecting property:', error);
        
        // Check if the request is AJAX
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to reject property',
                error: error.message 
            });
        }
        
        res.status(500).render('error', { 
            message: 'Failed to reject property',
            error: error.message 
        });
    }
});

// Add API endpoint to search properties
router.get('/api/search', async (req, res) => {
    try {
        const searchTerm = req.query.q;
        
        if (!searchTerm || searchTerm.length < 2) {
            return res.json({ properties: [] });
        }
        
        // Search in property titles, locations, and descriptions
        const searchRegex = new RegExp(searchTerm, 'i');
        
        const allProperties = await PropertyModel.getAllProperties();
        
        // Filter properties based on search term
        const matchedProperties = allProperties.filter(property => 
            searchRegex.test(property.title) || 
            searchRegex.test(property.location) || 
            searchRegex.test(property.description) ||
            (property.features && searchRegex.test(property.features.type)) ||
            (property.amenities && property.amenities.some(amenity => searchRegex.test(amenity)))
        );
        
        // Only return active and approved properties for comparison
        const availableProperties = matchedProperties.filter(property => 
            property.status === 'active' && property.approvalStatus === 'approved'
        );
        
        // Limit the number of results to 10
        const limitedResults = availableProperties.slice(0, 10);
        
        res.json({ properties: limitedResults });
    } catch (error) {
        console.error('Error searching properties:', error);
        res.status(500).json({ 
            error: 'Failed to search properties',
            message: error.message 
        });
    }
});

// Get neighborhood information for a property
router.get('/:id/neighbourhood', async (req, res) => {
    try {
        const property = await PropertyModel.getPropertyById(req.params.id);
        
        if (!property) {
            return res.status(404).render('error', { message: 'Property not found' });
        }
        
        // Get agent for this property
        let agent = null;
        if (property.agent) {
            agent = await AgentModel.getAgentById(property.agent);
        }
        
        // Get city from property location
        const location = property.location;
        const city = location.split(',').pop().trim();
        
        // Create neighborhood data
        // This would usually come from a database or external API
        const neighborhoodData = {
            safety: {
                crimeRate: "Low",
                policeStations: 2,
                securityServices: "24/7 patrol",
                safetyRating: 4.5
            },
            education: {
                schools: [
                    { name: "City Public School", distance: "0.5 km", rating: 4.2 },
                    { name: "St. Mary's High School", distance: "1.2 km", rating: 4.5 },
                ],
                colleges: [
                    { name: "City College", distance: "2.5 km", rating: 4.0 }
                ],
                libraries: [
                    { name: "Community Library", distance: "1.0 km" }
                ]
            },
            healthcare: {
                hospitals: [
                    { name: "General Hospital", distance: "1.8 km", emergency: true },
                    { name: "City Medical Center", distance: "2.5 km", emergency: true }
                ],
                clinics: [
                    { name: "Family Clinic", distance: "0.7 km" }
                ],
                pharmacies: [
                    { name: "MedPlus", distance: "0.3 km" },
                    { name: "Apollo Pharmacy", distance: "1.0 km" }
                ]
            },
            transportation: {
                busStops: [
                    { name: "Main Street Stop", distance: "0.2 km" },
                    { name: "Market Junction", distance: "0.5 km" }
                ],
                metroStations: [
                    { name: "City Center Metro", distance: "1.5 km" }
                ],
                railwayStations: [
                    { name: "Central Railway Station", distance: "3.5 km" }
                ],
                airportDistance: "15 km",
                airportName: "International Airport"
            },
            shopping: {
                malls: [
                    { name: "City Center Mall", distance: "2.0 km" },
                    { name: "Westside Shopping Complex", distance: "3.5 km" }
                ],
                markets: [
                    { name: "Farmers Market", distance: "1.0 km" },
                    { name: "Daily Needs Market", distance: "0.5 km" }
                ],
                supermarkets: [
                    { name: "SuperMart", distance: "0.8 km" },
                    { name: "Fresh Grocery", distance: "1.2 km" }
                ]
            },
            recreation: {
                parks: [
                    { name: "Central Park", distance: "0.6 km" },
                    { name: "Children's Play Area", distance: "0.3 km" }
                ],
                gyms: [
                    { name: "Fitness Center", distance: "0.7 km" }
                ],
                restaurants: [
                    { name: "Fine Dining Restaurant", distance: "0.5 km" },
                    { name: "Family Restaurant", distance: "0.8 km" },
                    { name: "Fast Food Joint", distance: "0.3 km" }
                ],
                cafes: [
                    { name: "Coffee House", distance: "0.4 km" },
                    { name: "Bakery & Cafe", distance: "0.6 km" }
                ]
            },
            utilities: {
                waterSupply: "24/7 Municipal Water",
                electricity: "Reliable with backup generator",
                internet: "Multiple high-speed providers available",
                gasSupply: "Piped natural gas"
            },
            environment: {
                airQuality: "Good",
                noiseLevel: "Moderate",
                greenSpaces: "Multiple parks within walking distance",
                wasteManagement: "Regular municipal collection"
            }
        };
        
        // Get property walkability score (mock data)
        const walkabilityScore = 85; // 0-100 scale
        
        // Get nearby properties
        // PropertyModel.find is not a valid function, we need to use getAllProperties instead
        const allProperties = await PropertyModel.getAllProperties();
        
        // Filter for properties in the same city/location and exclude current property
        const nearbyProperties = allProperties
            .filter(prop => 
                prop._id.toString() !== property._id.toString() && // Exclude current property
                prop.location && prop.location.includes(city) // Filter by city
            )
            .slice(0, 4); // Limit to 4 properties
        
        // Render the neighbourhood info page
        res.render('neighbourhoodInfo', { 
            property,
            agent,
            neighborhoodData,
            walkabilityScore,
            nearbyProperties,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching neighbourhood info:', error);
        res.status(500).render('error', { 
            message: 'Failed to fetch neighbourhood information',
            error: error.message
        });    }
});

// Get seller's approved properties for dashboard (API route)
router.get('/seller/approved', requireAuth, requireSeller, async (req, res) => {
    try {
        // Get only approved properties for the seller
        const approvedProperties = await PropertyModel.getApprovedPropertiesBySeller(req.user._id);
        
        // Check if request wants JSON (from React frontend)
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({
                success: true,
                properties: approvedProperties
            });
        }
        
        // Fallback for non-JSON requests
        res.json({
            success: true,
            properties: approvedProperties
        });
    } catch (error) {
        console.error('Error fetching seller approved properties:', error);
        
        // Check if request wants JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ 
                success: false,
                message: 'Failed to fetch approved properties',
                error: error.message 
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch approved properties',
            error: error.message 
        });    }
});

// Update property geolocation coordinates
router.post('/admin/geolocation/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { latitude, longitude, address } = req.body;
        
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }
        
        const updatedProperty = await PropertyModel.updatePropertyGeolocation(
            id, 
            parseFloat(latitude), 
            parseFloat(longitude), 
            address
        );
        
        res.json({
            success: true,
            message: 'Property geolocation updated successfully',
            property: updatedProperty
        });
    } catch (error) {
        console.error('Error updating property geolocation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update property geolocation',
            error: error.message
        });
    }
});

// Batch update geolocation for multiple properties
router.post('/admin/geolocation/batch', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { updates } = req.body;
        
        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Updates array is required and must not be empty'
            });
        }
        
        const results = await PropertyModel.batchUpdateGeolocation(updates);
        
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        res.json({
            success: true,
            message: `Batch update completed: ${successful} successful, ${failed} failed`,
            results: results
        });
    } catch (error) {
        console.error('Error in batch geolocation update:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform batch geolocation update',
            error: error.message
        });
    }
});

// Get properties without geolocation data
router.get('/admin/missing-geolocation', requireAuth, requireAdmin, async (req, res) => {
    try {
        const properties = await PropertyModel.Property.find({
            $or: [
                { 'geolocation.latitude': { $exists: false } },
                { 'geolocation.longitude': { $exists: false } },
                { 'geolocation.latitude': null },
                { 'geolocation.longitude': null }
            ]
        }).select('_id title location');
        
        res.json({
            success: true,
            properties: properties,
            count: properties.length
        });
    } catch (error) {
        console.error('Error fetching properties without geolocation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch properties without geolocation',
            error: error.message
        });
    }
});

// Get agents and their geolocation/workload info
router.get('/admin/agents/geolocation-info', requireAuth, requireAdmin, async (req, res) => {
    try {
        const agents = await AgentModel.Agent.find({})
            .select('name location geolocation listingCount verified')
            .lean();
        
        const agentInfo = agents.map(agent => ({
            id: agent._id,
            name: agent.name,
            location: agent.location,
            geolocation: agent.geolocation,
            workload: agent.listingCount || 0,
            verified: agent.verified,
            hasGeolocation: !!(agent.geolocation && agent.geolocation.latitude && agent.geolocation.longitude)
        }));
        
        res.json({
            success: true,
            agents: agentInfo,
            summary: {
                total: agentInfo.length,
                withGeolocation: agentInfo.filter(a => a.hasGeolocation).length,
                verified: agentInfo.filter(a => a.verified).length
            }
        });
    } catch (error) {
        console.error('Error fetching agent geolocation info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch agent geolocation info',
            error: error.message
        });
    }
});

// Update agent geolocation
router.post('/admin/agents/geolocation/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { latitude, longitude, serviceRadius } = req.body;
        
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }
        
        const agent = await AgentModel.Agent.findByIdAndUpdate(
            id,
            {
                'geolocation.latitude': parseFloat(latitude),
                'geolocation.longitude': parseFloat(longitude),
                'geolocation.serviceRadius': serviceRadius ? parseInt(serviceRadius) : 50
            },
            { new: true }
        );
        
        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Agent geolocation updated successfully',
            agent: agent
        });
    } catch (error) {
        console.error('Error updating agent geolocation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update agent geolocation',
            error: error.message
        });
    }
});

// Automatically geocode property address
router.post('/admin/geolocation/auto/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get the property to extract its address
        const property = await PropertyModel.getPropertyById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        
        // Try to geocode using the location field
        const addressToGeocode = property.location;
        if (!addressToGeocode || addressToGeocode.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Property has no address to geocode'
            });
        }
        
        try {
            console.log(`Admin geocoding property ${id} with address: ${addressToGeocode}`);
            
            // Use the geocoding service
            const geocodeResult = await geocodingService.getCoordinatesFromAddress(addressToGeocode);
            
            // Update the property with the new coordinates
            const updatedProperty = await PropertyModel.updatePropertyGeolocation(
                id,
                geocodeResult.latitude,
                geocodeResult.longitude,
                geocodeResult.formattedAddress
            );
            
            res.json({
                success: true,
                message: 'Property geocoded and updated successfully',
                property: updatedProperty,
                geocoding: {
                    originalAddress: addressToGeocode,
                    formattedAddress: geocodeResult.formattedAddress,
                    coordinates: {
                        latitude: geocodeResult.latitude,
                        longitude: geocodeResult.longitude
                    }
                }
            });
            
        } catch (geocodeError) {
            console.error('Geocoding failed for property:', geocodeError.message);
            return res.status(400).json({
                success: false,
                message: `Failed to geocode address: ${geocodeError.message}`
            });
        }
        
    } catch (error) {
        console.error('Error in admin auto-geocoding:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to auto-geocode property',
            error: error.message
        });
    }
});

// Batch auto-geocode multiple properties
router.post('/admin/geolocation/auto-batch', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { propertyIds } = req.body;
        
        if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Property IDs array is required'
            });
        }
        
        const results = {
            successful: [],
            failed: [],
            total: propertyIds.length
        };
        
        console.log(`Starting batch auto-geocoding for ${propertyIds.length} properties`);
        
        for (const propertyId of propertyIds) {
            try {
                // Get the property
                const property = await PropertyModel.getPropertyById(propertyId);
                if (!property) {
                    results.failed.push({
                        propertyId,
                        error: 'Property not found'
                    });
                    continue;
                }
                
                // Check if it has an address
                const addressToGeocode = property.location;
                if (!addressToGeocode || addressToGeocode.trim() === '') {
                    results.failed.push({
                        propertyId,
                        error: 'No address available'
                    });
                    continue;
                }
                
                // Geocode the address
                const geocodeResult = await geocodingService.getCoordinatesFromAddress(addressToGeocode);
                
                // Update the property
                await PropertyModel.updatePropertyGeolocation(
                    propertyId,
                    geocodeResult.latitude,
                    geocodeResult.longitude,
                    geocodeResult.formattedAddress
                );
                
                results.successful.push({
                    propertyId,
                    originalAddress: addressToGeocode,
                    formattedAddress: geocodeResult.formattedAddress,
                    coordinates: {
                        latitude: geocodeResult.latitude,
                        longitude: geocodeResult.longitude
                    }
                });
                
                console.log(`✅ Successfully geocoded property ${propertyId}`);
                
                // Add a small delay to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`❌ Failed to geocode property ${propertyId}:`, error.message);
                results.failed.push({
                    propertyId,
                    error: error.message
                });
            }
        }
        
        console.log(`Batch geocoding completed: ${results.successful.length} successful, ${results.failed.length} failed`);
        
        res.json({
            success: true,
            message: `Batch geocoding completed: ${results.successful.length}/${results.total} properties geocoded successfully`,
            results
        });
        
    } catch (error) {
        console.error('Error in batch auto-geocoding:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform batch auto-geocoding',
            error: error.message
        });
    }
});

module.exports = router;