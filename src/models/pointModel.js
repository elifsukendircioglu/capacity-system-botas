const pool = require('../config/db');

async function createPoint(data) {
    const { name, mak, owner_id } = data;

    const result = await pool.query(
        `INSERT INTO points (name, mak, owner_id, status)
         VALUES ($1, $2, $3, 'pending')
         RETURNING *`,
        [name, mak, owner_id]
    );

    return result.rows[0];
}

async function getPointsByOwner(owner_id) {
    const result = await pool.query(
        `SELECT * FROM points WHERE owner_id = $1 ORDER BY id DESC`,
        [owner_id]
    );
    return result.rows;
}

async function getApprovedPoints() {
    const result = await pool.query(
        `SELECT * FROM points WHERE status = 'approved' ORDER BY name ASC`
    );
    return result.rows;
}

async function getPendingPoints() {
    const result = await pool.query(
        `SELECT p.*, u.username
         FROM points p
         JOIN users u ON p.owner_id = u.id
         WHERE p.status = 'pending'
         ORDER BY p.created_at ASC`
    );
    return result.rows;
}

async function getPointById(id) {
    const result = await pool.query(`SELECT * FROM points WHERE id = $1`, [id]);
    return result.rows[0];
}

async function setPointStatus(id, status) {
    const result = await pool.query(
        `UPDATE points SET status = $1 WHERE id = $2 RETURNING *`,
        [status, id]
    );
    return result.rows[0];
}

module.exports = {
    createPoint,
    getPointsByOwner,
    getApprovedPoints,
    getPendingPoints,
    getPointById,
    setPointStatus
};