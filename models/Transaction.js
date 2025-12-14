const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Transaction = sequelize.define("Transaction", {
    transaction_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ledger_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    member_id: {
        type: DataTypes.INTEGER,
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    transaction_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: "Transactions",
    timestamps: false, // You might choose to omit standard timestamps for transaction history
});

module.exports = Transaction;