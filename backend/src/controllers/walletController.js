const { query } = require('../config/db');
const { getOrCreateWallet, requestPayout } = require('../services/fintech/walletService');

/**
 * Get Wallet Balance and Summary (GET /api/wallet)
 */
async function getWallet(req, res, next) {
  try {
    const userId = req.user.id;
    const walletRows = await query('SELECT * FROM wallets WHERE user_id = ?', [userId]);

    let wallet = walletRows[0];
    if (!wallet) {
      await query('INSERT INTO wallets (user_id, available_balance, pending_balance, total_lifetime_earnings) VALUES (?, 0, 0, 0)', [userId]);
      const created = await query('SELECT * FROM wallets WHERE user_id = ?', [userId]);
      wallet = created[0];
    }

    return res.json({ success: true, wallet });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Detailed Wallet Ledger History (GET /api/wallet/ledger)
 */
async function getLedger(req, res, next) {
  try {
    const userId = req.user.id;
    const walletRows = await query('SELECT id FROM wallets WHERE user_id = ?', [userId]);
    if (!walletRows.length) {
      return res.json({ success: true, ledger: [] });
    }

    const ledger = await query(
      `SELECT wl.*, t.transaction_reference, t.payment_method
       FROM wallet_ledger wl
       LEFT JOIN transactions t ON wl.transaction_id = t.id
       WHERE wl.wallet_id = ?
       ORDER BY wl.created_at DESC LIMIT 50`,
      [walletRows[0].id]
    );

    return res.json({ success: true, ledger });
  } catch (error) {
    next(error);
  }
}

/**
 * Worker Requests a Payout (POST /api/wallet/payout-request)
 */
async function submitPayoutRequest(req, res, next) {
  try {
    const workerId = req.user.worker_id;
    if (!workerId) {
      return res.status(403).json({ success: false, message: 'Only workers can request payout withdrawals.' });
    }

    const { amount, paymentMethod, accountDetails } = req.body;

    if (!amount || !accountDetails) {
      return res.status(400).json({ success: false, message: 'Amount and payout destination details (UPI or Bank) are required.' });
    }

    const result = await requestPayout({
      workerId,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'upi',
      accountDetails
    });

    return res.status(201).json({
      success: true,
      message: 'Payout withdrawal requested. Our admin finance team will review and process the transfer.',
      result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List Worker's Payout Requests (GET /api/wallet/payouts)
 */
async function getPayouts(req, res, next) {
  try {
    const workerId = req.user.worker_id;
    const payouts = await query(
      'SELECT * FROM payout_requests WHERE worker_id = ? ORDER BY requested_at DESC',
      [workerId]
    );
    return res.json({ success: true, payouts });
  } catch (error) {
    next(error);
  }
}

/**
 * Log a Worker Expense (POST /api/wallet/expenses)
 */
async function logExpense(req, res, next) {
  try {
    const workerId = req.user.worker_id;
    if (!workerId) {
      return res.status(403).json({ success: false, message: 'Only workers can log trade expenses.' });
    }

    const { category, title, amount, expense_date, notes } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ success: false, message: 'Expense title and amount are required.' });
    }

    const insertRes = await query(
      `INSERT INTO worker_expenses (worker_id, category, title, amount, expense_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workerId, category || 'Tools & Supplies', title.trim(), parseFloat(amount), expense_date || new Date().toISOString().slice(0, 10), notes || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Expense recorded successfully.',
      expenseId: insertRes.insertId
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Worker Expenses (GET /api/wallet/expenses)
 */
async function getExpenses(req, res, next) {
  try {
    const workerId = req.user.worker_id;
    const expenses = await query(
      'SELECT * FROM worker_expenses WHERE worker_id = ? ORDER BY expense_date DESC',
      [workerId]
    );
    return res.json({ success: true, expenses });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWallet,
  getLedger,
  submitPayoutRequest,
  getPayouts,
  logExpense,
  getExpenses
};

