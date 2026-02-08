# Owner Booking Management - Visual Flow

## 🔄 Complete User Journey

```
╔════════════════════════════════════════════════════════════════════════════╗
║                          PROPZEN BOOKING SYSTEM                            ║
╚════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────┐      ┌──────────────────────────────┐
│      CUSTOMER SIDE                  │      │      OWNER SIDE              │
│    (Browse & Book)                  │      │ (Manage Bookings)            │
└─────────────────────────────────────┘      └──────────────────────────────┘

  HOME PAGE                                      OWNER DASHBOARD
  ├─ Explore Properties ──────────────────────→  Login
  │                                              │
  │  PROPERTIES PAGE                             ├─ Tab 1: 📅 Booking Requests
  │  ├─ Search/Filter                            │  ├─ Pending Bookings (3)
  │  ├─ [View Details] Button                    │  ├─ Approved Bookings (5)
  │  │                                           │  └─ Rejected Bookings (2)
  │  └─ [Book Now] Button                        │
  │     │                                        ├─ Tab 2: 🏠 Add Property
  │     └─→ Is user logged in?                   │
  │        │                                     │
  │        ├─→ NO: Redirect to LOGIN             │
  │        │                                     │
  │        └─→ YES: Show Booking Modal           │
  │            ├─ Property: Auto-filled          │
  │            ├─ Visit Date: [DATE PICKER]      │
  │            ├─ Message: [TEXTAREA]            │
  │            └─ [Submit] Button                │
  │                                              │
  └─→ Success Message                            └─→ Table Updates
      "Booking submitted!"                           Status: ⏳ Pending


BOOKING TABLE (Owner Dashboard)
┌──────────────────────────────────────────────────────────────────────┐
│ Property │ User Name │ Email          │ Date      │ Status   │Action │
├──────────────────────────────────────────────────────────────────────┤
│ Villa    │ Rahul     │ rahul@.com     │ 20 Jan    │ ⏳Pending│Review │
│ Apt      │ Priya     │ priya@.com     │ 25 Jan    │ ✅Aprv'd │  ✅   │
│ House    │ Arun      │ arun@.com      │ 28 Jan    │ ❌Rejctd │  ❌   │
└──────────────────────────────────────────────────────────────────────┘

OWNER CLICKS "Review" → MODAL OPENS
┌──────────────────────────────────────────────────────────┐
│  BOOKING REQUEST DETAILS              Status: ⏳Pending  │
├──────────────────────────────────────────────────────────┤
│  📍 PROPERTY                                             │
│  ├─ Name: Villa in Bandra                              │
│  ├─ Location: Mumbai                                    │
│  └─ Price: ₹50,00,000                                   │
├──────────────────────────────────────────────────────────┤
│  👤 USER DETAILS                                         │
│  ├─ Name: Rahul Kumar                                  │
│  ├─ Email: rahul@email.com                             │
│  └─ Role: user                                          │
├──────────────────────────────────────────────────────────┤
│  📅 VISIT DETAILS                                        │
│  ├─ Visit Date: Monday, January 20, 2026               │
│  └─ Message: Looking for a 2BHK in prime location     │
├──────────────────────────────────────────────────────────┤
│  [✅ Approve]              [❌ Reject]                  │
└──────────────────────────────────────────────────────────┘


SCENARIO A: OWNER APPROVES
──────────────────────────
Owner clicks [✅ Approve]
    ↓
Backend: 
├─ status = "approved"
├─ respondedAt = now
└─ Booking saved
    ↓
Modal closes
    ↓
Table updates:
├─ Status: ✅ Approved
└─ Action: Shows ✅ badge (not clickable)
    ↓
✅ SUCCESS


SCENARIO B: OWNER REJECTS
──────────────────────────
Owner clicks [❌ Reject]
    ↓
Rejection form appears:
┌────────────────────────────────────┐
│ Why are you rejecting?             │
│ ┌──────────────────────────────┐   │
│ │ Property already booked for  │   │
│ │ this date. Try another date. │   │
│ └──────────────────────────────┘   │
│ [Cancel]  [Confirm Rejection]      │
└────────────────────────────────────┘
    ↓
Owner clicks [Confirm Rejection]
    ↓
Backend:
├─ status = "rejected"
├─ rejectionReason = "..."
├─ respondedAt = now
└─ Booking saved
    ↓
Modal closes
    ↓
Table updates:
├─ Status: ❌ Rejected
└─ Action: Shows ❌ badge
    ↓
✅ SUCCESS
```

---

## 📊 Data Flow Diagram

