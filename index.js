const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 8000;
const {
  checkForAuthenticationCookie,
  requireAuth,
} = require("./middleware/auth");
const adminAuth = require("./middleware/adminAuth");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blog");
const blogDB = require("./models/blog");

// Import models from the index file to ensure proper initialization
const { PropertyModel, AgentModel } = require("./models");

// Import routes
const agentRoutes = require("./routes/agent");
const propertyRoutes = require("./routes/property");
const dashboardRoutes = require("./routes/dashboard");
const loanRoutes = require("./routes/loan");
const rentRoutes = require("./routes/rent");
const visitRoutes = require("./routes/visit");
const advertisingRoutes = require("./routes/advertising");
const chatRoutes = require("./routes/chat");
const chatbotRoutes = require("./routes/chatbot");
const notificationRoutes = require("./routes/notification");

const UserModel = require("./models/user");

connectDB();

// CORS configuration for React frontend
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Accept"],
  })
);

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// Serve React build files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/dist")));
}

// Session middleware configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Use activity routes and middleware - Register early in the chain
const activityRoutes = require("./routes/activity");
// Set a global flag to indicate activity tracking is enabled
app.locals.trackActivity = true;

// Authentication cookie check - this populates req.user
app.use(checkForAuthenticationCookie("token"));

// Add middleware to track current path for all requests
app.use((req, res, next) => {
  // Store the current path in res.locals for use in templates
  res.locals.currentPath = req.path;
  next();
});

// Debug middleware to inspect authentication data before tracking
app.use((req, res, next) => {
  if (req.user) {
    console.log("DEBUG - Auth data before tracking:", {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  }
  next();
});

// Apply device info extraction middleware first
app.use(activityRoutes.extractDeviceInfo);
// Apply activity tracking middleware
app.use(activityRoutes.trackPageView);

// Set up model dependencies
PropertyModel.setAgentModel(AgentModel);
PropertyModel.setUserModel(UserModel);

// API Routes
app.get("/api/homepage", async (req, res) => {
  try {
    // Get recent blogs
    const recentBlogs = await blogDB.getRecentBlogs(3);

    // Get featured properties from advertising model
    const AdvertisingModel = require("./models/advertising");
    const PropertyModel = require("./models/property");
    const AgentModel = require("./models/agent");

    // Get featured properties with advertising info
    const featuredPropertiesData =
      await AdvertisingModel.getFeaturedPropertiesWithAdInfo(4);

    // Prepare property data for the featured section
    const formattedProperties = await Promise.all(
      featuredPropertiesData.map(async (data) => {
        const property = data.property;
        const adId = data.advertisingId;

        // Get agent information
        const agent = await AgentModel.getAgentById(property.agent);

        return {
          badge: property.type === "rent" ? "green" : "orange",
          badgeText: property.type === "rent" ? "FOR RENT" : "FOR SALE",
          location: property.location || "Location not specified",
          imagesCount: property.images ? property.images.length : 0,
          videosCount: property.videos ? property.videos.length : 0,
          imageUrl:
            property.images && property.images.length > 0
              ? property.images[0]
              : "/assets/property-1.jpg",
          title: property.title || "Property Title",
          description: property.description || "No description available",
          bedrooms: property.features ? property.features.beds || 0 : 0,
          bathrooms: property.features ? property.features.baths || 0 : 0,
          squareFeet: property.features ? property.features.sqft || 0 : 0,
          price: property.price ? `${property.price.toLocaleString()}` : "$0",
          period: property.type === "rent" ? "Month" : "Total",
          overviewLink: `/property/${property._id}`,
          agentImage: agent && agent.image ? agent.image : "/assets/author.jpg",
          agentName: agent ? agent.name : "Agent Name",
          agentTitle: "Estate Agent",
          agentLink: agent ? `/agent/${agent._id}` : "#",
          adId: adId,
          propertyId: property._id,
        };
      })
    );

    // If no featured properties, use default ones
    if (formattedProperties.length === 0) {
      formattedProperties.push(
        {
          badge: "green",
          badgeText: "FOR RENT",
          location: "Belmont Gardens, Chicago",
          imagesCount: 4,
          videosCount: 2,
          imageUrl: "/assets/property-1.jpg",
          title: "New Apartment Nice View",
          description:
            "Beautiful Huge 1 Family House In Heart Of Westbury. Newly Renovated With New Wood",
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 3450,
          price: "$34,900",
          period: "Month",
          overviewLink: "/property_overview",
          agentImage: "/assets/author.jpg",
          agentName: "William Seklo",
          agentTitle: "Estate Agents",
          agentLink: "#",
        },
        {
          badge: "orange",
          badgeText: "FOR SALES",
          location: "Belmont Gardens, Chicago",
          imagesCount: 4,
          videosCount: 2,
          imageUrl: "/assets/property-2.jpg",
          title: "Modern Apartments",
          description:
            "Beautiful Huge 1 Family House In Heart Of Westbury. Newly Renovated With New Wood",
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 3450,
          price: "$34,900",
          period: "Month",
          overviewLink: "/property_overview",
          agentImage: "/assets/author.jpg",
          agentName: "William Seklo",
          agentTitle: "Estate Agents",
          agentLink: "#",
        }
      );
    }

    // Ensure we have at least 4 properties by duplicating if needed
    while (formattedProperties.length < 4) {
      formattedProperties.push(
        formattedProperties[0] || {
          badge: "green",
          badgeText: "FOR RENT",
          location: "Belmont Gardens, Chicago",
          imagesCount: 4,
          videosCount: 2,
          imageUrl: "/assets/property-3.jpg",
          title: "Comfortable Apartment",
          description:
            "Beautiful Huge 1 Family House In Heart Of Westbury. Newly Renovated With New Wood",
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 3450,
          price: "$34,900",
          period: "Month",
          overviewLink: "/property_overview",
          agentImage: "/assets/author.jpg",
          agentName: "William Seklo",
          agentTitle: "Estate Agents",
          agentLink: "#",
        }
      );
    }

    res.json({
      success: true,
      data: {
        recentBlogs,
        featuredProperties: formattedProperties,
      },
    });
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch homepage data",
      error: error.message,
    });
  }
});

