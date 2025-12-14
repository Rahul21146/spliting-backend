const { Sequelize } = require("sequelize");
require("dotenv").config();

// Prefer a full connection URL when available (some providers expose a public URL)
// e.g. MYSQL_URL or MYSQL_PUBLIC_URL or DATABASE_URL. Fall back to individual parts.
const connectionUrl = process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL || process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL;

let sequelize;
if (connectionUrl) {
  // Use the full connection string
  sequelize = new Sequelize(connectionUrl, {
    dialect: 'mysql',
    logging: false,
  });
} else {
  // Fall back to separate env vars
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mysql',
      logging: false,
    }
  );
}

module.exports = sequelize;
