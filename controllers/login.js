const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
require("dotenv").config();
const { logActivity } = require("./activityController");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    // compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    // create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
    // Log activity: login
    try {
      await logActivity(user.id, 'LOGIN', 'User logged in', null, null, req);
    } catch (e) {
      console.error('Failed to log login activity:', e);
    }
    
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    console.log("Received Google token:", token);

    if (!token)
      return res.status(400).json({ message: "Google token is required!" });

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
  console.log("payload ",payload);

    const { email, name, sub: googleId, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Create new user
      user = await User.create({
        username: email.split("@")[0],
        name,
        email,
        password: bcrypt.hashSync(googleId, 10), // random password
        googleId,
        avatar: picture,
        role: "user",
      });
    }

    // Create JWT token
    const tokenJWT = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Google login successful",
      token: tokenJWT,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    return res.status(401).json({ message: "Failed to login with Google!" });
  }
};
