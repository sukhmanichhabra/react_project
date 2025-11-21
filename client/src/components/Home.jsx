import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import { useProperties } from "./property list/useProperties";
import { getPropertyImageUrl, getAgentImageUrl } from "../utils/imageUtils";

function Home() {
  const { properties, loading, error } = useProperties("all");
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);

  useEffect(() => {
    document.title = "Home - Real Estate Platform";
    window.scrollTo(0, 0);
    fetchLatestBlogs();
  }, []);

  const fetchLatestBlogs = async () => {
    try {
      setBlogsLoading(true);
      const response = await axios.get("/api/blog/all");
      const allBlogs = response.data.blogs || response.data || [];
      // Get last 3 blogs (most recent first)
      const lastThreeBlogs = allBlogs.slice(0, 3);
      setBlogs(lastThreeBlogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setBlogs([]);
    } finally {
      setBlogsLoading(false);
    }
  };

  const featuredProperties = (properties || [])
    .filter((property) => property && property._id)
    .slice(0, 6)
    .map((property) => {
      const agent = property.agent || property.seller || {};

      const location =
        property.location ||
        property.geolocation?.address ||
        "Location not specified";

      const imageUrl =
        property.images && property.images.length > 0
          ? getPropertyImageUrl(property.images[0])
          : "/assets/property-1.jpg";

      let priceLabel = "$0";
      if (typeof property.price === "number") {
        priceLabel = `$${property.price.toLocaleString()}`;
      } else if (typeof property.price === "string") {
        priceLabel = property.price;
      }

      const bedrooms =
        parseInt(
          property.features?.bedrooms ||
            property.features?.beds ||
            property.bedrooms
        ) || 0;

      const bathrooms =
        parseInt(
          property.features?.bathrooms ||
            property.features?.baths ||
            property.bathrooms
        ) || 0;

      const squareFeet =
        parseInt(
          property.features?.squareFootage ||
            property.features?.sqft ||
            property.squareFeet
        ) || 0;

      return {
        id: property._id,
        badge: property.tag === "rent" ? "green" : "orange",
        badgeText: property.tag === "rent" ? "FOR RENT" : "FOR SALE",
        location,
        imagesCount: property.images?.length || 0,
        imageUrl,
        price: priceLabel,
        title: property.title || "Property",
        description: property.description || "No description available",
        bedrooms,
        bathrooms,
        squareFeet,
        overviewLink: `/property/${property._id}`,
        agentImage: getAgentImageUrl(agent.image || agent.profileImage),
        agentName:
          agent.fullName || agent.name || property.seller?.name || "Estate Agent",
        agentLink: agent._id ? `/agents/${agent._id}` : "#",
      };
    });

  const totalProperties = properties?.length || 0;

  return (
    <div className="home-page">
      <main>
        <article>
          <section className="hero" id="home">
            <div className="home-container">
              <div className="hero-inner">
                <div className="hero-content">
                  <p className="hero-subtitle">
                    <span>PREMIUM REAL ESTATE</span>
                  </p>
                  <h2 className="hero-title">Find Your Perfect Property With Us</h2>
                  <p className="hero-text">
                    We help you find your dream home with our curated selection of
                    premium properties. Our expert agents provide personalized
                    guidance throughout your real estate journey.
                  </p>
                  <div className="hero-buttons">
                    <Link to="/properties" className="btn">
                      Explore Properties
                    </Link>
                    <Link to="/contact" className="btn btn-secondary">
                      Contact Us
                    </Link>
                  </div>
                </div>
                <figure className="hero-banner">
                  <img
                    src="/assets/heroimg.png"
                    alt="Modern house model"
                  />
                </figure>
              </div>
              <div className="trusted-by">
                <h4>Trusted By</h4>
                <div className="partner-logos">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/5969/5969002.png"
                    alt="Partner 1"
                    className="partner-logo"
                  />
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png"
                    alt="Partner 2"
                    className="partner-logo"
                  />
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/5968/5968919.png"
                    alt="Partner 3"
                    className="partner-logo"
                  />
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/5968/5968705.png"
                    alt="Partner 4"
                    className="partner-logo"
                  />
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/5968/5968853.png"
                    alt="Partner 5"
                    className="partner-logo"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="about" id="about">
            <div className="home-container">
              <div className="about-inner">
                <figure className="about-banner">
                  <img
                    src="/assets/about-banner-1.png"
                    alt="House interior"
                    className="about-banner-main"
                  />
                  <img
                    src="/assets/about-banner-2.jpg"
                    alt="House interior"
                    className="about-banner-secondary"
                  />
                </figure>
                <div className="about-content">
                  <p className="section-subtitle">About Us</p>
                  <h2 className="section-title">
                    The Leading Real Estate Rental-Selling Marketplace.
                  </h2>
                  <p className="about-text">
                    Over 39,000 people work for us in more than 70 countries all over
                    the world. This breadth of global coverage, combined with
                    specialist services, makes us the perfect partner for your
                    property journey.
                  </p>
                  <ul className="about-list">
                    <li className="about-item">
                      <div className="about-item-icon">
                        <ion-icon name="home-outline"></ion-icon>
                      </div>
                      <p className="about-item-text">No Collateral Loans</p>
                    </li>
                    <li className="about-item">
                      <div className="about-item-icon">
                        <ion-icon name="leaf-outline"></ion-icon>
                      </div>
                      <p className="about-item-text">Competitive Prices</p>
                    </li>
                    <li className="about-item">
                      <div className="about-item-icon">
                        <ion-icon name="wine-outline"></ion-icon>
                      </div>
                      <p className="about-item-text">Exceptional Lifestyle</p>
                    </li>
                    <li className="about-item">
                      <div className="about-item-icon">
                        <ion-icon name="shield-checkmark-outline"></ion-icon>
                      </div>
                      <p className="about-item-text">24/7 Agent Support</p>
                    </li>
                  </ul>
                  <p className="about-callout">
                    "You are not buying a house, you are buying a lifestyle."
                  </p>
                  <Link to="/properties" className="btn">
                    Our Services
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="service" id="service">
            <div className="home-container">
              <p className="section-subtitle">Our Services</p>
              <h2 className="section-title">Our Main Focus</h2>
              <ul className="service-list">
                <li>
                  <div className="service-card">
                    <div className="card-icon">
                      <img src="/assets/service-1.png" alt="Service icon" />
                    </div>
                    <h3 className="card-title">
                      <Link to="/properties">Buy a home</Link>
                    </h3>
                    <p className="card-text">
                      Over 1 million+ homes for sale available on the website, we can
                      match you with a house you will want to call home.
                    </p>
                    <Link to="/properties" className="card-link">
                      <span>Find A Home</span>
                      <ion-icon name="arrow-forward-outline"></ion-icon>
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="service-card">
                    <div className="card-icon">
                      <img src="/assets/service-2.png" alt="Service icon" />
                    </div>
                    <h3 className="card-title">
                      <Link to="/properties">Rent a home</Link>
                    </h3>
                    <p className="card-text">
                      Explore a wide range of rental properties tailored to your
                      budget and lifestyle.
                    </p>
                    <Link to="/properties" className="card-link">
                      <span>Find A Home</span>
                      <ion-icon name="arrow-forward-outline"></ion-icon>
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="service-card">
                    <div className="card-icon">
                      <img src="/assets/service-3.png" alt="Service icon" />
                    </div>
                    <h3 className="card-title">
                      <Link to="/properties">Sell a home</Link>
                    </h3>
                    <p className="card-text">
                      We help you list, market, and sell your property at the best
                      possible price.
                    </p>
                    <Link to="/properties" className="card-link">
                      <span>Find A Home</span>
                      <ion-icon name="arrow-forward-outline"></ion-icon>
                    </Link>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="property" id="property">
            <div className="home-container">
              <p className="section-subtitle">Properties</p>
              <h2 className="section-title">Featured Listings</h2>

              {loading && (
                <p style={{ textAlign: "center", padding: "1rem" }}>
                  Loading featured properties...
                </p>
              )}

              {error && !loading && (
                <p style={{ textAlign: "center", padding: "1rem", color: "red" }}>
                  {error}
                </p>
              )}

              {!loading && !error && featuredProperties.length === 0 && (
                <p style={{ textAlign: "center", padding: "1rem" }}>
                  No featured properties available right now.
                </p>
              )}

              {!loading && !error && featuredProperties.length > 0 && (
                <ul className="property-list">
                  {featuredProperties.map((item) => (
                    <li key={item.id}>
                      <div className="property-card">
                        <figure className="card-banner">
                          <Link to={item.overviewLink}>
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-100"
                            />
                          </Link>
                          <div className={`card-badge ${item.badge}`}>
                            {item.badgeText}
                          </div>
                          <div className="banner-actions">
                            <button className="banner-actions-btn">
                              <ion-icon name="location"></ion-icon>
                              <address>{item.location}</address>
                            </button>
                            <button className="banner-actions-btn">
                              <ion-icon name="camera"></ion-icon>
                              <span>{item.imagesCount}</span>
                            </button>
                          </div>
                        </figure>
                        <div className="card-content">
                          <div className="card-price">
                            <strong>{item.price}</strong>
                          </div>
                          <h3 className="card-title">
                            <Link to={item.overviewLink}>{item.title}</Link>
                          </h3>
                          <p className="card-text">{item.description}</p>
                          <ul className="card-list">
                            <li className="card-item">
                              <strong>{item.bedrooms}</strong>
                              <ion-icon name="bed-outline"></ion-icon>
                              <span>Bedrooms</span>
                            </li>
                            <li className="card-item">
                              <strong>{item.bathrooms}</strong>
                              <ion-icon name="man-outline"></ion-icon>
                              <span>Bathrooms</span>
                            </li>
                            <li className="card-item">
                              <strong>{item.squareFeet}</strong>
                              <ion-icon name="square-outline"></ion-icon>
                              <span>Square Ft</span>
                            </li>
                          </ul>
                        </div>
                        <div className="card-footer">
                          <div className="card-author">
                            <figure className="author-avatar">
                              <img
                                src={item.agentImage}
                                alt={item.agentName}
                                className="w-100"
                              />
                            </figure>
                            <div>
                              <p className="author-name">
                                <Link to={item.agentLink}>{item.agentName}</Link>
                              </p>
                              <p className="author-title">Estate Agent</p>
                            </div>
                          </div>
                          <div className="card-footer-actions">
                            <button className="card-footer-actions-btn">
                              <ion-icon name="resize-outline"></ion-icon>
                            </button>
                            <button className="card-footer-actions-btn">
                              <ion-icon name="heart-outline"></ion-icon>
                            </button>
                            <button className="card-footer-actions-btn">
                              <ion-icon name="add-circle-outline"></ion-icon>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="features">
            <div className="home-container">
              <p className="section-subtitle">Our Testimonial</p>
              <h2 className="section-title">Clients Feedback</h2>
              <ul className="features-list">
                <li>
                  <div className="features-card">
                    <div className="card-icon">
                      <ion-icon name="person-outline"></ion-icon>
                    </div>
                    <h3 className="card-title">Jacob William</h3>
                    <p className="author-title">SELLING AGENTS</p>
                    <p className="card-text">
                      <ion-icon
                        name="quote-outline"
                        className="quote-icon"
                      ></ion-icon>
                      "Excellent service! Found my dream home in just two weeks.
                      The team was professional and attentive."
                    </p>
                  </div>
                </li>
                <li>
                  <div className="features-card">
                    <div className="card-icon">
                      <ion-icon name="person-outline"></ion-icon>
                    </div>
                    <h3 className="card-title">Kelian Anderson</h3>
                    <p className="author-title">SELLING AGENTS</p>
                    <p className="card-text">
                      <ion-icon
                        name="quote-outline"
                        className="quote-icon"
                      ></ion-icon>
                      "The property listings were accurate and detailed. Made my
                      decision-making process much easier."
                    </p>
                  </div>
                </li>
                <li>
                  <div className="features-card">
                    <div className="card-icon">
                      <ion-icon name="person-outline"></ion-icon>
                    </div>
                    <h3 className="card-title">Emma Thompson</h3>
                    <p className="author-title">HOME BUYER</p>
                    <p className="card-text">
                      <ion-icon
                        name="quote-outline"
                        className="quote-icon"
                      ></ion-icon>
                      "The virtual tours saved me so much time. I could narrow
                      down my choices before visiting in person."
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="journal" id="journal">
            <div className="home-container">
              <p className="section-subtitle">News & Journal</p>
              <h2 className="section-title">Latest Blog Posts</h2>

              {blogsLoading && (
                <p style={{ textAlign: "center", padding: "2rem", color: "#718096" }}>
                  Loading latest blogs...
                </p>
              )}

              {!blogsLoading && blogs.length === 0 && (
                <p style={{ textAlign: "center", padding: "2rem", color: "#718096" }}>
                  No blog posts available yet.
                </p>
              )}

              {!blogsLoading && blogs.length > 0 && (
                <ul className="journal-list">
                  {blogs.map((blog) => {
                    const blogDate = blog.createdAt
                      ? new Date(blog.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Unknown date";

                    const authorName = blog.author?.name || blog.author || "Anonymous";
                    const authorImage = blog.author?.image || blog.author?.profileImage || "/images/default-avatar.png";
                    const blogImage = blog.imageUrl || blog.image || "/assets/house.jpg";
                    const blogTag = blog.tags?.[0] || "Real Estate";

                    return (
                      <li key={blog._id}>
                        <div className="blog-card">
                          <div className="blog-card-image">
                            <img src={blogImage} alt={blog.title} />
                            <span className="blog-card-tag">{blogTag}</span>
                          </div>
                          <div className="blog-card-content">
                            <p className="blog-card-date">
                              <ion-icon name="calendar-outline"></ion-icon>
                              {blogDate}
                            </p>
                            <h3 className="blog-card-title">
                              <Link to={`/blog/${blog._id}`}>{blog.title}</Link>
                            </h3>
                            <p className="blog-card-excerpt">
                              {blog.excerpt || blog.description || "No description available"}
                            </p>
                            <div className="blog-card-footer">
                              <div className="blog-card-author">
                                <figure className="blog-card-author-avatar">
                                  <img src={authorImage} alt={authorName} />
                                </figure>
                                <p className="blog-card-author-name">{authorName}</p>
                              </div>
                              <Link to={`/blog/${blog._id}`} className="blog-card-read-more">
                                <span>Read More</span>
                                <ion-icon name="arrow-forward-outline"></ion-icon>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}

export default Home;
