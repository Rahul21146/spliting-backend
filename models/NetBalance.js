const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NetBalance = sequelize.define("NetBalance", {
    net_balance_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ledger_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    net_balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    tableName: "NetBalance",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['ledger_id', 'user_id'], // Enforcing the UNIQUE constraint
        }
    ]
});

module.exports = NetBalance;