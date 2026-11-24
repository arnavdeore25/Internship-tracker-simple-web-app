const { Pool, types } = require('pg');

// Return DATE columns as plain 'YYYY-MM-DD' strings so timezones can't shift the day.
if (types) types.setTypeParser(1082, (value) => value);

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/tracker',
});

// Create the table on startup if it doesn't exist yet.
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'applied'
        CHECK (status IN ('applied', 'interview', 'offer', 'rejected')),
      applied_on DATE NOT NULL DEFAULT CURRENT_DATE,
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

module.exports = { pool, init };
