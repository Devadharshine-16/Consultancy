require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");


const app = express();
const cors = require("cors");
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("✅ MongoDB Atlas Connected");
  app.listen(5000, () => console.log("🚀 Server running on port 5000"));
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));