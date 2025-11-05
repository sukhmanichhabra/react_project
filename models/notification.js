const mongoose = require('mongoose');

// Notification Schema
const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'rent_due',
            'emi_due',
            'property_sold',
            'property_rented',
            'loan_approved',
            'loan_rejected',
            'property_approved',
            'property_rejected',
            'visit_scheduled',
            'visit_approved',
            'visit_rejected',
            'visit_cancelled',
            'message_received',
            'system'
        ]
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedModel'
    },
    relatedModel: {
        type: String,
        enum: ['Property', 'Rent', 'EMI', 'LoanApplication', 'Visit', 'Message', null]
    },
    link: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

// Get all notifications for a user
async function getUserNotifications(userId, options = {}) {
    const { limit = 50, skip = 0, unreadOnly = false } = options;
    
    try {
        const query = { userId };
        
        if (unreadOnly) {
            query.isRead = false;
        }
        
        return await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    } catch (error) {
        console.error('Error getting user notifications:', error);
        return [];
    }
}

// Mark notification as read
async function markAsRead(notificationId) {
    try {
        return await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return null;
    }
}

// Mark all notifications as read for a user
async function markAllAsRead(userId) {
    try {
        const result = await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
        return result.modifiedCount;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return 0;
    }
}

// Create a new notification
async function createNotification(notificationData) {
    try {
        const notification = new Notification(notificationData);
        return await notification.save();
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

// Delete a notification
async function deleteNotification(notificationId) {
    try {
        return await Notification.findByIdAndDelete(notificationId);
    } catch (error) {
        console.error('Error deleting notification:', error);
        return null;
    }
}

// Get unread notification count for a user
async function getUnreadCount(userId) {
    try {
        return await Notification.countDocuments({ userId, isRead: false });
    } catch (error) {
        console.error('Error getting unread notification count:', error);
        return 0;
    }
}

module.exports = {
    Notification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    getUnreadCount
}; 