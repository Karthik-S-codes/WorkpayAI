import React from 'react';
import { UserCheck, Search, ShieldCheck, DollarSign, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-electric-600">Step-by-Step Workflow</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900">How WorkPay AI Works</h1>
        <p className="text-sm text-slate-600">A seamless, secure journey for both hiring clients and skilled workers.</p>
      </div>

      {/* For Customers */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-blue-100 text-electric-700 font-bold rounded-lg text-xs uppercase">For Customers</span>
          <h2 className="text-2xl font-bold text-slate-900">How to Hire & Pay with Confidence</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">1</div>
            <h3 className="font-bold text-slate-900 text-sm">Post a Job or Browse Workers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use our AI Job Description generator to specify requirements, or search verified workers by category and proximity.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">2</div>
            <h3 className="font-bold text-slate-900 text-sm">Review AI Match Scores</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Compare applicants side-by-side with 0-100% compatibility scores, transparent reasons, ratings, and verified certificates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">3</div>
            <h3 className="font-bold text-slate-900 text-sm">Inspect & Release Payment</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Funds are held safely in escrow. Once work is completed to your satisfaction, sign off to release money and download your tax invoice.
            </p>
          </div>
        </div>
      </div>

      {/* For Workers */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs uppercase">For Workers</span>
          <h2 className="text-2xl font-bold text-slate-900">How to Find Jobs & Grow Your Income</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">1</div>
            <h3 className="font-bold text-slate-900 text-sm">Create Verified Profile</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use the AI Profile Builder to summarize your skills and upload trade certificates to receive the WorkPay Verified badge.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">2</div>
            <h3 className="font-bold text-slate-900 text-sm">Apply & Accept Offers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse local jobs or receive direct hiring offers from customers. Accept offers that fit your schedule and expected salary.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">3</div>
            <h3 className="font-bold text-slate-900 text-sm">Instant Wallet Payouts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track real-time earnings in your digital wallet and request direct payouts to your Bank Account or UPI ID with 0% delay.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-8">
        <Link
          to="/register"
          className="inline-flex items-center space-x-2 py-3 px-8 bg-electric-600 hover:bg-electric-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
        >
          <span>Get Started on WorkPay AI</span>
        </Link>
      </div>
    </div>
  );
}

