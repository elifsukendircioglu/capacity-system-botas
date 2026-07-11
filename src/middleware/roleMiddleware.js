const pool = require('../config/db');

async function requireAdmin(req, res, next) {
  try {
    const userId = req.user.userId; // authMiddleware'den geliyor (token içindeki alan adı neyse)

    const result = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Bu işlem için admin yetkisi gerekli' });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

module.exports = requireAdmin;