const serverless = require('serverless-http');
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

// Match both root path and netlify function path
app.get(['/', '/.netlify/functions/server'], async (req, res) => {
  try {
    if (!connectionString) {
      return res.status(500).json({ error: "Missing database connection string environment variable." });
    }
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Bridge is running!', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports.handler = serverless(app);
