const jwt = require("jsonwebtoken");
const User = require("../models/users");
const sendMail = require("../config/mailer");
const resetPasswordTemplate = require("../config/Templates/resetPasswordTemplate");
const frontendURL = process.env.FRONTEND_URL;

exports.sendResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Create JWT Reset Token (expires in 1 hour)
    const resetToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        purpose: "password-reset",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const resetLink = `${frontendURL}/reset-password/${user.email}/${resetToken}`;

    const htmlContent = resetPasswordTemplate(
      user.name,
      user.email,
      resetLink
    );

    await sendMail(
      user.email,
      "Reset Your Password - SplitWise",
      htmlContent
    );

    return res.status(200).json({
      success: true,
      message: "Password reset link sent",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
