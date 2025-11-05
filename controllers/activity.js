const Activity = require("../models/activity");
const UAParser = require("ua-parser-js");

// Middleware to extract device information
const extractDeviceInfo = (req, res, next) => {
  const userAgent = req.headers["user-agent"];
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Improved device type detection
  let deviceType = "unknown";

  if (result.device && result.device.type) {
    // Use the detected device type if available
    deviceType = result.device.type;
  } else if (userAgent) {
    // Fallback detection based on user agent string
    const ua = userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      deviceType = "tablet";
    } else if (
      /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      deviceType = "mobile";
    } else {
      deviceType = "desktop";
    }
  }

  req.deviceInfo = {
    deviceType: deviceType,
    browser: result.browser.name || "unknown",
    os: result.os.name || "unknown",
    userAgent: userAgent,
  };

  next();
};

// Middleware to track page views
const trackPageView = async (req, res, next) => {
  try {
    // Skip tracking for analytics routes to prevent recursion
    if (req.originalUrl.startsWith("/activity")) {
      return next();
    }

    // Skip tracking for favicon and other asset requests
    if (
      req.originalUrl.includes("favicon") ||
      req.originalUrl.includes(".svg") ||
      req.originalUrl.includes(".ico") ||
      req.originalUrl.includes(".css") ||
      req.originalUrl.includes(".js") ||
      req.originalUrl.includes(".jpg") ||
      req.originalUrl.includes(".png") ||
      req.originalUrl.includes(".gif")
    ) {
      return next();
    }

    // Get user info - properly extract from req.user (which contains JWT payload)
    // Our JWT token contains _id, name, email, and role
    const userId = req.user?._id || null;
    const userName = req.user?.name || "Anonymous";
    const userRole = req.user?.role || "anonymous";

    // For debugging
    if (req.user) {
      console.log("Activity tracking for user:", {
        id: userId,
        name: userName,
        role: userRole,
      });
    }

    // Store original methods for response object to intercept redirects
    const originalRedirect = res.redirect;
    const originalRender = res.render;
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    // Determine action type and target based on URL
    let actionType = "page_view";
    let targetType = null;
    let targetId = null;
    let targetName = null;

    // Property view tracking
    if (req.originalUrl.match(/^\/property\/[a-zA-Z0-9]+$/)) {
      actionType = "property_view";
      targetType = "property";
      targetId = req.originalUrl.split("/").pop();
      // We'll set the targetName in the route handler for property details
    }
    // Agent view tracking
    else if (req.originalUrl.match(/^\/agent\/[a-zA-Z0-9]+$/)) {
      actionType = "agent_view";
      targetType = "agent";
      targetId = req.originalUrl.split("/").pop();
    }
    // Blog view tracking - handle both URL patterns
    else if (
      req.originalUrl.match(/^\/blog_desc\/[a-zA-Z0-9]+$/) ||
      req.originalUrl.match(/^\/blog\/[a-zA-Z0-9]+$/)
    ) {
      actionType = "blog_view";
      targetType = "blog";
      targetId = req.originalUrl.split("/").pop();
    }
    // Advertisement tracking
    else if (req.originalUrl.includes("/advertising/")) {
      actionType = "advertisement_view";
      targetType = "advertisement";
      // Extract advertisement ID if available
      const match = req.originalUrl.match(/\/advertising\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        targetId = match[1];
      }
    }
    // Contact page view
    else if (req.originalUrl === "/contact") {
      actionType = "page_view";
      targetType = "page";
      targetName = "Contact Page";
    }
    // About page view
    else if (req.originalUrl === "/about") {
      actionType = "page_view";
      targetType = "page";
      targetName = "About Page";
    }
    // FAQ page view
    else if (req.originalUrl === "/faq") {
      actionType = "page_view";
      targetType = "page";
      targetName = "FAQ Page";
    }
    // Pricing page view
    else if (req.originalUrl === "/pricing") {
      actionType = "page_view";
      targetType = "page";
      targetName = "Pricing Page";
    }
    // Market Trends page view
    else if (req.originalUrl === "/trend") {
      actionType = "page_view";
      targetType = "page";
      targetName = "Market Trends Page";
    }
    // Property Prediction Model page view
    else if (req.originalUrl === "/model") {
      actionType = "page_view";
      targetType = "page";
      targetName = "Price Prediction Page";
    }
    // Login page view
    else if (req.originalUrl === "/auth/signin") {
      actionType = "page_view";
      targetType = "page";
      targetName = "Login Page";
    }
    // Signup page view
    else if (req.originalUrl === "/auth/signup") {
      actionType = "page_view";
      targetType = "page";
      targetName = "Signup Page";
    }
    // Dashboard page view
    else if (req.originalUrl.startsWith("/dashboard")) {
      actionType = "page_view";
      targetType = "page";
      targetName = "Dashboard Page";
    }
    // Loan and EMI related pages
    else if (req.originalUrl.startsWith("/loan")) {
      actionType = "page_view";
      targetType = "page";
      // Differentiate between loan routes
      if (req.originalUrl === "/loan/emi-calculator") {
        targetName = "EMI Calculator Page";
      } else if (req.originalUrl === "/loan/apply") {
        targetName = "Loan Application Page";
      } else if (req.originalUrl === "/loan/my-applications") {
        targetName = "My Loan Applications Page";
      } else if (req.originalUrl.includes("/loan/applications/")) {
        targetName = "Loan Application Details Page";
      } else {
        targetName = "Loan Services Page";
      }
    }
    // Property listing page view
    else if (
      req.originalUrl === "/property" ||
      req.originalUrl === "/property_list"
    ) {
      actionType = "page_view";
      targetType = "page";
      targetName = "Property Listing Page";
    }
    // Agent listing page view
    else if (
      req.originalUrl === "/agent" ||
      req.originalUrl.startsWith("/agent_list")
    ) {
      actionType = "page_view";
      targetType = "page";
      targetName = "Agent Listing Page";
    }
    // Blog listing page view
    else if (req.originalUrl === "/blog_list") {
      actionType = "page_view";
      targetType = "page";
      targetName = "Blog Listing Page";
    }
    // Chat pages
    else if (req.originalUrl.startsWith("/chat")) {
      actionType = "page_view";
      targetType = "page";
      targetName = "Chat Page";
    }
    // Chatbot interactions
    else if (req.originalUrl.startsWith("/chatbot")) {
      actionType = "page_view";
      targetType = "page";
      targetName = "Chatbot Page";
    }
    // Visit scheduling pages
    else if (req.originalUrl.startsWith("/visit")) {
      actionType = "page_view";
      targetType = "page";
      targetName = "Property Visit Page";
    }
    // Rent-related pages
    else if (req.originalUrl.startsWith("/rent")) {
      actionType = "page_view";
      targetType = "page";
      targetName = "Rental Properties Page";
    }
    // Approval pages (admin)
    else if (req.originalUrl === "/approve-property") {
      actionType = "page_view";
      targetType = "page";
      targetName = "Property Approval Page";
    }
    // Admin activity pages
    else if (req.originalUrl.startsWith("/activity")) {
      actionType = "page_view";
      targetType = "page";
      targetName = "Activity Analytics Page";
    }
    // Homepage view
    else if (req.originalUrl === "/") {
      actionType = "page_view";
      targetType = "page";
      targetName = "Homepage";
    }
    // Error page
    else if (req.originalUrl === "/error") {
      actionType = "page_view";
      targetType = "page";
      targetName = "Error Page";
    }
    // Any other page (catch-all)
    else {
      actionType = "page_view";
      targetType = "page";
      targetName = `Page: ${req.originalUrl}`;
    }

    // Create activity data
    const activityData = {
      userId,
      userName,
      userRole,
      actionType,
      targetType,
      targetId,
      targetName,
      url: req.originalUrl,
      referrer: req.headers.referer || "",
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
      deviceType: req.deviceInfo.deviceType,
      sessionId: req.session ? req.session.id : null,
      timestamp: new Date(),
    };

    // Log activity asynchronously (don't wait for it to complete)
    Activity.logActivity(activityData).catch((err) => {
      console.error("Error logging page view:", err);
    });

    // Track redirects by overriding redirect method
    res.redirect = function (url) {
      // Log redirect activity
      const redirectActivityData = {
        userId,
        userName,
        userRole,
        actionType: "page_redirect",
        targetType: "page",
        targetName: `Redirect to: ${url}`,
        url: req.originalUrl,
        referrer: req.headers.referer || "",
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        deviceType: req.deviceInfo.deviceType,
        sessionId: req.session ? req.session.id : null,
        timestamp: new Date(),
        metadata: {
          redirectDestination: url,
        },
      };

      Activity.logActivity(redirectActivityData).catch((err) => {
        console.error("Error logging redirect activity:", err);
      });

      // Call original redirect method
      return originalRedirect.apply(this, arguments);
    };

    // Continue with the request
    next();
  } catch (error) {
    console.error("Error in trackPageView middleware:", error);
    // Continue the request even if tracking fails
    next();
  }
};

