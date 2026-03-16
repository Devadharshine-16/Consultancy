require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Property = require("./models/Property");
const Booking = require("./models/Booking");

async function fetchOwnerData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const owner = await User.findOne({ email: "owner@gmail.com" });
    if (!owner) {
      console.log("Owner not found");
      return;
    }

    console.log("Owner ID:", owner._id);
    console.log("Owner Name:", owner.name);
    console.log("Owner Email:", owner.email);
    console.log("---");

    const properties = await Property.find({ owner: owner._id });
    console.log(`Properties (${properties.length}):`);
    properties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.title} - ${prop.location?.address || 'N/A'} - ₹${prop.price}`);
    });

    console.log("---");

    const propertyIds = properties.map(p => p._id);
    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate('property')
      .populate('user');

    console.log(`Booking Requests (${bookings.length}):`);
    bookings.forEach((booking, index) => {
      console.log(`${index + 1}. Property: ${booking.property.title} | User: ${booking.user.name} (${booking.user.email}) | Status: ${booking.status} | Date: ${booking.createdAt.toDateString()}`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

fetchOwnerData();