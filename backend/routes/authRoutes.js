const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      hashedPassword: "123456",
    });
    res.status(201).json(user);
  } catch (error) {
    console.error(error);

    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
