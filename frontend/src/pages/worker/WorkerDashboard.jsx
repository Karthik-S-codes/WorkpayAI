import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet, Briefcase, CheckCircle2, Clock, Star, ShieldCheck,
  TrendingUp, ArrowRight, AlertTriangle, Users, Sparkles
} from 'lucide-react';
import { workerAPI } from '../../services/api';

export default function WorkerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await workerAPI.getDashboard();
        if (res.data?.success) {
          setDashboard(res.data.dashboard);
        }
      } catch (err) {
        console.error('Failed to load worker dashboard', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400">Loading worker dashboard...</div>;
  }

  const worker = dashboard?.worker || {};
  const wallet = dashboard?.wallet || {};
  const metrics = dashboard?.metrics || {};

  return (
    <div className="space-y-8">
      {/* Profile Verification Alert if Pending */}
      {worker.verification_status !== 'verified' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-amber-900">Verification Status: Pending Review</h4>
              <p className="text-[11px] text-amber-700">Upload trade certificates to receive the verified badge and boost hiring rates by 40%.</p>
            </div>
          </div>
          <Link
            to="/worker/edit-profile"
            className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
          >
            Upload Certificates
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Worker Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage active assignments, earnings wallet, and incoming client offers</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/find-jobs"
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5"
          >
            <Briefcase className="w-4 h-4 text-slate-500" />
            <span>Find Jobs</span>
          </Link>
          <Link
            to="/worker/ai-income"
            className="py-2.5 px-4 bg-gradient-to-r from-electric-600 to-teal-500 text-white font-bold rounded-xl text-xs shadow-md shadow-electric-600/20 flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Income Insights</span>
          </Link>
        </div>
      </div>

      {/* Financial Wallet Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-navy-950 to-navy-900 text-white p-5 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-300 font-semibold uppercase">Available in Wallet</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">₹{parseFloat(wallet.available_balance || 0).toFixed(2)}</div>
          <Link
            to="/worker/wallet"
            className="inline-flex items-center text-[11px] font-bold text-teal-400 hover:underline"
          >
            <span>Request Payout →</span>
          </Link>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Pending Escrow</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">₹{parseFloat(wallet.pending_balance || 0).toFixed(2)}</div>
          <span className="text-[10px] text-slate-400 block">Unlocks upon client confirmation</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Active Jobs</span>
            <Briefcase className="w-4 h-4 text-electric-600" />
          </div>
          <div className="text-2xl font-black text-electric-600">{metrics.activeJobs || 0}</div>
          <Link to="/worker/my-work" className="text-[10px] text-electric-600 font-bold hover:underline block">
            View My Work →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Client Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{worker.rating_avg || 5.0} ★</div>
          <span className="text-[10px] text-slate-400 block">{worker.total_completed_jobs || 0} jobs completed</span>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">Profile Readiness</span>
          <span className="font-black text-electric-600">{worker.profile_completion || 75}% Complete</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-electric-600 to-teal-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${worker.profile_completion || 75}%` }}
          ></div>
        </div>
      </div>

      {/* Main 2-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Hiring Offers */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Incoming Hiring Offers</h3>
            <Link to="/worker/hiring-requests" className="text-xs font-bold text-electric-600 hover:underline">
              View All ({metrics.pendingHiringRequests || 0}) →
            </Link>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-800">Direct hiring requests from clients</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Review budget, location and accept jobs that suit your schedule.</p>
            </div>
            <Link
              to="/worker/hiring-requests"
              className="py-2 px-3.5 bg-electric-600 hover:bg-electric-700 text-white rounded-xl text-xs font-bold"
            >
              Check Offers
            </Link>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Recent Customer Reviews</h3>
            <Link to="/worker/reviews" className="text-xs font-bold text-electric-600 hover:underline">
              All Reviews →
            </Link>
          </div>

          {dashboard?.recentReviews?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No reviews recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {dashboard?.recentReviews?.map((r) => (
                <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{r.reviewer_name}</span>
                    <span className="text-amber-500 font-bold text-xs">⭐ {r.rating}</span>
                  </div>
                  <p className="text-xs text-slate-600 italic">"{r.review_text}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

