const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,   // goseeko
  process.env.DB_USER,   // root
  process.env.DB_PASS,   // root
  {
    host: process.env.DB_HOST, // 127.0.0.1
    port: process.env.DB_PORT, // 3305
    dialect: "mysql",
    logging: false,
  }
);

module.exports = sequelize;
