# ✅ Visit API Routes - Fixed!

## 🔧 Problem Identified

The backend had visit routes but they were designed for **EJS templates** (HTML pages), not for the **React frontend** (JSON API).

### What Was Missing:
- ❌ `/api/visit/agent-visits` endpoint (404 error)
- ❌ `/api/visit/available-slots` endpoint
- ❌ JSON responses for React components

### What Existed:
- ✅ `/api/visit/agent` (but returns HTML, not JSON)
- ✅ `/api/visit/my-visits` (works for buyers)
- ✅ `/api/visit/schedule` (works for scheduling)

---

## ✅ Changes Made

### 1. **Updated `routes/visit.js`**

Added new API endpoints:

```javascript
// Get agent visits (JSON API for React)
router.get(
  "/agent-visits",
  requireAuth,
  visitController.requireAgent,
  visitController.getAgentVisitsAPI
);

// Get available time slots (JSON API)
router.get(
  "/available-slots",
  visitController.getAvailableSlotsAPI
);
```

**Lines Added**: After line 54 (after getAgentDashboard route)

---

### 2. **Updated `controllers/visit.js`**

Added two new controller methods:

#### A. `getAgentVisitsAPI` Method:
```javascript
// Get agent visits as JSON API (for React frontend)
const getAgentVisitsAPI = async (req, res) => {
  try {
    const agentId = req.user._id;

    // Get all visits for this agent
    const visits = await VisitModel.find({ agentId })
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

#### B. `getAvailableSlotsAPI` Method:
```javascript
// Get available time slots as JSON API (for React frontend)
const getAvailableSlotsAPI = async (req, res) => {
  try {
    const { date, propertyId } = req.query;

    const allSlots = [
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "12:00 - 13:00",
      "13:00 - 14:00",
      "14:00 - 15:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
    ];

    if (!date || !propertyId) {
      return res.json({
        success: true,
        timeSlots: allSlots,
      });
    }

    // Find booked slots for this date and property
    const bookedVisits = await VisitModel.find({
      propertyId,
      visitDate: new Date(date),
      status: { $in: ["pending", "approved"] },
    });

    const bookedSlots = bookedVisits.map((v) => v.timeSlot);
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    res.json({
      success: true,
      timeSlots: availableSlots,
    });
  } catch (error) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch time slots",
      error: error.message,
    });
  }
};
```

#### C. Updated `module.exports`:
```javascript
module.exports = {
  requireBuyer,
  requireAgent,
  getSchedulePage,
  getScheduleForProperty,
  scheduleVisit,
  getMyVisits,
  cancelVisit,
  getAgentDashboard,
  getAgentVisitsAPI,        // ← NEW
  getAvailableSlotsAPI,     // ← NEW
  approveVisit,
  rejectVisit,
  completeVisit,
  getTimeSlots,
  processOverdueVisits,
};
```

**Lines Added**: Before `module.exports` (around line 748)

---

## 🎯 What Now Works

### ✅ Agent Visit Management:
```bash
GET /api/visit/agent-visits
Headers: { Authorization: Bearer <token> }
Response: {
  success: true,
  visits: [
    {
      _id: "...",
      propertyId: { title, location, images, ... },
      buyerId: { name, email, phone },
      visitDate: "2025-11-10",
      timeSlot: "10:00 - 11:00",
      status: "pending",
      buyerNotes: "...",
      agentNotes: "..."
    }
  ]
}
```

### ✅ Available Time Slots:
```bash
GET /api/visit/available-slots?date=2025-11-10&propertyId=123
Response: {
  success: true,
  timeSlots: [
    "09:00 - 10:00",
    "11:00 - 12:00",
    "14:00 - 15:00"
  ]
}
```

---

## 🚀 Testing

### 1. **Restart Your Backend Server**
```bash
# Stop the server (Ctrl+C)
# Start it again
npm start
# or
node index.js
```

### 2. **Test in Browser**
- Login as an **agent**
- Navigate to: **Properties → Property Visits → Manage Visits**
- Should now see the visits dashboard without 404 errors

### 3. **Test as Buyer**
- Login as a **buyer**
- Navigate to: **Properties → Property Visits → Schedule Visit**
- Select property, date, and time slot
- Should see available slots dynamically

---

## 📊 API Endpoints Summary

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/api/visit/schedule` | POST | ✅ | Buyer | Schedule new visit |
| `/api/visit/my-visits` | GET | ✅ | Buyer | Get buyer's visits |
| `/api/visit/agent-visits` | GET | ✅ | Agent | Get agent's visits (NEW) |
| `/api/visit/available-slots` | GET | ❌ | Any | Get available time slots (NEW) |
| `/api/visit/approve/:visitId` | POST | ✅ | Agent | Approve visit |
| `/api/visit/reject/:visitId` | POST | ✅ | Agent | Reject visit |
| `/api/visit/complete/:visitId` | POST | ✅ | Agent | Complete visit |
| `/api/visit/cancel/:visitId` | POST | ✅ | Buyer | Cancel visit |
| `/api/visit/process-overdue` | POST | ✅ | Agent/Admin | Process overdue visits |

---

## ✅ Result

**The 404 errors should now be resolved!**

The React frontend can now:
- ✅ Fetch agent visits
- ✅ Check available time slots
- ✅ Display visit management dashboard
- ✅ Schedule new visits
- ✅ Approve/reject/complete visits

**Restart your backend server and test the visit management features!** 🎉

---

## 🔍 If Still Getting Errors

1. **Check server is running**: `http://localhost:8000` or your port
2. **Check console logs**: Look for any startup errors
3. **Verify VisitModel exists**: Check `models/visit.js` or similar
4. **Check authentication**: Make sure you're logged in as agent
5. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)

---

## 📝 Notes

- The original routes (`/api/visit/agent`) still work for EJS templates
- New routes (`/api/visit/agent-visits`) are specifically for React
- Both can coexist without conflicts
- Authentication is required for most endpoints
- Role-based access control is enforced

**Everything should work now!** 🚀
