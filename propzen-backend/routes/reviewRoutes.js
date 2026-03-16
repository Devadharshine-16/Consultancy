const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const auth = require('../middleware/authMiddleware');

// Get reviews for a property
router.get('/property/:propertyId', async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate({
        path: 'user',
        select: 'name'
      })
      .sort({ createdAt: -1 })
      .lean();
    
    // Calculate average rating
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    
    res.json({
      reviews,
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: reviews.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
});

// Add a review for a booking
router.post('/add', auth, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      user: userId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not eligible for review' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ 
      user: userId, 
      booking: bookingId 
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already submitted for this booking' });
    }

    // Create new review
    const review = new Review({
      user: userId,
      property: booking.property,
      booking: bookingId,
      rating: Number(rating),
      comment: comment.trim()
    });

    await review.save();
    
    res.status(201).json({ 
      message: 'Review submitted successfully',
      review 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting review', error: err.message });
  }
});

// Get user's reviews
router.get('/my-reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate({
        path: 'property',
        select: 'title images'
      })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
});

module.exports = router;
