const pool = require('../config/db');

async function getNextDayReserve(point_id) {
    const result = await pool.query(
        `SELECT * FROM reserves
         WHERE point_id = $1 AND reserve_date = CURRENT_DATE + 1
         LIMIT 1`,
        [point_id]
    );
    return result.rows[0];
}

async function getReservesForAllocation() {
    const result = await pool.query(
        `SELECT * FROM reserves
         WHERE reserve_date = CURRENT_DATE
         AND allocated_amount IS NULL`
    );
    return result.rows;
}

async function updateAllocatedAmount(id, allocatedAmount) {
    const result = await pool.query(
        `UPDATE reserves
         SET allocated_amount = $1, allocated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [allocatedAmount, id]
    );
    return result.rows[0];
}

async function createReserve(data) {
    const { point_id, reserve_amount } = data;

    const result = await pool.query(
        `INSERT INTO reserves (point_id, reserve_amount, reserve_date)
         VALUES ($1, $2, CURRENT_DATE )
         RETURNING *`,
        [point_id, reserve_amount]
    );

    return result.rows[0];
}
async function getAllAllocations(date) {
    let query = `
        SELECT r.*, p.name AS point_name
        FROM reserves r
        JOIN points p ON r.point_id = p.id
        WHERE r.allocated_amount IS NOT NULL
    `;
    const params = [];

    if (date) {
        params.push(date);
        query += ` AND r.reserve_date = $${params.length}`;
    }

    query += ` ORDER BY r.reserve_date DESC`;

    const result = await pool.query(query, params);
    return result.rows;
}

async function getAllocationsByOwner(owner_id, date) {
    let query = `
        SELECT r.*, p.name AS point_name
        FROM reserves r
        JOIN points p ON r.point_id = p.id
        WHERE r.allocated_amount IS NOT NULL
        AND p.owner_id = $1
    `;
    const params = [owner_id];

    if (date) {
        params.push(date);
        query += ` AND r.reserve_date = $${params.length}`;
    }

    query += ` ORDER BY r.reserve_date DESC`;

    const result = await pool.query(query, params);
    return result.rows;
}

module.exports = {
    getNextDayReserve,
    getReservesForAllocation,
    updateAllocatedAmount,
    createReserve,
    getAllAllocations,
    getAllocationsByOwner
};