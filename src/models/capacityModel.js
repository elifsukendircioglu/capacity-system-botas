const pool = require('../config/db');

async function createCapacity(data) {
    const { id_user, capacity, energy, tempreture, pressure, flow, point_id } = data;

    const result = await pool.query(
        `INSERT INTO "Capacity" 
         (id_user, capacity, energy, tempreture, pressure, flow, point_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [id_user, capacity, energy, tempreture, pressure, flow, point_id]
    );

    return result.rows[0];
}

async function getCapacitiesByUser(id_user) {
    const result = await pool.query(
        `SELECT * FROM "Capacity" WHERE id_user = $1 ORDER BY id DESC`,
        [id_user]
    );
    return result.rows;
}

async function getAllPoints() {
    const result = await pool.query(`SELECT id, name FROM points ORDER BY name ASC`);
    return result.rows;
}

async function getPendingCapacities() {
    const result = await pool.query(
        `SELECT c.*, p.name AS point_name, u.username
         FROM "Capacity" c
         JOIN points p ON c.point_id = p.id
         JOIN users u ON c.id_user = u.id
         WHERE c.status = 'pending'
         ORDER BY c.created_at ASC`
    );
    return result.rows;
}

async function getCapacityById(id) {
    const result = await pool.query(
        `SELECT * FROM "Capacity" WHERE id = $1`,
        [id]
    );
    return result.rows[0];
}

async function setCapacityStatus(id, status, adminId) {
    const result = await pool.query(
        `UPDATE "Capacity"
         SET status = $1, approved_by = $2, approved_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [status, adminId, id]
    );
    return result.rows[0];
}
async function getCapacitiesByUserAndRange(id_user, start, end) {
    const result = await pool.query(
        `SELECT c.*, p.name AS point_name
        FROM "Capacity" c
        JOIN points p ON c.point_id = p.id
        WHERE c.id_user = $1
        AND c.created_at::date BETWEEN $2 AND $3
        ORDER BY c.created_at DESC`,
        [id_user, start, end]
    );
    return result.rows;
}
module.exports = {
    createCapacity,
    getCapacitiesByUser,
    getAllPoints,
    getPendingCapacities,
    getCapacityById,
    setCapacityStatus,
    getCapacitiesByUserAndRange  
};