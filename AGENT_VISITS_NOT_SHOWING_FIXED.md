# ✅ Agent Visits Not Showing - Fixed!

## 🔴 Problem

Buyer scheduled a visit, but it doesn't show up in the agent's visit management dashboard.

---

## 🔍 Root Cause

**ID Mismatch Issue:**

The system has two types of IDs:
1. **User ID** (`req.user._id`) - The logged-in user's ID
2. **Agent ID** (`agent._id`) - The Agent document's ID

### What was happening:

#### When Creating Visit (scheduleVisit):
```javascript
// Line 133 in controllers/visit.js
agentId: property.agent  // ← Stores Agent document ID
```

#### When Querying Visits (getAgentVisitsAPI):
```javascript
// OLD CODE (❌ Wrong):
const agentId = req.user._id;  // ← User ID, not Agent ID!
const visits = await Visit.find({ agentId })  // ← No match!
```

**The query was using User ID to search for visits, but visits store Agent ID!**

---

## ✅ Solution

First find the Agent document using the User ID, then query visits using the Agent's ID.

### Updated `getAgentVisitsAPI` in `controllers/visit.js`:

```javascript
// Get agent visits as JSON API (for React frontend)
const getAgentVisitsAPI = async (req, res) => {
  try {
    const userId = req.user._id;  // ← Get User ID

    // STEP 1: Find the agent document for this user
    const agent = await AgentModel.findOne({ userId: userId });
    
    if (!agent) {
      return res.json({
        success: true,
        visits: [],
        message: "No agent profile found for this user"
      });
    }

    // STEP 2: Get all visits using the Agent's _id (not User's _id)
    const visits = await Visit.find({ agentId: agent._id })  // ← Use Agent ID!
      .populate("propertyId")
      .populate("buyerId", "name email phone")
      .sort({ visitDate: 1, status: 1 });

    res.json({
      success: true,
      visits: visits || [],
    });
  } catch (error) {
    console.error("Error fetching agent visits:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch visits",
      error: error.message,
    });
  }
};
```

---

## 📊 Data Flow Explained

### Creating a Visit (Buyer Side):
```
1. Buyer selects property
   ↓
2. System gets property.agent (Agent ID)
   ↓
3. Creates visit with:
   - buyerId: req.user._id (User ID)
   - agentId: property.agent (Agent ID) ← Stores Agent ID
   ↓
4. Visit saved to database
```

### Fetching Visits (Agent Side):
```
1. Agent logs in (has User ID)
   ↓
2. System finds Agent document:
   Agent.findOne({ userId: req.user._id })
   ↓
3. Gets agent._id (Agent ID)
   ↓
4. Queries visits:
   Visit.find({ agentId: agent._id }) ← Uses Agent ID
   ↓
5. Returns matching visits
```

---

## 🎯 Why This Happens

Your system has a **User-Agent relationship**:

```
User (Authentication)
  ↓
  userId
  ↓
Agent (Profile/Business)
  ↓
  agent._id
  ↓
Visit (Appointments)
```

- **User** = Login credentials, authentication
- **Agent** = Business profile, properties, specialization
- **Visit** = Appointment linked to Agent profile

This is a common pattern in multi-role systems where one User can have different profiles (Agent, Buyer, Seller, etc.).

---

## 🚀 Testing

**Restart your backend server:**
```bash
# Stop the server (Ctrl+C)
# Start it again
npm start
```

**Test the flow:**

### As Buyer:
1. Login as buyer
2. Go to **Properties → Property Visits → Schedule Visit**
3. Select a property
4. Choose date and time
5. Submit visit request
6. ✅ Visit created successfully

### As Agent:
1. Login as agent (who owns the property)
2. Go to **Properties → Property Visits → Manage Visits**
3. ✅ Should now see the visit request in "Pending" tab!

---

## 🔍 Debugging Tips

If visits still don't show:

### 1. Check Agent Profile Exists:
```javascript
// In MongoDB or via API
db.agents.findOne({ userId: <your-user-id> })
```

### 2. Check Property Has Agent:
```javascript
// In MongoDB or via API
db.properties.findOne({ _id: <property-id> })
// Should have: agent: <agent-id>
```

### 3. Check Visit Was Created:
```javascript
// In MongoDB or via API
db.visits.find({ propertyId: <property-id> })
// Should show the visit with agentId
```

### 4. Verify IDs Match:
```javascript
// The visit's agentId should match the agent's _id
visit.agentId === agent._id  // Should be true
```

---

## 📝 Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Visits not showing for agent | Query used User ID instead of Agent ID | Find Agent document first, then query with Agent ID |
| `Visit.find({ agentId: req.user._id })` | Wrong ID type | `Visit.find({ agentId: agent._id })` |

---

## ✅ Result

**Agent visits should now display correctly!** 🎉

- ✅ Buyer schedules visit → Stored with Agent ID
- ✅ Agent views dashboard → Queries with Agent ID
- ✅ Visits match and display properly
- ✅ All visit management features work

**Restart your server and test the complete flow!** 🚀

---

## 🔄 Related Files Changed

- ✅ `controllers/visit.js` - Updated `getAgentVisitsAPI` function
- ✅ Lines 750-785 modified

**No other changes needed - the fix is complete!**
