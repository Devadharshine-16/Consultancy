const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  visitDate: { type: Date, required: true },
  message: { type: String, default: "" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  rejectionReason: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  respondedAt: { type: Date }
});

module.exports =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
