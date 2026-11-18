const { createPaymentOrder, verifyPaymentSignature, verifyWebhookSignature } = require('../services/fintech/paymentGateway');
const { processJobPayment } = require('../services/fintech/walletService');
const { generateInvoicePdf } = require('../services/fintech/invoiceGenerator');
const { query } = require('../config/db');

/**
 * Create Payment Order (POST /api/payments/create-order)
 */
async function createOrder(req, res, next) {
  try {
    const { jobId, workerId, amount, paymentMethod } = req.body;

    if (!workerId || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid worker ID and amount are required.' });
    }

    const receipt = `rcpt_wp_${Date.now()}`;
    const order = await createPaymentOrder({
      amount: parseFloat(amount),
      currency: 'INR',
      receipt,
      notes: {
        jobId: jobId || 'direct',
        workerId,
        customerId: req.user.customer_id
      }
    });

    return res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify and Finalize Payment (POST /api/payments/verify)
 */
async function verifyPayment(req, res, next) {
  try {
    const customerId = req.user.customer_id;
    if (!customerId) {
      return res.status(403).json({ success: false, message: 'Only customers can execute payments.' });
    }

    const {
      jobId,
      workerId,
      amount,
      orderId,
      paymentId,
      signature,
      paymentMethod = 'UPI - Instant Pay',
      idempotencyKey
    } = req.body;

    if (!orderId || !paymentId || !workerId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Payment ID, Worker ID, and Amount are required for cryptographic verification.'
      });
    }

    // Backend verification of payment signature
    const isValidSignature = verifyPaymentSignature({
      orderId,
      paymentId,
      signature
    });

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Cryptographic signature mismatch. Payment verification failed.'
      });
    }

    const txRef = `TXN_WP_${Date.now().toString(36).toUpperCase()}_${paymentId.slice(-6).toUpperCase()}`;
    const platformFee = Math.round((parseFloat(amount) * 0.05) * 100) / 100; // 5% standard transparent platform fee

    const paymentResult = await processJobPayment({
      transactionReference: txRef,
      jobId: jobId ? parseInt(jobId, 10) : null,
      customerId,
      workerId: parseInt(workerId, 10),
      amount: parseFloat(amount),
      platformFee,
      paymentMethod,
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentId,
      gatewaySignature: signature,
      idempotencyKey: idempotencyKey || `idemp_${orderId}_${paymentId}`
    });

    return res.json({
      success: true,
      message: 'Payment verified and settled into worker digital ledger successfully.',
      result: paymentResult
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Payment Webhook (POST /api/payments/webhook)
 */
async function handleWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const isWebhookValid = verifyWebhookSignature({
      body: req.body,
      signature
    });

    if (!isWebhookValid) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const event = req.body.event;
    console.log(`[Payment Webhook Received]: ${event}`);

    return res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Payment History (GET /api/payments/history)
 */
async function getPaymentHistory(req, res, next) {
  try {
    const role = req.user.role;
    let sql = '';
    let params = [];

    if (role === 'customer') {
      sql = `
        SELECT t.*, j.title as job_title, u.full_name as worker_name, inv.invoice_number
        FROM transactions t
        LEFT JOIN jobs j ON t.job_id = j.id
        JOIN worker_profiles wp ON t.worker_id = wp.id
        JOIN users u ON wp.user_id = u.id
        LEFT JOIN invoices inv ON t.id = inv.transaction_id
        WHERE t.customer_id = ?
        ORDER BY t.created_at DESC
      `;
      params = [req.user.customer_id];
    } else if (role === 'worker') {
      sql = `
        SELECT t.*, j.title as job_title, u.full_name as customer_name, inv.invoice_number
        FROM transactions t
        LEFT JOIN jobs j ON t.job_id = j.id
        JOIN customer_profiles cp ON t.customer_id = cp.id
        JOIN users u ON cp.user_id = u.id
        LEFT JOIN invoices inv ON t.id = inv.transaction_id
        WHERE t.worker_id = ?
        ORDER BY t.created_at DESC
      `;
      params = [req.user.worker_id];
    } else {
      // Admin
      sql = `
        SELECT t.*, j.title as job_title, uc.full_name as customer_name, uw.full_name as worker_name, inv.invoice_number
        FROM transactions t
        LEFT JOIN jobs j ON t.job_id = j.id
        JOIN customer_profiles cp ON t.customer_id = cp.id
        JOIN users uc ON cp.user_id = uc.id
        JOIN worker_profiles wp ON t.worker_id = wp.id
        JOIN users uw ON wp.user_id = uw.id
        LEFT JOIN invoices inv ON t.id = inv.transaction_id
        ORDER BY t.created_at DESC LIMIT 100
      `;
    }

    const transactions = await query(sql, params);
    return res.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    next(error);
  }
}

/**
 * Download Invoice PDF (GET /api/payments/invoice/:invoiceNumber/pdf)
 */
async function downloadInvoicePdf(req, res, next) {
  try {
    const invoiceNumber = req.params.invoiceNumber;

    const rows = await query(
      `SELECT
        inv.*,
        t.transaction_reference,
        t.payment_method,
        j.title as job_title,
        j.payment_type,
        wc.name as worker_category,
        uc.full_name as customer_name,
        uc.phone as customer_phone,
        cp.address as customer_address,
        uw.full_name as worker_name,
        uw.phone as worker_phone
       FROM invoices inv
       JOIN transactions t ON inv.transaction_id = t.id
       LEFT JOIN jobs j ON inv.job_id = j.id
       JOIN customer_profiles cp ON inv.customer_id = cp.id
       JOIN users uc ON cp.user_id = uc.id
       JOIN worker_profiles wp ON inv.worker_id = wp.id
       JOIN users uw ON wp.user_id = uw.id
       LEFT JOIN worker_categories wc ON wp.category_id = wc.id
       WHERE inv.invoice_number = ?`,
      [invoiceNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const invoice = rows[0];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoiceNumber}.pdf`);

    generateInvoicePdf(invoice, res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  downloadInvoicePdf
};

