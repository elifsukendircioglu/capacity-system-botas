const express = require('express');
const router = express.Router();
const { addReserve } = require('../controllers/reserveController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, addReserve);

module.exports = router;