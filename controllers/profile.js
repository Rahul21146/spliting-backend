const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
require("dotenv").config();
const { logActivity } = require("./activityController");

exports.getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Received token:", token);

    if (!token) {
      return res.status(401).json({ success: false, error: "No token provided" });
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Extract ID from token
    const userId = decoded.id;
    console.log("Extracted user ID from token:", userId);

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    console.log("Fetched user:", user);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Log activity: viewed profile
    try {
      await logActivity(userId, 'VIEW_PROFILE', 'Viewed profile', null, null, req);
    } catch (e) {
      console.error('Failed to log profile view activity:', e);
    }

    return res.json({
      success: true,
      user,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
