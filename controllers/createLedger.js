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
const { logActivity } = require("./activityController");


exports.createLedger = async (req, res) => {
    try {
        const { 
            user_id, 
            ledger_name, 
            description, 
            member_emails = []  // <---- EMAILS now
        } = req.body;

        if (!user_id || !ledger_name) {
            return res.status(400).json({ message: "user_id and ledger_name are required." });
        }

        // -------------------------------------------
        // 0️⃣ Convert member emails → user_ids using Sequelize
        // -------------------------------------------
        const member_ids = [];
        for (const email of member_emails) {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ error: `User with email ${email} not found` });
            }
            member_ids.push(user.id);
        }

        // Use a transaction to ensure atomicity
        const result = await sequelize.transaction(async (t) => {
            // 1️⃣ Create LEDGER
            const ledger = await Ledger.create(
                { user_id, ledger_name, description, is_active: true },
                { transaction: t }
            );

            const ledger_id = ledger.ledger_id;

            // 2️⃣ Insert CREATOR as member (always)
            await LedgerMember.create({ ledger_id, user_id }, { transaction: t });

            // 3️⃣ Insert OTHER MEMBERS (converted from email → id)
            if (member_ids.length > 0) {
                const bulk = member_ids.map((mid) => ({ ledger_id, user_id: mid }));
                await LedgerMember.bulkCreate(bulk, { transaction: t, ignoreDuplicates: true });
            }

            // Fetch all members including creator
            const members = await LedgerMember.findAll({ where: { ledger_id }, attributes: ['user_id'], transaction: t });

            // 4️⃣ Create NET BALANCES (initial 0 for each member)
            if (members.length > 0) {
                const netBalances = members.map((m) => ({ ledger_id, user_id: m.user_id, net_balance: 0.0 }));
                await NetBalance.bulkCreate(netBalances, { transaction: t });
            }

            return { ledger_id, members };
        });

        const ledger_id = result.ledger_id;
        const members = result.members;

        // Log activity: ledger creation
        try {
          await logActivity(user_id, 'CREATE_LEDGER', `Created ledger ${ledger_name}`, ledger_id, null, req);
        } catch (e) {
          console.error('Failed to log activity for createLedger:', e);
        }

        return res.status(201).json({
            message: "Ledger created successfully.",
            ledger_id,
            members: members.map(m => m.user_id)
        });

    } catch (error) {
        console.error("Create Ledger Error:", error);
        return res.status(500).json({ error: "Error creating ledger", details: error });
    } 
};



// exports.getUserLedgers = async (req, res) => {
//     try {
//         const { user_id } = req.params;

//         if (!user_id) {
//             return res.status(400).json({ message: "user_id is required." });
//         }

//         // ---------------------------------------------
//         // 1️⃣ Get all ledgers where the user is member
//         // ---------------------------------------------
//         const ledgers = await Ledger.findAll({
//             include: [
//                 {
//                     model: LedgerMember,
//                     required: true,
//                     where: { user_id },  
//                 },
//                 {
//                     model: LedgerMember,
//                     as: "Members",
//                     attributes: ["user_id"]
//                 },
//                 {
//                     model: NetBalance,
//                     where: { user_id },  
//                     attributes: ["net_balance"],
//                     required: false
//                 }
//             ],
//             attributes: [
//                 "ledger_id",
//                 "ledger_name",
//                 "description",    // 👈 Added here!
//                 "is_active"
//             ],
//         });

//         // ---------------------------------------------
//         // 2️⃣ Format the result
//         // ---------------------------------------------
//         const response = ledgers.map((ledger) => {
//             const membersCount = ledger.Members.length;
//             const netBalance = ledger.NetBalances?.[0]?.net_balance || 0;

//             return {
//                 ledger_id: ledger.ledger_id,
//                 ledger_name: ledger.ledger_name,
//                 description: ledger.description,   // 👈 Added here!
//                 is_active: ledger.is_active,
//                 members: membersCount,
//                 net_balance: netBalance,
//                 status:
//                     netBalance > 0 ? "You Will Receive"
//                     : netBalance < 0 ? "You Have to Pay"
//                     : "Settled"
//             };
//         });

//         return res.status(200).json({
//             success: true,
//             ledgers: response,
//         });

//     } catch (error) {
//         console.error("Get Ledgers Error:", error);
//         return res.status(500).json({
//             error: "Error fetching ledgers",
//             details: error.message
//         });
//     }
// };

// controllers/ledgerController.js
exports.getUserLedgers = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required." });
    }

    const ledgers = await Ledger.findAll({
      include: [
        // LedgerMembership for current user (to filter ledgers)
        {
          model: LedgerMember,
          required: true,
          where: { user_id },
        },
        // All members of the ledger
        {
          model: LedgerMember,
          as: "Members",
          include: [
            {
              model: User,
              attributes: ["id", "username", "email"]
            }
          ]
        },
        // NetBalance for current user
        {
          model: NetBalance,
          where: { user_id },
          attributes: ["net_balance"],
          required: false
        }
      ],
      attributes: ["ledger_id", "ledger_name", "description", "is_active"],
    });

    const response = ledgers.map((ledger) => {
      // Map members to include pending amount
      const members = ledger.Members.map((lm) => {
        // Try to get this member's net balance if exists
        const memberBalanceRecord = ledger.NetBalances?.find(nb => nb.user_id === lm.user_id);
        return {
          id: lm.User.id,
          username: lm.User.username,
          email: lm.User.email,
          amount: memberBalanceRecord ? parseFloat(memberBalanceRecord.net_balance) : 0
        };
      });

      const netBalance = ledger.NetBalances?.[0]?.net_balance || 0;

      return {
        ledger_id: ledger.ledger_id,
        ledger_name: ledger.ledger_name,
        description: ledger.description,
        is_active: ledger.is_active,
        members, // <-- full member info
        net_balance: netBalance,
        status:
          netBalance > 0 ? "You Will Receive"
          : netBalance < 0 ? "You Have to Pay"
          : "Settled"
      };
    });

    return res.status(200).json({
      success: true,
      ledgers: response,
    });

    // Log activity: viewed ledger list
    try {
      await logActivity(user_id, 'VIEW_LEDGERS', 'Viewed ledger list', null, null, req);
    } catch (e) {
      console.error('Failed to log activity for getUserLedgers:', e);
    }

  } catch (error) {
    console.error("Get Ledgers Error:", error);
    return res.status(500).json({
      error: "Error fetching ledgers",
      details: error.message
    });
  }
};



