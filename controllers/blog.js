const blogDB = require("../models/blog");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Helper function to track activity
const trackActivity = (req, activityData) => {
  if (req.app.locals.trackActivity) {
    const Activity = require("../models/activity");
    const fullActivityData = {
      ...activityData,
      url: req.originalUrl,
      referrer: req.headers.referer || "",
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
      deviceType: req.deviceInfo ? req.deviceInfo.deviceType : "unknown",
      sessionId: req.session ? req.session.id : null,
      timestamp: new Date(),
    };

    Activity.logActivity(fullActivityData).catch((err) => {
      console.error("Error logging activity:", err);
    });
  }
};

// Configure multer for blog image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/uploads/blog";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "blog-" + uniqueSuffix + ext);
  },
});

// File filter for image uploads
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Initialize multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

// Get all blogs (NOW WITH PAGINATION)
exports.getAllBlogs = async (req, res) => { 
  try {
    // 1. Get page number from query, default to 1
    const page = parseInt(req.query.page) || 1;
    // 2. Set your limit
    const limit = 9; 

    // 3. Pass them to the model function
    const result = await blogDB.getAllBlogs(page, limit);
    
    // 4. Send the whole object back (which will include blogs AND pagination)
    res.json(result);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

// Get featured blog
exports.getFeaturedBlog = async (req, res) => {
  try {
    const featuredBlog = await blogDB.getFeaturedBlog();
    if (!featuredBlog) {
      return res.status(404).json({ error: "No featured blog found" });
    }
    res.json(featuredBlog);
  } catch (error) {
    console.error("Error fetching featured blog:", error);
    res.status(500).json({ error: "Failed to fetch featured blog" });
  }
};

// Get blog update form
exports.getBlogUpdateForm = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await blogDB.getBlogById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      data: {
        title: "Update Blog",
        blog,
      },
    });
  } catch (error) {
    console.error("Error fetching blog for update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
      error: error.message,
    });
  }
};

// Get blogs by tag
exports.getBlogsByTag = async (req, res) => {
  try {
    const tag = req.params.tag;
    const blogs = await blogDB.getBlogsByTag(tag);
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs by tag:", error);
    res.status(500).json({ error: "Failed to fetch blogs by tag" });
  }
};

// Get blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await blogDB.getBlogById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
        details: "The blog post you are looking for could not be found.",
      });
    }

    // Track blog view
    trackActivity(req, {
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : "Anonymous",
      userRole: req.user ? req.user.role : "anonymous",
      actionType: "blog_view",
      targetType: "blog",
      targetId: blogId,
      targetName: blog.title || "Blog Post",
    });

    res.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog details:", error);
    res.status(500).json({
      success: false,
      message: "Error loading blog post",
      error: error.message,
    });
  }
};

// Get blog creation form data
exports.getBlogCreationForm = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        title: "Add New Blog",
        message: req.query.success ? "Blog post created successfully!" : null,
        messageType: req.query.success ? "success" : null,
      },
    });
  } catch (error) {
    console.error("Error getting blog creation form data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load blog creation form",
      error: error.message,
    });
  }
};

// Create new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, author, content, tags, createdOn, featured } = req.body;

    // Validate required fields
    if (!title || !author || !content || !tags || !createdOn) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Set imageUrl from uploaded file or use default
    let imageUrl = "/assets/house.jpg"; // Default image
    if (req.file) {
      // Convert Windows path to URL format with forward slashes
      imageUrl = "/uploads/blog/" + req.file.filename;
    }

    // Create blog
    const newBlog = await blogDB.createBlog({
      title,
      author,
      content,
      tags: Array.isArray(tags) ? tags : [tags], // Ensure tags is an array
      createdOn,
      imageUrl,
      featured: featured === "true" || featured === true,
    });

    res.status(201).json({ success: true, data: newBlog });
  } catch (error) {
    // Delete uploaded file if blog creation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error creating blog:", error);
    res.status(500).json({ error: "Failed to create blog" });
  }
};

// Update blog
exports.updateBlog = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = { ...req.body };

    // Handle image update
    if (req.file) {
      updates.imageUrl = "/uploads/blog/" + req.file.filename;

      // Get old image path to delete if it exists and isn't the default
      const oldBlog = await blogDB.getBlogById(id);
      if (
        oldBlog &&
        oldBlog.imageUrl &&
        !oldBlog.imageUrl.includes("assets/house.jpg") &&
        oldBlog.imageUrl.includes("/uploads/blog/")
      ) {
        const oldImagePath = path.join("public", oldBlog.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Handle tags
    if (updates.tags) {
      updates.tags = Array.isArray(updates.tags)
        ? updates.tags
        : [updates.tags];
    }

    // Handle boolean fields
    if (updates.featured !== undefined) {
      updates.featured =
        updates.featured === "true" || updates.featured === true;
    }

    const updatedBlog = await blogDB.updateBlog(id, updates);

    if (!updatedBlog) {
      // Delete uploaded file if blog update fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json({ success: true, data: updatedBlog });
  } catch (error) {
    // Delete uploaded file if blog update fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error updating blog:", error);
    res.status(500).json({ error: "Failed to update blog" });
  }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const id = req.params.id;

    // Get blog to retrieve image path before deleting
    const blog = await blogDB.getBlogById(id);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Delete the blog from database
    const deleted = await blogDB.deleteBlog(id);

    if (!deleted) {
      return res.status(404).json({ error: "Failed to delete blog" });
    }

    // Delete associated image file if it exists and isn't the default
    if (
      blog.imageUrl &&
      !blog.imageUrl.includes("assets/house.jpg") &&
      blog.imageUrl.includes("/uploads/blog/")
    ) {
      const imagePath = path.join("public", blog.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ error: "Failed to delete blog" });
  }
};

// Set a blog as featured
exports.setFeaturedBlog = async (req, res) => {
  try {
    const id = req.params.id;
    const success = await blogDB.setFeaturedBlog(id);

    if (!success) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error setting featured blog:", error);
    res.status(500).json({ error: "Failed to set featured blog" });
  }
};

// Add a comment to a blog
exports.addComment = async (req, res) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      // redirectUrl: "/auth/login?redirect=/blog_desc/" + req.params.id,
    });
  }

  try {
    const blogId = req.params.id;
    const { text } = req.body;

    // Validate required fields
    if (!text || text.trim() === "") {
      return res
        .status(400)
        .json({ success: false, error: "Comment text is required" });
    }

    // Create comment data
    const commentData = {
      userId: req.user._id,
      text: text.trim(),
    };

    // Add comment to blog
    const newComment = await blogDB.addComment(blogId, commentData);

    if (!newComment) {
      return res.status(404).json({ success: false, error: "Blog not found" });
    }

    // Get the updated comment with user info
    const blog = await blogDB.getBlogById(blogId);
    const populatedComment = blog.comments[blog.comments.length - 1];

    res.status(201).json({ success: true, data: populatedComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ success: false, error: "Failed to add comment" });
  }
};

// Get recent blogs
exports.getRecentBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 3;
    const recentBlogs = await blogDB.getRecentBlogs(limit);
    res.json(recentBlogs);
  } catch (error) {
    console.error("Error fetching recent blogs:", error);
    res.status(500).json({ error: "Failed to fetch recent blogs" });
  }
};

// Export multer upload middleware for use in routes
exports.upload = upload;
