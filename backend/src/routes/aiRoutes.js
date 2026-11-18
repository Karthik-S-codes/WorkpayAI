const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.post('/match-workers', aiController.matchWorkersForJob);
router.post('/predict-salary', aiController.predictSalaryEndpoint);
router.post('/chat', aiController.chatEndpoint);
router.post('/build-profile', aiController.buildProfileEndpoint);
router.post('/recommend-skills', aiController.recommendSkillsEndpoint);
router.get('/check-fraud/:userId', authenticate, aiController.checkFraudEndpoint);
router.post('/analyze-reviews', aiController.analyzeReviewsEndpoint);
router.post('/generate-job-desc', aiController.generateJobDescEndpoint);
router.get('/income-insights/:workerId', authenticate, aiController.incomeInsightsEndpoint);
router.post('/parse-voice-search', aiController.parseVoiceSearchEndpoint);

module.exports = router;

