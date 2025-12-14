// script: list_indexes.js
// Purpose: Connects to the project's DB using existing config and prints indexes for the `users` table.
// Usage (PowerShell):
// cd c:\Users\admin\Desktop\Spliting\spliting-backend; node scripts/list_indexes.js

require('dotenv').config();
const sequelize = require('../config/database');

async function listIndexes() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB. Running SHOW INDEX for `users`...\n');
    const [results] = await sequelize.query("SHOW INDEX FROM `users`");
    if (!results || results.length === 0) {
      console.log('No indexes found for table `users`.');
    } else {
      console.table(results);
    }
  } catch (err) {
    console.error('Error listing indexes:', err.message || err);
    process.exitCode = 2;
  } finally {
    await sequelize.close();
  }
}

listIndexes();
