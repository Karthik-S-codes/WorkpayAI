const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { generateToken } = require('../config/jwt');

/**
 * Register a new user (Worker or Customer)
 * Public admin registration is blocked for security.
 */
async function register(req, res, next) {
  try {
    const { email, password, role, full_name, phone, address, preferred_location, category_id, experience_years, expected_salary } = req.body;

    if (!email || !password || !full_name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, full name, and phone number are required.'
      });
    }

    if (!['customer', 'worker'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "customer" or "worker". Admin accounts must be provisioned internally.'
      });
    }

    // Check existing email or phone
    const existing = await query('SELECT id FROM users WHERE email = ? OR phone = ?', [email.trim().toLowerCase(), phone.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address or phone number already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const insertUserRes = await query(
      `INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE, TRUE)`,
      [email.trim().toLowerCase(), passwordHash, role, full_name.trim(), phone.trim()]
    );
    const userId = insertUserRes.insertId;

    // Create role-specific profile
    if (role === 'worker') {
      await query(
        `INSERT INTO worker_profiles
         (user_id, category_id, address, preferred_location, experience_years, expected_salary, payment_preference, availability_status, profile_completion, verification_status)
         VALUES (?, ?, ?, ?, ?, ?, 'daily', 'available', 60, 'pending')`,
        [
          userId,
          category_id ? parseInt(category_id, 10) : null,
          address || null,
          preferred_location || 'Bengaluru',
          experience_years ? parseFloat(experience_years) : 1.0,
          expected_salary ? parseFloat(expected_salary) : 600.00
        ]
      );
    } else {
      await query(
        `INSERT INTO customer_profiles (user_id, address, preferred_location)
         VALUES (?, ?, ?)`,
        [userId, address || null, preferred_location || 'Bengaluru']
      );
    }

    // Create wallet for user
    await query(
      `INSERT INTO wallets (user_id, available_balance, pending_balance, total_lifetime_earnings, currency)
       VALUES (?, 0.00, 0.00, 0.00, 'INR')`,
      [userId]
    );

    const token = generateToken({ id: userId, email: email.trim().toLowerCase(), role });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: userId,
        email: email.trim().toLowerCase(),
        full_name: full_name.trim(),
        phone: phone.trim(),
        role
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * User Login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const users = await query(
      `SELECT u.id, u.email, u.password_hash, u.role, u.full_name, u.phone, u.avatar_url, u.is_active, u.is_verified
       FROM users u
       WHERE u.email = ?`,
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended. Please contact platform administration.'
      });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    // Attach role profile id
    let workerProfile = null;
    let customerProfile = null;

    if (user.role === 'worker') {
      const wRows = await query('SELECT id, category_id, verification_status, availability_status, expected_salary FROM worker_profiles WHERE user_id = ?', [user.id]);
      workerProfile = wRows[0] || null;
    } else if (user.role === 'customer') {
      const cRows = await query('SELECT id FROM customer_profiles WHERE user_id = ?', [user.id]);
      customerProfile = cRows[0] || null;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified,
        worker_id: workerProfile?.id,
        customer_id: customerProfile?.id,
        verification_status: workerProfile?.verification_status
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Current Authenticated User (GET /api/auth/me)
 */
async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    const users = await query(
      'SELECT id, email, role, full_name, phone, avatar_url, is_verified, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];
    let extra = {};

    if (user.role === 'worker') {
      const wRows = await query(
        `SELECT wp.*, wc.name as category_name
         FROM worker_profiles wp
         LEFT JOIN worker_categories wc ON wp.category_id = wc.id
         WHERE wp.user_id = ?`,
        [userId]
      );
      extra.worker_profile = wRows[0] || null;
    } else if (user.role === 'customer') {
      const cRows = await query('SELECT * FROM customer_profiles WHERE user_id = ?', [userId]);
      extra.customer_profile = cRows[0] || null;
    }

    return res.json({
      success: true,
      user: {
        ...user,
        ...extra
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Change Password
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }

    const users = await query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout
 */
function logout(req, res) {
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
}

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  logout
};

