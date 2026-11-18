const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'workpay_ai';

  console.log(`[WorkPay AI] Initializing database "${database}" on ${host}:${port}...`);

  let connection;
  try {
    // 1. Connect without specifying the target database first
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log('[WorkPay AI] Connected to MySQL Server successfully.');

    // 2. Read schema file
    const sqlPath = path.join(__dirname, '../../../database/workpay_ai.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found at ${sqlPath}`);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('[WorkPay AI] Executing database schema and seed data...');
    await connection.query(sqlContent);

    console.log(`[WorkPay AI] Database "${database}" initialized and seeded successfully!`);
  } catch (error) {
    console.error('[WorkPay AI Database Init Error]:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error(`Hint: MySQL server is not running on ${host}:${port}. Please start the MySQL service in Windows Services.`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(`Hint: Incorrect username or password for MySQL. Check DB_PASSWORD in backend/.env.`);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;

