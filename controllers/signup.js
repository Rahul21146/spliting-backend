const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const { uploadToCloudinary } = require("../config/uploadToCloudnary");
require("dotenv").config();
const { logActivity } = require("./activityController");

exports.register = async (req, res) => {
  try {
    const { username, name, email, password, gender, date_of_birth, location } = req.body;

    // check if email or username already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    image=req.files?.image;
    let uploadResult;
    if(image){
      uploadResult = await uploadToCloudinary(image, "BlogApp", 80);
    } 
    // create user  
    const user = await User.create({
      username,
      name,
      email,
      password: hashedPassword,
      gender,
      date_of_birth,
      location,
      image: uploadResult ? uploadResult.secure_url : null,
    });

    // Log activity: signup
    try {
      await logActivity(user.id, 'SIGNUP', 'User registered', null, null, req);
    } catch (e) {
      console.error('Failed to log signup activity:', e);
    }

    return res.json({ message: "User registered successfully", user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

