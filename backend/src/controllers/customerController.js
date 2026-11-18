const { query } = require('../config/db');

/**
 * Get Customer Profile (GET /api/customers/me)
 */
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const rows = await query(
      `SELECT cp.*, u.full_name, u.email, u.phone, u.avatar_url
       FROM customer_profiles cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    return res.json({ success: true, customer: rows[0] });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Customer Profile (PUT /api/customers/profile)
 */
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { full_name, phone, address, preferred_location } = req.body;

    if (full_name || phone) {
      await query(
        'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?',
        [full_name, phone, userId]
      );
    }

    await query(
      'UPDATE customer_profiles SET address = COALESCE(?, address), preferred_location = COALESCE(?, preferred_location) WHERE user_id = ?',
      [address, preferred_location, userId]
    );

    return res.json({ success: true, message: 'Customer profile updated successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Customer Dashboard Overview (GET /api/customers/me/dashboard)
 */
async function getCustomerDashboard(req, res, next) {
  try {
    const userId = req.user.id;
    const custRows = await query('SELECT id FROM customer_profiles WHERE user_id = ?', [userId]);
    if (!custRows.length) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }
    const customerId = custRows[0].id;

    // Real Metrics from MySQL
    const totalJobs = await query('SELECT COUNT(*) as count FROM jobs WHERE customer_id = ?', [customerId]);
    const activeJobs = await query('SELECT COUNT(*) as count FROM jobs WHERE customer_id = ? AND status IN ("open", "applications_received", "in_progress")', [customerId]);
    const completedJobs = await query('SELECT COUNT(*) as count FROM jobs WHERE customer_id = ? AND status = "completed"', [customerId]);
    const pendingHires = await query('SELECT COUNT(*) as count FROM hiring_requests WHERE customer_id = ? AND status = "pending"', [customerId]);

    // Recent Transactions
    const recentTx = await query(
      `SELECT t.*, j.title as job_title, u.full_name as worker_name
       FROM transactions t
       LEFT JOIN jobs j ON t.job_id = j.id
       LEFT JOIN worker_profiles wp ON t.worker_id = wp.id
       LEFT JOIN users u ON wp.user_id = u.id
       WHERE t.customer_id = ?
       ORDER BY t.created_at DESC LIMIT 5`,
      [customerId]
    );

    // Recent Jobs
    const recentJobs = await query(
      `SELECT j.*, wc.name as category_name,
        (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as application_count
       FROM jobs j
       JOIN worker_categories wc ON j.category_id = wc.id
       WHERE j.customer_id = ?
       ORDER BY j.created_at DESC LIMIT 5`,
      [customerId]
    );

    return res.json({
      success: true,
      dashboard: {
        metrics: {
          totalJobsPosted: totalJobs[0].count,
          activeJobs: activeJobs[0].count,
          completedJobs: completedJobs[0].count,
          pendingHiringRequests: pendingHires[0].count
        },
        recentJobs,
        recentTransactions: recentTx
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getCustomerDashboard
};

