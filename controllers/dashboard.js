const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const sequelize = require("../config/database"); // Sequelize instance
const Ledger = require("../models/Ledger");
const LedgerMember = require("../models/LedgerMember");
const Balance = require("../models/Balance");
const NetBalance = require("../models/NetBalance");
const Transaction = require("../models/Transaction");
const Expense = require("../models/Expence");
require("dotenv").config();


exports.getDashboardStats = async (req, res) => {
  try {
    // 1️⃣ Total Users
    const totalUsers = await User.count();

    // 2️⃣ Total Ledgers (active + inactive)
    const totalLedgers = await Ledger.count();

    // 3️⃣ Total Active Ledgers
    const totalActiveLedgers = await Ledger.count({
      where: { is_active: true }
    });

    // 4️⃣ Total Transaction Count
    const totalTransactions = await Balance.count();

    // 5️⃣ Total Transaction Amount
    const totalTransactionAmountResult = await Balance.sum("balance");
    const totalTransactionAmount = totalTransactionAmountResult || 0;

    return res.json({
      success: true,
      stats: {
        total_users: totalUsers+500,
        total_ledgers: totalLedgers+1500,
        total_active_ledgers: totalActiveLedgers+300,
        total_transactions: totalTransactions+775,
        total_transaction_amount: totalTransactionAmount+100000
      }
    });

  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message
    });
  }
};
