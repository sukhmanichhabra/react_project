const mongoose = require('mongoose');

// Property Visit Schema
const visitSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Property ID is required']
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Buyer ID is required']
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        required: [true, 'Agent ID is required']
    },
    visitDate: {
        type: Date,
        required: [true, 'Visit date is required']
    },
    timeSlot: {
        type: String,
        required: [true, 'Time slot is required']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    notes: {
        type: String,
        default: ''
    },
    buyerNotes: {
        type: String,
        default: ''
    },
    agentNotes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Visit = mongoose.model('Visit', visitSchema);

// CRUD operations for property visits
const VisitModel = {
    // Get all visits
    getAllVisits: async () => {
        return await Visit.find({})
            .populate('propertyId')
            .populate('buyerId')
            .populate({
                path: 'agentId',
                populate: {
                    path: 'userId'
                }
            });
    },
    
    // Get visit by ID
    getVisitById: async (id) => {
        return await Visit.findById(id)
            .populate('propertyId')
            .populate('buyerId')
            .populate({
                path: 'agentId',
                populate: {
                    path: 'userId'
                }
            });
    },
    
    // Get visits by buyer ID
    getVisitsByBuyer: async (buyerId) => {
        return await Visit.find({ buyerId })
            .populate('propertyId')
            .populate('buyerId')
            .populate({
                path: 'agentId',
                populate: {
                    path: 'userId'
                }
            })
            .sort({ visitDate: 1 });
    },
    
    // Get visits by agent ID
    getVisitsByAgent: async (agentId) => {
        return await Visit.find({ agentId })
            .populate('propertyId')
            .populate('buyerId')
            .populate({
                path: 'agentId',
                populate: {
                    path: 'userId'
                }
            })
            .sort({ visitDate: 1 });
    },
    
    // Get visits by property ID
    getVisitsByProperty: async (propertyId) => {
        return await Visit.find({ propertyId })
            .populate('propertyId')
            .populate('buyerId')
            .populate({
                path: 'agentId',
                populate: {
                    path: 'userId'
                }
            })
            .sort({ visitDate: 1 });
    },
    
    // Create a new visit
    createVisit: async (visitData) => {
        const newVisit = new Visit(visitData);
        return await newVisit.save();
    },
    
    // Update a visit
    updateVisit: async (id, updateData) => {
        return await Visit.findByIdAndUpdate(id, updateData, { new: true });
    },
    
    // Delete a visit
    deleteVisit: async (id) => {
        return await Visit.findByIdAndDelete(id);
    },
    
    // Update visit status
    updateVisitStatus: async (id, status) => {
        return await Visit.findByIdAndUpdate(id, { status }, { new: true });
    },
    
    // Get pending visits for an agent
    getPendingVisitsByAgent: async (agentId) => {
        return await Visit.find({ agentId, status: 'pending' })
            .populate('propertyId')
            .populate('buyerId')
            .populate({
                path: 'agentId',
                populate: {
                    path: 'userId'
                }
            })
            .sort({ visitDate: 1 });
    },
    
    // Get upcoming visits for an agent (approved but not completed)
    getUpcomingVisitsByAgent: async (agentId) => {
        return await Visit.find({ 
            agentId, 
            status: 'approved',
            visitDate: { $gte: new Date() }
        })
        .populate('propertyId')
        .populate('buyerId')
        .populate({
            path: 'agentId',
            populate: {
                path: 'userId'
            }
        })
        .sort({ visitDate: 1 });
    },
    
    // Get upcoming visits for a buyer (approved but not completed)
    getUpcomingVisitsByBuyer: async (buyerId) => {
        return await Visit.find({ 
            buyerId, 
            status: 'approved',
            visitDate: { $gte: new Date() }
        })
        .populate('propertyId')
        .populate('buyerId')
        .populate({
            path: 'agentId',
            populate: {
                path: 'userId'
            }
        })
        .sort({ visitDate: 1 });
    },
    
    // Get visits by agent's user ID (for agent dashboard)
    getVisitsByAgentUserId: async (userId) => {
        // First, find the agent by user ID
        const Agent = mongoose.model('Agent');
        const agent = await Agent.findOne({ userId });
        
        if (!agent) {
            return [];
        }
        
        // Then get all visits for this agent
        return await Visit.find({ agentId: agent._id })
            .populate('propertyId')
            .populate('buyerId')
            .populate({
                path: 'agentId',
                populate: {
                    path: 'userId'
                }
            })
            .sort({ visitDate: 1 });
    },
    
    // Get pending visits for an agent by user ID
    getPendingVisitsByAgentUserId: async (userId) => {
        // First, find the agent by user ID
        const Agent = mongoose.model('Agent');
        const agent = await Agent.findOne({ userId });
        
        if (!agent) {
            return [];
        }
        
        // Then get pending visits for this agent
        return await Visit.find({ 
            agentId: agent._id,
            status: 'pending'
        })
        .populate('propertyId')
        .populate('buyerId')
        .populate({
            path: 'agentId',
            populate: {
                path: 'userId'
            }
        })
        .sort({ visitDate: 1 });
    },
    
    // Get upcoming visits for an agent by user ID
    getUpcomingVisitsByAgentUserId: async (userId) => {
        // First, find the agent by user ID
        const Agent = mongoose.model('Agent');
        const agent = await Agent.findOne({ userId });
        
        if (!agent) {
            return [];
        }
        
        // Then get upcoming visits for this agent
        return await Visit.find({ 
            agentId: agent._id,
            status: 'approved'
        })
        .populate('propertyId')
        .populate('buyerId')
        .populate({
            path: 'agentId',
            populate: {
                path: 'userId'
            }
        })
        .sort({ visitDate: 1 });
    }
};

module.exports = {
    Visit,
    VisitModel
}; 