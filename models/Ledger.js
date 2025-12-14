const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ledger = sequelize.define("Ledger", {
    ledger_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // References a User model if you define associations later
    },
    ledger_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
},
}, {
    tableName: "Ledger",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = Ledger;