const { query } = require('../config/db');

/**
 * List workers with comprehensive filtering (category, location, exp, budget, rating)
 */
async function listWorkers(req, res, next) {
  try {
    const { category, location, minExp, maxSalary, minRating, search } = req.query;

    let sql = `
      SELECT
        wp.id as worker_id,
        wp.user_id,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_url,
        wc.id as category_id,
        wc.name as category_name,
        wc.slug as category_slug,
        wp.bio,
        wp.address,
        wp.preferred_location,
        wp.experience_years,
        wp.languages,
        wp.expected_salary,
        wp.payment_preference,
        wp.availability_status,
        wp.rating_avg,
        wp.rating_count,
        wp.total_completed_jobs,
        wp.verification_status,
        GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as skills_list
      FROM worker_profiles wp
      JOIN users u ON wp.user_id = u.id
      LEFT JOIN worker_categories wc ON wp.category_id = wc.id
      LEFT JOIN worker_skills ws ON wp.id = ws.worker_id
      LEFT JOIN skills s ON ws.skill_id = s.id
      WHERE u.is_active = TRUE
    `;

    const params = [];

    if (category) {
      sql += ' AND (wc.slug = ? OR wc.id = ?)';
      params.push(category, category);
    }

    if (location) {
      sql += ' AND (wp.preferred_location LIKE ? OR wp.address LIKE ?)';
      params.push(`%${location}%`, `%${location}%`);
    }

    if (minExp) {
      sql += ' AND wp.experience_years >= ?';
      params.push(parseFloat(minExp));
    }

    if (maxSalary) {
      sql += ' AND wp.expected_salary <= ?';
      params.push(parseFloat(maxSalary));
    }

    if (minRating) {
      sql += ' AND wp.rating_avg >= ?';
      params.push(parseFloat(minRating));
    }

    if (search) {
      sql += ' AND (u.full_name LIKE ? OR wp.bio LIKE ? OR wc.name LIKE ? OR s.name LIKE ?)';
      const sTerm = `%${search}%`;
      params.push(sTerm, sTerm, sTerm, sTerm);
    }

    sql += ' GROUP BY wp.id ORDER BY wp.verification_status DESC, wp.rating_avg DESC, wp.total_completed_jobs DESC';

    const workers = await query(sql, params);

    return res.json({
      success: true,
      count: workers.length,
      workers
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get detailed worker profile by ID
 */
async function getWorkerById(req, res, next) {
  try {
    const workerId = req.params.id;

    const workerRows = await query(
      `SELECT
        wp.*,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_url,
        wc.name as category_name,
        wc.slug as category_slug
       FROM worker_profiles wp
       JOIN users u ON wp.user_id = u.id
       LEFT JOIN worker_categories wc ON wp.category_id = wc.id
       WHERE wp.id = ?`,
      [workerId]
    );

    if (workerRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    const worker = workerRows[0];

    // Fetch skills
    const skills = await query(
      `SELECT s.id, s.name, ws.years_experience, ws.proficiency_level
       FROM worker_skills ws
       JOIN skills s ON ws.skill_id = s.id
       WHERE ws.worker_id = ?`,
      [workerId]
    );

    // Fetch verified certificates
    const certificates = await query(
      `SELECT id, title, issuing_org, issue_date, certificate_url, verification_status
       FROM worker_certificates
       WHERE worker_id = ?`,
      [workerId]
    );

    // Fetch recent reviews
    const reviews = await query(
      `SELECT jr.id, jr.rating, jr.review_text, jr.sentiment, jr.created_at, u.full_name as reviewer_name
       FROM job_reviews jr
       JOIN users u ON jr.reviewer_id = u.id
       WHERE jr.reviewee_id = ?
       ORDER BY jr.created_at DESC LIMIT 10`,
      [worker.user_id]
    );

    // Fetch weekly availability schedule
    const availability = await query(
      `SELECT day_of_week, start_time, end_time, is_available
       FROM user_availability
       WHERE user_id = ?
       ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`,
      [worker.user_id]
    );

    return res.json({
      success: true,
      worker: {
        ...worker,
        skills,
        certificates,
        reviews,
        availability
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update current worker's profile (PUT /api/workers/profile)
 */
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      full_name,
      phone,
      bio,
      address,
      preferred_location,
      category_id,
      experience_years,
      education,
      languages,
      expected_salary,
      payment_preference,
      availability_status
    } = req.body;

    if (full_name || phone) {
      await query(
        'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?',
        [full_name, phone, userId]
      );
    }

    await query(
      `UPDATE worker_profiles SET
        bio = COALESCE(?, bio),
        address = COALESCE(?, address),
        preferred_location = COALESCE(?, preferred_location),
        category_id = COALESCE(?, category_id),
        experience_years = COALESCE(?, experience_years),
        education = COALESCE(?, education),
        languages = COALESCE(?, languages),
        expected_salary = COALESCE(?, expected_salary),
        payment_preference = COALESCE(?, payment_preference),
        availability_status = COALESCE(?, availability_status),
        profile_completion = 90
       WHERE user_id = ?`,
      [
        bio,
        address,
        preferred_location,
        category_id,
        experience_years,
        education,
        languages,
        expected_salary,
        payment_preference,
        availability_status,
        userId
      ]
    );

    return res.json({
      success: true,
      message: 'Worker profile updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Worker Dashboard Overview (GET /api/workers/me/dashboard)
 */
async function getWorkerDashboard(req, res, next) {
  try {
    const userId = req.user.id;
    const workerRows = await query('SELECT * FROM worker_profiles WHERE user_id = ?', [userId]);
    if (!workerRows.length) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }
    const worker = workerRows[0];

    // Counts
    const pendingHiring = await query('SELECT COUNT(*) as count FROM hiring_requests WHERE worker_id = ? AND status = "pending"', [worker.id]);
    const acceptedJobs = await query('SELECT COUNT(*) as count FROM job_assignments WHERE worker_id = ? AND status = "active"', [worker.id]);
    const walletRes = await query('SELECT * FROM wallets WHERE user_id = ?', [userId]);

    // Recent notifications
    const notifications = await query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [userId]);

    // Recent reviews
    const recentReviews = await query(
      `SELECT jr.*, u.full_name as reviewer_name
       FROM job_reviews jr
       JOIN users u ON jr.reviewer_id = u.id
       WHERE jr.reviewee_id = ?
       ORDER BY jr.created_at DESC LIMIT 3`,
      [userId]
    );

    return res.json({
      success: true,
      dashboard: {
        worker,
        wallet: walletRes[0] || { available_balance: 0, pending_balance: 0, total_lifetime_earnings: 0 },
        metrics: {
          pendingHiringRequests: pendingHiring[0].count,
          activeJobs: acceptedJobs[0].count,
          completedJobs: worker.total_completed_jobs,
          rating: worker.rating_avg,
          profileCompletion: worker.profile_completion,
          verificationStatus: worker.verification_status
        },
        notifications,
        recentReviews
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Manage Weekly Availability (POST /api/workers/availability)
 */
async function manageAvailability(req, res, next) {
  try {
    const userId = req.user.id;
    const { schedule } = req.body; // Array of { day_of_week, start_time, end_time, is_available }

    if (!Array.isArray(schedule)) {
      return res.status(400).json({ success: false, message: 'Schedule must be an array of daily availability objects.' });
    }

    for (const item of schedule) {
      await query(
        `INSERT INTO user_availability (user_id, day_of_week, start_time, end_time, is_available)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE start_time = VALUES(start_time), end_time = VALUES(end_time), is_available = VALUES(is_available)`,
        [userId, item.day_of_week, item.start_time || '08:00:00', item.end_time || '18:00:00', item.is_available ? 1 : 0]
      );
    }

    return res.json({ success: true, message: 'Availability schedule updated successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Upload Certificates (POST /api/workers/certificates)
 */
async function uploadCertificate(req, res, next) {
  try {
    const userId = req.user.id;
    const workerRows = await query('SELECT id FROM worker_profiles WHERE user_id = ?', [userId]);
    const workerId = workerRows[0].id;

    const { title, issuing_org, issue_date, certificate_url } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Certificate title is required.' });
    }

    const insertRes = await query(
      `INSERT INTO worker_certificates (worker_id, title, issuing_org, issue_date, certificate_url, verification_status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [workerId, title, issuing_org || null, issue_date || null, certificate_url || 'https://workpay.ai/certs/sample_cert.pdf']
    );

    return res.status(201).json({
      success: true,
      message: 'Certificate uploaded and queued for admin verification.',
      certificateId: insertRes.insertId
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listWorkers,
  getWorkerById,
  updateProfile,
  getWorkerDashboard,
  manageAvailability,
  uploadCertificate
};

