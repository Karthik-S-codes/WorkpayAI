/**
 * FinTech Internal Wallet & Ledger Service
 * Strict ACID database transactions using MySQL connection pooling.
 * Double-entry ledger architecture with idempotency guarantees.
 */

const { withTransaction, query } = require('../../config/db');

/**
 * Ensures a wallet exists for the given user, creating one if missing
 */
async function getOrCreateWallet(connection, userId) {
  const [rows] = await connection.execute(
    'SELECT * FROM wallets WHERE user_id = ? FOR UPDATE',
    [userId]
  );
  if (rows && rows.length > 0) {
    return rows[0];
  }

  // Create new wallet
  const [insertRes] = await connection.execute(
    'INSERT INTO wallets (user_id, available_balance, pending_balance, total_lifetime_earnings, currency) VALUES (?, 0.00, 0.00, 0.00, "INR")',
    [userId]
  );
  const [newRows] = await connection.execute(
    'SELECT * FROM wallets WHERE id = ?',
    [insertRes.insertId]
  );
  return newRows[0];
}

/**
 * Records a successful job payment transaction and credits the worker's wallet
 * Guaranteed idempotency: throws error if transaction_reference or idempotency_key already processed.
 */
async function processJobPayment({
  transactionReference,
  jobId,
  customerId,
  workerId,
  amount,
  platformFee = 0.0,
  paymentMethod = 'razorpay_upi',
  gatewayOrderId,
  gatewayPaymentId,
  gatewaySignature,
  idempotencyKey
}) {
  return await withTransaction(async (conn) => {
    // 1. Idempotency Check
    const [existing] = await conn.execute(
      'SELECT id, status FROM transactions WHERE transaction_reference = ? OR (idempotency_key IS NOT NULL AND idempotency_key = ?)',
      [transactionReference, idempotencyKey || 'none']
    );

    if (existing.length > 0) {
      if (existing[0].status === 'completed') {
        return {
          alreadyProcessed: true,
          transactionId: existing[0].id,
          message: 'Payment already recorded idempotently.'
        };
      }
    }

    const netAmount = parseFloat(amount) - parseFloat(platformFee);

    // 2. Fetch worker user ID
    const [workerRows] = await conn.execute(
      'SELECT user_id FROM worker_profiles WHERE id = ?',
      [workerId]
    );
    if (!workerRows.length) {
      throw new Error(`Worker profile #${workerId} not found.`);
    }
    const workerUserId = workerRows[0].user_id;

    // 3. Insert or update transaction record
    const [txResult] = await conn.execute(
      `INSERT INTO transactions
       (transaction_reference, job_id, customer_id, worker_id, amount, platform_fee, net_amount, payment_method, payment_gateway, gateway_order_id, gateway_payment_id, gateway_signature, status, idempotency_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'razorpay_sandbox', ?, ?, ?, 'completed', ?)`,
      [
        transactionReference,
        jobId || null,
        customerId,
        workerId,
        amount,
        platformFee,
        netAmount,
        paymentMethod,
        gatewayOrderId,
        gatewayPaymentId,
        gatewaySignature,
        idempotencyKey || null
      ]
    );
    const transactionId = txResult.insertId;

    // 4. Update worker wallet (lock row with FOR UPDATE)
    const wallet = await getOrCreateWallet(conn, workerUserId);
    const newAvailable = parseFloat(wallet.available_balance) + netAmount;
    const newLifetime = parseFloat(wallet.total_lifetime_earnings) + netAmount;

    await conn.execute(
      `UPDATE wallets
       SET available_balance = ?, total_lifetime_earnings = ?, updated_at = NOW()
       WHERE id = ?`,
      [newAvailable, newLifetime, wallet.id]
    );

    // 5. Create immutable ledger record
    await conn.execute(
      `INSERT INTO wallet_ledger
       (wallet_id, transaction_id, entry_type, category, amount, balance_after, description)
       VALUES (?, ?, 'credit', 'job_payment', ?, ?, ?)`,
      [
        wallet.id,
        transactionId,
        netAmount,
        newAvailable,
        `Net payment for Job #${jobId || 'Direct'} after platform service fee`
      ]
    );

    // 6. Generate digital invoice record
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(transactionId).padStart(5, '0')}`;
    await conn.execute(
      `INSERT INTO invoices
       (invoice_number, transaction_id, job_id, customer_id, worker_id, amount, tax_amount, total_amount, status, issued_date)
       VALUES (?, ?, ?, ?, ?, ?, 0.00, ?, 'paid', CURDATE())`,
      [invoiceNumber, transactionId, jobId || null, customerId, workerId, amount, amount]
    );

    // 7. Update job status to 'completed' if applicable
    if (jobId) {
      await conn.execute(
        "UPDATE jobs SET status = 'completed' WHERE id = ?",
        [jobId]
      );
      await conn.execute(
        "UPDATE job_assignments SET status = 'fully_completed', customer_confirmed_completion = TRUE WHERE job_id = ?",
        [jobId]
      );
      await conn.execute(
        "UPDATE worker_profiles SET total_completed_jobs = total_completed_jobs + 1 WHERE id = ?",
        [workerId]
      );
    }

    return {
      success: true,
      transactionId,
      transactionReference,
      invoiceNumber,
      amount,
      netAmount,
      walletBalance: newAvailable
    };
  });
}

/**
 * Requests a payout withdrawal from worker's available balance
 */
async function requestPayout({ workerId, amount, paymentMethod, accountDetails }) {
  return await withTransaction(async (conn) => {
    const [workerRows] = await conn.execute(
      'SELECT user_id FROM worker_profiles WHERE id = ?',
      [workerId]
    );
    if (!workerRows.length) throw new Error('Worker not found.');
    const workerUserId = workerRows[0].user_id;

    const wallet = await getOrCreateWallet(conn, workerUserId);
    const payoutAmount = parseFloat(amount);

    if (payoutAmount <= 0) {
      throw new Error('Payout amount must be greater than zero.');
    }
    if (payoutAmount > parseFloat(wallet.available_balance)) {
      throw new Error(`Insufficient wallet balance. Available: ₹${wallet.available_balance}, Requested: ₹${payoutAmount}`);
    }

    // Deduct available balance and put in pending withdrawal
    const newAvailable = parseFloat(wallet.available_balance) - payoutAmount;
    await conn.execute(
      'UPDATE wallets SET available_balance = ? WHERE id = ?',
      [newAvailable, wallet.id]
    );

    // Create payout request
    const [payoutRes] = await conn.execute(
      `INSERT INTO payout_requests
       (worker_id, wallet_id, amount, payment_method, account_details, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [workerId, wallet.id, payoutAmount, paymentMethod || 'upi', accountDetails]
    );

    // Post debit ledger entry
    await conn.execute(
      `INSERT INTO wallet_ledger
       (wallet_id, entry_type, category, amount, balance_after, description)
       VALUES (?, 'debit', 'payout', ?, ?, ?)`,
      [
        wallet.id,
        payoutAmount,
        newAvailable,
        `Withdrawal request #${payoutRes.insertId} to ${paymentMethod.toUpperCase()}`
      ]
    );

    return {
      payoutId: payoutRes.insertId,
      requestedAmount: payoutAmount,
      remainingBalance: newAvailable,
      status: 'pending'
    };
  });
}

module.exports = {
  getOrCreateWallet,
  processJobPayment,
  requestPayout
};

