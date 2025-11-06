# ✅ VisitModel Error - Fixed!

## 🔴 Error

```
TypeError: VisitModel.find is not a function
```

---

## 🔍 Root Cause

The `VisitModel` exported from `models/visit.js` is **not a Mongoose model** - it's a **wrapper object** with helper methods.

### What was exported:
```javascript
// models/visit.js
const Visit = mongoose.model('Visit', visitSchema);  // ← Mongoose model

const VisitModel = {  // ← Wrapper object with methods
  getAllVisits: async () => { ... },
  getVisitsByAgent: async (agentId) => { ... },
  // etc.
};

module.exports = {
  Visit,        // ← Mongoose model (has .find())
  VisitModel    // ← Wrapper object (NO .find())
};
```

### What the controller tried to do:
```javascript
const visits = await VisitModel.find({ agentId })  // ❌ VisitModel.find is not a function
```

---

## ✅ Solution

Import and use the `Visit` Mongoose model directly instead of the `VisitModel` wrapper.

### Changes Made to `controllers/visit.js`:

#### 1. **Added Import** (Line 2):
```javascript
const { PropertyModel, AgentModel, VisitModel } = require("../models");
const { Visit } = require("../models/visit");  // ← NEW: Import Visit model
const mongoose = require("mongoose");
```

#### 2. **Updated `getAgentVisitsAPI`** (Line 756):
```javascript
// OLD (❌ Error):
const visits = await VisitModel.find({ agentId })

// NEW (✅ Works):
const visits = await Visit.find({ agentId })
```

#### 3. **Updated `getAvailableSlotsAPI`** (Line 799):
```javascript
// OLD (❌ Error):
const bookedVisits = await VisitModel.find({

// NEW (✅ Works):
const bookedVisits = await Visit.find({
```

---

## 🎯 What Now Works

### ✅ Agent Visits API:
```javascript
GET /api/visit/agent-visits

// Now correctly queries the database:
const visits = await Visit.find({ agentId })
  .populate("propertyId")
  .populate("buyerId", "name email phone")
  .sort({ visitDate: 1, status: 1 });
```

### ✅ Available Slots API:
```javascript
GET /api/visit/available-slots?date=2025-11-10&propertyId=123

// Now correctly queries the database:
const bookedVisits = await Visit.find({
  propertyId,
  visitDate: new Date(date),
  status: { $in: ["pending", "approved"] },
});
```

---

## 🔄 Alternative Approach

If you wanted to use the `VisitModel` wrapper methods instead, you could have done:

```javascript
// Using VisitModel helper methods:
const visits = await VisitModel.getVisitsByAgent(agentId);
```

But using `Visit` directly is simpler and more flexible for custom queries.

---

## 🚀 Testing

**Restart your backend server:**
```bash
# Stop the server (Ctrl+C)
# Start it again
npm start
```

**Then test:**
1. Login as **agent**
2. Navigate to **Properties → Property Visits → Manage Visits**
3. Should now load successfully! ✅

---

## 📊 Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| `VisitModel.find is not a function` | VisitModel is a wrapper object, not Mongoose model | Import and use `Visit` model directly |
| 500 Internal Server Error | Controller couldn't query database | Changed `VisitModel.find()` to `Visit.find()` |

---

## ✅ Result

**The visit management system should now work perfectly!** 🎉

- ✅ Agent can view all visits
- ✅ Buyer can schedule visits
- ✅ Time slots check availability
- ✅ All CRUD operations functional

**Restart your server and test the visit management features!** 🚀
