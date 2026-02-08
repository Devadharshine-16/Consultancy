# Code Reference - Add Property Implementation

## 1. Complete AddProperty.jsx Code

**File:** `propzen-frontend/src/pages/AddProperty.jsx`

Key sections:

### State Management
```javascript
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
```

### Form Validation
```javascript
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
```

### Image Management
```javascript
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
```

### Form Submission
```javascript
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
```

---

## 2. Backend Property Model Schema

**File:** `propzen-backend/models/Property.js`

```javascript
const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Property title is required"],
  },
  propertyType: {
    type: String,
    enum: {
      values: ["House", "Apartment", "Land", "Commercial"],
      message: "Property type must be House, Apartment, Land, or Commercial",
    },
    required: [true, "Property type is required"],
  },
  location: {
    city: String,
    area: String,
    address: String,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price must be positive"],
  },
  propertySize: {
    value: Number,
    unit: {
      type: String,
      enum: ["sq.ft", "acres"],
      default: "sq.ft",
    },
  },
  bedrooms: Number,
  bathrooms: Number,
  availabilityStatus: {
    type: String,
    enum: {
      values: ["Available", "Sold", "Under Negotiation"],
      message: "Status must be Available, Sold, or Under Negotiation",
    },
    default: "Available",
  },
  description: String,
  images: [String],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  contactDetails: {
    name: String,
    email: String,
    phone: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
```

---

## 3. Backend Route Validation

**File:** `propzen-backend/routes/propertyRoutes.js`

```javascript
router.post(
  "/add",
  authMiddleware,
  roleMiddleware(["owner", "admin"]),
  async (req, res) => {
    try {
      const { title, propertyType, city, area, address, price, propertySize, 
              propertySizeUnit, bedrooms, bathrooms, availabilityStatus, 
              description, images } = req.body;

      // Validation
      if (!title || !title.trim()) {
        return res.status(400).json({ message: "Property title is required" });
      }
      if (!["House", "Apartment", "Land", "Commercial"].includes(propertyType)) {
        return res.status(400).json({ message: "Invalid property type" });
      }
      if (!city?.trim() || !area?.trim() || !address?.trim()) {
        return res.status(400).json({ message: "Complete location is required" });
      }
      if (!price || price <= 0) {
        return res.status(400).json({ message: "Valid price is required" });
      }
      if (!propertySize || propertySize <= 0) {
        return res.status(400).json({ message: "Valid property size is required" });
      }
      if (bedrooms < 0 || bathrooms < 0) {
        return res.status(400).json({ 
          message: "Bedrooms and bathrooms cannot be negative" 
        });
      }
      if (!["Available", "Sold", "Under Negotiation"].includes(availabilityStatus)) {
        return res.status(400).json({ message: "Invalid availability status" });
      }
      if (!description || description.trim().length < 10) {
        return res.status(400).json({ 
          message: "Description must be at least 10 characters" 
        });
      }

      // Get owner's contact details
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create property
      const property = new Property({
        title: title.trim(),
        propertyType,
        location: {
          city: city.trim(),
          area: area.trim(),
          address: address.trim(),
        },
        price: Number(price),
        propertySize: {
          value: Number(propertySize),
          unit: propertySizeUnit,
        },
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        availabilityStatus,
        description: description.trim(),
        images: images || [],
        owner: req.user._id,
        contactDetails: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });

      await property.save();

      res.status(201).json({
        message: "Property added successfully",
        property,
      });
    } catch (error) {
      console.error("Error adding property:", error);
      res.status(500).json({ message: "Error adding property", error: error.message });
    }
  }
);
```

---

## 4. CSS Styling - Key Sections

**File:** `propzen-frontend/src/styles/addProperty.css`

### Form Layout
```css
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-input,
.form-select,
.form-textarea {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  background-color: #f8f9ff;
}
```

### Image Upload Area
```css
.image-upload-area {
  position: relative;
  border: 2px dashed #007bff;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  background: linear-gradient(135deg, #f8f9ff 0%, #e7f3ff 100%);
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-upload-area:hover {
  border-color: #0056b3;
  background: linear-gradient(135deg, #e7f3ff 0%, #d0e8ff 100%);
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
```

### Image Preview Grid
```css
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.preview-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  aspect-ratio: 1;
  background: #e9ecef;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}
```

