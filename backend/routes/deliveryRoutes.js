const express = require('express');
const router = express.Router();
const { assignDelivery } = require('../controllers/deliveryController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.post('/assign', protect, adminOnly, assignDelivery);


module.exports = router;