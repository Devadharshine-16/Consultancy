# Add Property Form - Visual Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROPZEN - Property Marketplace              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐                ┌──────────────────────┐
│   FRONTEND (React)   │                │  BACKEND (Express)   │
│                      │                │                      │
│ AddProperty.jsx      │                │ propertyRoutes.js    │
│ ├─ formData state    │ ──POST──>      │ ├─ /add endpoint     │
│ ├─ imagePreviews     │ (JSON + JWT)   │ ├─ Validate fields   │
│ ├─ handleSubmit()    │                │ ├─ Check role        │
│ └─ Form UI           │                │ ├─ Link owner        │
│                      │   <──201──      │ ├─ Get contact info  │
│ addProperty.css      │ (property doc)  │ └─ Save to DB        │
│ ├─ Form layout       │                │                      │
│ ├─ Image grid        │                │ Property.js          │
│ └─ Responsive        │                │ ├─ title (String)    │
│                      │                │ ├─ propertyType      │
│                      │                │ ├─ location (Object) │
│                      │                │ ├─ price (Number)    │
│                      │                │ ├─ propertySize      │
│                      │                │ ├─ bedrooms/baths    │
│                      │                │ ├─ status (Enum)     │
│                      │                │ ├─ description       │
│                      │                │ ├─ images (Array)    │
│                      │                │ ├─ owner (Ref)       │
│                      │                │ └─ contactDetails    │
│                      │                │                      │
└──────────────────────┘                └──────────────────────┘
         │                                       │
         │                                       │
         └─────────────────────┬─────────────────┘
                               │
                         ┌─────▼──────┐
                         │  MongoDB   │
                         │  Database  │
                         └────────────┘
```

## User Flow Diagram

```
┌─────────────┐
│   Login     │ ← User authenticates with JWT
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Dashboard       │
│  📅 Bookings Tab │
│  🏠 Add Property │ ← User clicks this tab
└──────────┬───────┘
           │
           ▼
┌──────────────────────────────────────┐
│     AddProperty Form Page            │
│  ┌──────────────────────────────────┐│
│  │ Property Title: [Text Input]      ││
│  │ Type: [House ▼]                   ││
│  │ City: [Mumbai]  Area: [Bandra]    ││
│  │ Address: [123 Main St]            ││
│  │ Price: [5000000]                  ││
│  │ Size: [1500] Unit: [sq.ft ▼]      ││
│  │ Beds: [3]  Baths: [2]             ││
│  │ Status: [Available ▼]             ││
│  │ Description: [Text Area]          ││
│  │ Images: [Upload Area]             ││
│  │ ┌─────┬─────┬─────┐               ││
│  │ │ Img1│ Img2│ Img3│ (previews)   ││
│  │ └─────┴─────┴─────┘               ││
│  │ [✅ Add Property]                 ││
│  └──────────────────────────────────┘│
└──────────────┬───────────────────────┘
               │ Click Submit
               ▼
        ┌─────────────┐
        │ Validation  │ (Client-side)
        └──────┬──────┘
               │ All valid?
       ┌───────┴────────┐
       │ NO             │ YES
       ▼                ▼
    [Error msg]    ┌────────────┐
                   │ POST /api  │
                   │/properties/│
                   │/add        │
                   └──────┬─────┘
                          │
                          ▼
                  ┌────────────────┐
                  │ Backend        │
                  │ Processing     │
                  │ 1. Check auth  │
                  │ 2. Verify role │
                  │ 3. Validate    │
                  │ 4. Link owner  │
                  │ 5. Add contact │
                  │ 6. Save to DB  │
                  └────────┬───────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼ (201)               ▼ (400/401/403)
           ┌─────────┐           ┌──────────┐
           │ Success │           │  Error   │
           │ Message │           │ Response │
           └────┬────┘           └────┬─────┘
                │                     │
                ▼                     ▼
           ┌──────────┐           [Error msg]
           │ Form     │
           │ Reset    │
           └──────────┘
```

## Data Flow

```
FRONTEND (AddProperty.jsx)
   │
   ├─ State:
   │  ├─ formData = { title, propertyType, city, area, address, price, ... }
   │  ├─ imagePreviews = [{ file, preview: URL }, ...]
   │  ├─ loading = false
   │  ├─ error = ""
   │  └─ success = false
   │
   ├─ On Input Change:
   │  └─ setFormData({ ...prev, [name]: value })
   │
   ├─ On Image Select:
   │  ├─ Create preview URLs
   │  ├─ setImagePreviews([...])
   │  └─ setFormData({ ...images: [files] })
   │
   ├─ On Form Submit:
   │  ├─ validateForm() → Check all required fields
   │  ├─ If invalid → setError("message")
   │  ├─ If valid:
   │  │  ├─ setLoading(true)
   │  │  ├─ Get JWT from localStorage
   │  │  ├─ Convert images to base64 URLs
   │  │  ├─ POST to /api/properties/add
   │  │  ├─ On success:
   │  │  │  ├─ setSuccess(true)
   │  │  │  ├─ Reset formData
   │  │  │  ├─ Reset imagePreviews
   │  │  │  └─ Auto-dismiss after 3s
   │  │  └─ On error:
   │  │     └─ setError(err.response.data.message)
   │  └─ setLoading(false)
   │
   └─ Render:
      ├─ Success message (if success)
      ├─ Form with all 11 fields
      ├─ Image upload area
      ├─ Image preview grid
      ├─ Error message (if error)
      └─ Submit button (disabled if loading)

         │
         │ (JSON + JWT)
         ▼

