const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LedgerMember = sequelize.define("LedgerMember", {
    // 1. Define the first part of the Composite Primary Key
    ledger_id: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Marks this column as part of the PK
        allowNull: false,
    },
    
    // 2. Define the second part of the Composite Primary Key
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Marks this column as part of the PK
        allowNull: false,
    },
    
    // Optional: Keep the created_at timestamp
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },

    // If you need the 'role' column back (recommended for permissions), uncomment it:
    /*
    role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'member',
    },
    */
}, {
    tableName: "LedgerMember",
    // Since you are tracking 'created_at' manually, you can disable Sequelize's default timestamps
    timestamps: false, 
    // If you want 'updated_at', change 'timestamps' to 'true' and define 'updatedAt'
    
    // 💡 Sequelize automatically enforces the UNIQUE constraint 
    // when multiple columns are marked as primaryKey: true.
});

module.exports = LedgerMember;