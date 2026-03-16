require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "https://vazhvidam.vercel.app",
  "http://localhost:3000",
  "http://localhost:5174"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("✅ MongoDB Atlas Connected");

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

})
.catch(err => console.log("MongoDB Error:", err));