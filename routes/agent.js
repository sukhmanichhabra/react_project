const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agent");
const { requireAuth } = require("../middleware/auth");
const geocodingService = require("../service/geocoding");

// Middleware to check if user is an admin
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false,
            message: 'Access denied. Only admins can access this endpoint.' 
        });
    }
    next();
};

// Search and filter routes
router.get("/search", agentController.searchAgents);
router.get("/filter/:status", agentController.filterAgents);

// Admin routes for verification
router.get(
  "/pending-verification",
  requireAuth,
  agentController.getPendingVerification
);
router.post(
  "/update-verification/:id",
  requireAuth,
  agentController.updateVerificationStatus
);

// Admin geocoding endpoints for agents

// Automatically geocode agent location
router.post('/admin/geolocation/auto/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { AgentModel } = require('../models');
        const { id } = req.params;
        
        // Get the agent to extract its location
        const agent = await AgentModel.getAgentById(id);
        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }
        
        // Try to geocode using the location field
        const locationToGeocode = agent.location;
        if (!locationToGeocode || locationToGeocode.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Agent has no location to geocode'
            });
        }
        
        try {
            console.log(`Admin geocoding agent ${id} with location: ${locationToGeocode}`);
            
            // Use the geocoding service
            const geocodeResult = await geocodingService.getCoordinatesFromAddress(locationToGeocode);
            
            // Update the agent with the new coordinates
            const updateData = {
                geolocation: {
                    latitude: geocodeResult.latitude,
                    longitude: geocodeResult.longitude,
                    serviceRadius: agent.geolocation?.serviceRadius || 50
                }
            };
            
            const updatedAgent = await AgentModel.updateAgent(id, updateData);
            
            res.json({
                success: true,
                message: 'Agent geocoded and updated successfully',
                agent: updatedAgent,
                geocoding: {
                    originalLocation: locationToGeocode,
                    formattedAddress: geocodeResult.formattedAddress,
                    coordinates: {
                        latitude: geocodeResult.latitude,
                        longitude: geocodeResult.longitude
                    }
                }
            });
            
        } catch (geocodeError) {
            console.error('Geocoding failed for agent:', geocodeError.message);
            return res.status(400).json({
                success: false,
                message: `Failed to geocode location: ${geocodeError.message}`
            });
        }
        
    } catch (error) {
        console.error('Error in admin agent auto-geocoding:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to auto-geocode agent',
            error: error.message
        });
    }
});

// Get agents without geolocation data
router.get('/admin/missing-geolocation', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { AgentModel } = require('../models');
        
        const agents = await AgentModel.Agent.find({
            $or: [
                { 'geolocation.latitude': { $exists: false } },
                { 'geolocation.longitude': { $exists: false } },
                { 'geolocation.latitude': null },
                { 'geolocation.longitude': null }
            ]
        }).select('_id name location email');
        
        res.json({
            success: true,
            agents: agents,
            count: agents.length
        });
    } catch (error) {
        console.error('Error fetching agents without geolocation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch agents without geolocation',
            error: error.message
        });
    }
});

// Batch auto-geocode multiple agents
router.post('/admin/geolocation/auto-batch', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { AgentModel } = require('../models');
        const { agentIds } = req.body;
        
        if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Agent IDs array is required'
            });
        }
        
        const results = {
            successful: [],
            failed: [],
            total: agentIds.length
        };
        
        console.log(`Starting batch auto-geocoding for ${agentIds.length} agents`);
        
        for (const agentId of agentIds) {
            try {
                // Get the agent
                const agent = await AgentModel.getAgentById(agentId);
                if (!agent) {
                    results.failed.push({
                        agentId,
                        error: 'Agent not found'
                    });
                    continue;
                }
                
                // Check if it has a location
                const locationToGeocode = agent.location;
                if (!locationToGeocode || locationToGeocode.trim() === '') {
                    results.failed.push({
                        agentId,
                        error: 'No location available'
                    });
                    continue;
                }
                
                // Geocode the location
                const geocodeResult = await geocodingService.getCoordinatesFromAddress(locationToGeocode);
                
                // Update the agent
                const updateData = {
                    geolocation: {
                        latitude: geocodeResult.latitude,
                        longitude: geocodeResult.longitude,
                        serviceRadius: agent.geolocation?.serviceRadius || 50
                    }
                };
                
                await AgentModel.updateAgent(agentId, updateData);
                
                results.successful.push({
                    agentId,
                    originalLocation: locationToGeocode,
                    formattedAddress: geocodeResult.formattedAddress,
                    coordinates: {
                        latitude: geocodeResult.latitude,
                        longitude: geocodeResult.longitude
                    }
                });
                
                console.log(`✅ Successfully geocoded agent ${agentId}`);
                
                // Add a small delay to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`❌ Failed to geocode agent ${agentId}:`, error.message);
                results.failed.push({
                    agentId,
                    error: error.message
                });
            }
        }
        
        console.log(`Batch agent geocoding completed: ${results.successful.length} successful, ${results.failed.length} failed`);
        
        res.json({
            success: true,
            message: `Batch geocoding completed: ${results.successful.length}/${results.total} agents geocoded successfully`,
            results
        });
        
    } catch (error) {
        console.error('Error in batch agent auto-geocoding:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform batch agent auto-geocoding',
            error: error.message
        });
    }
});

// Agent CRUD routes
router.get("/", agentController.getAllAgents);
router.get("/current-profile", requireAuth, agentController.getCurrentAgentProfile);
router.get("/:id", agentController.getAgentById);
router.post("/", agentController.addAgent);
router.put("/:id", agentController.updateAgent);
router.delete("/:id", agentController.deleteAgent);

// Agent interactions
router.post("/:id/reviews", agentController.addReview);
router.post("/:id/properties", agentController.addPropertyToAgent);

// Document upload route
router.post(
  "/upload-documents",
  requireAuth,
  agentController.upload.fields([
    { name: "idProof", maxCount: 1 },
    { name: "license", maxCount: 1 },
    { name: "businessProof", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
    { name: "additionalDocs", maxCount: 5 },
  ]),
  agentController.uploadDocuments
);

module.exports = router;
