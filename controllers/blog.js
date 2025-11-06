const blogDB = require("../models/blog");
const { blogUpload, deleteImage, getPublicIdFromUrl } = require("../config/cloudinary");

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

// Export the Cloudinary upload for use in routes
const upload = blogUpload;

// Note: File filtering and size limits are now configured in config/cloudinary.js

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
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Set imageUrl from uploaded file (Cloudinary) or use default
    let imageUrl = "/assets/house.jpg"; // Default image
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary provides the full URL in file.path
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
      updates.imageUrl = req.file.path; // Cloudinary URL

      // Get old image to delete from Cloudinary if it exists and isn't the default
      const oldBlog = await blogDB.getBlogById(id);
      if (
        oldBlog &&
        oldBlog.imageUrl &&
        !oldBlog.imageUrl.includes("assets/house.jpg") &&
        oldBlog.imageUrl.includes("cloudinary.com")
      ) {
        // Extract public_id and delete from Cloudinary
        const publicId = getPublicIdFromUrl(oldBlog.imageUrl);
        if (publicId) {
          try {
            await deleteImage(publicId);
          } catch (err) {
            console.error("Error deleting old image from Cloudinary:", err);
          }
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
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json({ success: true, data: updatedBlog });
  } catch (error) {
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

    // Delete associated image from Cloudinary if it exists and isn't the default
    if (
      blog.imageUrl &&
      !blog.imageUrl.includes("assets/house.jpg") &&
      blog.imageUrl.includes("cloudinary.com")
    ) {
      const publicId = getPublicIdFromUrl(blog.imageUrl);
      if (publicId) {
        try {
          await deleteImage(publicId);
        } catch (err) {
          console.error("Error deleting image from Cloudinary:", err);
        }
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
