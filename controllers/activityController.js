// controllers/activityController.js
const UserActivity = require("../models/UserActivity");
const User = require("../models/users");
const Ledger = require("../models/Ledger");
const { logActivity } = require("./utils/logActivity");

exports.getUserActivity = async (req, res) => {
  try {
    const { user_id } = req.params;

    const activities = await UserActivity.findAll({
      where: { user_id },
      include: [
        { model: User, attributes: ["id", "username", "email"] },
        { model: Ledger, attributes: ["ledger_id", "ledger_name"] }
      ],
      order: [["created_at", "DESC"]]
    });

    return res.json({
      success: true,
      count: activities.length,
      activities
    });

  } catch (err) {
    console.error("Get User Activity Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

// Re-exportable helper so other controllers can call activity logging via
// `const { logActivity } = require('./controllers/activityController')`
exports.logActivity = async (user_id, activity_type, description, ledger_id = null, amount = null, req = null) => {
  try {
    // Delegate to utils/logActivity (which already handles errors)
    await logActivity(user_id, activity_type, description, ledger_id, amount, req);
  } catch (err) {
    console.error('ActivityController.logActivity error:', err);
  }
};
