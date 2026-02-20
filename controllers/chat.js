const ChatMessage = require("../models/ChatMessage");

exports.getLedgerMessages = async (req, res) => {
  try {
    const { ledger_id } = req.params;

    const messages = await ChatMessage.findAll({
      where: { ledger_id },
      order: [["created_at", "ASC"]],
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};