```
CUSTOMER ACTION                    BACKEND PROCESSING              DATABASE
═════════════════════════════════════════════════════════════════════════════

User clicks "Book Now"
    ↓
Shows Booking Modal
    ↓
User enters:
├─ visitDate: "2026-01-20"
├─ message: "Optional msg"
└─ [Submit]
    ↓
Frontend sends POST:
  /api/bookings/add
  {
    property: "propId",
    visitDate: "2026-01-20",
    message: "Optional msg"
  }
    ↓                          Backend receives request
                               ├─ Validates fields
                               ├─ Finds property
                               ├─ Gets property.owner
                               ├─ Creates booking:
                               │  {
                               │    user: customerId,
                               │    property: propId,
                               │    owner: ownerId,        ← Auto-captured!
                               │    visitDate: date,
                               │    message: msg,
                               │    status: "pending"
                               │  }
                               └─ Saves to DB
                                   ↓
                               ✅ Response sent
    ↓
Frontend receives response
    ↓
Shows success message
    ↓
Modal closes
    ↓
UI updates


OWNER ACTIONS                                                         DATABASE
═════════════════════════════════════════════════════════════════════════════

Owner opens dashboard
    ↓
Clicks "📅 Booking Requests"
    ↓
Fetches: GET /api/bookings/owner/requests
    ↓                          Backend queries:
                               Booking.find({ owner: ownerId })
                                   ↓
                               Returns all bookings for this owner
                                   ↓
                               Populates user and property data
                                   ↓
                               ✅ Response sent
    ↓
Table renders with bookings
    ↓
Owner clicks "Review"
    ↓
Modal opens with details
    ↓
Owner chooses:
├─ Click [✅ Approve]    ──→  PUT /api/bookings/approve/:id
│                            ├─ Update status → "approved"
│                            ├─ Set respondedAt
│                            └─ Response sent
│
└─ Click [❌ Reject]     ──→  PUT /api/bookings/reject/:id
                            ├─ Update status → "rejected"
                            ├─ Set rejectionReason
                            ├─ Set respondedAt
                            └─ Response sent
    ↓
Frontend updates table
    ↓
Status badge changes
```

---

## 🏗️ Component Architecture

```
App.jsx
├─ Navbar
├─ Routes
│  ├─ Home
│  ├─ Properties
│  │  └─ Properties.jsx
│  │     ├─ PropertyDetails.jsx (Modal)
│  │     └─ BookingModal.jsx (Modal)
│  │
│  ├─ Login
│  ├─ Register
│  │
│  └─ OwnerDashboard (Protected)
│     └─ OwnerDashboard.jsx
│        ├─ Bookings Tab
│        │  ├─ Stats Cards
│        │  └─ Bookings Table
│        │     └─ BookingRequestModal.jsx (Modal)
│        │
│        └─ Add Property Tab
│
└─ Footer

MODALS:
├─ PropertyDetails.jsx
│  ├─ Image Gallery
│  ├─ Property Info
│  └─ "Book Now" button
│
├─ BookingModal.jsx
│  ├─ Property Details
│  ├─ Visit Date Input
│  ├─ Message Textarea
│  └─ Submit Button
│
└─ BookingRequestModal.jsx
   ├─ Property Section
   ├─ User Section
   ├─ Visit Details
   ├─ Message Display
   └─ Approve/Reject Buttons
```

---

## 🎯 Status Badge States

```
PENDING                APPROVED               REJECTED
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ ⏳               │   │ ✅               │   │ ❌               │
│ PENDING         │   │ APPROVED        │   │ REJECTED        │
│                 │   │                 │   │                 │
│ Yellow bg       │   │ Green bg        │   │ Red bg          │
│ Brown text      │   │ Green text      │   │ Red text        │
│ Can review      │   │ Cannot review   │   │ Cannot review   │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## 📱 Responsive Layouts

```
DESKTOP (>880px)
┌────────────────────────────────────────┐
│  Owner Dashboard - Booking Requests    │
├────────────────────────────────────────┤
│ 3 Pending | 5 Approved | 2 Rejected   │
├────────────────────────────────────────┤
│ Full Table Layout                      │
│ ├─ Property | User | Email | Date │   │
│ ├─ Status | Action                    │
│ └─ Horizontal scroll on mobile         │
└────────────────────────────────────────┘

TABLET (520-880px)
┌──────────────────────┐
│ Dashboard - Bookings │
├──────────────────────┤
│ Stats (stacked)      │
├──────────────────────┤
│ Table (adjusted)     │
│ Compact view         │
└──────────────────────┘

MOBILE (<520px)
┌────────────────┐
│ 📅 Dashboard   │
├────────────────┤
│ Pending: 3     │
│ Approved: 5    │
│ Rejected: 2    │
├────────────────┤
│ Vertical Table │
│ Card Layout    │
└────────────────┘
```

---

## 🔐 Authorization Flow

```
User Action
    ↓
Get token from localStorage
    ↓
Include in Authorization header:
  Authorization: Bearer {token}
    ↓
Backend receives request
    ↓
Extract token from header
    ↓
Verify JWT signature
    ↓
Valid? ┐
       ├─→ YES: Decode token → get userId
       │        req.user.id = userId
       │        Check ownership:
       │        └─→ Is req.user.id === booking.owner?
       │           ├─→ YES: Allow action ✅
       │           └─→ NO: 403 Forbidden ❌
       │
       └─→ NO: 401 Unauthorized ❌
```

---

## 📈 Status Transitions

```
Booking Created
    ↓
┌─────────────────┐
│   PENDING (⏳)   │  ← Customer waiting for response
└────────┬────────┘
         │
         ├──→ Owner Approves
         │    ↓
         │    ┌──────────────────┐
         │    │  APPROVED (✅)    │  ← Customer can proceed
         │    └──────────────────┘
         │
         └──→ Owner Rejects
              ↓
              ┌──────────────────┐
              │  REJECTED (❌)    │  ← Customer needs to rebook
              └──────────────────┘
              (with optional reason)
```

---

This is the complete visual representation of your booking management system!
