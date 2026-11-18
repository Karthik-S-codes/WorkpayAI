const { verifyToken } = require('../config/jwt');
const { query } = require('../config/db');

/**
 * Authentication middleware: verifies Bearer JWT and attaches req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token.'
      });
    }

    // Lookup user in MySQL
    const users = await query('SELECT id, email, role, full_name, phone, is_verified, is_active FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    const user = users[0];
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Attach user profile reference
    if (user.role === 'worker') {
      const workerProfiles = await query('SELECT id, category_id, availability_status, verification_status FROM worker_profiles WHERE user_id = ?', [user.id]);
      user.worker_id = workerProfiles[0]?.id || null;
      user.category_id = workerProfiles[0]?.category_id || null;
      user.verification_status = workerProfiles[0]?.verification_status || 'pending';
    } else if (user.role === 'customer') {
      const customerProfiles = await query('SELECT id FROM customer_profiles WHERE user_id = ?', [user.id]);
      user.customer_id = customerProfiles[0]?.id || null;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
}

/**
 * Role-Based Access Control (RBAC) guard
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please sign in.'
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}].`
      });
    }
    next();
  };
}

module.exports = {
  authenticate,
  requireRole
};

