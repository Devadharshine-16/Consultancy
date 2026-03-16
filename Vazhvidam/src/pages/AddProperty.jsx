import { useState } from "react";
import "../styles/addProperty.css";
import { addProperty } from "../api";

function AddProperty() {
  const [formData, setFormData] = useState({
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
    description: "",
    images: []
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    // Create preview URLs
    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImagePreviews(previews);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
    setError("");
  };

  const removeImage = (index) => {
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        images: newPreviews.map(p => p.file)
      }));
      return newPreviews;
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Property title is required");
      return false;
    }
    if (!formData.city.trim() || !formData.area.trim() || !formData.address.trim()) {
      setError("City, area, and address are required");
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      setError("Valid price is required");
      return false;
    }
    if (!formData.propertySize || formData.propertySize <= 0) {
      setError("Valid property size is required");
      return false;
    }
    if (formData.bedrooms < 0 || formData.bathrooms < 0) {
      setError("Bedrooms and bathrooms cannot be negative");
      return false;
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setError("Description must be at least 10 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first");
        setLoading(false);
        return;
      }

      // Convert images to base64 or use URLs
      const imageUrls = imagePreviews.map(img => img.preview);

      const propertyData = {
        title: formData.title.trim(),
        propertyType: formData.propertyType,
        city: formData.city.trim(),
        area: formData.area.trim(),
        address: formData.address.trim(),
        price: Number(formData.price),
        propertySize: Number(formData.propertySize),
        propertySizeUnit: formData.propertySizeUnit,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        availabilityStatus: formData.availabilityStatus,
        description: formData.description.trim(),
        images: imageUrls
      };

      await addProperty(propertyData, token);
      setSuccess(true);
      setFormData({
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
        description: "",
        images: []
      });
      setImagePreviews([]);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Error adding property. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-property-page">
      <div className="add-property-header">
        <h1>Add Your Property</h1>
        <p>List your property and reach potential buyers and renters</p>
      </div>

      {success && (
        <div className="success-message">
          ✅ Property added successfully! Your listing is now live.
        </div>
      )}

      <form onSubmit={handleSubmit} className="property-form">
        {/* Row 1: Title & Property Type */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">
              Property Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
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
              value={formData.propertyType}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Land">Land</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
        </div>

        {/* Row 2: Location Details */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">
              City <span className="required">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="e.g., Mumbai"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="area">
              Area <span className="required">*</span>
            </label>
            <input
              type="text"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              placeholder="e.g., Bandra"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">
              Address <span className="required">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g., 123 Main Street"
              className="form-input"
            />
          </div>
        </div>

        {/* Row 3: Price & Size */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">
              Price (₹) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
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
                value={formData.propertySize}
                onChange={handleInputChange}
                placeholder="e.g., 1500"
                className="form-input"
                min="0"
              />
              <select
                name="propertySizeUnit"
                value={formData.propertySizeUnit}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="sq.ft">sq.ft</option>
                <option value="acres">acres</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 4: Rooms & Bathrooms */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="bedrooms">
              Bedrooms <span className="required">*</span>
            </label>
            <input
              type="number"
              id="bedrooms"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleInputChange}
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
              value={formData.bathrooms}
              onChange={handleInputChange}
              className="form-input"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="availabilityStatus">
              Availability Status <span className="required">*</span>
            </label>
            <select
              id="availabilityStatus"
              name="availabilityStatus"
              value={formData.availabilityStatus}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Under Negotiation">Under Negotiation</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the property in detail... (minimum 10 characters)"
            className="form-textarea"
            rows="5"
          />
          <small className="char-count">
            {formData.description.length} characters
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

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {loading ? "Adding Property..." : "✅ Add Property"}
        </button>
      </form>
    </div>
  );
}

export default AddProperty;
