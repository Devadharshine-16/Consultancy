import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/dashboard.css";
import BookingRequestModal from "../components/BookingRequestModal";

function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" or "property"
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const [property, setProperty] = useState({
    title: "",
    location: "",
    price: "",
    description: ""
  });

  // Fetch owner's bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }
      
      const response = await axios.get(
        "http://localhost:5000/api/bookings/owner/requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Bookings response:", response.data);
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load booking requests";
      console.error("Error details:", error.response?.data);
      alert(`Error: ${errorMessage}`);
      setBookings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Load bookings when component mounts or when tab changes to bookings
  useEffect(() => {
    if (activeTab === "bookings") {
      fetchBookings();
    }
  }, [activeTab]);

  // Handle approve/reject
  const handleApprove = async (bookingId) => {
    setActionInProgress(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/bookings/approve/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Booking approved successfully! ✅");
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      console.error("Error approving booking:", error);
      alert("Failed to approve booking");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async (bookingId, rejectionReason) => {
    setActionInProgress(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/bookings/reject/${bookingId}`,
        { rejectionReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Booking rejected successfully");
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      console.error("Error rejecting booking:", error);
      alert("Failed to reject booking");
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePropertyChange = (e) => {
    setProperty({ ...property, [e.target.name]: e.target.value });
  };

  const handlePropertySubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    const priceString = property.price.toString().replace(/,/g, '').trim();
    const priceNum = Number(priceString);
    if (!priceString || isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid price");
      return;
    }

    try {
      const propertyData = {
        title: property.title.trim(),
        location: property.location.trim(),
        price: priceNum,
        description: property.description.trim() || ""
      };

      await axios.post(
        "http://localhost:5000/api/properties/add",
        propertyData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      alert("Property added successfully ✅");

      setProperty({
        title: "",
        location: "",
        price: "",
        description: ""
      });

    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || "Failed to add property";
      alert(`Error adding property: ${errorMessage}`);
    }
  };

  // Count bookings by status
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const approvedCount = bookings.filter(b => b.status === "approved").length;
  const rejectedCount = bookings.filter(b => b.status === "rejected").length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Owner Dashboard</h1>
        <p>Manage your properties and booking requests</p>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          📅 Booking Requests
          {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
        </button>
        <button
          className={`tab-button ${activeTab === "property" ? "active" : ""}`}
          onClick={() => setActiveTab("property")}
        >
          🏠 Add Property
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="bookings-section">
            <div className="bookings-stats">
              <div className="stat-card pending">
                <span className="stat-number">{pendingCount}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-card approved">
                <span className="stat-number">{approvedCount}</span>
                <span className="stat-label">Approved</span>
              </div>
              <div className="stat-card rejected">
                <span className="stat-number">{rejectedCount}</span>
                <span className="stat-label">Rejected</span>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading booking requests...</div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <p>No booking requests yet</p>
                <small>When users book your properties, they'll appear here</small>
              </div>
            ) : (
              <div className="bookings-table">
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Visit Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="property-cell">
                          {booking.property?.title || "N/A"}
                        </td>
                        <td>{booking.user?.name || "Unknown"}</td>
                        <td>{booking.user?.email || "N/A"}</td>
                        <td>
                          {new Date(booking.visitDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </td>
                        <td>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {booking.status === "pending" ? (
                            <button
                              className="btn-view-details"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              Review
                            </button>
                          ) : (
                            <span className="responded-badge">
                              {booking.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Property Tab */}
        {activeTab === "property" && (
          <div className="property-section">
            <div className="property-panel">
              <p>List your property quickly with basic details.</p>

              <form onSubmit={handlePropertySubmit} className="property-form">
                <div className="form-row">
                  <input
                    name="title"
                    value={property.title}
                    onChange={handlePropertyChange}
                    placeholder="Property Title"
                    required
                    className="input"
                  />

                  <input
                    name="location"
                    value={property.location}
                    onChange={handlePropertyChange}
                    placeholder="Location"
                    required
                    className="input"
                  />
                </div>

                <div className="form-row">
                  <input
                    name="price"
                    value={property.price}
                    onChange={handlePropertyChange}
                    placeholder="Price (numbers only)"
                    required
                    className="input"
                  />
                </div>

                <textarea
                  name="description"
                  value={property.description}
                  onChange={handlePropertyChange}
                  placeholder="Description"
                  className="textarea"
                />

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Add Property
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingRequestModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onApprove={() => handleApprove(selectedBooking._id)}
          onReject={handleReject}
          isLoading={actionInProgress}
        />
      )}
    </div>
  );
}

export default OwnerDashboard;
