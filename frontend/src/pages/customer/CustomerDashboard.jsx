import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Users, CreditCard, PlusCircle, Search,
  ArrowRight, ShieldCheck, CheckCircle2, Clock
} from 'lucide-react';
import { customerAPI } from '../../services/api';

export default function CustomerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await customerAPI.getDashboard();
        if (res.data?.success) {
          setDashboard(res.data.dashboard);
        }
      } catch (err) {
        console.error('Failed to load customer dashboard', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400">Loading dashboard...</div>;
  }

  const metrics = dashboard?.metrics || {
    totalJobsPosted: 0,
    activeJobs: 0,
    completedJobs: 0,
    pendingHiringRequests: 0
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Customer Workspace</h1>
          <p className="text-xs text-slate-500 mt-1">Manage jobs, hiring offers, and secure digital escrow disbursements</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/find-workers"
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Search Workers</span>
          </Link>

          <Link
            to="/customer/post-job"
            className="py-2.5 px-4 bg-electric-600 hover:bg-electric-700 text-white font-bold rounded-xl text-xs shadow-md shadow-electric-600/20 flex items-center space-x-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Job</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Jobs</span>
            <Briefcase className="w-4 h-4 text-electric-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.totalJobsPosted}</div>
          <span className="text-[10px] text-slate-400 block">All requirements listed</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Active Projects</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">{metrics.activeJobs}</div>
          <span className="text-[10px] text-blue-500 font-medium block">Open or in-progress</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Completed Jobs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{metrics.completedJobs}</div>
          <span className="text-[10px] text-emerald-600 font-medium block">Confirmed & paid</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Pending Offers</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">{metrics.pendingHiringRequests}</div>
          <span className="text-[10px] text-purple-500 font-medium block">Awaiting worker replies</span>
        </div>
      </div>

      {/* Main 2-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs Posted */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Your Active Requirements</h3>
            <Link to="/customer/my-jobs" className="text-xs font-bold text-electric-600 hover:underline">
              View All →
            </Link>
          </div>

          {dashboard?.recentJobs?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No jobs posted recently.</p>
          ) : (
            <div className="space-y-3">
              {dashboard?.recentJobs?.map((job) => (
                <div key={job.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{job.title}</h4>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      {job.category_name} • ₹{job.budget} • {job.application_count || 0} applicants
                    </span>
                  </div>
                  <Link
                    to="/customer/my-jobs"
                    className="p-2 text-slate-400 hover:text-electric-600"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments & Invoices */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Recent Disbursements</h3>
            <Link to="/customer/transactions" className="text-xs font-bold text-electric-600 hover:underline">
              Full Ledger →
            </Link>
          </div>

          {dashboard?.recentTransactions?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No completed transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {dashboard?.recentTransactions?.map((tx) => (
                <div key={tx.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{tx.job_title || 'Trade Service'}</h4>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Paid to: {tx.worker_name} • {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xs text-slate-900 block">₹{tx.amount}</span>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">PAID</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

