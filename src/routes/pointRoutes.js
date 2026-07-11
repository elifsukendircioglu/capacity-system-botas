const express = require('express');
const router = express.Router();
const {
    addPoint,
    myPoints,
    listApprovedPoints,
    listPendingPoints,
    approvePoint,
    rejectPoint
} = require('../controllers/pointController');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, addPoint);
router.get('/mine', authMiddleware, myPoints);
router.get('/approved', authMiddleware, listApprovedPoints);

router.get('/pending', authMiddleware, requireAdmin, listPendingPoints);
router.patch('/:id/approve', authMiddleware, requireAdmin, approvePoint);
router.patch('/:id/reject', authMiddleware, requireAdmin, rejectPoint);

module.exports = router;