import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/properties.css";
import PropertyDetails from "../components/PropertyDetails";
import BookingModal from "../components/BookingModal";
import Chatbot from "../components/Chatbot";

const API_BASE = "http://localhost:5000";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [createdBooking, setCreatedBooking] = useState(null);
  const navigate = useNavigate();

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/properties`);
      const data = res.data;
      // Handle both array response and wrapped { data: [...] } format
      const list = Array.isArray(data) ? data : (data?.properties ?? data?.data ?? []);
      setProperties(list);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(err.response?.data?.message || err.message || "Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((p) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = p.title?.toLowerCase().includes(term);

    // location is stored as an object { city, area, address }
    const city = p.location?.city || "";
    const area = p.location?.area || "";
    const address = p.location?.address || "";
    const locationString = `${city} ${area} ${address}`.toLowerCase();

    const locationMatch = locationString.includes(term);

    return titleMatch || locationMatch;
  });

  const handleBookNow = (property) => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Not logged in - show modal to go to login
      alert("Please log in to book a property");
      navigate("/login");
      return;
    }
    setSelectedProperty(property);
    setShowBookingModal(true);
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
  };

  return (
    <div className="properties-page">
      <Chatbot onPropertySelect={handlePropertySelect} />
      <div className="properties-header">
        <h1>Explore Properties</h1>
        <p>Find your perfect property from our verified listings</p>
      </div>

      <div className="properties-search-container">
        <input
          type="text"
          placeholder="Search by property name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="properties-loading">
          <p>Loading properties...</p>
        </div>
      ) : error ? (
        <div className="properties-error">
          <p>{error}</p>
          <button onClick={fetchProperties} className="btn-retry">Retry</button>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="no-properties">
          <p>{properties.length === 0 ? "No properties listed yet. Check back soon!" : "No properties match your search. Try a different term."}</p>
        </div>
      ) : (
        <div className="property-grid">
          {filteredProperties.map((p) => (
            <div key={p._id} className="property-card">
              <div className="property-image">
                {p.images && p.images.length > 0 && p.images[0] ? (
                  <img src={p.images[0]} alt={p.title || "Property"} />
                ) : (
                  <div className="property-image-placeholder">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <div className="property-info">
                <h3>{p.title || "Untitled Property"}</h3>
                <p className="location">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', marginRight: '4px' }}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                  </svg>
                  {p.location?.area || p.location?.city || p.location || "Location not specified"}
                </p>
                <p className="price">₹{typeof p.price === "number" ? p.price.toLocaleString() : (p.price || "0")}</p>
                {p.description && (
                  <p className="description">{String(p.description).substring(0, 100)}{String(p.description).length > 100 ? "..." : ""}</p>
                )}
                <div className="property-actions">
                  <button
                    className="btn-view"
                    onClick={() => setSelectedProperty(p)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn-book"
                    onClick={() => handleBookNow(p)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProperty && !showBookingModal && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onBookNow={() => {
            const token = localStorage.getItem("token");
            if (!token) {
              alert("Please log in to book a property");
              navigate("/login");
              return;
            }
            setShowBookingModal(true);
          }}
        />
      )}

      {showBookingModal && selectedProperty && (
        <BookingModal
          property={selectedProperty}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedProperty(null);
          }}
          onSuccess={() => {
            alert("Booking submitted successfully!");
            setShowBookingModal(false);
            setSelectedProperty(null);
          }}
        />
      )}
    </div>
  );
}

export default Properties;
