/**
 * AI Fraud Detection & Anomaly Recognition Engine
 * Rule-based heuristic scoring engine for identifying suspicious activity.
 * Alerts are flagged for administrative investigation without automated blacklisting.
 */

const { query } = require('../../config/db');

async function evaluateUserRisk(userId) {
  const alerts = [];
  let riskScore = 0;

  try {
    // 1. Check transaction velocity (more than 5 transactions in last 1 hour)
    const recentTx = await query(
      `SELECT COUNT(*) as count, SUM(amount) as total
       FROM transactions
       WHERE customer_id = (SELECT id FROM customer_profiles WHERE user_id = ?)
         AND created_at >= NOW() - INTERVAL 1 HOUR`,
      [userId]
    );

    const txCount = recentTx[0]?.count || 0;
    if (txCount >= 5) {
      riskScore += 45;
      alerts.push({
        alertType: 'High Transaction Velocity',
        severity: 'high',
        description: `Customer triggered ${txCount} payment transactions within a 1-hour window.`
      });
    }

    // 2. Check cancellation frequency
    const cancellations = await query(
      `SELECT COUNT(*) as cancelled_count
       FROM jobs
       WHERE customer_id = (SELECT id FROM customer_profiles WHERE user_id = ?)
         AND status = 'cancelled'
         AND created_at >= NOW() - INTERVAL 7 DAY`,
      [userId]
    );

    const cancelCount = cancellations[0]?.cancelled_count || 0;
    if (cancelCount >= 4) {
      riskScore += 30;
      alerts.push({
        alertType: 'Abnormal Job Cancellation Ratio',
        severity: 'medium',
        description: `User cancelled ${cancelCount} job postings in the past 7 days.`
      });
    }

    // 3. Check for dispute velocity
    const disputes = await query(
      `SELECT COUNT(*) as dispute_count
       FROM disputes
       WHERE (raised_by_user_id = ? OR against_user_id = ?)
         AND created_at >= NOW() - INTERVAL 14 DAY`,
      [userId, userId]
    );

    const disputeCount = disputes[0]?.dispute_count || 0;
    if (disputeCount >= 3) {
      riskScore += 35;
      alerts.push({
        alertType: 'Elevated Dispute Rate',
        severity: 'high',
        description: `User is involved in ${disputeCount} active or recent payment disputes within 14 days.`
      });
    }

    // 4. Scikit-Learn RandomForest ML Classification (if Python service is running)
    let mlEngine = 'Statistical Rule-Based Heuristic';
    try {
      const pyRes = await fetch('http://127.0.0.1:8000/detect-fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_velocity_1h: txCount,
          amount: parseFloat(recentTx[0]?.total || 0),
          cancellations_7d: cancelCount,
          disputes_14d: disputeCount,
          is_new_account: 0,
          avg_completion_time_hrs: 12.0
        }),
        signal: AbortSignal.timeout(1000)
      });
      if (pyRes.ok) {
        const pyData = await pyRes.json();
        if (pyData && pyData.evaluation) {
          riskScore = Math.max(riskScore, pyData.evaluation.risk_score);
          mlEngine = 'Python Scikit-Learn (RandomForestClassifier)';
        }
      }
    } catch (pyErr) {
      // Python ML offline, fall through to deterministic rules
    }

    // Normalize riskScore between 0 and 100
    riskScore = Math.min(100, riskScore);

    // Persist new alerts if score exceeds threshold
    if (alerts.length > 0) {
      for (const alert of alerts) {
        await query(
          `INSERT INTO fraud_alerts (user_id, related_entity_type, risk_score, alert_type, description, severity, status)
           VALUES (?, 'user', ?, ?, ?, ?, 'new')`,
          [userId, riskScore, alert.alertType, alert.description, alert.severity]
        );
      }
    }

    return {
      userId,
      riskScore,
      riskLevel: riskScore >= 70 ? 'High' : riskScore >= 35 ? 'Moderate' : 'Low',
      flaggedAlerts: alerts,
      engine: mlEngine
    };
  } catch (error) {
    console.error('[Fraud Detection Engine Error]:', error.message);
    return {
      userId,
      riskScore: 0,
      riskLevel: 'Low',
      flaggedAlerts: []
    };
  }
}

module.exports = {
  evaluateUserRisk
};

