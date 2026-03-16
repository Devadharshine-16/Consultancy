import { useState } from "react";
import "../styles/bookingModal.css";
import { createBooking } from "../api";

function BookingModal({ property, onClose, onSuccess }) {
  // Guard if property is missing
  if (!property) return null;

  // Derive safe location text (handles object or string)
  const locationText =
    property.location && typeof property.location === "object"
      ? property.location.city ||
        property.location.area ||
        property.location.address ||
        "Location not specified"
      : property.location || "Location not specified";

  // Derive safe price text (handles number/string/missing)
  const hasPrice =
    property.price !== undefined &&
    property.price !== null &&
    property.price !== "";
  const numericPrice = hasPrice ? Number(property.price) : null;
  const priceText =
    numericPrice !== null && !Number.isNaN(numericPrice)
      ? `₹${numericPrice.toLocaleString()}`
      : "Price not specified";

  const [formData, setFormData] = useState({
    visitDate: "",
    message: "",
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
      if (!formData.visitDate) {
        setError("Please select a visit date");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const bookingData = {
        property: property._id,
        visitDate: formData.visitDate,
        message: formData.message,
      };

      await createBooking(bookingData, token);
      onSuccess();
    } catch (err) {
      console.error("Booking error:", err);
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message ||
        "Failed to submit booking. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div
        className="booking-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="booking-modal-header">
          <h2>Book This Property</h2>
          <p className="property-name">{property.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          {/* Property ID (hidden) */}
          <input type="hidden" value={property._id} />

          {/* Property Info */}
          <div className="booking-property-info">
            <div className="info-row">
              <span className="label">Property:</span>
              <span className="value">{property.title}</span>
            </div>
            <div className="info-row">
              <span className="label">Location:</span>
              <span className="value">{locationText}</span>
            </div>
            <div className="info-row">
              <span className="label">Price:</span>
              <span className="value">{priceText}</span>
            </div>
          </div>

          {/* Visit Date */}
          <div className="form-group">
            <label htmlFor="visitDate">
              Visit Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="visitDate"
              name="visitDate"
              value={formData.visitDate}
              onChange={handleInputChange}
              min={today}
              required
              className="form-input"
            />
          </div>

          {/* Message */}
          <div className="form-group">
            <label htmlFor="message">
              Message <span className="optional">(optional)</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Tell us anything you'd like about your visit or property requirements..."
              rows="4"
              className="form-textarea"
            ></textarea>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Booking Request"}
          </button>
        </form>

        <div className="booking-info">
          <p className="info-text">
            ℹ️ Your contact information will be automatically included from your account.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
