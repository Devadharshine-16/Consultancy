import { useState } from "react";
import axios from "axios";
import "../styles/addProperty.css";

function AddProperty() {
  const [formData, setFormData] = useState({
    // Basic Property Details
    title: "",
    propertyType: "Apartment",
    purpose: "Sale",
    city: "",
    area: "",
    address: "",
    price: "",
    
    // Property Specifications
    propertySize: "",
    propertySizeUnit: "sq.ft",
    bhkType: "2BHK",
    bedrooms: "2",
    bathrooms: "1",
    furnishingStatus: "Unfurnished",
    floorNumber: "",
    totalFloors: "",
    
    // Availability & Ownership
    availabilityStatus: "Immediate",
    availableFrom: "",
    ownershipType: "Owner",
    
    // Additional Information
    description: "",
    
    // Amenities
    parking: false,
    waterSupply: false,
    powerBackup: false,
    lift: false
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [ownershipProofFile, setOwnershipProofFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    setError("");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImagePreviews(previews);
    setError("");
  };

  const removeImage = (index) => {
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      return newPreviews;
    });
  };

  const handleOwnershipProofChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setOwnershipProofFile(e.target.files[0]);
    }
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
    if (formData.availabilityStatus === "From Date" && !formData.availableFrom) {
      setError("Please select availability date");
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
        purpose: formData.purpose,
        city: formData.city.trim(),
        area: formData.area.trim(),
        address: formData.address.trim(),
        price: Number(formData.price),
        propertySize: Number(formData.propertySize),
        propertySizeUnit: formData.propertySizeUnit,
        bhkType: formData.bhkType,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        furnishingStatus: formData.furnishingStatus,
        floorNumber: formData.floorNumber ? Number(formData.floorNumber) : undefined,
        totalFloors: formData.totalFloors ? Number(formData.totalFloors) : undefined,
        availabilityStatus: formData.availabilityStatus,
        availableFrom: formData.availableFrom || undefined,
        ownershipType: formData.ownershipType,
        amenities: {
          parking: formData.parking,
          waterSupply: formData.waterSupply,
          powerBackup: formData.powerBackup,
          lift: formData.lift
        },
        description: formData.description.trim(),
        images: imageUrls
      };

      const response = await axios.post(
        "http://localhost:5000/api/properties/add",
        propertyData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      setSuccess(true);
      // Reset form
      setFormData({
        title: "",
        propertyType: "Apartment",
        purpose: "Sale",
        city: "",
        area: "",
        address: "",
        price: "",
        propertySize: "",
        propertySizeUnit: "sq.ft",
        bhkType: "2BHK",
        bedrooms: "2",
        bathrooms: "1",
        furnishingStatus: "Unfurnished",
        floorNumber: "",
        totalFloors: "",
        availabilityStatus: "Immediate",
        availableFrom: "",
        ownershipType: "Owner",
        description: "",
        parking: false,
        waterSupply: false,
        powerBackup: false,
        lift: false
      });
      setImagePreviews([]);
      setOwnershipProofFile(null);

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
        {/* Section 1: Basic Property Details */}
        <div className="form-section">
          <h2 className="section-title">Basic Property Details</h2>
          <div className="section-divider"></div>
          
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
                required
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
                required
              >
                <option value="Apartment">Apartment</option>
                <option value="Individual House">Individual House</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="purpose">
                Purpose <span className="required">*</span>
              </label>
              <select
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="Sale">Sale</option>
                <option value="Rent">Rent</option>
              </select>
            </div>
          </div>

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
                required
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
                required
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
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">
                {formData.purpose === "Rent" ? "Rent Amount" : "Price"} (₹) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder={formData.purpose === "Rent" ? "e.g., 25000" : "e.g., 5000000"}
                className="form-input"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Property Specifications */}
        <div className="form-section">
          <h2 className="section-title">Property Specifications</h2>
          <div className="section-divider"></div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bhkType">
                BHK Type <span className="required">*</span>
              </label>
              <select
                id="bhkType"
                name="bhkType"
                value={formData.bhkType}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="Studio">Studio</option>
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="3BHK">3BHK</option>
                <option value="4BHK">4BHK</option>
                <option value="5BHK+">5BHK+</option>
              </select>
            </div>

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
                required
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
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="propertySize">
                Total Area <span className="required">*</span>
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
                  required
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

            <div className="form-group">
              <label htmlFor="furnishingStatus">
                Furnishing Status <span className="required">*</span>
              </label>
              <select
                id="furnishingStatus"
                name="furnishingStatus"
                value={formData.furnishingStatus}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="floorNumber">
                Floor Number <span className="optional">(Optional)</span>
              </label>
              <input
                type="number"
                id="floorNumber"
                name="floorNumber"
                value={formData.floorNumber}
                onChange={handleInputChange}
                placeholder="e.g., 5"
                className="form-input"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="totalFloors">
                Total Floors <span className="optional">(Optional)</span>
              </label>
              <input
                type="number"
                id="totalFloors"
                name="totalFloors"
                value={formData.totalFloors}
                onChange={handleInputChange}
                placeholder="e.g., 10"
                className="form-input"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Availability & Ownership */}
        <div className="form-section">
          <h2 className="section-title">Availability & Ownership</h2>
          <div className="section-divider"></div>
          
          <div className="form-row">
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
                required
              >
                <option value="Immediate">Immediate</option>
                <option value="From Date">From Date</option>
              </select>
            </div>

            {formData.availabilityStatus === "From Date" && (
              <div className="form-group">
                <label htmlFor="availableFrom">
                  Available From <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="availableFrom"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleInputChange}
                  className="form-input"
                  required={formData.availabilityStatus === "From Date"}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="ownershipType">
                Ownership Type <span className="required">*</span>
              </label>
              <select
                id="ownershipType"
                name="ownershipType"
                value={formData.ownershipType}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="Owner">Owner</option>
                <option value="Builder">Builder</option>
                <option value="Agent">Agent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Amenities */}
        <div className="form-section">
          <h2 className="section-title">Amenities</h2>
          <div className="section-divider"></div>
          
          <div className="amenities-grid">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="parking"
                checked={formData.parking}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span className="checkbox-text">Parking</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="waterSupply"
                checked={formData.waterSupply}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span className="checkbox-text">Water Supply</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="powerBackup"
                checked={formData.powerBackup}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span className="checkbox-text">Power Backup</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="lift"
                checked={formData.lift}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span className="checkbox-text">Lift</span>
            </label>
          </div>
        </div>

        {/* Section 5: Additional Information */}
        <div className="form-section">
          <h2 className="section-title">Additional Information</h2>
          <div className="section-divider"></div>
          
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
              required
            />
            <small className="char-count">
              {formData.description.length} characters
            </small>
          </div>
        </div>

        {/* Section 6: Media & Proof */}
        <div className="form-section">
          <h2 className="section-title">Media & Proof</h2>
          <div className="section-divider"></div>
          
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
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="ownershipProof">
              Ownership Proof <span className="optional">(Optional - for admin verification)</span>
            </label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="ownershipProof"
                name="ownershipProof"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleOwnershipProofChange}
                className="file-input-simple"
              />
              {ownershipProofFile && (
                <p className="file-selected">
                  ✓ {ownershipProofFile.name}
                </p>
              )}
            </div>
            <small className="help-text">
              Upload property documents for admin verification (PDF, JPG, PNG)
            </small>
          </div>
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
