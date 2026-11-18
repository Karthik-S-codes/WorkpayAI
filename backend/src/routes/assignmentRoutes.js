const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, assignmentController.getAssignments);
router.put('/:id/complete-worker', authenticate, assignmentController.markWorkerComplete);
router.put('/:id/confirm-customer', authenticate, assignmentController.confirmCustomerComplete);

module.exports = router;

