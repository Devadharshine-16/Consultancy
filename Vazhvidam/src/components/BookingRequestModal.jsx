import { useState } from "react";
import "../styles/bookingRequestModal.css";

function BookingRequestModal({ booking, onClose, onApprove, onReject, isLoading }) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (booking) await onReject(booking._id, rejectionReason);
  };

  if (!booking) return null;

  // Safe location text (handles object {city, area, address} or string)
  const prop = booking.property;
  const locationText =
    prop?.location && typeof prop.location === "object"
      ? prop.location.city || prop.location.area || prop.location.address || "N/A"
      : prop?.location || "N/A";

  // Safe price text (handles number, string, null, undefined)
  const hasPrice = prop?.price !== undefined && prop?.price !== null && prop?.price !== "";
  const numericPrice = hasPrice ? Number(prop.price) : null;
  const priceText =
    numericPrice !== null && !Number.isNaN(numericPrice)
      ? `₹${numericPrice.toLocaleString()}`
      : "N/A";

  const visitDate = booking.visitDate
    ? new Date(booking.visitDate).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "N/A";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content booking-request-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <h2>Booking Request Details</h2>
          <span className="status-badge pending">{booking.status || "pending"}</span>
        </div>

        <div className="booking-details">
          {/* Property Info */}
          <section className="section">
            <h3>📍 Property</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Property Name</label>
                <p>{booking.property?.title || "N/A"}</p>
              </div>
              <div className="detail-item">
                <label>Location</label>
                <p>{locationText}</p>
              </div>
              <div className="detail-item">
                <label>Price</label>
                <p>{priceText}</p>
              </div>
            </div>
          </section>

          {/* User Info */}
          <section className="section">
            <h3>👤 User Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Name</label>
                <p>{booking.user?.name || "N/A"}</p>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <p>{booking.user?.email || "N/A"}</p>
              </div>
              <div className="detail-item">
                <label>Role</label>
                <p className="capitalize">{booking.user?.role || "N/A"}</p>
              </div>
            </div>
          </section>

          {/* Booking Info */}
          <section className="section">
            <h3>📅 Visit Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Requested Visit Date</label>
                <p>{visitDate}</p>
              </div>
              <div className="detail-item">
                <label>Booking Date</label>
                <p>
                  {booking.createdAt
                    ? new Date(booking.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </section>

          {/* Message */}
          {booking.message && (
            <section className="section">
              <h3>💬 User Message</h3>
              <div className="message-box">
                <p>{booking.message}</p>
              </div>
            </section>
          )}

          {/* Rejection Reason (if rejected) */}
          {booking.status === "rejected" && booking.rejectionReason && (
            <section className="section">
              <h3>❌ Rejection Reason</h3>
              <div className="rejection-box">
                <p>{booking.rejectionReason}</p>
              </div>
            </section>
          )}
        </div>

        {/* Action Buttons */}
        {booking.status === "pending" && (
          <div className="modal-actions">
            {!showRejectForm ? (
              <>
                <button
                  className="btn-approve"
                  onClick={onApprove}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "✅ Approve"}
                </button>
                <button
                  className="btn-reject"
                  onClick={() => setShowRejectForm(true)}
                  disabled={isLoading}
                >
                  ❌ Reject
                </button>
              </>
            ) : (
              <form onSubmit={handleRejectSubmit} className="reject-form">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Tell the user why you're rejecting this booking (optional)"
                  className="form-textarea"
                  rows="4"
                />
                <div className="reject-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-confirm-reject"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Confirm Rejection"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {booking.status && booking.status !== "pending" && (
          <div className="modal-footer">
            <p className="responded-info">
              Status: <strong>{(booking.status || "").toUpperCase()}</strong>
              {booking.respondedAt && (
                <span>
                  {" on "}
                  {new Date(booking.respondedAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingRequestModal;
