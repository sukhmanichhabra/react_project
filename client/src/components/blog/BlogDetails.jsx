import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./BlogDetails.css";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [tagCounts, setTagCounts] = useState({});
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState("");
  const [commentValidation, setCommentValidation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Scroll to top on load
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);

    fetchBlogDetails();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const backToTop = document.getElementById("blg-details-backToTop");
      if (backToTop) {
        if (window.pageYOffset > 300) {
          backToTop.style.display = "flex";
        } else {
          backToTop.style.display = "none";
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/blog/${id}`);

      if (response.data.success) {
        setBlog(response.data.data);

        // Fetch related blogs - always try to fetch some related content
        const blogData = response.data.data;
        if (blogData.tags && blogData.tags.length > 0) {
          // Use the first tag for related blogs
          fetchRelatedBlogs(blogData.tags[0]);
        } else {
          // If no tags, just get some recent blogs
          fetchRelatedBlogs(null);
        }

        // Fetch tag counts
        fetchTagCounts();
      }
    } catch (error) {
      console.error("Error fetching blog details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async (tag) => {
    try {
      let filteredBlogs = [];

      // If we have a tag, try to get blogs by that tag first
      if (tag) {
        try {
          const response = await axios.get(`/api/blog/tag/${tag}`);
          filteredBlogs = response.data.filter((b) => b._id !== id).slice(0, 3);
        } catch (tagError) {
          console.warn(`Error fetching blogs by tag '${tag}':`, tagError);
        }
      }

      // If we don't have enough related blogs by tag (or no tag), get more from all blogs
      if (filteredBlogs.length < 3) {
        try {
          const allBlogsResponse = await axios.get("/api/blog/all");
          const allBlogs = allBlogsResponse.data.blogs || allBlogsResponse.data;

          // Get additional blogs excluding current blog and already selected ones
          const additionalBlogs = allBlogs
            .filter(
              (b) =>
                b._id !== id && !filteredBlogs.some((fb) => fb._id === b._id)
            )
            .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn)) // Sort by newest first
            .slice(0, 3 - filteredBlogs.length);

          filteredBlogs = [...filteredBlogs, ...additionalBlogs];
        } catch (allBlogsError) {
          console.error(
            "Error fetching all blogs for related articles:",
            allBlogsError
          );
        }
      }

      console.log(
        `Found ${filteredBlogs.length} related blogs:`,
        filteredBlogs.map((b) => b.title)
      );
      setRelatedBlogs(filteredBlogs);
    } catch (error) {
      console.error("Error in fetchRelatedBlogs:", error);
      setRelatedBlogs([]);
    }
  };

  const fetchTagCounts = async () => {
    try {
      const response = await axios.get("/api/blog/all");
      const blogs = response.data.blogs || response.data;

      const counts = {
        residential: 0,
        commercial: 0,
        investment: 0,
        "market-trends": 0,
      };

      blogs.forEach((blog) => {
        if (blog.tags) {
          blog.tags.forEach((tag) => {
            if (Object.prototype.hasOwnProperty.call(counts, tag)) {
              counts[tag]++;
            }
          });
        }
      });

      setTagCounts(counts);
    } catch (error) {
      console.error("Error fetching tag counts:", error);
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const setFeatured = async (blogId) => {
    if (
      window.confirm(
        "Are you sure you want to set this blog as featured? This will unset any currently featured blog."
      )
    ) {
      try {
        const response = await axios.put(`/api/blog/featured/${blogId}`);

        if (response.data.success) {
          window.location.reload();
        } else {
          alert(
            "Error: " +
              (response.data.error || "Failed to set blog as featured")
          );
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while setting the blog as featured");
      }
    }
  };

  const confirmDelete = async (blogId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this blog? This action cannot be undone."
      )
    ) {
      try {
        const response = await axios.delete(`/api/blog/delete/${blogId}`);

        if (response.data.success) {
          navigate("/blogs");
        } else {
          alert("Error: " + (response.data.error || "Failed to delete blog"));
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the blog");
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const commentText = comment.trim();

    if (!commentText) {
      setCommentValidation("Please enter a comment");
      return;
    }

    setCommentValidation("");
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await axios.post(`/api/blog/comment/${id}`, {
        text: commentText,
      });

      if (response.data.success) {
        window.location.reload();
      } else if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      } else {
        setCommentValidation(response.data.error || "Failed to post comment");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setCommentValidation("An error occurred while posting your comment");
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBlogDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      })
      .toUpperCase();
  };

  if (loading) {
    return <div className="blg-details-loading">Loading...</div>;
  }

  if (!blog) {
    return <div className="blg-details-error">Blog not found</div>;
  }

  const totalTagCount = Object.values(tagCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="blg-details-page">
      <div className="blg-details-container">
        {/* Main Content Area */}
        <div className="blg-details-main-content">
          <div className="blg-details-blog-header">
            <div className="blg-details-author-info">
              <span className="blg-details-author">{blog.author}</span>
              <span className="blg-details-read-time">6 min</span>
            </div>
            <h1 className="blg-details-blog-title">{blog.title}</h1>
            {user && user.role === "admin" && (
              <div className="blg-details-admin-controls">
                <Link
                  to={`/blog/edit/${blog._id}`}
                  className="blg-details-admin-btn blg-details-edit-btn"
                >
                  <i className="fas fa-edit"></i> Edit
                </Link>
                <button
                  className="blg-details-admin-btn blg-details-delete-btn"
                  onClick={() => confirmDelete(blog._id)}
                >
                  <i className="fas fa-trash-alt"></i> Delete
                </button>
                {!blog.featured && (
                  <button
                    className="blg-details-admin-btn blg-details-feature-btn"
                    onClick={() => setFeatured(blog._id)}
                  >
                    <i className="fas fa-star"></i> Set as Featured
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="blg-details-blog-image">
            <span className="blg-details-date-badge">
              {formatBlogDate(blog.createdOn)}
            </span>
            <img
              src={blog.imageUrl}
              alt={blog.title}
              onError={(e) => (e.target.src = "/assets/house.jpg")}
            />
          </div>

          <div
            className="blg-details-blog-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          ></div>

          {/* Testimonial */}
          <div className="blg-details-testimonial">
            <div className="blg-details-quote-icon">❝</div>
            <blockquote>
              Quick solutions coupled with extraordinary nice performance—a
              recommendation that's great.
            </blockquote>
            <div className="blg-details-testimonial-author">
              <span className="blg-details-author-name">James Bond.</span>
              <span className="blg-details-author-location">USA</span>
            </div>
          </div>

          <div className="blg-details-process-section">
            <h2 className="blg-details-process-title">
              Easy Process for Buy an Apartments
            </h2>
            <div className="blg-details-process-checklist">
              <div className="blg-details-checklist-item">
                <i className="fa-solid fa-check"></i>
                <span>Find the problem first</span>
              </div>
              <div className="blg-details-checklist-item">
                <i className="fa-solid fa-check"></i>
                <span>Make research and find out the solution</span>
              </div>
              <div className="blg-details-checklist-item">
                <i className="fa-solid fa-check"></i>
                <span>Finalize the solution & apply.</span>
              </div>
            </div>

            <p className="blg-details-process-description">
              One touch of a red-hot stove is usually all we need to avoid that
              kind of discomfort in quis future. The same Duis aute irure dolor
              in reprehenderit, sunt in culpa qui official deserunt mollit anim
              id avoid est laborum.
            </p>

            <div className="blg-details-blog-image">
              <img
                src="/assets/team-meeting.jpg"
                alt="Team meeting around laptop"
              />
            </div>
            <p className="blg-details-image-caption">
              Buy or rent properties with no commission
            </p>

            <p className="blg-details-process-description">
              Tomfoolery crikey bits and bobs brilliant bamboozled down the pub
              amongst brolly hanky panky, cack bonnet arse over tit burke bugger
              all mate bodge, cillum dolore fugiat pariatur. Excepteur sint
              occaecat cupidatat non proident, sunt in culpa qui official
              deserunt mollit anim Tempus imperdiet nulla malesuada pellentesque
              elit eget gravida cum. Sit amet ris nullam eget felis.
            </p>

            {/* Blog Footer */}
            <div className="blg-details-blog-footer">
              <div className="blg-details-tags">
                <span>Tag:</span>
                <a href="#">Apartments,</a>
                <a href="#">loan,</a>
                <a href="#">Sale</a>
              </div>
              <div className="blg-details-social-share">
                <span>Share:</span>
                <a href="#">
                  <i className="fab fa-whatsapp"></i>
                </a>
                <a href="#">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#">
                  <i className="fab fa-skype"></i>
                </a>
              </div>
            </div>

            {/* Comments Section */}
            <div className="blg-details-comments-section">
              <h2 className="blg-details-comments-title">
                {blog.comments ? blog.comments.length : 0} Comments
              </h2>

              {blog.comments && blog.comments.length > 0 ? (
                blog.comments.map((comment, index) => (
                  <div className="blg-details-comment" key={index}>
                    <div className="blg-details-comment-avatar">
                      <img src="/assets/agent.png" alt="User" />
                    </div>
                    <div className="blg-details-comment-content">
                      <div className="blg-details-comment-header">
                        <span className="blg-details-comment-date">
                          {formatCommentDate(comment.createdAt)}
                        </span>
                        <button className="blg-details-reply-btn">REPLY</button>
                      </div>
                      <p className="blg-details-comment-text">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="blg-details-no-comments">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>

            {/* Leave a Comment Section */}
            <div className="blg-details-leave-comment">
              <h2>Leave A Comment</h2>

              {user ? (
                <form
                  id="blg-details-commentForm"
                  className="blg-details-comment-form"
                  onSubmit={handleCommentSubmit}
                >
                  <div className="form-group">
                    <label htmlFor="comment">Your Comment</label>
                    <textarea
                      id="comment"
                      name="comment"
                      rows="6"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    ></textarea>
                    {commentValidation && (
                      <div
                        id="blg-details-comment-validation"
                        className="blg-details-validation-message"
                      >
                        {commentValidation}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="blg-details-post-comment-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </button>
                </form>
              ) : (
                <p className="blg-details-signin-text">
                  Please{" "}
                  <Link to="/auth/signin" className="blg-details-sign-in">
                    sign in
                  </Link>{" "}
                  to post your comment or{" "}
                  <Link to="/auth/signup" className="blg-details-sign-in">
                    sign up
                  </Link>{" "}
                  if you don't have an account.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="blg-details-sidebar">
          {/* Search Box */}
          <div className="blg-details-search-box">
            <input type="text" placeholder="Search..." />
            <button type="submit">
              <i className="fa fa-search"></i>
            </button>
          </div>

          {/* Categories */}
          <div className="blg-details-category-section">
            <h2>Category</h2>
            <ul className="blg-details-category-list">
              <li>
                <Link to="/blogs">
                  All <span>({totalTagCount})</span>
                </Link>
              </li>
              <li>
                <Link to="/blogs?tag=residential">
                  Residential <span>({tagCounts.residential || 0})</span>
                </Link>
              </li>
              <li>
                <Link to="/blogs?tag=commercial">
                  Commercial <span>({tagCounts.commercial || 0})</span>
                </Link>
              </li>
              <li>
                <Link to="/blogs?tag=investment">
                  Investment <span>({tagCounts.investment || 0})</span>
                </Link>
              </li>
              <li>
                <Link to="/blogs?tag=market-trends">
                  Market Trends <span>({tagCounts["market-trends"] || 0})</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Related Articles */}
          <div className="blg-details-recent-news">
            <h2>Related Articles</h2>
            {relatedBlogs && relatedBlogs.length > 0 ? (
              relatedBlogs.map((relatedBlog) => (
                <div className="blg-details-news-item" key={relatedBlog._id}>
                  <img
                    src={relatedBlog.imageUrl}
                    alt={relatedBlog.title}
                    onError={(e) => (e.target.src = "/assets/house.jpg")}
                  />
                  <div className="blg-details-news-content">
                    <h3>
                      <Link to={`/blog/${relatedBlog._id}`}>
                        {relatedBlog.title}
                      </Link>
                    </h3>
                    <span className="date">
                      {formatDate(relatedBlog.createdOn)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p>No related articles found.</p>
            )}
          </div>

          {/* Keywords section */}
          <div className="blg-details-keywords-section">
            <h2>Tags</h2>
            <div className="blg-details-keywords-list">
              {blog.tags &&
                blog.tags.map((tag, index) => (
                  <Link
                    to={`/blogs?tag=${tag}`}
                    className="blg-details-keyword"
                    key={index}
                  >
                    {tag}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        id="blg-details-backToTop"
        aria-label="Back to top"
        onClick={handleBackToTop}
      >
        <i className="fas fa-chevron-up"></i>
      </button>
    </div>
  );
};

export default BlogDetails;
