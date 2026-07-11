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
         WHERE reserve_date = CURRENT_DATE - 1
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
         VALUES ($1, $2, CURRENT_DATE + 1)
         RETURNING *`,
        [point_id, reserve_amount]
    );

    return result.rows[0];
}

module.exports = {
    getNextDayReserve,
    getReservesForAllocation,
    updateAllocatedAmount,
    createReserve
};


module.exports = { getNextDayReserve, getReservesForAllocation, updateAllocatedAmount, createReserve };