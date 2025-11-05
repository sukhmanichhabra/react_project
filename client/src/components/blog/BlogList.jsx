import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import "./BlogList.css";
import BlogCard from "./partials/BlogCard.jsx";

const BlogList = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [featuredBlog, setFeaturedBlog] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    totalBlogs: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Initialize AOS
    AOS.init({
      startEvent: "DOMContentLoaded",
      offset: 120,
      delay: 100,
      once: false,
      mirror: false,
      disable: "mobile",
    });

    // Scroll to top on load
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  }, []);

  useEffect(() => {
    fetchBlogs();
    fetchFeaturedBlog();
  }, [searchParams]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const page = searchParams.get("page") || 1;
      const tag = searchParams.get("tag") || "";

      let url = `/api/blog/all?page=${page}`;
      if (tag) {
        url = `/api/blog/tag/${tag}?page=${page}`;
        setActiveFilter(tag);
      } else {
        setActiveFilter("all");
      }

      const response = await axios.get(url);

      if (response.data.blogs) {
        setBlogs(response.data.blogs);
        setPagination(response.data.pagination || pagination);
      } else if (Array.isArray(response.data)) {
        setBlogs(response.data);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedBlog = async () => {
    try {
      const response = await axios.get("/api/blog/featured");
      setFeaturedBlog(response.data);
    } catch (error) {
      console.error("Error fetching featured blog:", error);
    }
  };

  const handleCategoryFilter = (filter) => {
    setActiveFilter(filter);
    if (filter === "all") {
      navigate("/blogs");
    } else {
      navigate(`/blogs?tag=${filter}`);
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const backToTop = document.getElementById("blg-list-backToTop");
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

  // FORMAT DATE FOR SMALL CARDS
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Use a shorter format for the small cards
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // FORMAT DATE FOR FEATURED BLOG
  const formatFeaturedDate = (dateString) => {
    const date = new Date(dateString);
    // Use the original long format for the featured blog
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="blg-list-loading">Loading...</div>;
  }

  return (
    <div className="blg-list-page">
      {/* Featured Blog Section (Unchanged) */}
      <section
        className="blg-list-featured-blog"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="blg-list-container">
          <div className="blg-list-section-header">
            <h2 className="blg-list-section-title">
              <i className="fas fa-star"></i> Featured Article
            </h2>
            <p className="blg-list-section-subtitle">
              Our most popular and insightful content
            </p>
            {user && user.role === "admin" && (
              <Link to="/blog/add" className="blg-list-btn-add-blog">
                <i className="fas fa-plus"></i> Add New Blog
              </Link>
            )}
          </div>

          {featuredBlog ? (
            <div className="blg-list-featured-blog-container">
              <div className="blg-list-featured-blog-image">
                <img
                  src={featuredBlog.imageUrl}
                  alt={featuredBlog.title}
                  onError={(e) => (e.target.src = "/assets/house.jpg")}
                />
                <div className="blg-list-featured-tag">
                  <i className="fas fa-star"></i> Featured
                </div>
              </div>
              <div className="blg-list-featured-blog-content">
                <div className="blg-list-featured-meta">
                  <div className="blg-list-featured-category">
                    <i className="fas fa-folder"></i>
                    {featuredBlog.tags && featuredBlog.tags[0]}
                  </div>
                  <div className="blg-list-featured-date">
                    <i className="fas fa-calendar"></i>
                    {/* Use the long date format here */}
                    {formatFeaturedDate(featuredBlog.createdOn)}
                  </div>
                </div>
                <h2 className="blg-list-featured-title">
                  {featuredBlog.title}
                </h2>
                <p className="blg-list-featured-excerpt">
                  {featuredBlog.content
                    ? featuredBlog.content
                        .substring(0, 200)
                        .replace(/<[^>]*>/g, "") + "..."
                    : ""}
                </p>
                <div className="blg-list-featured-author">
                  <img
                    src="/assets/agent.png"
                    alt="Author"
                    className="blg-list-author-avatar"
                  />
                  <span className="blg-list-author-name">
                    {featuredBlog.author}
                  </span>
                </div>
                <Link
                  to={`/blog/${featuredBlog._id}`}
                  className="blg-list-featured-read-more"
                >
                  Read Full Article <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          ) : (
            <div className="blg-list-no-featured-blog">
              <div className="blg-list-empty-state">
                <i className="fas fa-newspaper"></i>
                <h3>No Featured Blog Yet</h3>
                <p>Featured blogs will appear here once added.</p>
                {user && user.role === "admin" && (
                  <Link to="/blog/add" className="blg-list-btn-add-first-blog">
                    <i className="fas fa-plus"></i> Create Your First Blog
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Category Filter Section (Unchanged) */}
      <section
        className="blg-list-blog-categories"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="blg-list-container">
          <div className="blg-list-category-filters">
            <button
              className={`blg-list-category-btn ${
                activeFilter === "all" ? "active" : ""
              }`}
              onClick={() => handleCategoryFilter("all")}
            >
              All Categories
            </button>
            <button
              className={`blg-list-category-btn ${
                activeFilter === "residential" ? "active" : ""
              }`}
              onClick={() => handleCategoryFilter("residential")}
            >
              <i className="fas fa-home"></i> Residential
            </button>
            <button
              className={`blg-list-category-btn ${
                activeFilter === "commercial" ? "active" : ""
              }`}
              onClick={() => handleCategoryFilter("commercial")}
            >
              <i className="fas fa-building"></i> Commercial
            </button>
            <button
              className={`blg-list-category-btn ${
                activeFilter === "investment" ? "active" : ""
              }`}
              onClick={() => handleCategoryFilter("investment")}
            >
              <i className="fas fa-chart-line"></i> Investment
            </button>
            <button
              className={`blg-list-category-btn ${
                activeFilter === "market-trends" ? "active" : ""
              }`}
              onClick={() => handleCategoryFilter("market-trends")}
            >
              <i className="fas fa-chart-bar"></i> Market Trends
            </button>
          </div>
        </div>
      </section>

      {/* Blog List Section (MODIFIED) */}
      <section
        className="blg-list-blog-section"
        id="blog"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="blg-list-container">
          <div className="blg-list-section-header">
            <h2 className="blg-list-section-title">
              <i className="fas fa-newspaper"></i> Latest Articles
            </h2>
            <p className="blg-list-section-subtitle">
              Stay updated with our most recent real estate content
            </p>
          </div>

          {blogs && blogs.length > 0 ? (
            <>
              {/* --- THIS IS THE MODIFIED PART --- */}
              <ul className="blg-list-blog-list">
                {blogs.map((blog) => (
                  // Pass the short date format function to the card
                  <BlogCard
                    key={blog._id}
                    blog={blog}
                    formatDate={formatDate}
                  />
                ))}
              </ul>
              {/* --- END OF MODIFICATION --- */}

              {/* Pagination (Unchanged) */}
              <div className="blg-list-pagination" data-aos="fade-up">
                {pagination.hasPrev && (
                  <Link
                    to={`/blogs?page=${pagination.page - 1}${
                      searchParams.get("tag")
                        ? `&tag=${searchParams.get("tag")}`
                        : ""
                    }`}
                    className="page-nav prev"
                  >
                    <i className="fas fa-chevron-left"></i> Previous
                  </Link>
                )}

                {[...Array(pagination.totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    (pageNum >= pagination.page - 1 &&
                      pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <Link
                        key={pageNum}
                        to={`/blogs?page=${pageNum}${
                          searchParams.get("tag")
                            ? `&tag=${searchParams.get("tag")}`
                            : ""
                        }`}
                        className={pagination.page === pageNum ? "active" : ""}
                      >
                        {pageNum}
                      </Link>
                    );
                  } else if (
                    pageNum === pagination.page - 2 ||
                    pageNum === pagination.page + 2
                  ) {
                    return (
                      <span key={pageNum} className="page-ellipsis">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                {pagination.hasNext && (
                  <Link
                    to={`/blogs?page=${pagination.page + 1}${
                      searchParams.get("tag")
                        ? `&tag=${searchParams.get("tag")}`
                        : ""
                    }`}
                    className="page-nav next"
                  >
                    Next <i className="fas fa-chevron-right"></i>
                  </Link>
                )}
              </div>
            </>
          ) : (
            <div className="blg-list-no-blogs">
              <div className="blg-list-empty-state">
                <i className="fas fa-newspaper"></i>
                <h3>No Blogs Available</h3>
                <p>Check back later for new content.</p>
                {user && user.role === "admin" && (
                  <Link to="/blog/add" className="blg-list-btn-add-first-blog">
                    <i className="fas fa-plus"></i> Create Your First Blog
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section (Unchanged) */}
      <section
        className="blg-list-newsletter"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="blg-list-container">
          <div className="blg-list-newsletter-content">
            <div className="blg-list-newsletter-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="blg-list-newsletter-text">
              <h3>Subscribe to Our Newsletter</h3>
              <p>Get the latest real estate insights delivered to your inbox</p>
            </div>
            <form className="blg-list-newsletter-form">
              <div className="form-group">
                <input type="email" placeholder="Enter your email" required />
                <button type="submit">Subscribe</button>
              </div>
              <div className="form-check">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">I agree to receive newsletters</label>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Real Estate Stats Section (Unchanged) */}
      <section
        className="blg-list-stats-section"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="blg-list-container">
          <div className="blg-list-section-header">
            <h2 className="blg-list-section-title">
              <i className="fas fa-chart-pie"></i> Real Estate Market Insights
            </h2>
            <p className="blg-list-section-subtitle">
              Key statistics from the current real estate market
            </p>
          </div>

          <div className="blg-list-stats-container">
            <div className="blg-list-stat-card">
              <div className="blg-list-stat-icon">
                <i className="fas fa-home"></i>
              </div>
              <h3 className="stat-number" data-target="15000">
                1000+
              </h3>
              <p className="blg-list-stat-title">Properties Listed</p>
            </div>

            <div className="blg-list-stat-card">
              <div className="blg-list-stat-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="stat-number" data-target="8.5">
                25%
              </h3>
              <p className="blg-list-stat-title">Average Price Growth (%)</p>
            </div>

            <div className="blg-list-stat-card">
              <div className="blg-list-stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="stat-number" data-target="50000">
                10000+
              </h3>
              <p className="blg-list-stat-title">Happy Customers</p>
            </div>

            <div className="blg-list-stat-card">
              <div className="blg-list-stat-icon">
                <i className="fas fa-handshake"></i>
              </div>
              <h3 className="stat-number" data-target="2500">
                5000+
              </h3>
              <p className="blg-list-stat-title">Successful Deals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button (Unchanged) */}
      <button
        id="blg-list-backToTop"
        aria-label="Back to top"
        onClick={handleBackToTop}
      >
        <i className="fas fa-chevron-up"></i>
      </button>
    </div>
  );
};

export default BlogList;
