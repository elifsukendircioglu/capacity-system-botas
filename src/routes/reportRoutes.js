const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/roleMiddleware');
const { getSummary, downloadPdf } = require('../controllers/reportController');

router.get('/summary', verifyToken, requireAdmin, getSummary);
router.get('/pdf', verifyToken, requireAdmin, downloadPdf);

module.exports = router;