const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, walletController.getWallet);
router.get('/ledger', authenticate, walletController.getLedger);
router.post('/payout-request', authenticate, walletController.submitPayoutRequest);
router.get('/payouts', authenticate, walletController.getPayouts);
router.post('/expenses', authenticate, walletController.logExpense);
router.get('/expenses', authenticate, walletController.getExpenses);

module.exports = router;

