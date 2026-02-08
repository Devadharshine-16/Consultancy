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
  // IMPORTANT: These are optional at schema level to allow existing users to log in
  // Enum validation removed from schema - validation happens only in registration route
  identityProofType: {
    type: String,
    required: false, // Optional - allows existing users without proof
    default: undefined
  },
  identityProofFile: {
    type: String,
    required: false, // Optional - allows existing users without proof
    default: undefined
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  // Schema options
  validateBeforeSave: true,
  strict: true
});

// Pre-validate hook: Ensure undefined/null values don't cause validation issues
// This allows existing users without identity proof to be saved/updated
userSchema.pre('validate', function(next) {
  // Convert null/empty string to undefined to avoid validation issues
  if (!this.identityProofType || this.identityProofType === null || this.identityProofType === '') {
    this.identityProofType = undefined;
  }
  if (!this.identityProofFile || this.identityProofFile === null || this.identityProofFile === '') {
    this.identityProofFile = undefined;
  }
  next();
});

// Post-init hook: Clean up fields when documents are loaded from database
// This ensures existing users without identity proof don't cause issues during populate/find
userSchema.post('init', function() {
  // If fields are null or empty, set to undefined
  if (this.identityProofType === null || this.identityProofType === '') {
    this.identityProofType = undefined;
  }
  if (this.identityProofFile === null || this.identityProofFile === '') {
    this.identityProofFile = undefined;
  }
});

// Clear cached model to ensure schema changes are applied
// IMPORTANT: Restart server after schema changes for this to take effect
if (mongoose.models.User) {
  delete mongoose.models.User;
}

module.exports = mongoose.model("User", userSchema);
