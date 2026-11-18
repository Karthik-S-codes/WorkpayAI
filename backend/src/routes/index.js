const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const workerRoutes = require('./workerRoutes');
const customerRoutes = require('./customerRoutes');
const jobRoutes = require('./jobRoutes');
const hiringRoutes = require('./hiringRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const paymentRoutes = require('./paymentRoutes');
const walletRoutes = require('./walletRoutes');
const disputeRoutes = require('./disputeRoutes');
const adminRoutes = require('./adminRoutes');
const aiRoutes = require('./aiRoutes');
const { query } = require('../config/db');

// Health Check
router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const result = await query('SELECT 1 + 1 as check_val');
    if (result && result[0]?.check_val === 2) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.json({
    status: 'online',
    platform: 'WorkPay AI',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Public Categories Listing
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await query('SELECT * FROM worker_categories WHERE is_active = TRUE ORDER BY name ASC');
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/workers', workerRoutes);
router.use('/customers', customerRoutes);
router.use('/jobs', jobRoutes);
router.use('/hiring', hiringRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/payments', paymentRoutes);
router.use('/wallet', walletRoutes);
router.use('/disputes', disputeRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);

module.exports = router;

