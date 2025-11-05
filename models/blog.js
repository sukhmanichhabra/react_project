const mongoose = require("mongoose");

// Blog Schema
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    createdOn: {
      type: Date,
      default: Date.now,
    },
    imageUrl: {
      type: String,
      default: "/assets/house.jpg",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Create Blog model
const Blog = mongoose.model("Blog", blogSchema);

// Blog operations using Mongoose
module.exports = {
  // Create a new blog
  createBlog: async (blogData) => {
    try {
      // If setting this blog as featured, unset any other featured blog
      if (blogData.featured) {
        await Blog.updateMany({}, { featured: false });
      }

      // Create and save new blog
      const newBlog = new Blog({
        ...blogData,
        // Ensure tags are an array
        tags: Array.isArray(blogData.tags) ? blogData.tags : [blogData.tags],
      });

      await newBlog.save();
      return newBlog;
    } catch (error) {
      console.error("Error creating blog:", error);
      throw error;
    }
  },

  // Get all blogs
  getAllBlogs: async (page = 1, limit = 9) => {
    try {
      const skip = (page - 1) * limit;

      // Get the total count of blogs
      const totalBlogs = await Blog.countDocuments({});
      const totalPages = Math.ceil(totalBlogs / limit);

      // Fetch only the blogs for the current page
      const blogs = await Blog.find({})
        .sort({ createdOn: -1 }) // Sort by newest
        .skip(skip)
        .limit(limit)
        .lean(); // .lean() makes it faster, optional

      // Return the new object structure your frontend expects
      return {
        blogs,
        pagination: {
          page,
          totalPages,
          totalBlogs,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error in getAllBlogs (model):", error);
      throw error;
    }
  },

  // Get featured blog
  getFeaturedBlog: async () => {
    try {
      const featuredBlog = await Blog.findOne({ featured: true }).lean();
      if (!featuredBlog) {
        // If no featured blog, return the most recent one
        return await Blog.findOne().sort({ createdOn: -1 }).lean();
      }
      return featuredBlog;
    } catch (error) {
      console.error("Error getting featured blog:", error);
      return null;
    }
  },

  // Get blog by ID
  getBlogById: async (id) => {
    try {
      // Check if id is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        // For legacy string IDs, try to find by a custom field or default to first blog
        console.log(
          `ID "${id}" is not a valid ObjectId, attempting to find first blog`
        );
        return await Blog.findOne().sort({ createdOn: -1 }).lean();
      }

      return await Blog.findById(id).lean();
    } catch (error) {
      console.error(`Error getting blog by ID ${id}:`, error);
      return null;
    }
  },

  // Get blogs by tag
  getBlogsByTag: async (tag, page = 1, limit = 9) => {
    try {
      const query = { tags: tag };
      const skip = (page - 1) * limit;

      // Get the total count of blogs *matching the tag*
      const totalBlogs = await Blog.countDocuments(query);
      const totalPages = Math.ceil(totalBlogs / limit);

      // Fetch only the matching blogs for the current page
      const blogs = await Blog.find(query)
        .sort({ createdOn: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Return the new object structure
      return {
        blogs,
        pagination: {
          page,
          totalPages,
          totalBlogs,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error in getBlogsByTag (model):", error);
      throw error;
    }
  },

  // Get count of blogs by tag
  getCountByTag: async (tag) => {
    try {
      return await Blog.countDocuments({ tags: tag.toLowerCase() });
    } catch (error) {
      console.error(`Error getting count for tag ${tag}:`, error);
      return 0;
    }
  },

  // Get all tag counts
  getAllTagCounts: async () => {
    try {
      // Define the standard tags we want counts for
      const standardTags = [
        "residential",
        "commercial",
        "investment",
        "market-trends",
      ];

      // Create an object to store the counts
      const tagCounts = {};

      // Get count for each standard tag
      for (const tag of standardTags) {
        tagCounts[tag] = await Blog.countDocuments({ tags: tag });
      }

      return tagCounts;
    } catch (error) {
      console.error("Error getting tag counts:", error);
      return {
        residential: 0,
        commercial: 0,
        investment: 0,
        "market-trends": 0,
      };
    }
  },

  // Update blog
  updateBlog: async (id, updatedData) => {
    try {
      // If setting this blog as featured, unset any other featured blog
      if (updatedData.featured) {
        await Blog.updateMany({ _id: { $ne: id } }, { featured: false });
      }

      // Process tags if provided
      if (updatedData.tags) {
        updatedData.tags = Array.isArray(updatedData.tags)
          ? updatedData.tags
          : [updatedData.tags];
      }

      // Update the blog
      const updatedBlog = await Blog.findByIdAndUpdate(
        id,
        { $set: updatedData },
        { new: true, runValidators: true }
      ).lean();

      return updatedBlog;
    } catch (error) {
      console.error(`Error updating blog ${id}:`, error);
      return null;
    }
  },

  // Delete blog
  deleteBlog: async (id) => {
    try {
      const result = await Blog.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error(`Error deleting blog ${id}:`, error);
      return false;
    }
  },

  // Set a blog as featured (and unset others)
  setFeaturedBlog: async (id) => {
    try {
      // First, unset all blogs as featured
      await Blog.updateMany({}, { featured: false });

      // Then set the specified blog as featured
      const result = await Blog.findByIdAndUpdate(
        id,
        { featured: true },
        { new: true }
      );

      return !!result;
    } catch (error) {
      console.error(`Error setting featured blog ${id}:`, error);
      return false;
    }
  },

  // Add a comment to a blog
  addComment: async (blogId, commentData) => {
    try {
      const blog = await Blog.findById(blogId);

      if (!blog) {
        return null; // Blog not found
      }

      // Create new comment
      const newComment = {
        userId: commentData.userId,
        text: commentData.text,
        createdAt: new Date(),
      };

      // Add comment to blog
      blog.comments.push(newComment);
      await blog.save();

      return newComment;
    } catch (error) {
      console.error(`Error adding comment to blog ${blogId}:`, error);
      return null;
    }
  },

  // Get all comments for a blog
  getComments: async (blogId) => {
    try {
      const blog = await Blog.findById(blogId)
        .populate("comments.userId", "name email profileImage")
        .lean();

      if (!blog) {
        return []; // Blog not found
      }

      return blog.comments;
    } catch (error) {
      console.error(`Error getting comments for blog ${blogId}:`, error);
      return [];
    }
  },

  // Get most recent blogs (limited number)
  getRecentBlogs: async (limit = 3) => {
    try {
      return await Blog.find().sort({ createdOn: -1 }).limit(limit).lean();
    } catch (error) {
      console.error(`Error getting recent blogs:`, error);
      return [];
    }
  },

  // Get paginated blogs
  getPaginatedBlogs: async (page = 1, limit = 9) => {
    try {
      const skip = (page - 1) * limit;
      const totalBlogs = await Blog.countDocuments();

      // If there are no blogs, return empty result
      if (totalBlogs === 0) {
        return {
          blogs: [],
          pagination: {
            page: 1,
            totalPages: 0,
            totalBlogs: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

      const totalPages = Math.ceil(totalBlogs / limit);

      const blogs = await Blog.find()
        .sort({ createdOn: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        blogs,
        pagination: {
          page,
          totalPages,
          totalBlogs,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error getting paginated blogs:", error);
      return {
        blogs: [],
        pagination: {
          page: 1,
          totalPages: 0,
          totalBlogs: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  },

  // Export the Mongoose model
  Blog,
};
