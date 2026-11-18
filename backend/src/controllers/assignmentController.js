const { query } = require('../config/db');

/**
 * Get Job Assignments (GET /api/assignments)
 */
async function getAssignments(req, res, next) {
  try {
    const role = req.user.role;
    let sql = '';
    let params = [];

    if (role === 'worker') {
      sql = `
        SELECT ja.*, j.title as job_title, j.description as job_description, j.location as job_location,
               u.full_name as customer_name, u.phone as customer_phone
        FROM job_assignments ja
        LEFT JOIN jobs j ON ja.job_id = j.id
        JOIN customer_profiles cp ON ja.customer_id = cp.id
        JOIN users u ON cp.user_id = u.id
        WHERE ja.worker_id = ?
        ORDER BY ja.created_at DESC
      `;
      params = [req.user.worker_id];
    } else if (role === 'customer') {
      sql = `
        SELECT ja.*, j.title as job_title, j.location as job_location,
               u.full_name as worker_name, u.phone as worker_phone, u.avatar_url as worker_avatar,
               wc.name as category_name
        FROM job_assignments ja
        LEFT JOIN jobs j ON ja.job_id = j.id
        JOIN worker_profiles wp ON ja.worker_id = wp.id
        JOIN users u ON wp.user_id = u.id
        LEFT JOIN worker_categories wc ON wp.category_id = wc.id
        WHERE ja.customer_id = ?
        ORDER BY ja.created_at DESC
      `;
      params = [req.user.customer_id];
    } else {
      sql = 'SELECT ja.* FROM job_assignments ja ORDER BY ja.created_at DESC LIMIT 50';
    }

    const assignments = await query(sql, params);
    return res.json({ success: true, count: assignments.length, assignments });
  } catch (error) {
    next(error);
  }
}

/**
 * Worker Marks Work As Completed (PUT /api/assignments/:id/complete-worker)
 */
async function markWorkerComplete(req, res, next) {
  try {
    const assignmentId = req.params.id;
    const workerId = req.user.worker_id;

    const rows = await query('SELECT * FROM job_assignments WHERE id = ? AND worker_id = ?', [assignmentId, workerId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found or unauthorized.' });
    }

    await query(
      `UPDATE job_assignments SET
        worker_confirmed_completion = TRUE,
        status = 'worker_completed',
        completion_date = CURDATE()
       WHERE id = ?`,
      [assignmentId]
    );

    // Notify customer
    const custUser = await query('SELECT user_id FROM customer_profiles WHERE id = ?', [rows[0].customer_id]);
    if (custUser.length > 0) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, reference_id)
         VALUES (?, 'Work Completed by Specialist', 'Worker has marked the assignment as complete. Please inspect and confirm to release payment.', 'job', ?)`,
        [custUser[0].user_id, String(assignmentId)]
      );
    }

    return res.json({
      success: true,
      message: 'Work marked as completed. Awaiting client sign-off and payment verification.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Customer Confirms Completion (PUT /api/assignments/:id/confirm-customer)
 */
async function confirmCustomerComplete(req, res, next) {
  try {
    const assignmentId = req.params.id;
    const customerId = req.user.customer_id;

    const rows = await query('SELECT * FROM job_assignments WHERE id = ? AND customer_id = ?', [assignmentId, customerId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found or unauthorized.' });
    }

    await query(
      `UPDATE job_assignments SET
        customer_confirmed_completion = TRUE,
        status = 'fully_completed'
       WHERE id = ?`,
      [assignmentId]
    );

    if (rows[0].job_id) {
      await query("UPDATE jobs SET status = 'completed' WHERE id = ?", [rows[0].job_id]);
    }

    return res.json({
      success: true,
      message: 'Assignment confirmed complete! You can now proceed to digital payment and leave a rating review.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAssignments,
  markWorkerComplete,
  confirmCustomerComplete
};

