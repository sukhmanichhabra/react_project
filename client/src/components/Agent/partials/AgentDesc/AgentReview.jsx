import { Link, useParams, useNavigate } from "react-router-dom";
import "../../styles/AgentDesc/AgentReview.css";

// Receive agent and user as props
function AgentReview({ agent, user }) {
  const { id } = useParams(); // Still need ID for submitting review
  const navigate = useNavigate();

  // REMOVED: useEffect hook that fetched agent data
  // REMOVED: All state that was duplicated from parent (agent, user, loading)

  // Handle review form submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate(`/auth/signin?redirect=/agent/${id}`);
      return;
    }

    const formData = new FormData(e.target);
    const reviewData = {
      name: formData.get("title"), // This should probably be user.name, but matching your logic
      rating: parseFloat(formData.get("rating")),
      text: formData.get("text"),
      date: new Date().toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }),
      image: user.profileImage || "/assets/reviewer.jpg",
    };

    try {
      const response = await fetch(`/api/agent/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      const feedbackElement = document.querySelector(
        ".agt-desc-review-form .agt-desc-review-feedback"
      );
      if (!feedbackElement) return;

      if (response.ok) {
        feedbackElement.className = "agt-desc-review-feedback success";
        feedbackElement.textContent = `✓ Review submitted successfully! Rating: ${reviewData.rating} stars`;
        feedbackElement.style.display = "block";

        // Reset form
        e.target.reset();

        // Reload page to show new review (as you had it)
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const data = await response.json();
        feedbackElement.className = "agt-desc-review-feedback error";
        feedbackElement.textContent = data.error || "Failed to submit review";
        feedbackElement.style.display = "block";
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      const feedbackElement = document.querySelector(
        ".agt-desc-review-form .agt-desc-review-feedback"
      );
      if (feedbackElement) {
        feedbackElement.className = "agt-desc-review-feedback error";
        feedbackElement.textContent =
          "Failed to submit review. Please try again.";
        feedbackElement.style.display = "block";
      }
    }
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (!agent || !agent.reviews || agent.reviews.length === 0) return "0.0";
    const sum = agent.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / agent.reviews.length).toFixed(1);
  };

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="fas fa-star"></i>);
      } else {
        // Using far for empty star, fas for half/full
        stars.push(<i key={i} className="far fa-star"></i>);
      }
    }
    return stars;
  };

  // No loading/error check needed here, parent handles it
  if (!agent) return null;

  return (
    <div className="agt-desc-review-container">
      {/* Reviews Section */}
      <div className="agt-desc-review-section">
        <div className="agt-desc-review-header">
          <h2>All Reviews ({calculateAverageRating()} Rating)</h2>
        </div>

        <div className="agt-desc-review-list">
          {agent.reviews && agent.reviews.length > 0 ? (
            agent.reviews.map((review, index) => (
              <div key={index} className="agt-desc-review-item">
                <div className="agt-desc-review-reviewer-info">
                  <img
                    src={review.image || "/assets/reviewer.jpg"}
                    alt={review.name}
                    className="agt-desc-review-reviewer-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/reviewer.jpg";
                    }}
                  />
                  <div className="agt-desc-review-reviewer-details">
                    <h3>{review.name}</h3>
                    <span className="agt-desc-review-review-date">
                      {review.date}
                    </span>
                  </div>
                  <div className="agt-desc-review-rating">
                    <span className="agt-desc-review-rating-text">
                      ({review.rating} Rating)
                    </span>
                    <div className="agt-desc-review-stars">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="agt-desc-review-text">{review.text}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>

      {/* Leave A Reply Section */}
      <div className="agt-desc-review-reply-section">
        <h2>Leave A Reply</h2>
        {user ? (
          <form
            className="agt-desc-review-form"
            id="reviewForm"
            onSubmit={handleReviewSubmit}
          >
            <div className="agt-desc-review-feedback"></div>
            <div className="agt-desc-review-form-row">
              <div className="agt-desc-review-form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={user.name}
                  readOnly
                />
              </div>
              <div className="agt-desc-review-form-group">
                <label>Rating</label>
                <select
                  className="agt-desc-review-rating-select"
                  name="rating"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Rating
                  </option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>

            <div className="agt-desc-review-form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                defaultValue={user.email}
                readOnly
              />
            </div>

            <div className="agt-desc-review-form-group">
              <label>Write your review here...</label>
              <textarea name="text" rows="4" required></textarea>
            </div>

            <button type="submit" className="agt-desc-review-post-btn">
              POST REVIEW
            </button>
          </form>
        ) : (
          <p className="agt-desc-review-sign-in-text">
            Please{" "}
            <Link
              to={`/auth/signin?redirect=/agent/${id}`}
              className="agt-desc-review-sign-in-link"
            >
              sign in
            </Link>{" "}
            to post your review or{" "}
            <Link
              to={`/auth/signup?redirect=/agent/${id}`}
              className="agt-desc-review-sign-in-link"
            >
              signup
            </Link>{" "}
            if you don't have an account.
          </p>
        )}
      </div>
    </div>
  );
}

export default AgentReview;
