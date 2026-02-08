# Booking System - Troubleshooting Guide

## Issues Fixed ✅

### 1. **Missing Route Registration** - CRITICAL
**Problem:** Booking routes were not registered in `server.js`
**Solution:** Added `app.use("/api/bookings", require("./routes/bookingRoutes"));`
**Result:** Backend now accepts booking requests at `/api/bookings/add`

### 2. **Date Format Issue**
**Problem:** Sending `new Date()` object which doesn't serialize properly
**Solution:** Changed to send ISO string from date input directly
**Result:** Dates now properly saved to database

### 3. **Better Error Messages**
**Problem:** Generic error messages not helpful for debugging
**Solution:** Enhanced error handling in both frontend and backend
**Result:** Now shows specific error messages

### 4. **Missing Validations**
**Problem:** Backend not validating all required fields properly
**Solution:** Added comprehensive validation for:
- Property existence check
- User authentication check
- Required field validation
**Result:** Better error feedback

---

## Testing Checklist

Before testing, make sure:

1. **Backend is running:**
   ```bash
   npm start
   # Should see both messages:
   # ✅ MongoDB Atlas Connected
   # 🚀 Server running on port 5000
   ```

2. **Frontend imports axios:**
   ```bash
   npm install axios jwt-decode
   ```

3. **You're logged in:**
   - Token must exist in localStorage
   - Token must be valid

4. **Property data exists:**
   - Add a property first via Owner Dashboard
   - Or ensure properties exist in database

---

## How to Test

### Step 1: Browse Properties
- Go to `/properties` page
- You should see property cards (if you have any properties)

### Step 2: Click "View Details"
- Modal should open with property info
- Click "Book Now" button

### Step 3: Check Login Status
- **If NOT logged in:**
  - Should see alert "Please log in to book a property"
  - Redirected to `/login`
  
- **If logged in:**
  - Booking modal appears
  - Form shows:
    - Property name (auto-filled)
    - Visit Date input (required)
    - Message textarea (optional)

### Step 4: Submit Booking
- Select a future date
- (Optional) Add a message
- Click "Submit Booking Request"
- **Expected:** Success message, modal closes
- **If error:** See specific error message below form

---

## Common Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "No token" | Not logged in | Log in first |
| "Invalid token" | Expired/corrupted token | Clear localStorage, log in again |
| "Property not found" | Invalid property ID | Check if property exists in DB |
| "User not authenticated" | req.user not set | Check authMiddleware in server |
| "Property ID and visit date are required" | Empty fields | Fill in all required fields |
| "Network error" | Backend not running | Start backend: `npm start` |

---

## Database Debugging

If bookings aren't saving, check MongoDB:

```javascript
// Add this to a test route to check database
db.bookings.find({}).pretty()

// Should see bookings with:
// - user: ObjectId of logged-in user
// - property: ObjectId of property
// - visitDate: ISODate
// - message: string
// - status: "pending"
// - createdAt: ISODate
```

---

## API Endpoints

### Create Booking
```
POST /api/bookings/add
Headers: Authorization: Bearer {token}
Body: {
  property: "propertyId",
  visitDate: "2026-01-20",
  message: "optional message"
}
Response: {
  message: "Booking created successfully",
  data: { ...booking data... }
}
```

### Get All Bookings (Admin)
```
GET /api/bookings
Headers: Authorization: Bearer {token}
```

### Get User's Bookings
```
GET /api/bookings/user
Headers: Authorization: Bearer {token}
```

---

## Quick Debug Steps

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Submit booking form**
4. **Look for POST request to** `http://localhost:5000/api/bookings/add`
5. **Click on request, see:**
   - **Request Headers** - Should have `Authorization: Bearer {token}`
   - **Request Body** - Should show property, visitDate, message
   - **Response** - Check for error message

---

## Still Having Issues?

Check the **console logs** in:
1. **Browser Console** - Frontend errors
2. **Backend Terminal** - Server errors (will see stack trace)

Run tests systematically:
- ✅ Can you add a property? (Owner Dashboard)
- ✅ Can you see properties? (/properties)
- ✅ Can you view details? (Click View Details)
- ✅ Are you logged in? (Check localStorage token)
- ✅ Does date input appear? (Fill visit date)
- ✅ Does form submit? (Click Submit button)
- ✅ Does backend receive request? (Check backend logs)
