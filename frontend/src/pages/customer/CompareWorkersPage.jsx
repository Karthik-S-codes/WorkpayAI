import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShieldCheck, MapPin, IndianRupee, ArrowLeft, Send } from 'lucide-react';
import { workerAPI } from '../../services/api';

export default function CompareWorkersPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    async function loadWorkers() {
      setIsLoading(true);
      try {
        const promises = ids.map((id) => workerAPI.getById(id));
        const results = await Promise.all(promises);
        setWorkers(results.map((r) => r.data.worker));
      } catch (err) {
        console.error('Failed to load workers for comparison', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (ids.length > 0) loadWorkers();
    else setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-electric-600 border-t-transparent animate-spin mx-auto mb-3"></div>
        <span>Comparing selected specialists...</span>
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No workers selected for comparison</h2>
        <p className="text-xs text-slate-500">Go to Find Workers and select up to 3 specialists to compare side-by-side.</p>
        <Link to="/find-workers" className="inline-block py-2.5 px-6 bg-electric-600 text-white rounded-xl text-xs font-bold shadow-md">
          Find Workers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button onClick={() => navigate('/find-workers')} className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to search</span>
      </button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Side-by-Side Specialist Comparison</h1>
        <p className="text-xs text-slate-500 mt-1">Compare experience, pricing, verified credentials, and client ratings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workers.map((w) => (
          <div key={w.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center space-x-3.5">
                <img
                  src={w.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                  alt={w.full_name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1">
                    <span>{w.full_name}</span>
                    {w.verification_status === 'verified' && (
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                  </h3>
                  <span className="text-[11px] text-electric-600 font-bold bg-electric-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                    {w.category_name}
                  </span>
                </div>
              </div>

              {/* Matrix List */}
              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Customer Rating</span>
                  <span className="font-bold text-amber-500">⭐ {w.rating_avg} ({w.rating_count} reviews)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Daily Expected Rate</span>
                  <span className="font-extrabold text-slate-900">₹{w.expected_salary}/{w.payment_preference || 'day'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Trade Experience</span>
                  <span className="font-bold text-slate-800">{w.experience_years} Years</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Completed Jobs</span>
                  <span className="font-bold text-slate-800">{w.total_completed_jobs}+ Assignments</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Operating Location</span>
                  <span className="font-medium text-slate-700">{w.preferred_location}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Core Skills</span>
                <div className="flex flex-wrap gap-1">
                  {w.skills?.slice(0, 4).map((s) => (
                    <span key={s.id} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to={`/workers/${w.id}`}
              className="w-full py-2.5 bg-electric-600 hover:bg-electric-700 text-white rounded-xl text-xs font-bold text-center transition-all shadow-md flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Hire {w.full_name.split(' ')[0]}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

