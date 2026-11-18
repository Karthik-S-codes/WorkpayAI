const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/create-order', authenticate, paymentController.createOrder);
router.post('/verify', authenticate, paymentController.verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);
router.get('/history', authenticate, paymentController.getPaymentHistory);
router.get('/invoice/:invoiceNumber/pdf', paymentController.downloadInvoicePdf);

module.exports = router;

