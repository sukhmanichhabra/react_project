const NotificationModel = require('../models/notification');

/**
 * Notification Service - Centralized service for creating notifications
 */
class NotificationService {
    /**
     * Create a property status change notification
     * @param {Object} params Parameters for notification
     * @param {string} params.userId User ID to notify
     * @param {string} params.propertyId Property ID
     * @param {string} params.propertyTitle Property title
     * @param {string} params.status New status ('approved', 'rejected', 'sold', 'rented')
     * @returns {Promise<Object>} Created notification
     */
    static async propertyStatusChange({ userId, propertyId, propertyTitle, status }) {
        const statusInfo = {
            'approved': {
                type: 'property_approved',
                title: 'Property Approved',
                message: `Your property "${propertyTitle}" has been approved and is now visible to potential buyers.`,
                priority: 'medium'
            },
            'rejected': {
                type: 'property_rejected',
                title: 'Property Rejected',
                message: `Your property "${propertyTitle}" has been rejected. Please contact support for more information.`,
                priority: 'high'
            },
            'sold': {
                type: 'property_sold',
                title: 'Property Sold',
                message: `Congratulations! Your property "${propertyTitle}" has been successfully sold.`,
                priority: 'high'
            },
            'rented': {
                type: 'property_rented',
                title: 'Property Rented',
                message: `Your property "${propertyTitle}" has been successfully rented out.`,
                priority: 'high'
            }
        };

        const info = statusInfo[status];
        if (!info) {
            throw new Error(`Invalid property status: ${status}`);
        }

        return await NotificationModel.createNotification({
            userId,
            type: info.type,
            title: info.title,
            message: info.message,
            relatedId: propertyId,
            relatedModel: 'Property',
            link: `/property/${propertyId}`,
            priority: info.priority
        });
    }