// Activity log page
const getActivityLog = async (req, res) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Parse filter parameters
    const filter = {
      actionType: req.query.actionType || "",
      userRole: req.query.userRole || "",
      targetType: req.query.targetType || "",
      deviceType: req.query.deviceType || "",
      searchTerm: req.query.searchTerm || "",
      days: parseInt(req.query.days) || 30,
    };

    // Build query based on filters
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - filter.days);

    const query = {
      timestamp: { $gte: startDate },
      // Filter out favicon and asset requests
      url: {
        $not: {
          $regex: /\.(ico|svg|css|js|jpg|jpeg|png|gif|webp)$/i,
        },
      },
    };

    if (filter.actionType) {
      query.actionType = filter.actionType;
    }

    if (filter.userRole) {
      query.userRole = filter.userRole;
    }

    if (filter.targetType) {
      query.targetType = filter.targetType;
    }

    if (filter.deviceType) {
      query.deviceType = filter.deviceType;
    }

    if (filter.searchTerm) {
      // Search in multiple fields
      query.$or = [
        { url: { $regex: filter.searchTerm, $options: "i" } },
        { userName: { $regex: filter.searchTerm, $options: "i" } },
        { targetName: { $regex: filter.searchTerm, $options: "i" } },
      ];
    }

    // Get activities with pagination
    const activities = await Activity.ActivityModel.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalActivities = await Activity.ActivityModel.countDocuments(query);
    const totalPages = Math.ceil(totalActivities / limit);

    // Get statistics for the summary section
    const assetExclusionFilter = {
      url: {
        $not: {
          $regex: /\.(ico|svg|css|js|jpg|jpeg|png|gif|webp)$/i,
        },
      },
      timestamp: { $gte: startDate },
    };

    const statistics = {
      totalPageViews: await Activity.ActivityModel.countDocuments({
        ...assetExclusionFilter,
        actionType: "page_view",
      }),

      propertyViews: await Activity.ActivityModel.countDocuments({
        ...assetExclusionFilter,
        actionType: "property_view",
      }),

      advertisementViews: await Activity.ActivityModel.countDocuments({
        ...assetExclusionFilter,
        $or: [
          { actionType: "advertisement_view" },
          { targetType: "advertisement" },
        ],
      }),

      blogViews: await Activity.ActivityModel.countDocuments({
        ...assetExclusionFilter,
        actionType: "blog_view",
      }),

      activeUsers: (
        await Activity.ActivityModel.distinct("userId", {
          ...assetExclusionFilter,
          userId: { $ne: null },
        })
      ).length,

      // Add new metrics
      advertisementClicks: await Activity.ActivityModel.countDocuments({
        ...assetExclusionFilter,
        actionType: "advertisement_click",
      }),

      redirects: await Activity.ActivityModel.countDocuments({
        ...assetExclusionFilter,
        actionType: "page_redirect",
      }),

      totalUniqueVisitors: (
        await Activity.ActivityModel.distinct("ipAddress", {
          ...assetExclusionFilter,
        })
      ).length,

      avgSessionDuration: 0, // Keep for backward compatibility but don't display
    };

    // Calculate average session duration in minutes
    const sessionDuration = await Activity.ActivityModel.aggregate([
      {
        $match: {
          ...assetExclusionFilter,
          sessionId: { $ne: null },
          duration: { $ne: null, $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$sessionId",
          totalDuration: { $sum: "$duration" },
        },
      },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: "$totalDuration" },
        },
      },
    ]);

    if (sessionDuration.length > 0) {
      // Convert milliseconds to minutes and round to 1 decimal place
      statistics.avgSessionDuration =
        Math.round((sessionDuration[0].averageDuration / 60000) * 10) / 10;
    }

    // Get real data for charts
    const chartData = {
      // Daily activity for the last 7 days
      dailyActivity: await Activity.ActivityModel.aggregate([
        {
          $match: {
            ...assetExclusionFilter,
            timestamp: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
            },
            pageViews: {
              $sum: { $cond: [{ $eq: ["$actionType", "page_view"] }, 1, 0] },
            },
            propertyViews: {
              $sum: {
                $cond: [{ $eq: ["$actionType", "property_view"] }, 1, 0],
              },
            },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Action type distribution
      actionTypes: await Activity.ActivityModel.aggregate([
        {
          $match: assetExclusionFilter,
        },
        {
          $group: {
            _id: "$actionType",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Device distribution
      devices: await Activity.ActivityModel.aggregate([
        {
          $match: assetExclusionFilter,
        },
        {
          $group: {
            _id: "$deviceType",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Top visited pages
      topPages: await Activity.ActivityModel.aggregate([
        {
          $match: {
            ...assetExclusionFilter,
            actionType: "page_view",
          },
        },
        {
          $group: {
            _id: "$url",
            count: { $sum: 1 },
            pageName: { $first: "$targetName" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    };

    // Build query string for pagination links
    let queryString = "";
    if (filter.actionType) queryString += `&actionType=${filter.actionType}`;
    if (filter.userRole) queryString += `&userRole=${filter.userRole}`;
    if (filter.targetType) queryString += `&targetType=${filter.targetType}`;
    if (filter.deviceType) queryString += `&deviceType=${filter.deviceType}`;
    if (filter.searchTerm) queryString += `&searchTerm=${filter.searchTerm}`;
    if (filter.days) queryString += `&days=${filter.days}`;

    res.json({
      success: true,
      data: {
        activities,
        totalActivities,
        currentPage: page,
        totalPages,
        filter,
        statistics,
        chartData,
        queryString,
      },
    });
  } catch (error) {
    console.error("Error loading activity log page:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load activity log page",
      error: error.message,
    });
  }
};

// Get individual activity details
const getActivityDetails = async (req, res) => {
  try {
    const activityId = req.params.id;
    const activity = await Activity.ActivityModel.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.status(200).json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error("Error getting activity details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Log a client-side activity
const logActivity = async (req, res) => {
  try {
    const { actionType, targetId, targetType, targetName, metadata, duration } =
      req.body;

    // Validate required fields
    if (!actionType) {
      return res
        .status(400)
        .json({ success: false, message: "Action type is required" });
    }

    // Get user info
    const userId = req.user ? req.user._id : null;
    const userName = req.user ? req.user.name : "Anonymous";
    const userRole = req.user ? req.user.role : "anonymous";

    // Create activity data
    const activityData = {
      userId,
      userName,
      userRole,
      actionType,
      targetId,
      targetType,
      targetName,
      metadata,
      duration,
      url: req.headers.referer || "",
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
      deviceType: req.deviceInfo.deviceType,
      sessionId: req.session ? req.session.id : null,
      timestamp: new Date(),
    };

    // Log activity
    await Activity.logActivity(activityData);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error logging activity:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Analytics dashboard
const getAnalyticsDashboard = async (req, res) => {
  try {
    // Set default time period
    const days = parseInt(req.query.days) || 30;

    // Get user engagement metrics
    const engagementMetrics = await Activity.getUserEngagementMetrics(days);

    // Get most viewed properties
    const mostViewedProperties = await Activity.getMostViewedProperties(
      10,
      days
    );

    // Get most viewed agents
    const mostViewedAgents = await Activity.getMostViewedAgents(10, days);

    // Get most clicked advertisements
    const mostClickedAds = await Activity.getMostClickedAdvertisements(
      10,
      days
    );

    // Get daily active users
    const dailyActiveUsers = await Activity.getDailyActiveUsers(days);

    res.json({
      success: true,
      data: {
        engagementMetrics,
        mostViewedProperties,
        mostViewedAgents,
        mostClickedAds,
        dailyActiveUsers,
        days,
      },
    });
  } catch (error) {
    console.error("Error loading analytics dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load analytics dashboard",
      error: error.message,
    });
  }
};

// Property analytics
const getPropertyAnalytics = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const days = parseInt(req.query.days) || 30;

    // Get property details
    const PropertyModel = require("../models/property");
    const property = await PropertyModel.getPropertyById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
        details: "The requested property could not be found.",
      });
    }

    // Get property view statistics
    const viewStats = await Activity.getPropertyViewStats(propertyId);

    res.json({
      success: true,
      data: {
        property,
        viewStats,
        days,
      },
    });
  } catch (error) {
    console.error("Error loading property analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load property analytics",
      error: error.message,
    });
  }
};

// Agent analytics
const getAgentAnalytics = async (req, res) => {
  try {
    const agentId = req.params.id;
    const days = parseInt(req.query.days) || 30;

    // Get agent details
    const AgentModel = require("../models/agent");
    const agent = await AgentModel.getAgentById(agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
        details: "The requested agent could not be found.",
      });
    }

    // Get agent view statistics
    const viewStats = await Activity.getAgentViewStats(agentId);

    res.json({
      success: true,
      data: {
        agent,
        viewStats,
        days,
      },
    });
  } catch (error) {
    console.error("Error loading agent analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load agent analytics",
      error: error.message,
    });
  }
};

// Advertisement analytics
const getAdvertisementAnalytics = async (req, res) => {
  try {
    const advertisementId = req.params.id;
    const days = parseInt(req.query.days) || 30;

    // Get advertisement details
    const AdvertisingModel = require("../models/advertising");
    const advertisement = await AdvertisingModel.getAdvertisementById(
      advertisementId
    );

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found",
        details: "The requested advertisement could not be found.",
      });
    }

    // Get advertisement click statistics
    const clickStats = await Activity.getAdvertisementClickStats(
      advertisementId
    );

    res.json({
      success: true,
      data: {
        advertisement,
        clickStats,
        days,
      },
    });
  } catch (error) {
    console.error("Error loading advertisement analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load advertisement analytics",
      error: error.message,
    });
  }
};

// User activity timeline
const getUserActivityTimeline = async (req, res) => {
  try {
    const userId = req.params.id;
    const days = parseInt(req.query.days) || 7;

    // Get user details
    const UserModel = require("../models/user");
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        details: "The requested user could not be found.",
      });
    }

    // Get user timeline
    const timeline = await Activity.getUserTimeline(userId, days);

    // Get user preferences
    const preferences = await Activity.getUserPreferences(userId);

    res.json({
      success: true,
      data: {
        user,
        timeline,
        preferences,
        days,
      },
    });
  } catch (error) {
    console.error("Error loading user activity timeline:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load user activity timeline",
      error: error.message,
    });
  }
};

