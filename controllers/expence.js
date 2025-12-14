const Expense = require("../models/Expence");
const LedgerMember = require("../models/LedgerMember");
const NetBalance = require("../models/NetBalance");
const Balance = require("../models/Balance");
const User = require("../models/users");
const sequelize = require("../config/database");
const { logActivity } = require("./activityController");


exports.addExpense = async (req, res) => {
  try {
    const { ledger_id, user_id, title, amount, selectedMembers } = req.body;

    if (!ledger_id || !user_id || !title || !amount || !selectedMembers?.length) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Validate payer exists
    const payer = await User.findByPk(user_id);
    if (!payer) {
      return res.status(400).json({ success: false, message: `Payer user_id ${user_id} does not exist` });
    }

    // Validate payer is a member of the ledger
    const payerMember = await LedgerMember.findOne({ where: { ledger_id, user_id } });
    if (!payerMember) {
      return res.status(400).json({ success: false, message: `Payer user_id ${user_id} is not a member of ledger ${ledger_id}` });
    }

    // Validate selected members
    for (const memberId of selectedMembers) {
      const member = await LedgerMember.findOne({ where: { ledger_id, user_id: memberId } });
      if (!member) {
        return res.status(400).json({
          success: false,
          message: `Member ${memberId} is not part of this ledger`,
        });
      }
    }

    const t = await sequelize.transaction();
    try {
      // 1️⃣ Create a single Balance entry for the total amount
      const balance = await Balance.create({
        ledger_id,
        balance: parseFloat(amount), // total money added by the user
        title,
      }, { transaction: t });

      // 2️⃣ Split the amount equally among selected members
      const splitAmount = parseFloat(amount) / selectedMembers.length;

      const expenses = [];
      for (const memberId of selectedMembers) {
        // Create multiple Expense entries pointing to the same balance_id
        const expense = await Expense.create({
          ledger_id,
          user_id,          // who paid
          member_id: memberId, // for whom
          title,
          amount: splitAmount,
          balance_id: balance.balance_id, // link to the same balance entry
        }, { transaction: t });

        expenses.push(expense);

        // Update net balance for each member
        const [nb] = await NetBalance.findOrCreate({
          where: { ledger_id, user_id: memberId },
          defaults: { net_balance: 0 },
          transaction: t,
        });

        nb.net_balance = parseFloat(nb.net_balance) + splitAmount;
        await nb.save({ transaction: t });
      }

      await t.commit();

      // Log activity: add expense
      try {
        await logActivity(user_id, 'ADD_EXPENSE', `Added expense '${title}' amount ${amount}`, ledger_id, parseFloat(amount), req);
      } catch (e) {
        console.error('Failed to log activity for addExpense:', e);
      }

      return res.status(201).json({
        success: true,
        message: "Expense added, split, and balance updated successfully",
        balance,
        expenses,
        per_member_share: splitAmount.toFixed(2),
      });

    } catch (err) {
      await t.rollback();
      throw err;
    }

  } catch (error) {
    console.error("Add Expense Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.getLedgerTransactions = async (req, res) => {
  const { ledgerId } = req.params;

  try {
    // Fetch all expenses for this ledger with payer, member, and balance
    const expenses = await Expense.findAll({
      where: { ledger_id: ledgerId },
      include: [
        // payer -> ExpenseCreator association
        {
          model: User,
          as: "ExpenseCreator",
          attributes: ["id", "username", "email"]
        },
        {
          model: Balance,
          attributes: ["balance_id", "balance", "title"]
        },
        // member -> ExpenseMember association
        {
          model: User,
          as: "ExpenseMember",
          attributes: ["id", "username", "email"]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    const formatted = expenses.map(exp => ({
      expense_id: exp.expense_id,
      balance_id: exp.balance_id,
      amount: parseFloat(exp.amount),
      title: exp.title,
  added_by: exp.ExpenseCreator ? { id: exp.ExpenseCreator.id, username: exp.ExpenseCreator.username } : null,
  for_member: exp.ExpenseMember ? { id: exp.ExpenseMember.id, username: exp.ExpenseMember.username } : null,
      created_at: exp.created_at
    }));

    return res.json({ success: true, transactions: formatted });
  } catch (err) {
    console.error("Fetch Ledger Transactions Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};




