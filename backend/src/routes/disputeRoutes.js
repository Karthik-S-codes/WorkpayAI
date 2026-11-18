const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/', authenticate, disputeController.createDispute);
router.get('/', authenticate, disputeController.getDisputes);
router.put('/:id/resolve', authenticate, requireRole('admin'), disputeController.resolveDispute);

module.exports = router;

