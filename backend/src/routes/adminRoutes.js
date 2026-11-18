const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('admin'));

router.get('/overview', adminController.getAdminOverview);
router.get('/users', adminController.listUsers);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.put('/workers/:id/verify', adminController.verifyWorkerProfile);
router.get('/categories', adminController.listCategories);
router.post('/categories', adminController.createCategory);
router.get('/payouts', adminController.listAllPayouts);
router.put('/payouts/:id', adminController.updatePayoutStatus);
router.get('/fraud-alerts', adminController.listFraudAlerts);
router.put('/fraud-alerts/:id', adminController.updateFraudAlertStatus);

module.exports = router;

