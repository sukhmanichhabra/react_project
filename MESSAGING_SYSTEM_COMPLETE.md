# Messaging System Implementation Guide

## Overview
This document describes the complete messaging system that allows users to send messages to property agents and enables agents to manage and reply to these messages through their dashboard.

## System Architecture

### 1. Database Model (Message Model)
**File:** `models/message.js`

The Message model stores all communication between users and agents:

```javascript
{
  senderId: ObjectId,           // User who sent the message (or temp ID)
  senderName: String,           // Name from contact form
  senderEmail: String,          // Email from contact form  
  senderPhone: String,          // Optional phone number
  receiverId: ObjectId,         // Agent's user ID
  propertyId: String,           // Property the inquiry is about
  propertyTitle: String,        // Property title for reference
  subject: String,              // Default: "Property Inquiry"
  message: String,              // The actual message content
  status: String,               // "unread", "read", or "replied"
  readAt: Date,                 // When message was marked as read
  repliedAt: Date,              // When agent replied
  reply: String,                // Agent's reply text
  createdAt: Date,              // Auto-generated timestamp
  updatedAt: Date               // Auto-generated timestamp
}
```

**Key Functions:**
- `createMessage(messageData)` - Creates a new message
- `getReceivedMessages(userId)` - Gets all messages for an agent
- `markAsRead(messageId)` - Marks message as read
- `markAsReplied(messageId, replyText)` - Marks message as replied and stores reply
- `deleteMessage(messageId)` - Deletes a message

### 2. Contact Form Component
**File:** `client/src/components/property overview/AgentDetails.jsx`

Features:
- Form validation (name, email, phone, 30+ character message)
- Real-time validation feedback
- Loading states during submission
- Success/error messaging
- Sends POST request to `/api/property/:id/contact`

**Key Implementation:**
```javascript
const response = await axios.post(`/api/property/${propertyId}/contact`, {
  name: formData.name,
  email: formData.email,
  phone: formData.phone,
  message: formData.message
});
```

### 3. Backend Contact Handler
**File:** `routes/property.js` - Route: `POST /:id/contact`

Process:
1. Validates required fields (name, email, message)
2. Finds the property by ID
3. Gets the assigned agent for the property
4. Creates a message record in the database
5. Returns success/error response

**Key Features:**
- Works for both logged-in and anonymous users
- Automatically assigns to the correct agent
- Stores all necessary contact information

### 4. Agent Dashboard Messages
**File:** `client/src/components/Dashboard/Agent/Messages.jsx`

Features:
- Displays all received messages
- Shows unread count
- Message status badges (unread/read/replied)
- Mark as read functionality
- Reply functionality with form
- Delete messages
- Groups messages by property
- Real-time status updates

**Key API Calls:**
```javascript
// Get messages
GET /api/dashboard/messages

// Mark as read
PUT /api/dashboard/messages/:id/read

// Send reply
PUT /api/dashboard/messages/:id/reply
Body: { replyText: "Reply content" }

// Delete message
DELETE /api/dashboard/messages/:id
```

### 5. Dashboard Controller
**File:** `controllers/dashboard.js`

Functions:
- `getAgentMessages()` - Fetches all messages for logged-in agent
- `markMessageAsRead()` - Updates message status to read
- `replyToMessage()` - Stores reply and updates status
- `deleteMessage()` - Removes message from database

**Security:**
- All functions require agent authentication
- Messages are filtered by agent's user ID
- Only agents can access their own messages

## API Routes Summary

### Contact Form Submission
```
POST /api/property/:id/contact
Body: {
  name: string,
  email: string, 
  phone: string (optional),
  message: string
}
```

### Message Management (Agent Only)
```
GET /api/dashboard/messages
PUT /api/dashboard/messages/:id/read
PUT /api/dashboard/messages/:id/reply
DELETE /api/dashboard/messages/:id
```

## User Flow

### For Users (Sending Messages):
1. User visits property details page
2. Scrolls to "Contact Agent" section
3. Fills out contact form with name, email, phone, message
4. Form validates input (30+ character message required)
5. Submits form via AJAX to backend
6. Receives confirmation message
7. Agent receives notification of new message

### For Agents (Managing Messages):
1. Agent logs into dashboard
2. Navigates to "Messages" section
3. Sees list of all received messages with status
4. Can see unread count and property details
5. Can mark messages as read
6. Can reply to messages with built-in form
7. Can delete unwanted messages
8. Status updates in real-time

## Configuration Requirements

### 1. Database Setup
- MongoDB with Message collection
- Proper indexing on receiverId and status fields

### 2. Route Configuration
**File:** `index.js`
```javascript
app.use("/api/property", propertyRoutes);
app.use("/api/dashboard", dashboardRoutes);
```

### 3. Authentication Middleware
- Contact form works for anonymous users
- Dashboard message functions require agent authentication
- Uses `requireAuth` middleware for protected routes

## Testing the Implementation

### Manual Testing Steps:
1. **Test Contact Form:**
   - Go to any property page
   - Fill out contact form 
   - Verify success message appears
   - Check database for new message record

2. **Test Agent Dashboard:**
   - Login as agent user
   - Go to dashboard Messages section
   - Verify messages appear with correct status
   - Test mark as read functionality
   - Test reply functionality
   - Test delete functionality

### Automated Testing:
Run the test script:
```bash
node test_messaging_functionality.js
```

## Files Modified/Created

### Modified Files:
1. `models/message.js` - Added reply field and updated functions
2. `client/src/components/property overview/AgentDetails.jsx` - Implemented API call
3. `client/src/components/Dashboard/Agent/Messages.jsx` - Fixed date display and reply request
4. `controllers/dashboard.js` - Updated reply function to store reply text

### New Files:
1. `test_messaging_functionality.js` - Test script for messaging system

## Security Considerations

1. **Input Validation:**
   - All form inputs are validated on frontend and backend
   - Email format validation
   - Message length requirements

2. **Authentication:**
   - Agent routes require valid authentication
   - Users can only access their own messages
   - Anonymous contact form submissions are allowed

3. **Data Sanitization:**
   - All user inputs should be sanitized before storage
   - XSS prevention in message display

## Future Enhancements

1. **Email Notifications:**
   - Send email to agent when new message received
   - Send email to user when agent replies

2. **Real-time Updates:**
   - WebSocket integration for live message updates
   - Push notifications for mobile apps

3. **Message Threading:**
   - Group related messages in conversations
   - Message history for ongoing communications

4. **File Attachments:**
   - Allow users to attach images or documents
   - Secure file upload and storage

5. **Message Templates:**
   - Pre-written reply templates for agents
   - Common responses for frequent inquiries

## Conclusion

The messaging system is now fully functional with:
- ✅ Contact form sends messages to agents
- ✅ Messages are stored in database with proper structure
- ✅ Agent dashboard displays all messages
- ✅ Agents can read, reply, and delete messages
- ✅ Real-time status updates
- ✅ Proper error handling and validation
- ✅ Security measures in place

The system provides a complete communication channel between property inquirers and agents, improving the user experience and helping agents manage their leads effectively.