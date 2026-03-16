import { useState } from "react";
import "../styles/reviewModal.css";
import { submitReview } from "../api";

function ReviewModal({ booking, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.comment.trim() || formData.comment.trim().length < 10) {
        setError("Review comment must be at least 10 characters");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const reviewData = {
        bookingId: booking._id,
        rating: formData.rating,
        comment: formData.comment.trim()
      };

      await submitReview(reviewData, token);
      onSuccess();
      }
    } catch (err) {
      console.error("Review error:", err);
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message ||
        "Failed to submit review. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`star-button ${star <= formData.rating ? 'active' : ''}`}
        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
      >
        ★
      </button>
    ));
  };

  if (!booking) return null;

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div
        className="review-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="review-header">
          <h2>Rate Your Experience</h2>
          <p>Share your feedback about this property booking</p>
        </div>

        <div className="property-summary">
          <h3>{booking.property?.title || "Property"}</h3>
          <p className="booking-date">
            Booking Date: {new Date(booking.visitDate).toLocaleDateString()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label>Rating *</label>
            <div className="star-rating">
              {renderStars()}
              <span className="rating-text">
                {formData.rating === 5 ? 'Excellent' :
                 formData.rating === 4 ? 'Very Good' :
                 formData.rating === 3 ? 'Good' :
                 formData.rating === 2 ? 'Fair' : 'Poor'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Your Review *</label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Share your experience with this property..."
              className="review-textarea"
              rows="4"
              minLength="10"
              maxLength="500"
              required
            />
            <small className="char-count">
              {formData.comment.length}/500 characters
            </small>
          </div>

          {error && (
            <div className="review-error">
              {error}
            </div>
          )}

          <div className="review-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
