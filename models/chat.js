const mongoose = require('mongoose');

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    senderRole: {
        type: String,
        required: true,
        enum: ['buyer', 'seller', 'agent', 'admin']
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverName: {
        type: String,
        required: true
    },
    receiverRole: {
        type: String,
        required: true,
        enum: ['buyer', 'seller', 'agent', 'admin']
    },
    message: {
        type: String,
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        default: null
    },
    propertyTitle: {
        type: String,
        default: ''
    },
    isRead: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Chat Conversation Schema (to track unique conversations)
const chatConversationSchema = new mongoose.Schema({
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String,
        role: String
    }],
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        default: null
    },
    propertyTitle: {
        type: String,
        default: ''
    },
    lastMessage: {
        text: String,
        timestamp: Date,
        senderId: mongoose.Schema.Types.ObjectId
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Create models
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
const ChatConversation = mongoose.model('ChatConversation', chatConversationSchema);

// Helper methods for chat operations
const ChatModel = {
    // Create a new message
    createMessage: async function(messageData) {
        try {
            // Generate a unique conversation ID if not provided
            if (!messageData.conversationId) {
                // For MongoDB ObjectId strings
                const participantIds = [
                    messageData.senderId.toString(), 
                    messageData.receiverId.toString()
                ].sort();
                
                // Log for debugging
                console.log('Creating conversation ID from participants:', participantIds);
                
                // Use a consistent format for the conversation ID
                messageData.conversationId = participantIds.join('_');
                
                if (messageData.propertyId) {
                    messageData.conversationId += `_${messageData.propertyId.toString()}`;
                }
                
                console.log('Generated conversation ID:', messageData.conversationId);
            }
            
            // Create the message
            const message = new ChatMessage(messageData);
            await message.save();
            
            // Update or create the conversation
            const conversation = await this.updateConversation(message);
            
            // Update the message with the conversation's MongoDB ID for consistency
            if (conversation && conversation._id) {
                message.conversationId = conversation._id.toString();
                await message.save();
                console.log('Updated message with conversation ID:', conversation._id);
            }
            
            return message;
        } catch (error) {
            console.error('Error creating message:', error);
            throw error;
        }
    },
    
    // Update or create conversation for a message
    updateConversation: async function(message) {
        try {
            const senderId = message.senderId.toString();
            const receiverId = message.receiverId.toString();
            console.log('Looking for conversation between:', senderId, 'and', receiverId);
            
            // First try to find the conversation normally
            let conversation = await ChatConversation.findOne({
                $and: [
                    { 'participants.userId': message.senderId },
                    { 'participants.userId': message.receiverId }
                ]
            });
            
            // If not found, try different formats
            if (!conversation) {
                console.log('No conversation found with direct match, trying with toString');
                // Try with string IDs
                conversation = await ChatConversation.findOne({
                    'participants': {
                        $all: [
                            { $elemMatch: { 'userId': senderId } },
                            { $elemMatch: { 'userId': receiverId } }
                        ]
                    }
                });
            }
            
            if (!conversation) {
                console.log('Creating new conversation');
                // Create new conversation with properly formatted unread count key
                conversation = new ChatConversation({
                    participants: [
                        {
                            userId: message.senderId,
                            name: message.senderName,
                            role: message.senderRole
                        },
                        {
                            userId: message.receiverId,
                            name: message.receiverName,
                            role: message.receiverRole
                        }
                    ],
                    propertyId: message.propertyId,
                    propertyTitle: message.propertyTitle,
                    lastMessage: {
                        text: message.message,
                        timestamp: message.timestamp,
                        senderId: message.senderId
                    },
                    unreadCount: {
                        [receiverId]: 1
                    }
                });
            } else {
                console.log('Updating existing conversation:', conversation._id.toString());
                // Update existing conversation
                conversation.lastMessage = {
                    text: message.message,
                    timestamp: message.timestamp,
                    senderId: message.senderId
                };
                
                // Update property info if changed
                if (message.propertyId) {
                    conversation.propertyId = message.propertyId;
                    conversation.propertyTitle = message.propertyTitle;
                }
                
                // Safely increment unread count for receiver using string ID only
                try {
                    const currentCount = conversation.unreadCount.get(receiverId) || 0;
                    conversation.unreadCount.set(receiverId, currentCount + 1);
                } catch (error) {
                    console.error('Error updating unread count:', error);
                    // Reset unread count with safe key format
                    conversation.unreadCount = { [receiverId]: 1 };
                }
            }
            
            await conversation.save();
            return conversation;
        } catch (error) {
            console.error('Error updating conversation:', error);
            throw error;
        }
    },
    
    // Get messages for a conversation
    getMessagesByConversation: async function(conversationId, limit = 50, skip = 0) {
        try {
            return await ChatMessage.find({ conversationId })
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit);
        } catch (error) {
            console.error('Error getting messages:', error);
            throw error;
        }
    },
    
    // Get all conversations for a user
    getUserConversations: async function(userId) {
        try {
            return await ChatConversation.find({
                'participants.userId': userId
            }).sort({ 'lastMessage.timestamp': -1 });
        } catch (error) {
            console.error('Error getting user conversations:', error);
            throw error;
        }
    },
    
    // Mark messages as read
    markMessagesAsRead: async function(conversationId, userId) {
        try {
            // Make sure userId is a string
            const userIdStr = userId.toString();
            
            // Mark messages as read
            await ChatMessage.updateMany(
                { 
                    conversationId,
                    receiverId: userId,
                    isRead: false
                },
                { isRead: true }
            );
            
            // Reset unread count in conversation
            const conversation = await ChatConversation.findById(conversationId);
            
            if (conversation) {
                try {
                    // Try to update the existing Map entry
                    conversation.unreadCount.set(userIdStr, 0);
                } catch (error) {
                    console.error('Error updating unread count map:', error);
                    // If that fails, create a new unreadCount map
                    const unreadCounts = {};
                    unreadCounts[userIdStr] = 0;
                    conversation.unreadCount = unreadCounts;
                }
                
                await conversation.save();
            }
            
            return true;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    },
    
    // Get total unread messages for a user
    getTotalUnreadMessages: async function(userId) {
        try {
            return await ChatMessage.countDocuments({
                receiverId: userId,
                isRead: false
            });
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    },
    
    // Delete a conversation
    deleteConversation: async function(conversationId) {
        try {
            // Delete all messages in the conversation
            await ChatMessage.deleteMany({ conversationId });
            
            // Delete the conversation
            await ChatConversation.findOneAndDelete({ _id: conversationId });
            
            return true;
        } catch (error) {
            console.error('Error deleting conversation:', error);
            throw error;
        }
    },
    
    // Helper to find or create a conversation
    findOrCreateConversation: async function(senderData, receiverData, propertyData = null) {
        try {
            const senderId = senderData.id || senderData._id;
            const receiverId = receiverData.id || receiverData._id;
            
            console.log('Finding or creating conversation between:', senderId, 'and', receiverId);
            
            // Try to find existing conversation
            let conversation = await ChatConversation.findOne({
                $and: [
                    { 'participants.userId': senderId },
                    { 'participants.userId': receiverId }
                ]
            });
            
            if (!conversation) {
                console.log('Creating new conversation between users');
                // Create new conversation
                conversation = new ChatConversation({
                    participants: [
                        {
                            userId: senderId,
                            name: senderData.name,
                            role: senderData.role
                        },
                        {
                            userId: receiverId,
                            name: receiverData.name,
                            role: receiverData.role
                        }
                    ],
                    propertyId: propertyData ? propertyData.id || propertyData._id : null,
                    propertyTitle: propertyData ? propertyData.title : '',
                    unreadCount: {
                        [receiverId.toString()]: 0
                    }
                });
                
                await conversation.save();
                console.log('New conversation created with ID:', conversation._id);
            }
            
            return conversation;
        } catch (error) {
            console.error('Error finding/creating conversation:', error);
            throw error;
        }
    }
};

// Export models and helper functions
module.exports = {
    ChatModel,
    ChatMessage,
    ChatConversation
}; 