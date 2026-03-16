const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "owner", "admin"], default: "user" },

  // Simple login security fields
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },

  // Identity verification fields
  identityProofType: {
    type: String,
    required: false
  },
  identityProofFile: {
    type: String,
    required: false
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

// Clear cached model to ensure schema changes are applied
if (mongoose.models.User) {
  delete mongoose.models.User;
}

module.exports = mongoose.model("User", userSchema);
