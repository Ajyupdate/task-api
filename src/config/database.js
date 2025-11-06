const { Pool } = require('pg');

const isTrue = (val) => String(val).toLowerCase() === 'true';


const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'emmanuelFinch2001!',
  database: process.env.DB_NAME || 'task_manager',
  ssl: isTrue(process.env.DB_SSL || false) ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Unexpected PG pool error', err);
});

async function verifyDatabaseConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    // eslint-disable-next-line no-console
    console.log('Database connection verified.');
  } finally {
    client.release();
  }
}

async function closePool() {
  try {
    await pool.end();
  } catch (err) {
    // Pool might already be closed, ignore the error
    if (err.message && !err.message.includes('Cannot use a pool after it has been ended')) {
      throw err;
    }
  }
}

module.exports = { pool, verifyDatabaseConnection, closePool };

