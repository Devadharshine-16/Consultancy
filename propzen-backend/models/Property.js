const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  propertyType: { 
    type: String, 
    enum: ["Apartment", "Individual House", "Villa", "Plot", "House", "Land", "Commercial"], 
    required: true 
  },
  purpose: {
    type: String,
    enum: ["Rent", "Sale"],
    required: true,
    default: "Sale"
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
  bhkType: {
    type: String,
    enum: ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK+", "Studio"],
    default: "2BHK"
  },
  bedrooms: { type: Number, required: true, min: 0 },
  bathrooms: { type: Number, required: true, min: 0 },
  furnishingStatus: {
    type: String,
    enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
    default: "Unfurnished"
  },
  floorNumber: { type: Number, min: 0 },
  totalFloors: { type: Number, min: 0 },
  availabilityStatus: {
    type: String,
    enum: ["Immediate", "From Date", "Available", "Sold", "Under Negotiation"],
    default: "Immediate"
  },
  availableFrom: { type: Date },
  ownershipType: {
    type: String,
    enum: ["Owner", "Builder", "Agent"],
    default: "Owner"
  },
  amenities: {
    parking: { type: Boolean, default: false },
    waterSupply: { type: Boolean, default: false },
    powerBackup: { type: Boolean, default: false },
    lift: { type: Boolean, default: false }
  },
  description: { type: String, required: true },
  images: [{ type: String }],
  ownershipProof: { type: String }, // Optional file path for admin verification
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