### Messages
```css
.error-message {
  padding: 15px;
  margin: 20px 0;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  color: #721c24;
  font-weight: 500;
}

.success-message {
  padding: 15px;
  margin-bottom: 20px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  color: #155724;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Submit Button
```css
.btn-submit {
  width: 100%;
  padding: 15px;
  margin-top: 30px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 123, 255, 0.4);
  background: linear-gradient(135deg, #0056b3 0%, #003d82 100%);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
}
```

---

## 5. API Request/Response Examples

### Success Request
```javascript
POST http://localhost:5000/api/properties/add
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Luxury 2BHK Apartment",
  "propertyType": "Apartment",
  "city": "Mumbai",
  "area": "Bandra",
  "address": "123 Main Street, Bandra East",
  "price": 5000000,
  "propertySize": 1500,
  "propertySizeUnit": "sq.ft",
  "bedrooms": 2,
  "bathrooms": 2,
  "availabilityStatus": "Available",
  "description": "Beautiful furnished apartment with modern amenities, sea view, 24/7 security",
  "images": [
    "blob:http://localhost:5173/12345678-1234-1234-1234-123456789012",
    "blob:http://localhost:5173/87654321-4321-4321-4321-210987654321"
  ]
}
```

### Success Response (201)
```javascript
{
  "message": "Property added successfully",
  "property": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Luxury 2BHK Apartment",
    "propertyType": "Apartment",
    "location": {
      "city": "Mumbai",
      "area": "Bandra",
      "address": "123 Main Street, Bandra East"
    },
    "price": 5000000,
    "propertySize": {
      "value": 1500,
      "unit": "sq.ft"
    },
    "bedrooms": 2,
    "bathrooms": 2,
    "availabilityStatus": "Available",
    "description": "Beautiful furnished apartment with modern amenities...",
    "images": ["blob:...", "blob:..."],
    "owner": "507f1f77bcf86cd799439012",
    "contactDetails": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91-9876543210"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response (400 - Validation Failed)
```javascript
{
  "message": "Valid price is required"
}
```

### Error Response (403 - Authorization Failed)
```javascript
{
  "message": "Only owners and admins can add properties"
}
```

---

## 6. JSX Form Structure

```jsx
<div className="add-property-page">
  <div className="add-property-header">
    <h1>Add Your Property</h1>
    <p>List your property and reach potential buyers and renters</p>
  </div>

  {success && <div className="success-message">✅ Property added successfully!</div>}

  <form onSubmit={handleSubmit} className="property-form">
    {/* Row 1: Title & Type */}
    <div className="form-row">
      <div className="form-group">
        <label>Property Title <span className="required">*</span></label>
        <input type="text" name="title" value={formData.title} onChange={handleInputChange} />
      </div>
      <div className="form-group">
        <label>Property Type <span className="required">*</span></label>
        <select name="propertyType" value={formData.propertyType} onChange={handleInputChange}>
          <option value="House">House</option>
          <option value="Apartment">Apartment</option>
          <option value="Land">Land</option>
          <option value="Commercial">Commercial</option>
        </select>
      </div>
    </div>

    {/* Row 2: Location */}
    <div className="form-row">
      <div className="form-group">
        <label>City <span className="required">*</span></label>
        <input type="text" name="city" value={formData.city} onChange={handleInputChange} />
      </div>
      <div className="form-group">
        <label>Area <span className="required">*</span></label>
        <input type="text" name="area" value={formData.area} onChange={handleInputChange} />
      </div>
      <div className="form-group">
        <label>Address <span className="required">*</span></label>
        <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
      </div>
    </div>

    {/* Row 3: Price & Size */}
    <div className="form-row">
      <div className="form-group">
        <label>Price (₹) <span className="required">*</span></label>
        <input type="number" name="price" value={formData.price} onChange={handleInputChange} />
      </div>
      <div className="form-group">
        <label>Property Size <span className="required">*</span></label>
        <div className="size-input-group">
          <input type="number" name="propertySize" value={formData.propertySize} onChange={handleInputChange} />
          <select name="propertySizeUnit" value={formData.propertySizeUnit} onChange={handleInputChange}>
            <option value="sq.ft">sq.ft</option>
            <option value="acres">acres</option>
          </select>
        </div>
      </div>
    </div>

    {/* Row 4: Rooms & Status */}
    <div className="form-row">
      <div className="form-group">
        <label>Bedrooms <span className="required">*</span></label>
        <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} />
      </div>
      <div className="form-group">
        <label>Bathrooms <span className="required">*</span></label>
        <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} />
      </div>
      <div className="form-group">
        <label>Availability Status <span className="required">*</span></label>
        <select name="availabilityStatus" value={formData.availabilityStatus} onChange={handleInputChange}>
          <option value="Available">Available</option>
          <option value="Sold">Sold</option>
          <option value="Under Negotiation">Under Negotiation</option>
        </select>
      </div>
    </div>

    {/* Description */}
    <div className="form-group">
      <label>Description <span className="required">*</span></label>
      <textarea name="description" value={formData.description} onChange={handleInputChange} rows="5" />
      <small className="char-count">{formData.description.length} characters</small>
    </div>

    {/* Images */}
    <div className="form-group">
      <label>Property Images <span className="optional">(Max 5 images)</span></label>
      <div className="image-upload-area">
        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="file-input" />
        <div className="upload-placeholder">
          <p>📸 Click to select images or drag and drop</p>
        </div>
      </div>
      {imagePreviews.length > 0 && (
        <div className="image-previews">
          <h4>{imagePreviews.length} image(s) selected</h4>
          <div className="preview-grid">
            {imagePreviews.map((img, index) => (
              <div key={index} className="preview-item">
                <img src={img.preview} alt={`Preview ${index + 1}`} />
                <button type="button" className="remove-btn" onClick={() => removeImage(index)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Error */}
    {error && <div className="error-message">⚠️ {error}</div>}

    {/* Submit */}
    <button type="submit" className="btn-submit" disabled={loading}>
      {loading ? "Adding Property..." : "✅ Add Property"}
    </button>
  </form>
</div>
```

---

**Code Reference Complete**
**Status:** ✅ Ready for Implementation
**Last Updated:** Current Session
