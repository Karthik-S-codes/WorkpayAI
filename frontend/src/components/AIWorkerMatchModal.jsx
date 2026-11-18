import React from 'react';
import { X, Sparkles, CheckCircle2, Award, MapPin, IndianRupee, ShieldCheck } from 'lucide-react';

export default function AIWorkerMatchModal({ isOpen, onClose, worker, jobTitle, onHire }) {
  if (!isOpen || !worker) return null;

  const score = worker.aiMatchScore || worker.matchScore || 85;
  const reasons = worker.aiMatchReasons || worker.reasons || [
    'Strong skill alignment with stated job requirements',
    'Proven track record with high client review average',
    'Expected compensation fits within stated budget'
  ];

  const getScoreColor = (s) => {
    if (s >= 90) return 'text-emerald-500 stroke-emerald-500';
    if (s >= 75) return 'text-electric-500 stroke-electric-500';
    return 'text-amber-500 stroke-amber-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-electric-500/20 border border-electric-400 flex items-center justify-center text-electric-400">
              <Sparkles className="w-5 h-5 text-electric-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Worker Compatibility</h3>
              <p className="text-xs text-slate-300">Matching analysis for: {jobTitle || 'Your Project'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Match Score Display */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 stroke-current"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${getScoreColor(score)} stroke-current`}
                    strokeWidth="3.5"
                    strokeDasharray={`${score}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-extrabold text-base text-slate-800">{score}%</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">{worker.worker_name || worker.full_name}</h4>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                  <span>{worker.category_name}</span>
                  <span>•</span>
                  <span>{worker.experience_years} yrs exp</span>
                </div>
              </div>
            </div>

            {worker.verification_status === 'verified' && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* Key Match Drivers */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Why this worker was recommended:</h5>
            <div className="space-y-2">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-start space-x-2.5 p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Rating</span>
              <span className="font-bold text-slate-700 text-sm">⭐ {worker.rating_avg || 4.9}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Completed</span>
              <span className="font-bold text-slate-700 text-sm">{worker.total_completed_jobs || 15}+ Jobs</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Rate</span>
              <span className="font-bold text-slate-700 text-sm">₹{worker.expected_salary || worker.proposed_rate}/day</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all"
            >
              Close
            </button>
            {onHire && (
              <button
                onClick={() => {
                  onClose();
                  onHire(worker);
                }}
                className="flex-1 py-2.5 px-4 bg-electric-600 hover:bg-electric-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-electric-600/20"
              >
                Send Hiring Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

