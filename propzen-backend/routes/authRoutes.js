const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/upload");

// Simple login security config
const MAX_LOGIN_ATTEMPTS = 3; // lock after 3 failed attempts
const LOCK_TIME_MS = 5 * 60 * 1000; // 5 minutes

/* REGISTER */
// first middleware handles file upload; errors forwarded via next
router.post(
  "/register",
  (req, res, next) => {
    upload.single("identityProof")(req, res, (err) => {
      if (err) {
        console.error("Multer error during registration:", err);
        return next(err);
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ message: "Invalid form data" });
      }

      const { name, email, password, role, identityProofType } = req.body;

      if (!name || !email || !password || !identityProofType) {
        return res.status(400).json({ message: "All fields required" });
      }

      const validProofTypes = ["aadhaar", "ration", "license"];
      if (!validProofTypes.includes(identityProofType)) {
        return res.status(400).json({ message: "Invalid identity proof type" });
      }

      const validRoles = ["user", "owner"];
      const finalRole = validRoles.includes(role) ? role : "user";

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Identity proof upload is required" });
      }

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(409).json({ message: "Email already registered" });
      }

      await User.create({
        name,
        email,
        password,
        role: finalRole,
        identityProofType,
        identityProofFile: req.file.path,
        isVerified: false
      });

      res.json({ message: "User registered successfully" });
    } catch (err) {
      console.error("Error during registration:", err);
      next(err);
    }
  }
);

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });

    // If user exists, first check if they are currently locked
    if (user && user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      return res.status(429).json({
        message: "Too many failed attempts. Please try again after 5 minutes"
      });
    }

    // Handle invalid login (wrong email or password)
    if (!user || user.password !== password) {
      // Only track attempts for existing users
      if (user) {
        const currentFailed = user.failedLoginAttempts || 0;
        const newFailedAttempts = currentFailed + 1;

        // If this failure reaches the max, lock the account
        if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
          // Use updateOne instead of save() to update only specific fields
          // This avoids triggering full document validation, which is important
          // for existing users who may not have identity proof fields
          await User.updateOne(
            { _id: user._id },
            {
              failedLoginAttempts: newFailedAttempts,
              lockUntil: new Date(Date.now() + LOCK_TIME_MS)
            }
          );

          return res.status(429).json({
            message: "Too many failed attempts. Please try again after 5 minutes"
          });
        }

        // Update failed attempts without triggering full validation
        await User.updateOne(
          { _id: user._id },
          { failedLoginAttempts: newFailedAttempts }
        );
      }

      return res.status(401).json({ message: "Invalid login" });
    }

    // Successful login: reset counters for this user
    // Use updateOne instead of save() to avoid triggering full document validation
    // This ensures existing users without identity proof can still log in
    await User.updateOne(
      { _id: user._id },
      {
        failedLoginAttempts: 0,
        lockUntil: null
      }
    );

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
