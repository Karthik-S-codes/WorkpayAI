const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', workerController.listWorkers);
router.get('/:id', workerController.getWorkerById);
router.put('/profile', authenticate, requireRole('worker'), workerController.updateProfile);
router.get('/me/dashboard', authenticate, requireRole('worker'), workerController.getWorkerDashboard);
router.post('/availability', authenticate, requireRole('worker'), workerController.manageAvailability);
router.post('/certificates', authenticate, requireRole('worker'), workerController.uploadCertificate);

module.exports = router;

