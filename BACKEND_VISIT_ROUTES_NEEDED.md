# 🔧 Backend Visit Routes - Implementation Needed

## ❌ Current Issue

The frontend is trying to call visit API endpoints that don't exist on the backend:
- `GET /api/visit/agent-visits` → 404 Not Found
- `GET /api/visit/my-visits` → 404 Not Found
- `POST /api/visit/schedule` → 404 Not Found
- etc.

**The backend routes and controllers need to be created!**

---

## 📋 Required Backend Implementation

### 1. **Create Visit Model**
**File**: `models/visit.js` or `models/Visit.js`

```javascript
const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  visitDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  buyerNotes: {
    type: String
  },
  agentNotes: {
    type: String
  },
  approvedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
visitSchema.index({ buyerId: 1, status: 1 });
visitSchema.index({ agentId: 1, status: 1 });
visitSchema.index({ propertyId: 1, visitDate: 1 });

module.exports = mongoose.model('Visit', visitSchema);
```

---

### 2. **Create Visit Controller**
**File**: `controllers/visit.js` or `controllers/visitController.js`

```javascript
const Visit = require('../models/Visit');
const Property = require('../models/Property');
const User = require('../models/User');

// Schedule a visit (Buyer)
exports.scheduleVisit = async (req, res) => {
  try {
    const { propertyId, visitDate, timeSlot, notes } = req.body;
    const buyerId = req.user._id;

    // Validate property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Get agent from property (assuming property has agentId or sellerId)
    const agentId = property.agentId || property.sellerId;

    // Check if slot is already booked
    const existingVisit = await Visit.findOne({
      propertyId,
      visitDate: new Date(visitDate),
      timeSlot,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingVisit) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create visit
    const visit = await Visit.create({
      propertyId,
      buyerId,
      agentId,
      visitDate: new Date(visitDate),
      timeSlot,
      buyerNotes: notes,
      status: 'pending'
    });

    // Populate data
    await visit.populate('propertyId buyerId agentId');

    // TODO: Send notification to agent

    res.status(201).json({
      success: true,
      message: 'Visit scheduled successfully',
      visit
    });
  } catch (error) {
    console.error('Error scheduling visit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule visit',
      error: error.message
    });
  }
};

// Get buyer's visits
exports.getMyVisits = async (req, res) => {
  try {
    const buyerId = req.user._id;

    const visits = await Visit.find({ buyerId })
      .populate('propertyId')
      .populate('agentId', 'name email phone')
      .sort({ visitDate: -1 });

    res.json({
      success: true,
      visits
    });
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visits',
      error: error.message
    });
  }
};

// Get agent's visits
exports.getAgentVisits = async (req, res) => {
  try {
    const agentId = req.user._id;

    const visits = await Visit.find({ agentId })
      .populate('propertyId')
      .populate('buyerId', 'name email phone')
      .sort({ visitDate: 1, status: 1 });

    res.json({
      success: true,
      visits
    });
  } catch (error) {
    console.error('Error fetching agent visits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visits',
      error: error.message
    });
  }
};

// Get available time slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, propertyId } = req.query;

    const allSlots = [
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '12:00 - 13:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00',
      '16:00 - 17:00'
    ];

    // Find booked slots
    const bookedVisits = await Visit.find({
      propertyId,
      visitDate: new Date(date),
      status: { $in: ['pending', 'approved'] }
    });

    const bookedSlots = bookedVisits.map(v => v.timeSlot);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      success: true,
      timeSlots: availableSlots
    });
  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time slots',
      error: error.message
    });
  }
};

// Approve visit (Agent)
exports.approveVisit = async (req, res) => {
  try {
    const { visitId } = req.params;
    const { notes } = req.body;
    const agentId = req.user._id;

    const visit = await Visit.findOne({ _id: visitId, agentId });
    
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    if (visit.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Visit cannot be approved'
      });
    }

    visit.status = 'approved';
    visit.agentNotes = notes;
    visit.approvedAt = new Date();
    await visit.save();

    await visit.populate('propertyId buyerId');

    // TODO: Send notification to buyer

    res.json({
      success: true,
      message: 'Visit approved',
      visit
    });
  } catch (error) {
    console.error('Error approving visit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve visit',
      error: error.message
    });
  }
};

// Reject visit (Agent)
exports.rejectVisit = async (req, res) => {
  try {
    const { visitId } = req.params;
    const { notes } = req.body;
    const agentId = req.user._id;

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const visit = await Visit.findOne({ _id: visitId, agentId });
    
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    visit.status = 'rejected';
    visit.agentNotes = notes;
    visit.rejectedAt = new Date();
    await visit.save();

    await visit.populate('propertyId buyerId');

    // TODO: Send notification to buyer

    res.json({
      success: true,
      message: 'Visit rejected',
      visit
    });
  } catch (error) {
    console.error('Error rejecting visit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject visit',
      error: error.message
    });
  }
};

// Complete visit (Agent)
exports.completeVisit = async (req, res) => {
  try {
    const { visitId } = req.params;
    const { notes } = req.body;
    const agentId = req.user._id;

    const visit = await Visit.findOne({ _id: visitId, agentId });
    
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    if (visit.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved visits can be completed'
      });
    }

    visit.status = 'completed';
    if (notes) visit.agentNotes = notes;
    visit.completedAt = new Date();
    await visit.save();

    await visit.populate('propertyId buyerId');

    res.json({
      success: true,
      message: 'Visit marked as completed',
      visit
    });
  } catch (error) {
    console.error('Error completing visit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete visit',
      error: error.message
    });
  }
};

// Cancel visit (Buyer)
exports.cancelVisit = async (req, res) => {
  try {
    const { visitId } = req.params;
    const buyerId = req.user._id;

    const visit = await Visit.findOne({ _id: visitId, buyerId });
    
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    if (visit.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed visits cannot be cancelled'
      });
    }

    visit.status = 'cancelled';
    await visit.save();

    res.json({
      success: true,
      message: 'Visit cancelled',
      visit
    });
  } catch (error) {
    console.error('Error cancelling visit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel visit',
      error: error.message
    });
  }
};

// Process overdue visits (Agent)
exports.processOverdueVisits = async (req, res) => {
  try {
    const now = new Date();
    
    const overdueVisits = await Visit.updateMany(
      {
        status: 'approved',
        visitDate: { $lt: now }
      },
      {
        $set: { status: 'no_show' }
      }
    );

    res.json({
      success: true,
      message: 'Overdue visits processed',
      processedCount: overdueVisits.modifiedCount
    });
  } catch (error) {
    console.error('Error processing overdue visits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process overdue visits',
      error: error.message
    });
  }
};
```