BACKEND (propertyRoutes.js)
   │
   ├─ POST /api/properties/add
   │  │
   │  ├─ authMiddleware:
   │  │  ├─ Verify JWT token
   │  │  ├─ Extract user info
   │  │  └─ Set req.user
   │  │
   │  ├─ roleMiddleware:
   │  │  ├─ Check req.user.role
   │  │  ├─ If not "owner" or "admin" → 403 Forbidden
   │  │  └─ Continue if valid
   │  │
   │  ├─ Validation:
   │  │  ├─ Check title exists
   │  │  ├─ Check propertyType in ['House', 'Apartment', ...]
   │  │  ├─ Check location complete
   │  │  ├─ Check price > 0
   │  │  ├─ Check propertySize > 0
   │  │  ├─ Check bedrooms/bathrooms >= 0
   │  │  ├─ Check status in ['Available', ...]
   │  │  ├─ Check description length >= 10
   │  │  └─ If any fail → 400 Bad Request
   │  │
   │  ├─ Processing:
   │  │  ├─ owner = req.user._id (from JWT)
   │  │  ├─ Fetch User record for contact details
   │  │  ├─ contactDetails = {
   │  │  │    name: user.name,
   │  │  │    email: user.email,
   │  │  │    phone: user.phone
   │  │  │  }
   │  │  ├─ Create property object
   │  │  ├─ property.save()
   │  │  └─ Return 201 with property
   │  │
   │  └─ Error Handling:
   │     ├─ 400: Validation failed
   │     ├─ 401: No token/invalid token
   │     ├─ 403: Insufficient role
   │     └─ 500: Database error

         │
         │ (property document)
         ▼

FRONTEND (AddProperty.jsx)
   │
   ├─ Response received
   ├─ setSuccess(true)
   ├─ Show: "✅ Property added successfully!"
   ├─ After 3 seconds: setSuccess(false)
   └─ User can add another property or navigate away
```

## Component Architecture

```
┌─────────────────────────────────────┐
│     App.jsx (Main)                  │
│                                     │
│  ├─ ProtectedRoute                  │
│  │  └─ OwnerDashboard.jsx          │
│  │     ├─ Tab 1: Bookings           │
│  │     │  ├─ BookingTable           │
│  │     │  └─ BookingRequestModal    │
│  │     └─ Tab 2: Add Property ◄─────┼─── YOU ARE HERE
│  │        └─ AddProperty.jsx ◄──────┤
│  │           ├─ Form (11 fields)    │
│  │           ├─ Image upload        │
│  │           ├─ Validation          │
│  │           └─ Error/Success msgs  │
│  │                                  │
│  └─ Routes/Pages                    │
│     ├─ Home                         │
│     ├─ Login                        │
│     ├─ Register                     │
│     └─ Properties                   │
│        ├─ PropertyDetails           │
│        └─ BookingModal              │
│                                     │
└─────────────────────────────────────┘
```

## API Endpoints Used

```
POST /api/properties/add
├─ Headers:
│  ├─ Authorization: "Bearer <JWT_TOKEN>"
│  └─ Content-Type: "application/json"
├─ Body:
│  ├─ title (String)
│  ├─ propertyType (Enum)
│  ├─ city, area, address (String)
│  ├─ price (Number)
│  ├─ propertySize, propertySizeUnit (Number, String)
│  ├─ bedrooms, bathrooms (Number)
│  ├─ availabilityStatus (Enum)
│  ├─ description (String)
│  └─ images (Array of base64 strings)
└─ Response:
   ├─ 201: { _id, title, owner, contactDetails, ... }
   ├─ 400: { message: "Validation error" }
   ├─ 401: { message: "Unauthorized" }
   ├─ 403: { message: "Forbidden - Owner/Admin only" }
   └─ 500: { message: "Server error" }
```

## State Management

```
AddProperty.jsx State Tree:
│
├─ formData: {
│  ├─ title: ""
│  ├─ propertyType: "House"
│  ├─ city: ""
│  ├─ area: ""
│  ├─ address: ""
│  ├─ price: ""
│  ├─ propertySize: ""
│  ├─ propertySizeUnit: "sq.ft"
│  ├─ bedrooms: "0"
│  ├─ bathrooms: "0"
│  ├─ availabilityStatus: "Available"
│  ├─ description: ""
│  └─ images: []
│
├─ imagePreviews: [
│  ├─ { file: File, preview: "blob:..." }
│  ├─ { file: File, preview: "blob:..." }
│  └─ ...
│
├─ loading: false (true during submission)
├─ error: "" (error message if any)
└─ success: false (true after successful submission)
```

## Styling Architecture

```
addProperty.css
│
├─ .add-property-page (container, max-width 900px)
├─ .add-property-header (centered title section)
├─ .property-form (white form background)
│
├─ .form-row (responsive grid)
│  └─ .form-group (individual form field)
│     ├─ input/select/textarea (form controls)
│     ├─ Focus states (blue outline)
│     └─ Placeholder text (gray)
│
├─ .size-input-group (number + unit selector)
├─ .image-upload-area (dashed border + gradient)
├─ .image-previews (image grid)
│  ├─ .preview-item (image card)
│  └─ .remove-btn (red delete button)
│
├─ .error-message (red background)
├─ .success-message (green background)
├─ .btn-submit (blue gradient button)
│
└─ Media Queries:
   ├─ 768px (tablet)
   └─ 480px (mobile)
```

---

**Architecture Last Updated:** Current Session  
**Status:** ✅ Complete and Ready for Testing
