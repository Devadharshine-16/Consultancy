const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  propertyType: { 
    type: String, 
    enum: ["House", "Apartment", "Land", "Commercial"], 
    required: true 
  },
  location: {
    city: { type: String, required: true },
    area: { type: String, required: true },
    address: { type: String, required: true }
  },
  price: { type: Number, required: true, min: 0 },
  propertySize: { 
    value: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ["sq.ft", "acres"], default: "sq.ft" }
  },
  bedrooms: { type: Number, required: true, min: 0 },
  bathrooms: { type: Number, required: true, min: 0 },
  availabilityStatus: {
    type: String,
    enum: ["Available", "Sold", "Under Negotiation"],
    default: "Available"
  },
  description: { type: String, required: true },
  images: [{ type: String }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  contactDetails: {
    name: String,
    email: String,
    phone: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Property", propertySchema);
