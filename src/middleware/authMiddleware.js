const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token gerekli' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer xxxxx" -> "xxxxx"

  if (!token) {
    return res.status(401).json({ error: 'Token gerekli' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // token içindeki bilgiyi (userId, username) req'e ekliyoruz
    next(); // her şey doğruysa, isteğin devam etmesine izin ver
  } catch (err) {
    return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
}

module.exports = authMiddleware;