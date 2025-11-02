// routes/authRoutes.js
const express = require("express");
const router = express.Router();

// Import controller
const authController = require("../contollers/authController");

// ✅ Signup route
router.post("/signup", authController.signup);

// ✅ Login route
router.post("/login", authController.login);

module.exports = router;
