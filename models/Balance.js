const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Balance = sequelize.define("Balance", {
    balance_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ledger_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // FOREIGN KEY constraint will be set via Sequelize association
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
}, {
    tableName: "Balance",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = Balance;