// API Routes for all data
app.use("/api/auth", authRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/advertising", advertisingRoutes);
app.use("/api/property", propertyRoutes); // Corrected route
app.use("/api/property-approval", require("./routes/property-approval"));
app.use("/api/agent", agentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/loan", loanRoutes);
app.use("/api/rent", rentRoutes);
app.use("/api/visit", visitRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);

// Additional API endpoints
app.get("/api/pricing", async (req, res) => {
  res.json({
    success: true,
    data: {
      title: "Pricing Plans",
      plans: [
        {
          name: "Basic",
          price: "$29",
          period: "month",
          features: [
            "Up to 5 properties",
            "Basic support",
            "Email notifications",
          ],
        },
        {
          name: "Pro",
          price: "$59",
          period: "month",
          features: [
            "Up to 25 properties",
            "Priority support",
            "Advanced analytics",
            "SMS notifications",
          ],
        },
        {
          name: "Enterprise",
          price: "$99",
          period: "month",
          features: [
            "Unlimited properties",
            "24/7 support",
            "Custom integrations",
            "White label",
          ],
        },
      ],
    },
  });
});

app.get("/api/about", async (req, res) => {
  res.json({
    success: true,
    data: {
      title: "About Us",
      content: {
        mission:
          "To revolutionize the real estate industry through technology and exceptional service.",
        vision:
          "To be the leading platform connecting property seekers with their dream homes.",
        values: ["Innovation", "Integrity", "Customer Focus", "Excellence"],
      },
    },
  });
});

app.get("/api/contact", async (req, res) => {
  res.json({
    success: true,
    data: {
      title: "Contact Us",
      contact: {
        email: "contact@realestate.com",
        phone: "+1 (555) 123-4567",
        address: "123 Real Estate St, City, State 12345",
      },
    },
  });
});

app.get("/api/faq", async (req, res) => {
  res.json({
    success: true,
    data: {
      title: "Frequently Asked Questions",
      faqs: [
        {
          question: "How do I list my property?",
          answer:
            "Sign up as an agent and use our property listing form to add your properties.",
        },
        {
          question: "Is there a fee for listing properties?",
          answer:
            "Basic listings are free. Premium features are available with our paid plans.",
        },
        {
          question: "How do I schedule a property visit?",
          answer:
            "Click on any property and use the 'Schedule Visit' button to book an appointment.",
        },
      ],
    },
  });
});

app.get("/api/trend", async (req, res) => {
  res.json({
    success: true,
    data: {
      title: "Market Trends",
      trends: {
        avgPrice: 450000,
        priceChange: 5.2,
        totalListings: 1250,
        avgDaysOnMarket: 28,
      },
    },
  });
});

// User settings API endpoint
app.get("/api/settings", requireAuth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      },
    });
  } catch (error) {
    console.error("Error loading settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load settings",
      error: error.message,
    });
  }
});

// Property approval API endpoint
app.get("/api/approve-property", requireAuth, adminAuth, async (req, res) => {
  try {
    const stats = await PropertyModel.getPropertyApprovalStats();
    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error("Error loading property approval data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load property approval data",
      error: error.message,
    });
  }
});

