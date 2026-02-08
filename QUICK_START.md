# 🚀 Quick Start Guide - Owner Booking Management

## ⚡ 5-Minute Setup

### Step 1: Restart Backend
```bash
cd propzen-backend
npm start
```
✅ Wait for: "✅ MongoDB Atlas Connected" and "🚀 Server running on port 5000"

### Step 2: Restart Frontend
```bash
cd propzen-frontend
npm run dev
```
✅ Frontend running on http://localhost:5173

---

## 🧪 Test Flow (2 Browser Windows)

### Window 1: CUSTOMER
```
1. Open http://localhost:5173
2. Click "Explore Properties"
3. Click "Book Now" on any property
4. If not logged in → Login/Register
5. Fill booking form:
   - Visit Date: Select future date
   - Message: (optional) Type something
6. Click "Submit Booking Request"
✅ See success message
```

### Window 2: OWNER
```
1. Login as OWNER (who owns that property)
2. Go to Owner Dashboard (/owner-dashboard)
3. Click "📅 Booking Requests" tab
✅ See the booking in table with "Review" button

4. Click "Review"
✅ Modal opens with full booking details

5. Click "✅ Approve" OR "❌ Reject"
   - If Reject: Add optional reason
✅ Modal closes
✅ Table updates with new status
```

---

## 📋 What Changed

| Component | Change | Notes |
|-----------|--------|-------|
| Booking Model | +owner, +rejectionReason, +respondedAt | Now stores owner |
| Booking Routes | +owner/requests, +approve, +reject | New endpoints |
| OwnerDashboard | Tabbed interface, booking table | Complete redesign |
| BookingRequestModal | NEW | Shows booking details |
| server.js | +booking routes registration | Added missing line |

---

## 🔍 Where to Find Things

### API Endpoints
```
GET  /api/bookings/owner/requests    ← Get owner's pending bookings
PUT  /api/bookings/approve/:id       ← Approve booking
PUT  /api/bookings/reject/:id        ← Reject booking
```

### UI Components
```
/OwnerDashboard.jsx          ← Main dashboard with tabs
/BookingRequestModal.jsx     ← Booking details & actions
/styles/dashboard.css        ← Dashboard styling
/styles/bookingRequestModal.css ← Modal styling
```

### Files Modified
```
Backend:
- models/Booking.js
- routes/bookingRoutes.js
- server.js

Frontend:
- pages/OwnerDashboard.jsx (major update)
- components/BookingRequestModal.jsx (new)
- styles/dashboard.css (major update)
- styles/bookingRequestModal.css (new)
```

---

## 🐛 Common Issues

### "Cannot read property 'owner' of undefined"
→ Make sure you have properties in database with owner field

### "Bookings not showing in table"
→ Check if you're logged in as the property owner
→ Look at Network tab in DevTools → /api/bookings/owner/requests

### "Approve/Reject buttons don't work"
→ Check browser console for errors
→ Check if token exists: `localStorage.getItem('token')`
→ Backend logs for detailed error

### "Booking doesn't appear after submitting"
→ Page refresh should show it
→ Check Network tab → POST /api/bookings/add response

---

## ✅ Feature Checklist

- [ ] Backend running without errors
- [ ] Frontend running without errors
- [ ] Can browse properties (no login)
- [ ] Can book property as customer
- [ ] Booking appears in owner dashboard
- [ ] Can approve booking
- [ ] Can reject booking with reason
- [ ] Status updates in table
- [ ] Badges show correct colors
- [ ] Mobile view works

---

## 📱 Browser Testing

### Test in Chrome DevTools Device Toolbar:
- [ ] Desktop (1024px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

---

## 🎯 Success Indicators

✅ Customer books → "Booking submitted successfully!"
✅ Owner sees booking in table with "Review" button
✅ Owner clicks Review → Modal shows details
✅ Owner approves → Status becomes green ✅
✅ Owner rejects → Status becomes red ❌ with reason

---

## 📞 Need Help?

1. **Check logs**
   - Browser Console (F12)
   - Backend Terminal

2. **Check database**
   - Verify Booking document has 'owner' field
   - Check booking status is 'pending'

3. **Check network**
   - DevTools → Network tab
   - Look for API requests
   - Check response status and body

4. **Restart everything**
   - Kill backend (Ctrl+C)
   - Kill frontend (Ctrl+C)
   - `npm start` backend
   - `npm run dev` frontend

---

## 🎉 You're All Set!

The complete two-sided booking system is ready to use!

**Test it out and let me know if you find any issues.**

Next Steps:
- [ ] Test the complete flow
- [ ] Verify all statuses update correctly
- [ ] Check responsive design on mobile
- [ ] Consider adding email notifications (optional)
- [ ] Consider adding real-time updates (optional)
