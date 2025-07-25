const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const aiRoutes = require("./routes/ai");




const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json()); 

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/user", userRoutes);

app.use("/api/ai", aiRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
  });

