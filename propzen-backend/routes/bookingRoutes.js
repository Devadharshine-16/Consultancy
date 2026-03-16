const router = require("express").Router();
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const auth = require("../middleware/authMiddleware");

// User creates a booking
router.post("/add", auth, async (req, res) => {
  try {
    const { property, visitDate, message } = req.body;
    
    // Validate required fields
    if (!property) {
      return res.status(400).json({ message: "Property ID is required" });
    }
    if (!visitDate) {
      return res.status(400).json({ message: "Visit date is required" });
    }

    // Verify property exists and get owner
    const propertyData = await Property.findById(property);
    if (!propertyData) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Verify user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Create booking with owner reference
    const booking = new Booking({
      user: req.user.id,
      property,
      owner: propertyData.owner,
      visitDate: new Date(visitDate),
      message: message || "",
      status: "pending"
    });
    
    const savedBooking = await booking.save();
    const populatedBooking = await savedBooking.populate("property user owner");
    
    res.status(201).json({ 
      message: "Booking created successfully", 
      data: populatedBooking 
    });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Error creating booking", error: err.message });
  }
});

// Get all bookings (admin only)
router.get("/", auth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("property user owner")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings", error: err.message });
  }
});

// Get user's bookings (customer)
router.get("/user", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const userBookings = await Booking.find({ user: req.user.id })
      .populate("property owner")
      .sort({ createdAt: -1 });
    res.json(userBookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user bookings", error: err.message });
  }
});

// Get owner's bookings (owner dashboard) - optimized
router.get("/owner/requests", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get all bookings where this user is the owner (optimized with lean and field selection)
    const ownerBookings = await Booking.find({ owner: req.user.id })
      .populate({
        path: "property",
        select: "title price location images" // Only select necessary fields
      })
      .populate({
        path: "user", 
        select: "name email" // Only select necessary fields
      })
      .select("user property visitDate message status createdAt") // Only select necessary fields
      .lean() // Return plain JavaScript objects for better performance
      .sort({ createdAt: -1 })
      .limit(50); // Limit to prevent performance issues

    res.json(ownerBookings);
  } catch (err) {
    console.error("Error fetching owner bookings:", err);
    res.status(500).json({ message: "Error fetching booking requests", error: err.message });
  }
});

// Approve booking
router.put("/approve/:id", auth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify the user is the owner
    if (booking.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to approve this booking" });
    }

    booking.status = "approved";
    booking.respondedAt = new Date();
    await booking.save();

    const updatedBooking = await booking.populate("property user owner");
    res.json({ message: "Booking approved successfully", data: updatedBooking });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ message: "Error approving booking", error: err.message });
  }
});

// Reject booking
router.put("/reject/:id", auth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { rejectionReason } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify the user is the owner
    if (booking.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to reject this booking" });
    }

    booking.status = "rejected";
    booking.rejectionReason = rejectionReason || "";
    booking.respondedAt = new Date();
    await booking.save();

    const updatedBooking = await booking.populate("property user owner");
    res.json({ message: "Booking rejected successfully", data: updatedBooking });
  } catch (err) {
    console.error("Rejection error:", err);
    res.status(500).json({ message: "Error rejecting booking", error: err.message });
  }
});

module.exports = router;
