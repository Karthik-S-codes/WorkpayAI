const { query, withTransaction } = require('../config/db');

/**
 * Send Hiring Request (POST /api/hiring/request)
 */
async function createHiringRequest(req, res, next) {
  try {
    const customerId = req.user.customer_id;
    if (!customerId) {
      return res.status(403).json({ success: false, message: 'Only customers can send hiring requests.' });
    }

    const { worker_id, job_id, offered_rate, payment_type, message } = req.body;

    if (!worker_id || !offered_rate) {
      return res.status(400).json({ success: false, message: 'Worker ID and offered rate are required.' });
    }

    const insertRes = await query(
      `INSERT INTO hiring_requests (customer_id, worker_id, job_id, offered_rate, payment_type, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [customerId, worker_id, job_id || null, offered_rate, payment_type || 'per_job', message || 'We would like to hire you for our project.']
    );

    // Notify worker
    const workerUser = await query('SELECT user_id FROM worker_profiles WHERE id = ?', [worker_id]);
    if (workerUser.length > 0) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, reference_id)
         VALUES (?, 'New Hiring Offer Received!', 'A customer has sent you a direct hiring request.', 'job', ?)`,
        [workerUser[0].user_id, String(insertRes.insertId)]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Hiring request dispatched to worker successfully.',
      requestId: insertRes.insertId
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List Hiring Requests (GET /api/hiring/requests)
 */
async function getHiringRequests(req, res, next) {
  try {
    const role = req.user.role;
    let sql = '';
    let params = [];

    if (role === 'customer') {
      sql = `
        SELECT hr.*, 
               j.title as job_title,
               j.status as job_status,
               ja.status as assignment_status,
               (SELECT inv.invoice_number 
                FROM invoices inv 
                JOIN transactions t ON inv.transaction_id = t.id 
                WHERE t.job_id = hr.job_id AND t.status = 'completed' 
                ORDER BY t.id DESC LIMIT 1) as invoice_number,
               (SELECT COUNT(*) 
                FROM transactions t 
                WHERE t.job_id = hr.job_id AND t.status = 'completed') as paid_count,
               wp.expected_salary, wp.experience_years, wp.rating_avg, 
               u.full_name as worker_name, u.avatar_url as worker_avatar, u.phone as worker_phone, 
               wc.name as category_name
        FROM hiring_requests hr
        JOIN worker_profiles wp ON hr.worker_id = wp.id
        JOIN users u ON wp.user_id = u.id
        LEFT JOIN worker_categories wc ON wp.category_id = wc.id
        LEFT JOIN jobs j ON hr.job_id = j.id
        LEFT JOIN job_assignments ja ON hr.job_id = ja.job_id
        WHERE hr.customer_id = ?
        ORDER BY hr.created_at DESC
      `;
      params = [req.user.customer_id];
    } else if (role === 'worker') {
      sql = `
        SELECT hr.*, u.full_name as customer_name, u.phone as customer_phone, cp.address as customer_address, j.title as job_title
        FROM hiring_requests hr
        JOIN customer_profiles cp ON hr.customer_id = cp.id
        JOIN users u ON cp.user_id = u.id
        LEFT JOIN jobs j ON hr.job_id = j.id
        WHERE hr.worker_id = ?
        ORDER BY hr.created_at DESC
      `;
      params = [req.user.worker_id];
    } else {
      // Admin
      sql = 'SELECT * FROM hiring_requests ORDER BY created_at DESC LIMIT 50';
    }

    const requests = await query(sql, params);

    return res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Worker Responds to Hiring Request (PUT /api/hiring/requests/:id/respond)
 */
async function respondToHiringRequest(req, res, next) {
  try {
    const requestId = req.params.id;
    const workerId = req.user.worker_id;
    const { action } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be "accepted" or "rejected".' });
    }

    const reqRows = await query('SELECT * FROM hiring_requests WHERE id = ? AND worker_id = ?', [requestId, workerId]);
    if (reqRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hiring request not found or unauthorized.' });
    }
    const hRequest = reqRows[0];

    if (hRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${hRequest.status}.` });
    }

    await withTransaction(async (conn) => {
      let jobId = hRequest.job_id;

      if (action === 'accepted') {
        // If this direct hire offer did not originate from a job posting, create a direct-hire job record
        if (!jobId) {
          const [wRows] = await conn.execute(
            'SELECT category_id, preferred_location FROM worker_profiles WHERE id = ?',
            [workerId]
          );
          const [cRows] = await conn.execute(
            'SELECT address, preferred_location FROM customer_profiles WHERE id = ?',
            [hRequest.customer_id]
          );

          const categoryId = wRows[0]?.category_id || 1;
          const location = cRows[0]?.preferred_location || cRows[0]?.address || 'Bengaluru';
          const jobTitle = hRequest.message
            ? (hRequest.message.length > 60 ? hRequest.message.substring(0, 57) + '...' : hRequest.message)
            : 'Direct Trade Hiring Service';

          const [jobInsert] = await conn.execute(
            `INSERT INTO jobs 
             (customer_id, category_id, title, description, location, budget, payment_type, start_date, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), 'accepted')`,
            [
              hRequest.customer_id,
              categoryId,
              jobTitle,
              hRequest.message || 'Direct customer hire assignment',
              location,
              hRequest.offered_rate,
              hRequest.payment_type
            ]
          );
          jobId = jobInsert.insertId;

          await conn.execute('UPDATE hiring_requests SET job_id = ? WHERE id = ?', [jobId, requestId]);
        } else {
          await conn.execute("UPDATE jobs SET status = 'accepted' WHERE id = ?", [jobId]);
        }

        // Create active job assignment
        await conn.execute(
          `INSERT INTO job_assignments
           (job_id, worker_id, customer_id, agreed_rate, payment_type, start_date, status)
           VALUES (?, ?, ?, ?, ?, CURDATE(), 'active')`,
          [jobId, workerId, hRequest.customer_id, hRequest.offered_rate, hRequest.payment_type]
        );
      }

      await conn.execute('UPDATE hiring_requests SET status = ?, updated_at = NOW() WHERE id = ?', [action, requestId]);
    });

    return res.json({
      success: true,
      message: `Hiring offer ${action} successfully.`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createHiringRequest,
  getHiringRequests,
  respondToHiringRequest
};

