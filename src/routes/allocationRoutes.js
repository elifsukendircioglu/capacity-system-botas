const express = require('express');
const router = express.Router();
const { runAllocation } = require('../controllers/allocationController');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/roleMiddleware');

router.post('/run', authMiddleware, requireAdmin, runAllocation);

module.exports = router;