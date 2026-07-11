const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { addCapacity, myCapacities, listPoints, downloadMyPdf } = require('../controllers/capacityController');

router.post('/', verifyToken, addCapacity);
router.get('/', verifyToken, myCapacities);
router.get('/points', verifyToken, listPoints);
router.get('/mine/pdf', verifyToken, downloadMyPdf);

module.exports = router;
