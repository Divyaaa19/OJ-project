const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();


// REGISTER — Only creates users with role: 'user'



router.post("/register", async (req, res) => {
  const { name, email, password, adminKey } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    let role = "user";
    if (adminKey === process.env.ADMIN_KEY) {
      role = "admin";
    }

    const newUser = new User({
      name,
      email,
      password: hashed,
      role, // Only this gets saved
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// LOGIN — Returns token and role (admin/user)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.json({
      token,
      role: user.role // 👈 used by frontend for redirection
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
