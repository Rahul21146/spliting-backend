const { Sequelize } = require("sequelize");
require("dotenv").config();

// Prefer a full connection URL when available (some providers expose a public URL)
// e.g. MYSQL_URL or MYSQL_PUBLIC_URL or DATABASE_URL. Fall back to individual parts.
const connectionUrl =
  process.env.MYSQL_URL ||
  process.env.MYSQL_PUBLIC_URL ||
  process.env.DATABASE_URL ||
  process.env.MYSQLPUBLICURL ||
  process.env.DB_URL;

// Support alternative env var names for credentials when provider uses different names
const dbName = process.env.DB_NAME || process.env.DATABASE_NAME || process.env.MYSQL_DATABASE;
const dbUser = process.env.DB_USER || process.env.DB_USERNAME || process.env.MYSQL_USER;
const dbPass = process.env.DB_PASS || process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD;
const dbHost = process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST;
const dbPort = process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT;

let sequelize;
if (connectionUrl) {
  // Use the full connection string (recommended for hosted DBs)
  sequelize = new Sequelize(connectionUrl, {
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      // Helpful for cloud providers that can be a bit slow during cold start
      connectTimeout: 20000,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // Fall back to separate env vars
  sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort ? parseInt(dbPort, 10) : undefined,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      connectTimeout: 20000,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

module.exports = sequelize;
