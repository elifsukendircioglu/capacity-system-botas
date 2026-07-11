const pool = require('../config/db');

async function createUser(username, password_hash) {
  const result = await pool.query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
    [username, password_hash]
  );
  return result.rows[0];
}

async function findUserByUsername(username) {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
}

module.exports = { createUser, findUserByUsername };