---

### 3. **Create Visit Routes**
**File**: `routes/visit.js` or `routes/visitRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visit');
const { protect, authorize } = require('../middleware/auth'); // Adjust path as needed

// Public/Buyer routes
router.post('/schedule', protect, visitController.scheduleVisit);
router.get('/my-visits', protect, visitController.getMyVisits);
router.get('/available-slots', visitController.getAvailableSlots);
router.post('/cancel/:visitId', protect, visitController.cancelVisit);

// Agent routes
router.get('/agent-visits', protect, authorize('agent', 'admin'), visitController.getAgentVisits);
router.post('/approve/:visitId', protect, authorize('agent', 'admin'), visitController.approveVisit);
router.post('/reject/:visitId', protect, authorize('agent', 'admin'), visitController.rejectVisit);
router.post('/complete/:visitId', protect, authorize('agent', 'admin'), visitController.completeVisit);
router.post('/process-overdue', protect, authorize('agent', 'admin'), visitController.processOverdueVisits);

module.exports = router;
```

---

### 4. **Register Routes in Main App**
**File**: `server.js` or `app.js`

```javascript
// Add this with your other route imports
const visitRoutes = require('./routes/visit');

// Add this with your other route registrations
app.use('/api/visit', visitRoutes);
```

---

## 🔑 Key Points

### Authentication Middleware:
- `protect` - Verifies user is logged in
- `authorize('agent', 'admin')` - Checks user role

### Property Model Assumption:
The code assumes your Property model has either:
- `agentId` field (reference to agent User)
- `sellerId` field (reference to seller User)

**Adjust based on your actual Property schema!**

### User Model:
Assumes User model has `role` field with values like:
- `'buyer'`
- `'agent'`
- `'seller'`
- `'admin'`

---

## 📝 Implementation Steps

1. ✅ **Create Visit Model** (`models/Visit.js`)
2. ✅ **Create Visit Controller** (`controllers/visit.js`)
3. ✅ **Create Visit Routes** (`routes/visit.js`)
4. ✅ **Register Routes** in main app file
5. ✅ **Test Endpoints** with Postman/Thunder Client
6. ✅ **Verify Frontend** works correctly

---

## 🧪 Testing Endpoints

### Schedule Visit:
```bash
POST /api/visit/schedule
Headers: { Authorization: Bearer <token> }
Body: {
  "propertyId": "...",
  "visitDate": "2025-11-10",
  "timeSlot": "10:00 - 11:00",
  "notes": "Interested in this property"
}
```

### Get My Visits:
```bash
GET /api/visit/my-visits
Headers: { Authorization: Bearer <token> }
```

### Get Agent Visits:
```bash
GET /api/visit/agent-visits
Headers: { Authorization: Bearer <token> }
```

### Approve Visit:
```bash
POST /api/visit/approve/:visitId
Headers: { Authorization: Bearer <token> }
Body: {
  "notes": "Approved. See you then!"
}
```

---

## ⚠️ Important Notes

1. **Adjust paths** based on your project structure
2. **Modify auth middleware** names if different
3. **Update Property model** reference if needed
4. **Add notifications** (commented as TODO)
5. **Test thoroughly** before deploying

---

## 🎯 Once Backend is Ready

The frontend will automatically work because:
- ✅ API endpoints match what frontend expects
- ✅ Response structures match frontend parsing
- ✅ All CRUD operations supported
- ✅ Role-based access implemented

**Create these backend files and the visit management system will be fully functional!** 🚀
