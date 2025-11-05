// --- BlogCard.jsx ---

import React from "react";
import { Link } from "react-router-dom";
import "./BlogCard.css"; // We will create this new CSS file

// We pass blog and formatDate as props from BlogList
const BlogCard = ({ blog, formatDate }) => {
  // Helper to safely get the first tag, or a default
  const getTag = () => {
    if (blog.tags && blog.tags[0]) {
      return blog.tags[0];
    }
    return "General"; // Default tag if none
  };

  const tag = getTag();
  const tagForCSS = tag.toLowerCase().replace(" ", "-"); // e.g., "market-trends"

  return (
    <li className="blg-card-list-item">
      {/* data-category is used by CSS to color the tag pill.
       */}
      <div className="blg-card" data-category={tagForCSS}>
        <figure className="blg-card-banner">
          <img
            src={blog.imageUrl}
            alt={blog.title}
            onError={(e) => (e.target.src = "/assets/house.jpg")}
          />
        </figure>

        <div className="blg-card-content">
          {/* Top Meta: Author and Tag */}
          <div className="blg-card-meta-list">
            <span className="blg-card-meta-link">
              <i className="fas fa-user"></i>
              by: {blog.author}
            </span>
            <span className="blg-card-meta-link blg-card-tag-pill">
              {/* This span is styled as the pill */}
              {tag}
            </span>
          </div>

          {/* Title */}
          <h3 className="blg-card-title">{blog.title}</h3>

          {/* Bottom Meta: Date and Read More */}
          <div className="blg-card-content-bottom">
            <div className="blg-card-publish-date">
              <i className="fas fa-calendar"></i>
              <time dateTime={blog.createdOn}>
                {formatDate(blog.createdOn)}
              </time>
            </div>
            <Link to={`/blog/${blog._id}`} className="blg-card-read-more">
              Read More
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
};

export default BlogCard;
