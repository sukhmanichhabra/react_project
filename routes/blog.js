const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog");
const adminAuth = require("../middleware/adminAuth");

// Public routes - accessible to all users
router.get("/all", blogController.getAllBlogs);
router.get("/featured", blogController.getFeaturedBlog);
router.get("/tag/:tag", blogController.getBlogsByTag);
router.get("/recent/:limit?", blogController.getRecentBlogs);
router.get("/:id", blogController.getBlogById);

// Admin routes - require admin authentication
router.get("/update/:id", adminAuth, blogController.getBlogUpdateForm);
router.get("/add", adminAuth, blogController.getBlogCreationForm);
router.post(
  "/add",
  adminAuth,
  blogController.upload.single("image"),
  blogController.createBlog
);
router.put(
  "/update/:id",
  adminAuth,
  blogController.upload.single("image"),
  blogController.updateBlog
);
router.delete("/delete/:id", adminAuth, blogController.deleteBlog);
router.put("/featured/:id", adminAuth, blogController.setFeaturedBlog);

// Comment routes - require user authentication
router.post("/comment/:id", blogController.addComment);

module.exports = router;
