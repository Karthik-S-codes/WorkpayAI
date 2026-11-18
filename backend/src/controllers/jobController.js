const { query } = require('../config/db');
const { calculateWorkerMatch } = require('../services/ai/workerMatchingService');

/**
 * Create a new Job (POST /api/jobs)
 */
async function createJob(req, res, next) {
  try {
    const customerId = req.user.customer_id;
    if (!customerId) {
      return res.status(403).json({ success: false, message: 'Only customers can post jobs.' });
    }

    const {
      title,
      description,
      category_id,
      required_skills,
      required_experience,
      location,
      budget,
      payment_type,
      start_date,
      expected_duration,
      working_hours
    } = req.body;

    if (!title || !description || !category_id || !budget || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, budget, and location are required.'
      });
    }

    const insertRes = await query(
      `INSERT INTO jobs
       (customer_id, category_id, title, description, required_skills, required_experience, location, budget, payment_type, start_date, expected_duration, working_hours, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        customerId,
        category_id,
        title.trim(),
        description.trim(),
        required_skills || null,
        required_experience || 1.0,
        location.trim(),
        budget,
        payment_type || 'per_job',
        start_date || null,
        expected_duration || '1 Day',
        working_hours || '8 Hours/Day'
      ]
    );

    // Increment customer's total jobs posted
    await query('UPDATE customer_profiles SET total_jobs_posted = total_jobs_posted + 1 WHERE id = ?', [customerId]);

    return res.status(201).json({
      success: true,
      message: 'Job posted successfully!',
      jobId: insertRes.insertId
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List jobs with search and filters (GET /api/jobs)
 */
async function getJobs(req, res, next) {
  try {
    const { category, location, status, search, minBudget, maxBudget, myJobs } = req.query;

    let sql = `
      SELECT
        j.*,
        wc.name as category_name,
        wc.slug as category_slug,
        u.full_name as customer_name,
        u.avatar_url as customer_avatar,
        (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as application_count
      FROM jobs j
      JOIN worker_categories wc ON j.category_id = wc.id
      JOIN customer_profiles cp ON j.customer_id = cp.id
      JOIN users u ON cp.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (myJobs === 'true' && req.user && req.user.customer_id) {
      sql += ' AND j.customer_id = ?';
      params.push(req.user.customer_id);
    }

    if (category) {
      sql += ' AND (wc.slug = ? OR wc.id = ?)';
      params.push(category, category);
    }

    if (location) {
      sql += ' AND j.location LIKE ?';
      params.push(`%${location}%`);
    }

    if (status) {
      sql += ' AND j.status = ?';
      params.push(status);
    }

    if (minBudget) {
      sql += ' AND j.budget >= ?';
      params.push(parseFloat(minBudget));
    }

    if (maxBudget) {
      sql += ' AND j.budget <= ?';
      params.push(parseFloat(maxBudget));
    }

    if (search) {
      sql += ' AND (j.title LIKE ? OR j.description LIKE ? OR j.required_skills LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY j.created_at DESC';

    const jobs = await query(sql, params);

    return res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single job by ID with applications and AI recommendations (GET /api/jobs/:id)
 */
async function getJobById(req, res, next) {
  try {
    const jobId = req.params.id;

    const jobRows = await query(
      `SELECT
        j.*,
        wc.name as category_name,
        wc.slug as category_slug,
        u.full_name as customer_name,
        u.phone as customer_phone,
        u.email as customer_email
       FROM jobs j
       JOIN worker_categories wc ON j.category_id = wc.id
       JOIN customer_profiles cp ON j.customer_id = cp.id
       JOIN users u ON cp.user_id = u.id
       WHERE j.id = ?`,
      [jobId]
    );

    if (jobRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const job = jobRows[0];

    // Applications for this job
    const applications = await query(
      `SELECT
        ja.*,
        wp.experience_years,
        wp.expected_salary,
        wp.rating_avg,
        wp.rating_count,
        wp.total_completed_jobs,
        wp.verification_status,
        wp.preferred_location,
        u.full_name as worker_name,
        u.avatar_url as worker_avatar,
        u.phone as worker_phone,
        GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as skills_list
       FROM job_applications ja
       JOIN worker_profiles wp ON ja.worker_id = wp.id
       JOIN users u ON wp.user_id = u.id
       LEFT JOIN worker_skills ws ON wp.id = ws.worker_id
       LEFT JOIN skills s ON ws.skill_id = s.id
       WHERE ja.job_id = ?
       GROUP BY ja.id
       ORDER BY ja.applied_at DESC`,
      [jobId]
    );

    // Compute AI match score for each applicant
    const evaluatedApplications = applications.map(app => {
      const match = calculateWorkerMatch(job, app);
      return {
        ...app,
        aiMatchScore: match.matchScore,
        aiMatchReasons: match.reasons
      };
    });

    return res.json({
      success: true,
      job,
      applications: evaluatedApplications
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Apply for a job (POST /api/jobs/:id/apply)
 */
async function applyForJob(req, res, next) {
  try {
    const workerId = req.user.worker_id;
    if (!workerId) {
      return res.status(403).json({ success: false, message: 'Only registered workers can apply for jobs.' });
    }

    const jobId = req.params.id;
    const { proposed_rate, proposal_text } = req.body;

    if (!proposed_rate) {
      return res.status(400).json({ success: false, message: 'Proposed rate is required.' });
    }

    // Check if already applied
    const existing = await query('SELECT id FROM job_applications WHERE job_id = ? AND worker_id = ?', [jobId, workerId]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already applied for this job.' });
    }

    await query(
      `INSERT INTO job_applications (job_id, worker_id, proposed_rate, proposal_text, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [jobId, workerId, proposed_rate, proposal_text || 'Interested in executing this project with high quality.']
    );

    // Update job status to 'applications_received' if it was 'open'
    await query("UPDATE jobs SET status = 'applications_received' WHERE id = ? AND status = 'open'", [jobId]);

    return res.status(201).json({
      success: true,
      message: 'Job application submitted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Job Status / Details (PUT /api/jobs/:id)
 */
async function updateJob(req, res, next) {
  try {
    const jobId = req.params.id;
    const customerId = req.user.customer_id;

    // Check ownership
    const jobCheck = await query('SELECT customer_id FROM jobs WHERE id = ?', [jobId]);
    if (jobCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }
    if (req.user.role !== 'admin' && jobCheck[0].customer_id !== customerId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to edit this job.' });
    }

    const { title, description, budget, status, location, required_skills } = req.body;

    await query(
      `UPDATE jobs SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        budget = COALESCE(?, budget),
        status = COALESCE(?, status),
        location = COALESCE(?, location),
        required_skills = COALESCE(?, required_skills)
       WHERE id = ?`,
      [title, description, budget, status, location, required_skills, jobId]
    );

    return res.json({ success: true, message: 'Job updated successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Job (DELETE /api/jobs/:id)
 */
async function deleteJob(req, res, next) {
  try {
    const jobId = req.params.id;
    const customerId = req.user.customer_id;

    const jobCheck = await query('SELECT customer_id, status FROM jobs WHERE id = ?', [jobId]);
    if (jobCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }
    if (req.user.role !== 'admin' && jobCheck[0].customer_id !== customerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    await query('DELETE FROM jobs WHERE id = ?', [jobId]);
    return res.json({ success: true, message: 'Job deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createJob,
  getJobs,
  getJobById,
  applyForJob,
  updateJob,
  deleteJob
};

