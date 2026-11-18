const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/', authenticate, requireRole('customer'), jobController.createJob);
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);
router.put('/:id', authenticate, jobController.updateJob);
router.delete('/:id', authenticate, jobController.deleteJob);
router.post('/:id/apply', authenticate, requireRole('worker'), jobController.applyForJob);

module.exports = router;

