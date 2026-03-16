import { useState } from "react";
import "../styles/propertyDetails.css";

function PropertyDetails({ property, onClose, onBookNow }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + property.images.length) % property.images.length
      );
    }
  };

  // guard against missing property prop entirely
  if (!property) return null;

  // derive safe values
  const locationText =
    property.location && typeof property.location === "object"
      ? property.location.city || property.location.area || property.location.address || "Location not specified"
      : property.location || "Location not specified";
  const priceText =
    property.price !== undefined && property.price !== null
      ? `₹${Number(property.price).toLocaleString()}`
      : "Price not specified";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="property-details-container">
          {/* Image Gallery */}
          <div className="image-gallery">
            {property.images && property.images.length > 0 ? (
              <>
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="main-image"
                />
                {property.images.length > 1 && (
                  <>
                    <button className="nav-button prev" onClick={prevImage}>
                      ❮
                    </button>
                    <button className="nav-button next" onClick={nextImage}>
                      ❯
                    </button>
                    <div className="image-indicators">
                      {property.images.map((_, idx) => (
                        <span
                          key={idx}
                          className={`indicator ${
                            idx === currentImageIndex ? "active" : ""
                          }`}
                          onClick={() => setCurrentImageIndex(idx)}
                        ></span>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="no-image">No image available</div>
            )}
          </div>

          {/* Details */}
          <div className="property-details-info">
            <h2>{property.title}</h2>
            <p className="location">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
              </svg>
              {locationText}
            </p>
            <p className="price">{priceText}</p>

            {property.description && (
              <div className="description-section">
                <h3>About this property</h3>
                <p>{property.description}</p>
              </div>
            )}

            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Property Type</span>
                <span className="value">Premium Listing</span>
              </div>
              <div className="detail-item">
                <span className="label">Status</span>
                <span className="value">Available</span>
              </div>
              <div className="detail-item">
                <span className="label">Location</span>
                <span className="value">{locationText}</span>
              </div>
              <div className="detail-item">
                <span className="label">Price</span>
                <span className="value">{priceText}</span>
              </div>
            </div>

            <button className="btn-book-now" onClick={onBookNow}>
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;