// Get user engagement metrics (API)
const getUserEngagementMetrics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    // Get user engagement metrics
    const metrics = await Activity.getUserEngagementMetrics(days);

    res.status(200).json({ success: true, metrics });
  } catch (error) {
    console.error("Error getting user engagement metrics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get most viewed properties (API)
const getMostViewedProperties = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;

    // Get most viewed properties
    const properties = await Activity.getMostViewedProperties(limit, days);

    res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error("Error getting most viewed properties:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get property view statistics (API)
const getPropertyViewStats = async (req, res) => {
  try {
    const propertyId = req.params.id;

    // Get property view statistics
    const stats = await Activity.getPropertyViewStats(propertyId);

    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error getting property view statistics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get most viewed agents (API)
const getMostViewedAgents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;

    // Get most viewed agents
    const agents = await Activity.getMostViewedAgents(limit, days);

    res.status(200).json({ success: true, agents });
  } catch (error) {
    console.error("Error getting most viewed agents:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get agent view statistics (API)
const getAgentViewStats = async (req, res) => {
  try {
    const agentId = req.params.id;

    // Get agent view statistics
    const stats = await Activity.getAgentViewStats(agentId);

    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error getting agent view statistics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get most clicked advertisements (API)
const getMostClickedAdvertisements = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;

    // Get most clicked advertisements
    const advertisements = await Activity.getMostClickedAdvertisements(
      limit,
      days
    );

    res.status(200).json({ success: true, advertisements });
  } catch (error) {
    console.error("Error getting most clicked advertisements:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get advertisement click statistics (API)
const getAdvertisementClickStats = async (req, res) => {
  try {
    const advertisementId = req.params.id;

    // Get advertisement click statistics
    const stats = await Activity.getAdvertisementClickStats(advertisementId);

    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error getting advertisement click statistics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get daily active users (API)
const getDailyActiveUsers = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    // Get daily active users
    const users = await Activity.getDailyActiveUsers(days);

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error getting daily active users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user timeline (API)
const getUserTimeline = async (req, res) => {
  try {
    const userId = req.params.id;
    const days = parseInt(req.query.days) || 7;

    // Get user timeline
    const timeline = await Activity.getUserTimeline(userId, days);

    res.status(200).json({ success: true, timeline });
  } catch (error) {
    console.error("Error getting user timeline:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user preferences (API)
const getUserPreferences = async (req, res) => {
  try {
    const userId = req.params.id;

    // Get user preferences
    const preferences = await Activity.getUserPreferences(userId);

    res.status(200).json({ success: true, preferences });
  } catch (error) {
    console.error("Error getting user preferences:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user authentication statistics (API)
const getUserAuthStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    // Get user authentication statistics
    const stats = await Activity.getUserAuthStats(days);

    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error getting user authentication statistics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Authentication Activity Dashboard
const getAuthDashboard = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    // Get user authentication statistics
    const stats = await Activity.getUserAuthStats(days);

    res.json({
      success: true,
      data: {
        stats,
        days,
      },
    });
  } catch (error) {
    console.error("Error loading authentication dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load authentication dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  // Middleware functions
  extractDeviceInfo,
  trackPageView,

  // Page controllers
  getActivityLog,
  getAnalyticsDashboard,
  getPropertyAnalytics,
  getAgentAnalytics,
  getAdvertisementAnalytics,
  getUserActivityTimeline,
  getAuthDashboard,

  // API controllers
  getActivityDetails,
  logActivity,
  getUserEngagementMetrics,
  getMostViewedProperties,
  getPropertyViewStats,
  getMostViewedAgents,
  getAgentViewStats,
  getMostClickedAdvertisements,
  getAdvertisementClickStats,
  getDailyActiveUsers,
  getUserTimeline,
  getUserPreferences,
  getUserAuthStats,
};
