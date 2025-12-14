const UserActivity = require("../../models/UserActivity");
const User = require("../../models/users");

exports.getLedgerActivity = async (req, res) => {
  try {
    const { ledger_id } = req.params;

    if (!ledger_id) {
      return res.status(400).json({
        success: false,
        message: "ledger_id is required"
      });
    }

    // Fetch activity ordered by newest first
    const activities = await UserActivity.findAll({
      where: { ledger_id },
      include: [
        {
          model: User,
          attributes: ["id", "username"]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    // Format response
    const formatted = activities.map(a => ({
      activity_id: a.activity_id,
      user_id: a.user_id,
      user: a.User ? a.User.username : "Unknown User",
      activity_type: a.activity_type,
      description: a.description,
      amount: a.amount || 0,
      created_at: a.created_at
    }));

    return res.json({
      success: true,
      activities: formatted
    });

  } catch (err) {
    console.error("Ledger Activity Fetch Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};