    /**
     * Create a rent due notification
     * @param {Object} params Parameters for notification
     * @param {string} params.userId User ID to notify
     * @param {string} params.rentId Rent ID
     * @param {string} params.propertyTitle Property title
     * @param {Date} params.dueDate Due date
     * @param {number} params.amount Amount due
     * @returns {Promise<Object>} Created notification
     */
    static async rentDue({ userId, rentId, propertyTitle, dueDate, amount }) {
        const formattedDate = dueDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const formattedAmount = amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });

        return await NotificationModel.createNotification({
            userId,
            type: 'rent_due',
            title: 'Rent Payment Due',
            message: `Your rent payment of ${formattedAmount} for "${propertyTitle}" is due on ${formattedDate}.`,
            relatedId: rentId,
            relatedModel: 'Rent',
            link: `/rent/payments`,
            priority: 'high'
        });
    }

    /**
     * Create an EMI due notification
     * @param {Object} params Parameters for notification
     * @param {string} params.userId User ID to notify
     * @param {string} params.emiId EMI ID
     * @param {string} params.loanId Loan ID
     * @param {string} params.propertyTitle Property title
     * @param {Date} params.dueDate Due date
     * @param {number} params.amount Amount due
     * @returns {Promise<Object>} Created notification
     */
    static async emiDue({ userId, emiId, loanId, propertyTitle, dueDate, amount }) {
        const formattedDate = dueDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const formattedAmount = amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });

        return await NotificationModel.createNotification({
            userId,
            type: 'emi_due',
            title: 'EMI Payment Due',
            message: `Your EMI payment of ${formattedAmount} for "${propertyTitle}" is due on ${formattedDate}.`,
            relatedId: emiId,
            relatedModel: 'EMI',
            link: `/loan/my-emis`,
            priority: 'high'
        });
    }

    /**
     * Create a loan status change notification
     * @param {Object} params Parameters for notification
     * @param {string} params.userId User ID to notify
     * @param {string} params.loanId Loan ID
     * @param {string} params.propertyTitle Property title
     * @param {string} params.status New status ('approved', 'rejected')
     * @param {number} params.amount Loan amount
     * @returns {Promise<Object>} Created notification
     */
    static async loanStatusChange({ userId, loanId, propertyTitle, status, amount }) {
        const formattedAmount = amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });

        const statusInfo = {
            'approved': {
                type: 'loan_approved',
                title: 'Loan Approved',
                message: `Congratulations! Your loan of ${formattedAmount} for "${propertyTitle}" has been approved.`,
                priority: 'high'
            },
            'rejected': {
                type: 'loan_rejected',
                title: 'Loan Application Rejected',
                message: `We're sorry, but your loan application of ${formattedAmount} for "${propertyTitle}" has been rejected.`,
                priority: 'high'
            }
        };

        const info = statusInfo[status];
        if (!info) {
            throw new Error(`Invalid loan status: ${status}`);
        }

        return await NotificationModel.createNotification({
            userId,
            type: info.type,
            title: info.title,
            message: info.message,
            relatedId: loanId,
            relatedModel: 'LoanApplication',
            link: `/loan/details/${loanId}`,
            priority: info.priority
        });
    }

    /**
     * Create a visit status change notification
     * @param {Object} params Parameters for notification
     * @param {string} params.userId User ID to notify
     * @param {string} params.visitId Visit ID
     * @param {string} params.propertyTitle Property title
     * @param {string} params.status New status ('scheduled', 'approved', 'rejected', 'cancelled')
     * @param {Date} params.visitDate Visit date
     * @returns {Promise<Object>} Created notification
     */
    static async visitStatusChange({ userId, visitId, propertyTitle, status, visitDate }) {
        const formattedDate = visitDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const statusInfo = {
            'scheduled': {
                type: 'visit_scheduled',
                title: 'Property Visit Scheduled',
                message: `Your visit to "${propertyTitle}" has been scheduled for ${formattedDate}.`,
                priority: 'medium'
            },
            'approved': {
                type: 'visit_approved',
                title: 'Property Visit Approved',
                message: `Your visit to "${propertyTitle}" scheduled for ${formattedDate} has been approved.`,
                priority: 'medium'
            },
            'rejected': {
                type: 'visit_rejected',
                title: 'Property Visit Rejected',
                message: `Your visit to "${propertyTitle}" scheduled for ${formattedDate} has been rejected.`,
                priority: 'high'
            },
            'cancelled': {
                type: 'visit_cancelled',
                title: 'Property Visit Cancelled',
                message: `Your visit to "${propertyTitle}" scheduled for ${formattedDate} has been cancelled.`,
                priority: 'high'
            }
        };

        const info = statusInfo[status];
        if (!info) {
            throw new Error(`Invalid visit status: ${status}`);
        }

        return await NotificationModel.createNotification({
            userId,
            type: info.type,
            title: info.title,
            message: info.message,
            relatedId: visitId,
            relatedModel: 'Visit',
            link: `/visit/my-visits`,
            priority: info.priority
        });
    }

    /**
     * Create a new message notification
     * @param {Object} params Parameters for notification
     * @param {string} params.userId User ID to notify
     * @param {string} params.messageId Message ID
     * @param {string} params.senderName Sender name
     * @param {string} params.messagePreview Preview of message content
     * @returns {Promise<Object>} Created notification
     */
    static async newMessage({ userId, messageId, senderName, messagePreview }) {
        return await NotificationModel.createNotification({
            userId,
            type: 'message_received',
            title: 'New Message Received',
            message: `You have received a new message from ${senderName}: "${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}"`,
            relatedId: messageId,
            relatedModel: 'Message',
            link: `/chat`,
            priority: 'medium'
        });
    }

    /**
     * Create a system notification
     * @param {Object} params Parameters for notification
     * @param {string} params.userId User ID to notify
     * @param {string} params.title Notification title
     * @param {string} params.message Notification message
     * @param {string} params.link Optional link
     * @param {string} params.priority Priority (low, medium, high)
     * @returns {Promise<Object>} Created notification
     */
    static async systemNotification({ userId, title, message, link = null, priority = 'medium' }) {
        return await NotificationModel.createNotification({
            userId,
            type: 'system',
            title,
            message,
            link,
            priority
        });
    }
}

module.exports = NotificationService; 