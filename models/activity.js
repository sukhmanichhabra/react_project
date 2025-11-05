const mongoose = require('mongoose');

// Define the schema for activity tracking
const activitySchema = new mongoose.Schema({
  // User information (if logged in)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Not required as we'll track anonymous users too
  },
  userName: {
    type: String,
    default: 'Anonymous'
  },
  userRole: {
    type: String,
    enum: ['buyer', 'seller', 'agent', 'admin', 'anonymous'],
    default: 'anonymous'
  },
  
  // Action information
  actionType: {
    type: String,
    required: true,
    enum: [
      'page_view', 
      'property_view', 
      'agent_view', 
      'search', 
      'click', 
      'login', 
      'logout', 
      'signup', 
      'blog_view',
      'chat_initiated',
      'form_submit',
      'advertisement_view',
      'advertisement_click',
      'property_compare',
      'application_submit',
      'payment_initiated',
      'appointment_scheduled',
      'review_submitted',
      'chatbot_interaction',
      'user_login',
      'user_logout',
      'page_redirect'
    ]
  },
  
  // Target information
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Not required for all actions
  },
  targetType: {
    type: String,
    enum: [
      'property', 
      'agent', 
      'blog', 
      'advertisement', 
      'page', 
      'link', 
      'button',
      'chat',
      'form',
      'search_result',
      'loan_application',
      'payment',
      'appointment',
      'review',
      'chatbot',
      'user'
    ],
    required: false
  },
  targetName: {
    type: String,
    required: false
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Request information
  url: {
    type: String,
    required: true
  },
  referrer: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'tablet', 'mobile', 'unknown'],
    default: 'unknown'
  },
  
  // Session information
  sessionId: {
    type: String,
    required: false
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  // Duration (for measuring time spent)
  duration: {
    type: Number, // in milliseconds
    required: false
  }
});

// Indexes for performance
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ actionType: 1, timestamp: -1 });
activitySchema.index({ targetType: 1, targetId: 1, timestamp: -1 });
activitySchema.index({ timestamp: -1 });

// Create the model
const ActivityModel = mongoose.model('Activity', activitySchema);

// --------------------- Service Functions ---------------------

/**
 * Log a user activity
 * @param {Object} activityData - Activity data to log
 * @returns {Promise<Object>} - The created activity log
 */
