import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle2, Clock, Phone, MapPin, IndianRupee } from 'lucide-react';
import { assignmentAPI } from '../../services/api';

export default function MyWorkPage() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWork();
  }, []);

  async function loadWork() {
    setIsLoading(true);
    try {
      const res = await assignmentAPI.list();
      if (res.data?.success) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleMarkComplete = async (assignmentId) => {
    try {
      const res = await assignmentAPI.markCompleteByWorker(assignmentId);
      if (res.data?.success) {
        alert('Work marked completed! Client has been notified to inspect and release funds.');
        loadWork();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update work status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Active Assignments & Execution</h1>
        <p className="text-xs text-slate-500 mt-1">Track accepted jobs, client contact numbers, and mark milestones complete</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No active assignments</h3>
          <p className="text-xs text-slate-500">Accept direct hiring offers or apply for jobs to begin work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((a) => (
            <div key={a.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${a.status === 'fully_completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : a.status === 'worker_completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                    {a.status.replace('_', ' ')}
                  </span>
                  <span className="text-base font-black text-slate-900">₹{a.agreed_rate}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{a.job_title || 'Direct Client Engagement'}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {a.job_description || 'Standard trade execution per customer agreement.'}
                </p>

                <div className="space-y-1.5 pt-2 text-xs text-slate-500 border-t border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-700">Client:</span>
                    <span>{a.customer_name}</span>
                    <span className="text-electric-600 font-mono font-bold">({a.customer_phone})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{a.job_location || 'Customer Address'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Started {new Date(a.created_at).toLocaleDateString()}
                </span>

                {a.status === 'active' && (
                  <button
                    onClick={() => handleMarkComplete(a.id)}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Work Completed</span>
                  </button>
                )}

                {a.status === 'worker_completed' && (
                  <span className="text-xs font-bold text-blue-600 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Awaiting Client Confirmation</span>
                  </span>
                )}

                {a.status === 'fully_completed' && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Paid & Signed Off</span>
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

