import React, { useState } from 'react';

const ReviewSection = ({ reviews, propertyId }) => {
  const [formData, setFormData] = useState({
    title: '',
    rating: '',
    text: '',
    userName: ''
  });
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email.trim());
  };

  const validateTitle = (title) => {
    return title.trim().length >= 5;
  };

  const validateReview = (text) => {
    return text.trim().length >= 50;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ title: true, userName: true, rating: true, text: true });

    // Validate all fields
    const newErrors = {};
    if (!validateTitle(formData.title)) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    if (!validateEmail(formData.userName)) {
      newErrors.userName = 'Please enter a valid email address';
    }
    if (!formData.rating) {
      newErrors.rating = 'Please select a rating';
    }
    if (!validateReview(formData.text)) {
      newErrors.text = `Review must be at least 50 characters (${formData.text.trim().length}/50)`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus('error');
      return;
    }

    setStatus('sending');

    // TODO: Replace with actual API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ title: '', rating: '', text: '', userName: '' });
      setErrors({});
      setTouched({});
      setTimeout(() => setStatus(''), 3000);
    }, 1500);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    // Clear error for this field when user starts typing
    if (errors[id]) {
      setErrors({ ...errors, [id]: '' });
    }

    // Real-time validation
    const newErrors = { ...errors };
    
    if (id === 'title' && touched.title) {
      if (!validateTitle(value)) {
        newErrors.title = 'Title must be at least 5 characters';
      } else {
        delete newErrors.title;
      }
    }

    if (id === 'userName' && touched.userName) {
      if (!validateEmail(value)) {
        newErrors.userName = 'Please enter a valid email address';
      } else {
        delete newErrors.userName;
      }
    }

    if (id === 'rating' && touched.rating) {
      if (!value) {
        newErrors.rating = 'Please select a rating';
      } else {
        delete newErrors.rating;
      }
    }

    if (id === 'text' && touched.text) {
      if (!validateReview(value)) {
        newErrors.text = `Review must be at least 50 characters (${value.trim().length}/50)`;
      } else {
        delete newErrors.text;
      }
    }

    setErrors(newErrors);
  };

  const handleBlur = (e) => {
    const { id } = e.target;
    setTouched({ ...touched, [id]: true });

    // Trigger validation on blur
    const newErrors = { ...errors };

    if (id === 'title') {
      if (!validateTitle(formData.title)) {
        newErrors.title = 'Title must be at least 5 characters';
      }
    }

    if (id === 'userName') {
      if (!validateEmail(formData.userName)) {
        newErrors.userName = 'Please enter a valid email address';
      }
    }

    if (id === 'rating') {
      if (!formData.rating) {
        newErrors.rating = 'Please select a rating';
      }
    }

    if (id === 'text') {
      if (!validateReview(formData.text)) {
        newErrors.text = `Review must be at least 50 characters (${formData.text.trim().length}/50)`;
      }
    }

    setErrors(newErrors);
  };

  return (
    <div className="prop-overview-section-box">
      <div className="prop-overview-reviews-header">
        <h2>Reviews</h2>
        {reviews.length > 0 && (
          <div className="prop-overview-average-rating">
            <div className="prop-overview-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <i key={star} className="fas fa-star filled"></i>
              ))}
            </div>
            <span className="prop-overview-review-count">({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="prop-overview-no-reviews">No reviews yet. Be the first to review this property!</p>
      ) : (
        reviews.map((review) => (
          <div key={review._id} className="prop-overview-review">
            <div className="prop-overview-review-content">
              <div className="prop-overview-review-top">
                <div className="prop-overview-review-author">
                  <strong>{review.userName}</strong>
                  <div className="prop-overview-review-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i 
                        key={star} 
                        className={`fas fa-star ${star <= review.rating ? 'filled' : ''}`}
                      ></i>
                    ))}
                  </div>
                </div>
              </div>
              <span className="prop-overview-review-date">
                {new Date(review.date).toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit'
                })}
              </span>
              <h4 className="prop-overview-review-title">{review.title}</h4>
              <p className="prop-overview-review-text">{review.text}</p>
            </div>
            <hr />
          </div>
        ))
      )}

      {/* Write Review Form */}
      <div className="prop-overview-write-review">
        <h2>Leave A Review</h2>
        <form id="prop-overview-reviewForm" onSubmit={handleSubmit}>
          <input type="hidden" id="propertyId" value={propertyId} />
          
          {status && (
            <div id="prop-overview-reviewStatus" className={`prop-overview-review-status ${status}`}>
              {status === 'sending' && 'Submitting review...'}
              {status === 'success' && 'Review submitted successfully!'}
              {status === 'error' && 'Please fill in all required fields'}
            </div>
          )}

          <div className="prop-overview-form-group">
            <label htmlFor="title">Title*</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder=""
              className={errors.title && touched.title ? 'invalid' : formData.title && !errors.title ? 'valid' : ''}
              required
            />
            {errors.title && touched.title && (
              <span className="prop-overview-validation-message show">{errors.title}</span>
            )}
          </div>

          <div className="prop-overview-form-row">
            <div className="prop-overview-form-group">
              <label htmlFor="userName">Email*</label>
              <input
                type="email"
                id="userName"
                value={formData.userName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder=""
                className={errors.userName && touched.userName ? 'invalid' : formData.userName && !errors.userName ? 'valid' : ''}
                required
              />
              {errors.userName && touched.userName && (
                <span className="prop-overview-validation-message show">{errors.userName}</span>
              )}
            </div>

            <div className="prop-overview-form-group">
              <label htmlFor="rating">Rating*</label>
              <select 
                id="rating" 
                value={formData.rating}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.rating && touched.rating ? 'invalid' : formData.rating && !errors.rating ? 'valid' : ''}
                required
              >
                <option value="">Select Rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              {errors.rating && touched.rating && (
                <span className="prop-overview-validation-message show">{errors.rating}</span>
              )}
            </div>
          </div>

          <div className="prop-overview-form-group">
            <div className="prop-overview-label-with-counter">
              <label htmlFor="text">Review*</label>
              <span className={`prop-overview-character-counter ${formData.text.trim().length >= 50 ? 'valid' : ''}`}>
                {formData.text.trim().length}/50 characters
              </span>
            </div>
            <textarea
              id="text"
              rows="6"
              value={formData.text}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Write your review here..."
              className={errors.text && touched.text ? 'invalid' : formData.text && !errors.text ? 'valid' : ''}
              required
            ></textarea>
            {errors.text && touched.text && (
              <span className="prop-overview-validation-message show">{errors.text}</span>
            )}
          </div>

          <button type="submit" className="prop-overview-post-review-btn">
            POST REVIEW
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewSection;