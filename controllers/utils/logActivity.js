// utils/logActivity.js
const UserActivity = require("../../models/UserActivity");

exports.logActivity = async (
  user_id,
  activity_type,
  description,
  ledger_id = null,
  amount = null,
  req
) => {
  try {
    await UserActivity.create({
      user_id,
      activity_type,
      description,
      ledger_id,
      amount,
      ip_address: req?.ip || null,
      device_info: req?.headers?.["user-agent"] || null,
    });
  } catch (err) {
    console.error("Activity Log Error:", err);
  }
};