// controllers/ledgerController.js

// Get ledger details including members (no transactions)
// exports.getLedgerDetails = async (req, res) => {
//   try {
//     const { ledger_id } = req.params;

//     if (!ledger_id) {
//       return res.status(400).json({ message: "ledger_id is required." });
//     }

//     // Fetch ledger: include members (with user) and net balances separately
//     const ledger = await Ledger.findOne({
//       where: { ledger_id },
//       include: [
//         {
//           model: LedgerMember,
//           include: [
//             { model: User, attributes: ["id", "username", "email"] }
//           ]
//         },
//         {
//           model: NetBalance,
//           where: { ledger_id },
//           required: false
//         }
//       ]
//     });

//     if (!ledger) {
//       return res.status(404).json({ success: false, message: "Ledger not found." });
//     }

//     // Map members with amounts (find net balance by user_id from top-level NetBalances)
//     const members = ledger.LedgerMembers.map((lm) => {
//       const netBalanceRecord = ledger.NetBalances?.find(nb => nb.user_id === lm.user_id);
//       return {
//         id: lm.User.id,
//         username: lm.User.username,
//         email: lm.User.email,
//         amount: netBalanceRecord ? parseFloat(netBalanceRecord.net_balance) : 0
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       ledger: {
//         ledger_id: ledger.ledger_id,
//         ledger_name: ledger.ledger_name,
//         description: ledger.description,
//         is_active: ledger.is_active,
//         members
//       }
//     });
//   } catch (err) {
//     console.error("Error fetching ledger details:", err);
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };



exports.getLedgerDetails = async (req, res) => {
  try {
    const { ledger_id, user_id } = req.params;

    if (!ledger_id || !user_id) {
      return res.status(400).json({ message: "ledger_id and user_id required." });
    }

    // ===========================
    // 1️⃣ Fetch Ledger Basic Info
    // ===========================
    const ledgerInfo = await Ledger.findOne({
      where: { ledger_id },
      attributes: ["ledger_id", "ledger_name", "description", "is_active"]
    });

    if (!ledgerInfo) {
      return res.status(404).json({ success: false, message: "Ledger not found" });
    }

    // ===========================
    // 2️⃣ Fetch Members of Ledger
    // ===========================
    const memberList = await LedgerMember.findAll({
      where: { ledger_id },
      include: [{ model: User, attributes: ["id", "username", "email"] }]
    });

    // ===========================
    // 3️⃣ Fetch all expenses
    // ===========================
    const expenses = await Expense.findAll({
      where: { ledger_id },
      attributes: ["expense_id", "ledger_id", "user_id", "member_id", "amount"]
    });

    // ===========================
    // 4️⃣ COMPUTE Per-Member Settlement
    // Formula:
    // loginUserAddedForMember - memberAddedForLoginUser
    // ===========================
    let members = [];
    let totalPay = 0;
    let totalReceive = 0;

    for (let m of memberList) {
      const memberId = m.user_id;

      // Skip self (logged in user)
      if (memberId == user_id) {
        members.push({
          id: m.User.id,
          username: m.User.username,
          email: m.User.email,
          you_have_to_pay: 0,
          you_will_receive: 0
        });
        continue;
      }

      // 💰 How much login user added FOR this member
      const loginUserAdded =
        expenses
          .filter(exp => exp.user_id == user_id && exp.member_id == memberId)
          .reduce((sum, x) => sum + parseFloat(x.amount), 0);

      // 💰 How much this member added FOR login user
      const memberAdded =
        expenses
          .filter(exp => exp.user_id == memberId && exp.member_id == user_id)
          .reduce((sum, x) => sum + parseFloat(x.amount), 0);

      // ✔ FINAL difference
      const diff = loginUserAdded - memberAdded;

      let youPay = 0;
      let youReceive = 0;

      if (diff > 0) {
        // Member owes me
        youReceive = diff;
        totalReceive += youReceive;
      } else if (diff < 0) {
        // I owe member
        youPay = Math.abs(diff);
        totalPay += youPay;
      }

      members.push({
        id: m.User.id,
        username: m.User.username,
        email: m.User.email,
        you_have_to_pay: youPay,
        you_will_receive: youReceive
      });
    }

    // ===========================
    // 5️⃣ FINAL RESPONSE
    // ===========================
    return res.json({
      success: true,
      ledger: {
        ledger_id: ledgerInfo.ledger_id,
        ledger_name: ledgerInfo.ledger_name,
        description: ledgerInfo.description,
        is_active: ledgerInfo.is_active,
        members
      },
      logged_user_summary: {
        user_id,
        you_have_to_pay_total: totalPay,
        you_will_receive_total: totalReceive
      }
    });

    // Log activity: viewed specific ledger
    try {
      await logActivity(user_id, 'VIEW_LEDGER', `Viewed ledger ${ledger_id}`, ledger_id, null, req);
    } catch (e) {
      console.error('Failed to log activity for getLedgerDetails:', e);
    }

  } catch (err) {
    console.error("Ledger details error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};




