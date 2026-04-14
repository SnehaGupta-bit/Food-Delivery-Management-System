const express = require('express');
const router = express.Router();
const { updateLocation } = require('../controllers/trackingController');
// You might have a specific middleware for delivery agents here
const { protect } = require('../middleware/authMiddleware'); 

router.put('/location', protect, updateLocation);

module.exports = router;