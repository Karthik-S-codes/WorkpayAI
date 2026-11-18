const express = require('express');
const router = express.Router();
const hiringController = require('../controllers/hiringController');
const { authenticate } = require('../middleware/auth');

router.post('/request', authenticate, hiringController.createHiringRequest);
router.get('/requests', authenticate, hiringController.getHiringRequests);
router.put('/requests/:id/respond', authenticate, hiringController.respondToHiringRequest);

module.exports = router;

