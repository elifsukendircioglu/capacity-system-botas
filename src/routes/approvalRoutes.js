const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/roleMiddleware');
const {
    listPending,
    getEntryWithReserve,
    approveEntry,
    rejectEntry
} = require('../controllers/approvalController');

router.get('/', verifyToken, requireAdmin, listPending);
router.get('/:id', verifyToken, requireAdmin, getEntryWithReserve);
router.put('/:id/approve', verifyToken, requireAdmin, approveEntry);
router.put('/:id/reject', verifyToken, requireAdmin, rejectEntry);

module.exports = router;