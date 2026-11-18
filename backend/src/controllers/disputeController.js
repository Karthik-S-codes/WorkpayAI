const { query, withTransaction } = require('../config/db');

/**
 * Raise a Dispute (POST /api/disputes)
 */
async function createDispute(req, res, next) {
  try {
    const userId = req.user.id;
    const { jobId, transactionId, againstUserId, reason, details } = req.body;

    if (!jobId || !againstUserId || !reason || !details) {
      return res.status(400).json({
        success: false,
        message: 'Job ID, respondent user ID, reason, and dispute details are required.'
      });
    }

    const insertRes = await query(
      `INSERT INTO disputes
       (job_id, transaction_id, raised_by_user_id, against_user_id, reason, details, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')`,
      [jobId, transactionId || null, userId, againstUserId, reason, details]
    );

    // Update job status to 'disputed'
    await query("UPDATE jobs SET status = 'disputed' WHERE id = ?", [jobId]);

    // Notify respondent
    await query(
      `INSERT INTO notifications (user_id, title, message, type, reference_id)
       VALUES (?, 'Dispute Filed on Project', 'A dispute has been submitted regarding project quality or payment. Admin team is mediating.', 'warning', ?)`,
      [againstUserId, String(insertRes.insertId)]
    );

    return res.status(201).json({
      success: true,
      message: 'Dispute submitted. A platform administrator has been assigned to mediate.',
      disputeId: insertRes.insertId
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Disputes for current user (GET /api/disputes)
 */
async function getDisputes(req, res, next) {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let sql = '';
    let params = [];

    if (role === 'admin') {
      sql = `
        SELECT d.*, j.title as job_title,
               ur.full_name as raised_by_name, ur.role as raised_by_role,
               ua.full_name as against_name, ua.role as against_role,
               t.amount as transaction_amount
        FROM disputes d
        JOIN jobs j ON d.job_id = j.id
        JOIN users ur ON d.raised_by_user_id = ur.id
        JOIN users ua ON d.against_user_id = ua.id
        LEFT JOIN transactions t ON d.transaction_id = t.id
        ORDER BY d.created_at DESC
      `;
    } else {
      sql = `
        SELECT d.*, j.title as job_title,
               ur.full_name as raised_by_name,
               ua.full_name as against_name
        FROM disputes d
        JOIN jobs j ON d.job_id = j.id
        JOIN users ur ON d.raised_by_user_id = ur.id
        JOIN users ua ON d.against_user_id = ua.id
        WHERE d.raised_by_user_id = ? OR d.against_user_id = ?
        ORDER BY d.created_at DESC
      `;
      params = [userId, userId];
    }

    const disputes = await query(sql, params);
    return res.json({ success: true, count: disputes.length, disputes });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin Resolves a Dispute (PUT /api/disputes/:id/resolve)
 */
async function resolveDispute(req, res, next) {
  try {
    const disputeId = req.params.id;
    const { status, resolutionNotes, refundAmount } = req.body;

    if (!['investigating', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid dispute status.' });
    }

    await withTransaction(async (conn) => {
      await conn.execute(
        `UPDATE disputes SET
          status = ?,
          resolution_notes = ?,
          refund_amount = ?,
          updated_at = NOW()
         WHERE id = ?`,
        [status, resolutionNotes || null, parseFloat(refundAmount || 0), disputeId]
      );

      // If refund is issued:
      if (parseFloat(refundAmount) > 0) {
        const [dispRows] = await conn.execute('SELECT * FROM disputes WHERE id = ?', [disputeId]);
        if (dispRows.length > 0 && dispRows[0].transaction_id) {
          const disp = dispRows[0];
          await conn.execute(
            `INSERT INTO refunds (dispute_id, transaction_id, customer_id, amount, reason, status)
             VALUES (?, ?, (SELECT id FROM customer_profiles WHERE user_id = ?), ?, ?, 'successful')`,
            [disputeId, disp.transaction_id, disp.raised_by_user_id, refundAmount, resolutionNotes || 'Dispute resolution refund']
          );
        }
      }
    });

    return res.json({ success: true, message: 'Dispute status updated and recorded.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDispute,
  getDisputes,
  resolveDispute
};

