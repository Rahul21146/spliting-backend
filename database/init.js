const sequelize = require("../config/database"); // Your database connection instance
const Ledger = require("../models/Ledger");
const Balance = require("../models/Balance");
const NetBalance = require("../models/NetBalance");
const Transaction = require("../models/Transaction");
const LedgerMember = require("../models/LedgerMember");
const User = require("../models/users"); // Now explicitly requiring the User model
const Expense = require("../models/Expence");
const UserActivity = require("../models/UserActivity");

// --- Define Associations (Relationships) ---

// 1. User Associations
// A User can have many Ledgers.
User.hasMany(Ledger, { foreignKey: 'user_id' });
Ledger.belongsTo(User, { foreignKey: 'user_id' });

// A User can have many NetBalances (representing their summary in different ledgers).
User.hasMany(NetBalance, { foreignKey: 'user_id' });
NetBalance.belongsTo(User, { foreignKey: 'user_id' });

// A User can make many Transactions.
User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

// UserActivity associations
User.hasMany(UserActivity, { foreignKey: 'user_id' });
UserActivity.belongsTo(User, { foreignKey: 'user_id' });

// 2. Ledger Associations (as provided before)
// A Ledger has many Balances (individual balance entries).
Ledger.hasMany(Balance, { foreignKey: 'ledger_id' });
Balance.belongsTo(Ledger, { foreignKey: 'ledger_id' });

// A Ledger has many NetBalances (summaries for members/users in that ledger).
Ledger.hasMany(NetBalance, { foreignKey: 'ledger_id' });
NetBalance.belongsTo(Ledger, { foreignKey: 'ledger_id' });

// A Ledger has many Transactions (historical movements).
Ledger.hasMany(Transaction, { foreignKey: 'ledger_id' });
Transaction.belongsTo(Ledger, { foreignKey: 'ledger_id' });

// Ledger <-> UserActivity
Ledger.hasMany(UserActivity, { foreignKey: 'ledger_id' });
UserActivity.belongsTo(Ledger, { foreignKey: 'ledger_id' });

// A Ledger has many LedgerMembers (membership rows). Use alias 'Members' to match includes used elsewhere.
// Register both a default association and an aliased one so includes using either form work.
Ledger.hasMany(LedgerMember, { foreignKey: 'ledger_id' });
Ledger.hasMany(LedgerMember, { foreignKey: 'ledger_id', as: 'Members' });
LedgerMember.belongsTo(Ledger, { foreignKey: 'ledger_id' });

// Link LedgerMember to User so we can include User data when fetching members
LedgerMember.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(LedgerMember, { foreignKey: 'user_id' });

// Expense associations
Ledger.hasMany(Expense, { foreignKey: 'ledger_id' });
Expense.belongsTo(Ledger, { foreignKey: 'ledger_id' });
Expense.belongsTo(User, { foreignKey: 'user_id', as: 'ExpenseCreator' });
Expense.belongsTo(User, { foreignKey: 'member_id', as: 'ExpenseMember' });
// Link Expense to Balance so includes like { model: Balance } work when querying Expense
Balance.hasMany(Expense, { foreignKey: 'balance_id' });
Expense.belongsTo(Balance, { foreignKey: 'balance_id' });

// If you have a User model and want relation to Ledger
// User.hasMany(Ledger, { foreignKey: 'user_id' });
// Ledger.belongsTo(User, { foreignKey: 'user_id' });

// --- Database Synchronization Script ---
const syncDatabase = async (options = { alter: false }) => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');

    // Default: do not run destructive syncs in production. Use alter:true only in development
    if (options.alter) {
      try {
        // Try a schema alter (non-destructive). This can fail on databases with many existing indexes.
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized (alter) successfully.');
        return;
      } catch (err) {
        // Handle known MySQL error where table has too many keys for an ALTER operation
        if (err && err.original && err.original.code === 'ER_TOO_MANY_KEYS') {
          console.error('ALTER sync failed: too many keys on table. Falling back to safe sync without alter.');
          console.error('SQL Message:', err.original.sqlMessage);
          // Fall through to a safer sync below
        } else {
          // Unknown error while attempting alter - rethrow
          throw err;
        }
      }
    }

    // Safe fallback: do a non-altering sync (will not attempt to change existing columns/indexes)
    await sequelize.sync({ alter: false });
    console.log('All models were synchronized (safe sync) successfully.');
  } catch (error) {
    console.error('Unable to connect or sync the database:', error);
    throw error;
  }
};

module.exports = { syncDatabase };