// Blog list API endpoint
app.get("/api/blog_list", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const tag = req.query.tag || null;

    let blogs = [];
    let pagination = {};

    if (tag) {
      blogs = await blogDB.getBlogsByTag(tag);
      const totalBlogs = blogs.length;
      const limit = 9;
      const totalPages = Math.ceil(totalBlogs / limit);

      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, totalBlogs);

      const paginatedBlogs = blogs.slice(startIndex, endIndex);

      pagination = {
        page,
        totalPages,
        totalBlogs,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };

      blogs = paginatedBlogs;
    } else {
      const result = await blogDB.getPaginatedBlogs(page, 9);
      blogs = result.blogs;
      pagination = result.pagination;
    }

    const featuredBlog = await blogDB.getFeaturedBlog();
    const tagCounts = await blogDB.getAllTagCounts();

    res.json({
      success: true,
      data: {
        blogs,
        featuredBlog,
        pagination,
        tagCounts,
        activeTag: tag,
      },
    });
  } catch (error) {
    console.error("Error loading blog list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load blogs",
      error: error.message,
    });
  }
});

// Blog detail API endpoint
app.get("/api/blog_desc/:id", async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!blogId) {
      return res.status(400).json({
        success: false,
        message: "Blog ID is required",
      });
    }

    const blog = await blogDB.getBlogById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Track blog view activity
    if (req.app.locals.trackActivity) {
      const Activity = require("./models/activity");
      const userId = req.user ? req.user._id : null;
      const userName = req.user ? req.user.name : "Anonymous";
      const userRole = req.user ? req.user.role : "anonymous";

      const activityData = {
        userId,
        userName,
        userRole,
        actionType: "blog_view",
        targetType: "blog",
        targetId: blogId,
        targetName: blog.title || "Blog Post",
        url: req.originalUrl,
        referrer: req.headers.referer || "",
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        deviceType: req.deviceInfo ? req.deviceInfo.deviceType : "unknown",
        sessionId: req.session ? req.session.id : null,
        timestamp: new Date(),
      };

      Activity.logActivity(activityData).catch((err) => {
        console.error("Error logging blog view:", err);
      });
    }

    // Get related blogs
    let relatedBlogs = [];
    if (blog.tags && blog.tags.length > 0) {
      const allRelatedBlogs = await blogDB.getBlogsByTag(blog.tags[0]);
      relatedBlogs = allRelatedBlogs
        .filter((b) => b._id.toString() !== blog._id.toString())
        .slice(0, 3);
    }

    const comments = await blogDB.getComments(blog._id);
    const tagCounts = await blogDB.getAllTagCounts();

    res.json({
      success: true,
      data: {
        blog,
        relatedBlogs,
        comments,
        tagCounts,
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Error loading blog details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load blog details",
      error: error.message,
    });
  }
});

// User details API endpoint
app.get("/api/user-details", async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

// Legacy redirect routes for backward compatibility
app.get("/property_list", (req, res) => {
  res.redirect("/property");
});

app.get("/property_overview/:id", (req, res) => {
  res.redirect(`/property/${req.params.id}`);
});

// Property review API route
app.post("/api/property/review", requireAuth, async (req, res) => {
  try {
    const { propertyId, title, rating, text } = req.body;

    if (!propertyId || !title || !rating || !text) {
      return res.status(400).json({
        success: false,
        message: "Property ID, title, rating and review text are required",
      });
    }

    const reviewData = {
      title,
      rating: parseFloat(rating),
      text,
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      date: new Date(),
    };

    const success = PropertyModel.addReview(propertyId, reviewData);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: { review: reviewData },
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Activity tracking test route
app.get("/api/track-test", (req, res) => {
  console.log("Track test route accessed");

  if (req.app.locals.trackActivity) {
    const Activity = require("./models/activity");
    Activity.trackPageActivity(req, {
      actionType: "page_view",
      targetType: "page",
      targetName: "Track Test Page",
      metadata: {
        testData: "This is a test tracking entry",
        timestamp: new Date().toISOString(),
      },
    }).catch((err) => {
      console.error("Error in test tracking:", err);
    });
  }

  res.json({
    success: true,
    message: "Track test page - check your activity logs",
  });
});

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/dist/index.html"));
  });
} else {
  // In development, send a message for unmatched routes
  app.get("*", (req, res) => {
    res.status(404).json({
      success: false,
      message:
        "Route not found. Make sure you're using API endpoints with /api prefix.",
      availableEndpoints: [
        "/api/homepage",
        "/api/auth/*",
        "/api/blog/*",
        "/api/property/*",
        "/api/agent/*",
        "/api/dashboard/*",
        "/api/user-details",
      ],
    });
  });
}

// Initialize the visit auto-completion scheduler
const VisitScheduler = require("./service/visitScheduler");
VisitScheduler.initScheduler(30); // Check every 30 minutes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
