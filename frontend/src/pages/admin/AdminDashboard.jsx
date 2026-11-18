import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Briefcase, CreditCard, ShieldCheck, AlertTriangle,
  TrendingUp, Layers, CheckCircle2, DollarSign, Wallet
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line
} from 'recharts';
import { adminAPI } from '../../services/api';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await adminAPI.getOverview();
        if (res.data?.success) {
          setOverview(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin overview', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400">Loading admin operations panel...</div>;
  }

  const metrics = overview?.metrics || {};
  const users = metrics.users || {};
  const jobs = metrics.jobs || {};
  const finance = metrics.finance || {};
  const pending = metrics.pendingActions || {};
  const categoryDist = overview?.categoryDistribution || [];
  const trends = overview?.transactionTrends || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Administrator Command Center</h1>
        <p className="text-xs text-slate-500 mt-1">Platform-wide health, real-time MySQL aggregates, and operational oversight</p>
      </div>

      {/* Action Alerts Row */}
      {(pending.workerVerifications > 0 || pending.payoutRequests > 0 || pending.fraudAlerts > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {pending.workerVerifications > 0 && (
            <Link
              to="/admin/verifications"
              className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-blue-900 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-electric-600" />
                <div>
                  <h4 className="font-bold text-xs">{pending.workerVerifications} Worker Verifications</h4>
                  <span className="text-[10px] text-blue-600">Pending credential review</span>
                </div>
              </div>
              <span className="font-bold text-xs text-electric-700">Audit →</span>
            </Link>
          )}

          {pending.payoutRequests > 0 && (
            <Link
              to="/admin/payouts"
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 hover:bg-emerald-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-xs">{pending.payoutRequests} Payout Requests</h4>
                  <span className="text-[10px] text-emerald-600">Awaiting bank/UPI transfer</span>
                </div>
              </div>
              <span className="font-bold text-xs text-emerald-700">Process →</span>
            </Link>
          )}

          {pending.fraudAlerts > 0 && (
            <Link
              to="/admin/fraud-alerts"
              className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-900 hover:bg-rose-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <div>
                  <h4 className="font-bold text-xs">{pending.fraudAlerts} AI Fraud Alerts</h4>
                  <span className="text-[10px] text-rose-600">Requires risk investigation</span>
                </div>
              </div>
              <span className="font-bold text-xs text-rose-700">Inspect →</span>
            </Link>
          )}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Users</span>
          <div className="text-2xl font-black text-slate-900">{users.totalUsers || 0}</div>
          <span className="text-[10px] text-slate-500 block">
            {users.totalWorkers || 0} Workers • {users.totalCustomers || 0} Customers
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Platform Jobs</span>
          <div className="text-2xl font-black text-slate-900">{jobs.totalJobs || 0}</div>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            {jobs.completedJobs || 0} completed successfully
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Gross GMV Volume</span>
          <div className="text-2xl font-black text-electric-600">₹{parseFloat(finance.totalGrossVolume || 0).toFixed(2)}</div>
          <span className="text-[10px] text-slate-500 block">{finance.totalTransactions || 0} digital transactions</span>
        </div>

        <div className="bg-gradient-to-br from-navy-950 to-navy-900 text-white p-5 rounded-3xl shadow-xl space-y-2">
          <span className="text-[11px] text-slate-300 font-semibold uppercase">Platform Revenue</span>
          <div className="text-2xl font-black text-emerald-400">₹{parseFloat(finance.totalPlatformRevenue || 0).toFixed(2)}</div>
          <span className="text-[10px] text-slate-400 block">Net 5% transparent fee</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Worker Category Distribution</h3>
            <span className="text-[10px] text-slate-400 font-medium">Active Specialists</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDist.slice(0, 7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="workerCount" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Volume Trajectory */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Platform Transaction Volume</h3>
            <span className="text-[10px] text-slate-400 font-medium">Monthly Trends</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends.length > 0 ? trends : [{ month: '2026-11', volume: 1800, count: 1 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Volume']} />
                <Line type="monotone" dataKey="volume" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

