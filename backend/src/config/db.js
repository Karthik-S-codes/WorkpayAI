const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'workpay_ai',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  dateStrings: true,
  decimalNumbers: true
};

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

/**
 * Executes a parameterized SQL query
 */
async function query(sql, params = []) {
  const connectionPool = getPool();
  const [rows, fields] = await connectionPool.execute(sql, params);
  return rows;
}

/**
 * Executes multiple operations within an atomic ACID transaction
 */
async function withTransaction(callback) {
  const connectionPool = getPool();
  const connection = await connectionPool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Tests connection to MySQL Server and provides detailed diagnostics
 */
async function testConnection() {
  try {
    const connectionPool = getPool();
    const [result] = await connectionPool.query('SELECT 1 + 1 AS solution, DATABASE() as current_db');
    console.log(`[MySQL] Connected successfully to database: "${result[0].current_db}" on ${dbConfig.host}:${dbConfig.port}`);
    return { connected: true, currentDb: result[0].current_db };
  } catch (error) {
    console.error(`[MySQL Connection Error]: ${error.message} (Code: ${error.code})`);
    if (error.code === 'ECONNREFUSED') {
      console.error(`[MySQL Diagnostic]: Could not connect to MySQL server at ${dbConfig.host}:${dbConfig.port}. Please verify that the Windows MySQL80 service is running.`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(`[MySQL Diagnostic]: Access denied for user '${dbConfig.user}'. Please check DB_PASSWORD in backend/.env.`);
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`[MySQL Diagnostic]: Database '${dbConfig.database}' does not exist yet. Run 'npm run db:init' to initialize it.`);
    }
    return { connected: false, error: error.message, code: error.code };
  }
}

module.exports = {
  getPool,
  query,
  withTransaction,
  testConnection,
  dbConfig
};

