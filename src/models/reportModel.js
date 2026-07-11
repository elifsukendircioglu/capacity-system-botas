const pool = require('../config/db');

async function getCapacitiesByDateRange(start, end) {
    const result = await pool.query(
        `SELECT c.*, p.name AS point_name, u.username
         FROM "Capacity" c
         JOIN points p ON c.point_id = p.id
         JOIN users u ON c.id_user = u.id
         WHERE c.created_at >= $1 AND c.created_at < ($2::date + INTERVAL '1 day')
         ORDER BY c.created_at ASC`,
        [start, end]
    );
    return result.rows;
}

async function getAllocationsByDateRange(start, end) {
    const result = await pool.query(
        `SELECT r.*, p.name AS point_name
         FROM reserves r
         JOIN points p ON r.point_id = p.id
         WHERE r.reserve_date >= $1 AND r.reserve_date <= $2
         AND r.allocated_amount IS NOT NULL
         ORDER BY r.reserve_date ASC`,
        [start, end]
    );
    return result.rows;
}

module.exports = { getCapacitiesByDateRange, getAllocationsByDateRange };