const logActivity = async (activityData) => {
  try {
    const activity = new ActivityModel(activityData);
    return await activity.save();
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

/**
 * Get user activity
 * @param {String} userId - The user ID
 * @param {Object} options - Query options (limit, skip, sort)
 * @returns {Promise<Array>} - User activities
 */
const getUserActivity = async (userId, options = {}) => {
  try {
    const { limit = 100, skip = 0, sort = { timestamp: -1 } } = options;
    
    return await ActivityModel.find({ userId })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  } catch (error) {
    console.error('Error getting user activity:', error);
    throw error;
  }
};

/**
 * Get property view statistics
 * @param {String} propertyId - The property ID
 * @returns {Promise<Object>} - Property view statistics
 */
const getPropertyViewStats = async (propertyId) => {
  try {
    const totalViews = await ActivityModel.countDocuments({
      targetType: 'property',
      targetId: propertyId,
      actionType: 'property_view'
    });
    
    const uniqueVisitors = await ActivityModel.distinct('userId', {
      targetType: 'property',
      targetId: propertyId,
      actionType: 'property_view'
    });
    
    const viewsByDate = await ActivityModel.aggregate([
      {
        $match: {
          targetType: 'property',
          targetId: mongoose.Types.ObjectId(propertyId),
          actionType: 'property_view'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    return {
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      viewsByDate
    };
  } catch (error) {
    console.error('Error getting property view statistics:', error);
    throw error;
  }
};

/**
 * Get agent view statistics
 * @param {String} agentId - The agent ID
 * @returns {Promise<Object>} - Agent view statistics
 */
const getAgentViewStats = async (agentId) => {
  try {
    const totalViews = await ActivityModel.countDocuments({
      targetType: 'agent',
      targetId: agentId,
      actionType: 'agent_view'
    });
    
    const uniqueVisitors = await ActivityModel.distinct('userId', {
      targetType: 'agent',
      targetId: agentId,
      actionType: 'agent_view'
    });
    
    const viewsByDate = await ActivityModel.aggregate([
      {
        $match: {
          targetType: 'agent',
          targetId: mongoose.Types.ObjectId(agentId),
          actionType: 'agent_view'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    return {
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      viewsByDate
    };
  } catch (error) {
    console.error('Error getting agent view statistics:', error);
    throw error;
  }
};

/**
 * Get advertisement click statistics
 * @param {String} advertisementId - The advertisement ID
 * @returns {Promise<Object>} - Advertisement click statistics
 */
const getAdvertisementClickStats = async (advertisementId) => {
  try {
    const totalClicks = await ActivityModel.countDocuments({
      targetType: 'advertisement',
      targetId: advertisementId,
      actionType: 'advertisement_click'
    });
    
    const uniqueClickers = await ActivityModel.distinct('userId', {
      targetType: 'advertisement',
      targetId: advertisementId,
      actionType: 'advertisement_click'
    });
    
    const clicksByDate = await ActivityModel.aggregate([
      {
        $match: {
          targetType: 'advertisement',
          targetId: mongoose.Types.ObjectId(advertisementId),
          actionType: 'advertisement_click'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    return {
      totalClicks,
      uniqueClickers: uniqueClickers.length,
      clicksByDate
    };
  } catch (error) {
    console.error('Error getting advertisement click statistics:', error);
    throw error;
  }
};

/**
 * Get user timeline
 * @param {String} userId - The user ID
 * @param {Number} days - Number of days to look back
 * @returns {Promise<Array>} - User timeline
 */
const getUserTimeline = async (userId, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await ActivityModel.find({
      userId,
      timestamp: { $gte: startDate }
    })
    .sort({ timestamp: 1 });
  } catch (error) {
    console.error('Error getting user timeline:', error);
    throw error;
  }
};

/**
 * Get most viewed properties
 * @param {Number} limit - Number of properties to return
 * @param {Number} days - Number of days to look back
 * @returns {Promise<Array>} - Most viewed properties
 */
const getMostViewedProperties = async (limit = 10, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await ActivityModel.aggregate([
      {
        $match: {
          targetType: 'property',
          actionType: 'property_view',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$targetId',
          propertyName: { $first: '$targetName' },
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          propertyId: '$_id',
          propertyName: 1,
          views: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: limit }
    ]);
  } catch (error) {
    console.error('Error getting most viewed properties:', error);
    throw error;
  }
};

/**
 * Get most viewed agents
 * @param {Number} limit - Number of agents to return
 * @param {Number} days - Number of days to look back
 * @returns {Promise<Array>} - Most viewed agents
 */
const getMostViewedAgents = async (limit = 10, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await ActivityModel.aggregate([
      {
        $match: {
          targetType: 'agent',
          actionType: 'agent_view',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$targetId',
          agentName: { $first: '$targetName' },
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          agentId: '$_id',
          agentName: 1,
          views: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: limit }
    ]);
  } catch (error) {
    console.error('Error getting most viewed agents:', error);
    throw error;
  }
};

/**
 * Get most clicked advertisements
 * @param {Number} limit - Number of advertisements to return
 * @param {Number} days - Number of days to look back
 * @returns {Promise<Array>} - Most clicked advertisements
 */
const getMostClickedAdvertisements = async (limit = 10, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await ActivityModel.aggregate([
      {
        $match: {
          targetType: 'advertisement',
          actionType: 'advertisement_click',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$targetId',
          advertisementName: { $first: '$targetName' },
          clicks: { $sum: 1 },
          uniqueClickers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          advertisementId: '$_id',
          advertisementName: 1,
          clicks: 1,
          uniqueClickers: { $size: '$uniqueClickers' }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: limit }
    ]);
  } catch (error) {
    console.error('Error getting most clicked advertisements:', error);
    throw error;
  }
};

/**
 * Get user preferences based on activity
 * @param {String} userId - The user ID
 * @returns {Promise<Object>} - User preferences
 */
const getUserPreferences = async (userId) => {
  try {
    // Get property preferences
    const propertyPreferences = await ActivityModel.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          targetType: 'property',
          actionType: 'property_view'
        }
      },
      {
        $group: {
          _id: '$targetId',
          propertyName: { $first: '$targetName' },
          views: { $sum: 1 },
          lastViewed: { $max: '$timestamp' }
        }
      },
      { $sort: { views: -1, lastViewed: -1 } },
      { $limit: 5 }
    ]);
    
    // Get agent preferences
    const agentPreferences = await ActivityModel.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          targetType: 'agent',
          actionType: 'agent_view'
        }
      },
      {
        $group: {
          _id: '$targetId',
          agentName: { $first: '$targetName' },
          views: { $sum: 1 },
          lastViewed: { $max: '$timestamp' }
        }
      },
      { $sort: { views: -1, lastViewed: -1 } },
      { $limit: 5 }
    ]);
    
    // Get page preferences
    const pagePreferences = await ActivityModel.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          actionType: 'page_view'
        }
      },
      {
        $group: {
          _id: '$url',
          views: { $sum: 1 },
          lastViewed: { $max: '$timestamp' }
        }
      },
      { $sort: { views: -1, lastViewed: -1 } },
      { $limit: 5 }
    ]);
    
    return {
      propertyPreferences,
      agentPreferences,
      pagePreferences
    };
  } catch (error) {
    console.error('Error getting user preferences:', error);
    throw error;
  }
};

/**
 * Get daily active users
 * @param {Number} days - Number of days to look back
 * @returns {Promise<Array>} - Daily active users
 */
const getDailyActiveUsers = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await ActivityModel.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          userId: { $ne: null } // Only logged in users
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            userId: '$userId'
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
  } catch (error) {
    console.error('Error getting daily active users:', error);
    throw error;
  }
};

