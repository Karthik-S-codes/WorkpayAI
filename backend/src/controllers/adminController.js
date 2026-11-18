const { query, withTransaction } = require('../config/db');

/**
 * Admin Dashboard Comprehensive Metrics (GET /api/admin/overview)
 * All numbers calculated in real-time from MySQL queries
 */
async function getAdminOverview(req, res, next) {
  try {
    // 1. User counts
    const userStats = await query(`
      SELECT
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role = 'worker' THEN 1 ELSE 0 END) as totalWorkers,
        SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as totalCustomers,
        SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as suspendedUsers
      FROM users
    `);

    // 2. Job counts
    const jobStats = await query(`
      SELECT
        COUNT(*) as totalJobs,
        SUM(CASE WHEN status IN ('open', 'applications_received', 'in_progress') THEN 1 ELSE 0 END) as activeJobs,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedJobs,
        SUM(CASE WHEN status = 'disputed' THEN 1 ELSE 0 END) as disputedJobs
      FROM jobs
    `);

    // 3. Financial volume
    const finStats = await query(`
      SELECT
        COALESCE(SUM(amount), 0) as totalGrossVolume,
        COALESCE(SUM(platform_fee), 0) as totalPlatformRevenue,
        COALESCE(SUM(net_amount), 0) as totalWorkerDisbursements,
        COUNT(*) as totalTransactions
      FROM transactions
      WHERE status = 'completed'
    `);

    // 4. Pending actions
    const pendingVerifications = await query('SELECT COUNT(*) as count FROM worker_profiles WHERE verification_status = "pending"');
    const pendingPayouts = await query('SELECT COUNT(*) as count FROM payout_requests WHERE status = "pending"');
    const activeDisputes = await query('SELECT COUNT(*) as count FROM disputes WHERE status IN ("open", "investigating")');
    const newFraudAlerts = await query('SELECT COUNT(*) as count FROM fraud_alerts WHERE status = "new"');

    // 5. Category Distribution
    const categoryDistribution = await query(`
      SELECT wc.name, COUNT(wp.id) as workerCount
      FROM worker_categories wc
      LEFT JOIN worker_profiles wp ON wc.id = wp.category_id
      GROUP BY wc.id
      ORDER BY workerCount DESC
    `);

    // 6. Transaction Trends (Last 6 Months)
    const transactionTrends = await query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(amount) as volume
      FROM transactions
      WHERE status = 'completed' AND created_at >= NOW() - INTERVAL 6 MONTH
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    return res.json({
      success: true,
      metrics: {
        users: userStats[0],
        jobs: jobStats[0],
        finance: finStats[0],
        pendingActions: {
          workerVerifications: pendingVerifications[0].count,
          payoutRequests: pendingPayouts[0].count,
          openDisputes: activeDisputes[0].count,
          fraudAlerts: newFraudAlerts[0].count
        }
      },
      categoryDistribution,
      transactionTrends
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List All Users with Filtering (GET /api/admin/users)
 */
async function listUsers(req, res, next) {
  try {
    const { role, status, search } = req.query;
    let sql = `
      SELECT u.id, u.email, u.role, u.full_name, u.phone, u.avatar_url, u.is_verified, u.is_active, u.created_at,
             wp.verification_status as worker_verification,
             wc.name as category_name
      FROM users u
      LEFT JOIN worker_profiles wp ON u.id = wp.user_id
      LEFT JOIN worker_categories wc ON wp.category_id = wc.id
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      sql += ' AND u.role = ?';
      params.push(role);
    }
    if (status === 'active') {
      sql += ' AND u.is_active = TRUE';
    } else if (status === 'suspended') {
      sql += ' AND u.is_active = FALSE';
    }
    if (search) {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY u.created_at DESC LIMIT 100';
    const users = await query(sql, params);

    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle User Suspension with Audit Trail (PUT /api/admin/users/:id/status)
 */
async function toggleUserStatus(req, res, next) {
  try {
    const targetUserId = req.params.id;
    const { is_active, reason } = req.body;

    const userRows = await query('SELECT full_name, email FROM users WHERE id = ?', [targetUserId]);
    if (!userRows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await withTransaction(async (conn) => {
      await conn.execute('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, targetUserId]);

      // Admin audit log
      await conn.execute(
        `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
         VALUES (?, ?, 'user', ?, ?)`,
        [
          req.user.id,
          is_active ? 'RESTORE_USER_ACCOUNT' : 'SUSPEND_USER_ACCOUNT',
          targetUserId,
          reason || 'Administrative policy enforcement'
        ]
      );
    });

    return res.json({
      success: true,
      message: `Account status for "${userRows[0].full_name}" updated to ${is_active ? 'Active' : 'Suspended'}.`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Worker Verification: Approve or Reject (PUT /api/admin/workers/:id/verify)
 */
async function verifyWorkerProfile(req, res, next) {
  try {
    const workerId = req.params.id;
    const { status, notes } = req.body; // 'verified' or 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be "verified" or "rejected".' });
    }

    const workerRows = await query('SELECT user_id FROM worker_profiles WHERE id = ?', [workerId]);
    if (!workerRows.length) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    await withTransaction(async (conn) => {
      await conn.execute(
        `UPDATE worker_profiles SET
          verification_status = ?,
          verification_notes = ?,
          updated_at = NOW()
         WHERE id = ?`,
        [status, notes || null, workerId]
      );

      // Notify worker
      await conn.execute(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, ?, ?, ?)`,
        [
          workerRows[0].user_id,
          status === 'verified' ? 'Worker Profile Verified!' : 'Profile Verification Update',
          status === 'verified' ? 'Congratulations! Your profile and credentials have been verified by WorkPay AI. The verified badge is now active.' : `Verification note: ${notes || 'Please resubmit valid trade credentials.'}`,
          status === 'verified' ? 'success' : 'warning'
        ]
      );

      // Audit log
      await conn.execute(
        `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
         VALUES (?, 'WORKER_VERIFICATION_AUDIT', 'worker_profile', ?, ?)`,
        [req.user.id, workerId, `Status set to ${status}. Notes: ${notes || 'None'}`]
      );
    });

    return res.json({ success: true, message: `Worker verification status updated to ${status}.` });
  } catch (error) {
    next(error);
  }
}

/**
 * List & Manage Worker Categories (GET / POST / PUT)
 */
async function listCategories(req, res, next) {
  try {
    const categories = await query('SELECT * FROM worker_categories ORDER BY name ASC');
    return res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, slug, description, icon, min_hourly_rate, max_hourly_rate, base_daily_rate } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Category name and slug are required.' });
    }

    const insertRes = await query(
      `INSERT INTO worker_categories (name, slug, description, icon, min_hourly_rate, max_hourly_rate, base_daily_rate)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description || null, icon || 'Wrench', min_hourly_rate || 150, max_hourly_rate || 800, base_daily_rate || 750]
    );

    return res.status(201).json({ success: true, message: 'Category created.', categoryId: insertRes.insertId });
  } catch (error) {
    next(error);
  }
}

/**
 * Review Payout Requests (GET / PUT /api/admin/payouts)
 */
async function listAllPayouts(req, res, next) {
  try {
    const payouts = await query(`
      SELECT pr.*, u.full_name as worker_name, u.phone as worker_phone, u.email as worker_email,
             w.available_balance as current_wallet_balance
      FROM payout_requests pr
      JOIN worker_profiles wp ON pr.worker_id = wp.id
      JOIN users u ON wp.user_id = u.id
      JOIN wallets w ON pr.wallet_id = w.id
      ORDER BY pr.requested_at DESC
    `);
    return res.json({ success: true, payouts });
  } catch (error) {
    next(error);
  }
}

async function updatePayoutStatus(req, res, next) {
  try {
    const payoutId = req.params.id;
    const { status, adminNotes, paymentReference } = req.body; // 'approved', 'completed', 'rejected'

    if (!['approved', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid payout status.' });
    }

    await withTransaction(async (conn) => {
      await conn.execute(
        `UPDATE payout_requests SET
          status = ?,
          admin_notes = ?,
          payment_reference = ?,
          processed_at = NOW()
         WHERE id = ?`,
        [status, adminNotes || null, paymentReference || `PAYOUT_REF_${Date.now()}`, payoutId]
      );

      // If rejected, refund the funds back to available wallet balance
      if (status === 'rejected') {
        const [pRows] = await conn.execute('SELECT wallet_id, amount FROM payout_requests WHERE id = ?', [payoutId]);
        if (pRows.length > 0) {
          const { wallet_id, amount } = pRows[0];
          await conn.execute('UPDATE wallets SET available_balance = available_balance + ? WHERE id = ?', [amount, wallet_id]);
          await conn.execute(
            `INSERT INTO wallet_ledger (wallet_id, entry_type, category, amount, balance_after, description)
             VALUES (?, 'credit', 'refund', ?, (SELECT available_balance FROM wallets WHERE id = ?), 'Refund of rejected payout request')`,
            [wallet_id, amount, wallet_id]
          );
        }
      }
    });

    return res.json({ success: true, message: `Payout request marked as ${status}.` });
  } catch (error) {
    next(error);
  }
}

/**
 * Fraud Alerts Review (GET / PUT /api/admin/fraud-alerts)
 */
async function listFraudAlerts(req, res, next) {
  try {
    const alerts = await query(`
      SELECT fa.*, u.full_name as user_name, u.email as user_email, u.role as user_role
      FROM fraud_alerts fa
      JOIN users u ON fa.user_id = u.id
      ORDER BY fa.created_at DESC LIMIT 100
    `);
    return res.json({ success: true, alerts });
  } catch (error) {
    next(error);
  }
}

async function updateFraudAlertStatus(req, res, next) {
  try {
    const alertId = req.params.id;
    const { status } = req.body; // 'under_review', 'dismissed', 'action_taken'

    await query('UPDATE fraud_alerts SET status = ?, updated_at = NOW() WHERE id = ?', [status, alertId]);
    return res.json({ success: true, message: `Fraud alert updated to ${status}.` });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminOverview,
  listUsers,
  toggleUserStatus,
  verifyWorkerProfile,
  listCategories,
  createCategory,
  listAllPayouts,
  updatePayoutStatus,
  listFraudAlerts,
  updateFraudAlertStatus
};

