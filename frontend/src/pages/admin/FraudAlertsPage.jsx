import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Eye, ShieldCheck } from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function FraudAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    setIsLoading(true);
    try {
      const res = await adminAPI.listFraudAlerts();
      if (res.data?.success) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateAlert = async (alertId, status) => {
    try {
      const res = await adminAPI.updateFraudAlertStatus(alertId, { status });
      if (res.data?.success) {
        alert(res.data.message);
        loadAlerts();
      }
    } catch (err) {
      alert('Failed to update alert.');
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'critical': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">AI Fraud & Anomaly Alerts</h1>
        <p className="text-xs text-slate-500 mt-1">Rule-based anomaly recognition identifying suspicious velocity and payment spikes</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Scanning security records...</div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">All Clear: Zero Unresolved Fraud Alerts</h3>
          <p className="text-xs text-slate-500">Platform velocity and cancellation metrics are operating within normal parameters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity} Risk ({alert.risk_score}/100)
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{alert.alert_type}</h3>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{alert.description}</p>

                <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                  <span>User: <strong>{alert.user_name}</strong> ({alert.user_email})</span>
                  <span>•</span>
                  <span>Flagged on {new Date(alert.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                {alert.status === 'new' ? (
                  <>
                    <button
                      onClick={() => handleUpdateAlert(alert.id, 'dismissed')}
                      className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Dismiss (False Positive)
                    </button>
                    <button
                      onClick={() => handleUpdateAlert(alert.id, 'action_taken')}
                      className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20"
                    >
                      Take Action
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-slate-400 capitalize bg-slate-50 px-3 py-1 rounded-xl">
                    Status: {alert.status.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