/**
 * Get user engagement metrics
 * @param {Number} days - Number of days to look back
 * @returns {Promise<Object>} - User engagement metrics
 */
const getUserEngagementMetrics = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const totalUsers = await ActivityModel.distinct('userId', {
      timestamp: { $gte: startDate },
      userId: { $ne: null }
    });
    
    const totalSessions = await ActivityModel.distinct('sessionId', {
      timestamp: { $gte: startDate }
    });
    
    const totalPageViews = await ActivityModel.countDocuments({
      timestamp: { $gte: startDate },
      actionType: 'page_view'
    });
    
    const averageSessionDuration = await ActivityModel.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          sessionId: { $ne: null },
          duration: { $ne: null, $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$sessionId',
          totalDuration: { $sum: '$duration' }
        }
      },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: '$totalDuration' }
        }
      }
    ]);
    
    return {
      totalUsers: totalUsers.length,
      totalSessions: totalSessions.length,
      totalPageViews,
      averageSessionDuration: averageSessionDuration.length > 0 ? 
        Math.round(averageSessionDuration[0].averageDuration) : 0
    };
  } catch (error) {
    console.error('Error getting user engagement metrics:', error);
    throw error;
  }
};

/**
 * Get user login/logout statistics
 * @param {Number} days - Number of days to retrieve statistics for
 * @returns {Promise<Object>} - User login/logout statistics
 */
const getUserAuthStats = async (days = 30) => {
  try {
    // Calculate the start date (30 days ago by default)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get login statistics
    const loginStats = await ActivityModel.aggregate([
      {
        $match: {
          actionType: 'user_login',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    // Get logout statistics
    const logoutStats = await ActivityModel.aggregate([
      {
        $match: {
          actionType: 'user_logout',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    // Get most active users (by login count)
    const mostActiveUsers = await ActivityModel.aggregate([
      {
        $match: {
          actionType: 'user_login',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          userName: { $first: '$userName' },
          userRole: { $first: '$userRole' },
          loginCount: { $sum: 1 },
          lastLogin: { $max: '$timestamp' }
        }
      },
      {
        $sort: { loginCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          userName: 1,
          userRole: 1,
          loginCount: 1,
          lastLogin: 1
        }
      }
    ]);
    
    // Get login by device type
    const loginsByDevice = await ActivityModel.aggregate([
      {
        $match: {
          actionType: 'user_login',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          deviceType: '$_id',
          count: 1
        }
      }
    ]);
    
    return {
      loginStats,
      logoutStats,
      mostActiveUsers,
      loginsByDevice,
      totalLogins: loginStats.reduce((sum, stat) => sum + stat.count, 0),
      totalLogouts: logoutStats.reduce((sum, stat) => sum + stat.count, 0)
    };
  } catch (error) {
    console.error('Error getting user authentication statistics:', error);
    return {
      loginStats: [],
      logoutStats: [],
      mostActiveUsers: [],
      loginsByDevice: [],
      totalLogins: 0,
      totalLogouts: 0
    };
  }
};

/**
 * Helper function to track page activity from anywhere in the app
 * This makes it easy to manually log activities from anywhere in the application
 * 
 * @param {Object} req - Express request object
 * @param {Object} options - Options for activity tracking
 * @returns {Promise<Object>} - The created activity log
 */
const trackPageActivity = async (req, options = {}) => {
  try {
    const {
      actionType = 'page_view',
      targetType = 'page',
      targetId = null,
      targetName = null,
      metadata = {}
    } = options;
    
    // Extract user information from JWT payload in req.user
    const userId = req.user?._id || null;
    const userName = req.user?.name || 'Anonymous';
    const userRole = req.user?.role || 'anonymous';
    
    // Build activity data object
    const activityData = {
      userId,
      userName,
      userRole,
      actionType,
      targetType,
      targetId,
      targetName: targetName || `Page: ${req.originalUrl}`,
      metadata,
      url: req.originalUrl,
      referrer: req.headers.referer || '',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      deviceType: req.deviceInfo ? req.deviceInfo.deviceType : 'unknown',
      sessionId: req.session ? req.session.id : null,
      timestamp: new Date()
    };
    
    // Log the activity
    return await logActivity(activityData);
  } catch (error) {
    console.error('Error in trackPageActivity helper:', error);
    return null;
  }
};

// Export the model and service functions
module.exports = {
  ActivityModel,
  logActivity,
  getUserActivity,
  getPropertyViewStats,
  getAgentViewStats,
  getAdvertisementClickStats,
  getUserTimeline,
  getMostViewedProperties,
  getMostViewedAgents,
  getMostClickedAdvertisements,
  getUserPreferences,
  getDailyActiveUsers,
  getUserEngagementMetrics,
  getUserAuthStats,
  trackPageActivity
}; 