const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/me', authenticate, requireRole('customer'), customerController.getProfile);
router.put('/profile', authenticate, requireRole('customer'), customerController.updateProfile);
router.get('/me/dashboard', authenticate, requireRole('customer'), customerController.getCustomerDashboard);

module.exports = router;

