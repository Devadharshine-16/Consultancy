const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads/identity directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "identity");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  }
});

// Allow only images or PDF for identity proofs
const fileFilter = (req, file, cb) => {
  const allowedMime = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or PDF files are allowed for identity proof"), false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});
