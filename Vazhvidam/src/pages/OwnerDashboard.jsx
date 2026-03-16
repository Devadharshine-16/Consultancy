import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import "../styles/dashboard.css";
import BookingRequestModal from "../components/BookingRequestModal";

const API_BASE = "http://localhost:5000";

function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [myPropertiesLoading, setMyPropertiesLoading] = useState(false);
  const [myPropertiesError, setMyPropertiesError] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Property state for Add Property form
  const [property, setProperty] = useState({
    title: "",
    propertyType: "House",
    city: "",
    area: "",
    address: "",
    price: "",
    propertySize: "",
    propertySizeUnit: "sq.ft",
    bedrooms: "0",
    bathrooms: "0",
    availabilityStatus: "Available",
    description: ""
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [locationInput, setLocationInput] = useState("Chennai");
  const mapFrameRef = useRef(null);

  // Fetch owner's bookings (optimized with useCallback)
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching bookings for owner...");
      
      const response = await axios.get(
        "http://localhost:5000/api/bookings/owner/requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Bookings response:", response.data);
      console.log("Number of bookings:", response.data?.length || 0);
      
      // Log owner details for each booking
      response.data?.forEach((booking, index) => {
        console.log(`Booking ${index + 1}:`);
        console.log(`  - Property: ${booking.property?.title}`);
        console.log(`  - Owner Email: ${booking.owner?.email}`);
        console.log(`  - Owner Name: ${booking.owner?.name}`);
        console.log(`  - User Email: ${booking.user?.email}`);
        console.log(`  - Status: ${booking.status}`);
      });
      
      setBookings(response.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      console.error("Error response:", error.response?.data);
      alert(`Failed to load booking requests: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch owner's properties (optimized with useCallback)
  const fetchMyProperties = useCallback(async () => {
    setMyPropertiesLoading(true);
    setMyPropertiesError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMyPropertiesError("Please log in to view your properties");
        setMyProperties([]);
        return;
      }
      const res = await axios.get(`${API_BASE}/api/properties/owner/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyProperties(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setMyPropertiesError(err.response?.data?.message || "Failed to load properties");
      setMyProperties([]);
    } finally {
      setMyPropertiesLoading(false);
    }
  }, []);

  // Count bookings by status (optimized with useMemo)
  const bookingCounts = useMemo(() => ({
    pendingCount: bookings.filter(b => b.status === "pending").length,
    approvedCount: bookings.filter(b => b.status === "approved").length,
    rejectedCount: bookings.filter(b => b.status === "rejected").length
  }), [bookings]);

  const { pendingCount, approvedCount, rejectedCount } = bookingCounts;

  useEffect(() => {
    if (activeTab === "bookings") fetchBookings();
    if (activeTab === "myproperties") fetchMyProperties();
  }, [activeTab, fetchBookings, fetchMyProperties]);

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

  const handleReject = async (bookingId) => {
    setActionInProgress(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/bookings/reject/${bookingId}`,
        {},
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

  // Handle image change
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImagePreviews(previews);
    setImageFiles(files);
    setProperty(prev => ({
      ...prev,
      images: files
    }));
  };

  // Remove image
  const removeImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newFiles = newPreviews.map(p => p.file);
    setImagePreviews(newPreviews);
    setImageFiles(newFiles);
    setProperty(prev => ({
      ...prev,
      images: newFiles
    }));
  };

  // Handle property change
  const handlePropertyChange = (e) => {
    setProperty({ ...property, [e.target.name]: e.target.value });
  };

  // Handle location change
  const handleLocationChange = (e) => {
    const location = e.target.value;
    setLocationInput(location);
    
    // Update map iframe src
    if (mapFrameRef.current) {
      mapFrameRef.current.src = `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
    }
    
    // Update form data
    setProperty(prev => ({
      ...prev,
      address: location
    }));
  };

  // Handle property submit
  const handlePropertySubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    // Validation
    if (!property.title.trim()) {
      alert("Property title is required");
      return;
    }
    if (!property.address.trim()) {
      alert("Please enter a location");
      return;
    }
    if (!property.price || property.price <= 0) {
      alert("Valid price is required");
      return;
    }
    if (!property.propertySize || property.propertySize <= 0) {
      alert("Valid property size is required");
      return;
    }
    if (property.bedrooms < 0 || property.bathrooms < 0) {
      alert("Bedrooms and bathrooms cannot be negative");
      return;
    }
    if (!property.description.trim() || property.description.trim().length < 10) {
      alert("Description must be at least 10 characters");
      return;
    }

    try {
      // Convert image files to base64 for API
      const imagePromises = imageFiles.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });
      const imageBase64Array = await Promise.all(imagePromises);

      const propertyData = {
        title: property.title.trim(),
        propertyType: property.propertyType,
        location: {
          city: property.city.trim(),
          area: property.area.trim(),
          address: property.address.trim()
        },
        price: Number(property.price),
        propertySize: Number(property.propertySize),
        propertySizeUnit: property.propertySizeUnit,
        bedrooms: Number(property.bedrooms),
        bathrooms: Number(property.bathrooms),
        availabilityStatus: property.availabilityStatus,
        description: property.description.trim(),
        images: imageBase64Array
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

      // Reset form
      setProperty({
        title: "",
        propertyType: "House",
        city: "",
        area: "",
        address: "",
        price: "",
        propertySize: "",
        propertySizeUnit: "sq.ft",
        bedrooms: "0",
        bathrooms: "0",
        availabilityStatus: "Available",
        description: ""
      });
      setImageFiles([]);
      setImagePreviews([]);
      setLocationInput("Chennai");
      fetchMyProperties();

    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || "Failed to add property";
      alert(`Error adding property: ${errorMessage}`);
    }
  };

  // Handle delete property
  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${API_BASE}/api/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Property deleted successfully");
      setEditingProperty(null);
      fetchMyProperties();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete property");
    }
  };

  // Handle edit property
  const [editForm, setEditForm] = useState({
    title: "",
    location: "",
    price: "",
    description: ""
  });

  const openEditModal = (property) => {
    setEditForm({
      title: property.title || "",
      location: property.location || "",
      price: property.price || "",
      description: property.description || ""
    });
    setEditingProperty(property);
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.put(`${API_BASE}/api/properties/${editingProperty._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Property updated successfully!");
      setEditingProperty(null);
      fetchMyProperties();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update property");
    }
  };

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
          className={`tab-button ${activeTab === "myproperties" ? "active" : ""}`}
          onClick={() => setActiveTab("myproperties")}
        >
          🏘️ My Properties
          {myProperties.length > 0 && <span className="badge count">{myProperties.length}</span>}
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
                      <th>User Email</th>
                      <th>Visit Date</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>{booking.property?.title || "N/A"}</td>
                        <td>{booking.user?.name || "N/A"}</td>
                        <td>{booking.user?.email || "N/A"}</td>
                        <td>{new Date(booking.visitDate).toLocaleDateString()}</td>
                        <td>{booking.message || "No message"}</td>
                        <td>
                          <span className={`status ${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-approve"
                            onClick={() => setSelectedBooking(booking)}
                            disabled={actionInProgress}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* My Properties Tab */}
        {activeTab === "myproperties" && (
          <div className="my-properties-section">
            <div className="my-properties-header">
              <h2>My Properties</h2>
            </div>

            {myPropertiesLoading ? (
              <div className="loading">Loading your properties...</div>
            ) : myPropertiesError ? (
              <div className="empty-state">
                <p>{myPropertiesError}</p>
                <button className="btn-add-first" onClick={fetchMyProperties}>
                  Retry
                </button>
              </div>
            ) : myProperties.length === 0 ? (
              <div className="empty-state">
                <p>You haven't added any properties yet</p>
                <small>Go to Add Property to list your first property</small>
                <button
                  className="btn-add-first"
                  onClick={() => setActiveTab("property")}
                >
                  Add Property
                </button>
              </div>
            ) : (
              <div className="my-properties-grid">
                {myProperties.map((p) => (
                  <div key={p._id} className="my-property-card">
                    <div className="my-property-image">
                      {p.images && p.images[0] ? (
                        <img src={p.images[0]} alt={p.title} />
                      ) : (
                        <div className="my-property-placeholder">No Image</div>
                      )}
                    </div>
                    <div className="my-property-info">
                      <h3>{p.title}</h3>
                      <p className="loc">
                        📍 {p.location?.city || p.location?.address || "—"}
                      </p>
                      <p className="price">₹{typeof p.price === "number" ? p.price.toLocaleString() : p.price}</p>
                      <div className="my-property-actions">
                        <button
                          className="btn-edit"
                          onClick={() => openEditModal(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteProperty(p._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Property Tab */}
        {activeTab === "property" && (
          <div className="add-property-page">
            <div className="add-property-header">
              <h1>Add Your Property</h1>
              <p>List your property with Google Maps location selection</p>
            </div>

            <form onSubmit={handlePropertySubmit} className="property-form">
              {/* Property Title & Type */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">
                    Property Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={property.title}
                    onChange={handlePropertyChange}
                    placeholder="e.g., Luxury 2BHK Apartment in Downtown"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="propertyType">
                    Property Type <span className="required">*</span>
                  </label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={property.propertyType}
                    onChange={handlePropertyChange}
                    className="form-select"
                  >
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Land">Land</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>

              {/* Location Input and Map */}
              <div className="form-group">
                <label htmlFor="locationInput">
                  Property Location <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="locationInput"
                  name="locationInput"
                  value={locationInput}
                  onChange={handleLocationChange}
                  placeholder="Enter location (e.g., Chennai, Mumbai, Delhi)"
                  className="form-input"
                />
                <small className="location-hint">
                  📍 Type a location and see map update automatically
                </small>
              </div>

              {/* Google Map iframe */}
              <div className="map-container">
                <label>Property Location Map</label>
                <iframe
                  ref={mapFrameRef}
                  id="mapFrame"
                  width="100%"
                  height="400"
                  style={{ border: '1px solid #e1e5e9', borderRadius: '8px' }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps?q=${encodeURIComponent(locationInput)}&output=embed`}
                />
                {property.address && (
                  <div className="selected-location">
                    <strong>📍 Selected Location:</strong> {property.address}
                  </div>
                )}
              </div>

              {/* Price & Size */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">
                    Price (₹) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={property.price}
                    onChange={handlePropertyChange}
                    placeholder="e.g., 5000000"
                    className="form-input"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="propertySize">
                    Property Size <span className="required">*</span>
                  </label>
                  <div className="size-input-group">
                    <input
                      type="number"
                      id="propertySize"
                      name="propertySize"
                      value={property.propertySize}
                      onChange={handlePropertyChange}
                      placeholder="e.g., 1500"
                      className="form-input"
                      min="0"
                    />
                    <select
                      name="propertySizeUnit"
                      value={property.propertySizeUnit}
                      onChange={handlePropertyChange}
                      className="form-select"
                    >
                      <option value="sq.ft">sq.ft</option>
                      <option value="acres">acres</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Rooms & Bathrooms */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bedrooms">
                    Bedrooms <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    value={property.bedrooms}
                    onChange={handlePropertyChange}
                    className="form-input"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bathrooms">
                    Bathrooms <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    value={property.bathrooms}
                    onChange={handlePropertyChange}
                    className="form-input"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="availabilityStatus">
                  Availability Status <span className="required">*</span>
                </label>
                <select
                  id="availabilityStatus"
                  name="availabilityStatus"
                  value={property.availabilityStatus}
                  onChange={handlePropertyChange}
                  className="form-select"
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                  <option value="Under Negotiation">Under Negotiation</option>
                </select>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={property.description}
                  onChange={handlePropertyChange}
                  placeholder="Describe your property in detail... (minimum 10 characters)"
                  className="form-textarea"
                  rows="5"
                />
                <small className="char-count">
                  {property.description.length} characters
                </small>
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label htmlFor="images">
                  Property Images <span className="optional">(Max 5 images)</span>
                </label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="images"
                    name="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <div className="upload-placeholder">
                    <p>📸 Click to select images or drag and drop</p>
                    <small>Supported formats: JPG, PNG, WebP (Max 5 MB each)</small>
                  </div>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="image-previews">
                    <h4>{imagePreviews.length} image(s) selected</h4>
                    <div className="preview-grid">
                      {imagePreviews.map((img, index) => (
                        <div key={index} className="preview-item">
                          <img src={img.preview} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => removeImage(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-submit"
                style={{
                  background: '#0d9488',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginTop: '20px'
                }}
              >
                ✅ Add Property
              </button>
            </form>
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

      {/* Edit Property Modal */}
      {editingProperty && (
        <div className="modal-overlay" onClick={() => setEditingProperty(null)}>
          <div className="modal-content edit-property-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Property</h2>
              <button className="modal-close" onClick={() => setEditingProperty(null)}>×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="property-form">
              <div className="form-grid">
                <div className="form-field">
                  <label>Property Title</label>
                  <input
                    name="title"
                    value={editForm.title}
                    onChange={handleEditFormChange}
                    required
                    className="input"
                  />
                </div>
                <div className="form-field">
                  <label>Location</label>
                  <input
                    name="location"
                    value={editForm.location}
                    onChange={handleEditFormChange}
                    required
                    className="input"
                  />
                </div>
                <div className="form-field form-field-price">
                  <label>Price (₹)</label>
                  <div className="price-input-wrapper">
                    <input
                      name="price"
                      value={editForm.price}
                      onChange={handleEditFormChange}
                      placeholder="0"
                      required
                      className="input price-input"
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditFormChange}
                    placeholder="Describe your property — amenities, nearby facilities, why it's a great choice..."
                    className="textarea"
                    rows="4"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-add-property">
                  <span className="btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                  Add Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
