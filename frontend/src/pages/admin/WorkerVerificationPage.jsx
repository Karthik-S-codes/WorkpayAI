import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Award, Eye } from 'lucide-react';
import { workerAPI, adminAPI } from '../../services/api';

export default function WorkerVerificationPage() {
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkers();
  }, []);

  async function loadWorkers() {
    setIsLoading(true);
    try {
      const res = await workerAPI.list({});
      if (res.data?.success) {
        setWorkers(res.data.workers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleVerify = async (workerId, status) => {
    const notes = prompt(`Enter verification review note for worker #${workerId}:`);
    if (notes === null) return;

    try {
      const res = await adminAPI.verifyWorker(workerId, { status, notes });
      if (res.data?.success) {
        alert(res.data.message);
        loadWorkers();
      }
    } catch (err) {
      alert('Failed to update verification status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Worker Verification & Credential Audit</h1>
        <p className="text-xs text-slate-500 mt-1">Review trade diplomas, licenses, and approve the WorkPay Verified Badge</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading worker records...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((w) => (
            <div key={w.worker_id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={w.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                    alt={w.full_name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{w.full_name}</h3>
                    <span className="text-[11px] font-semibold text-electric-600">{w.category_name}</span>
                    <span className={`block text-[10px] font-bold uppercase mt-0.5 ${
                      w.verification_status === 'verified' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      Status: {w.verification_status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {w.bio || 'Registered trade specialist.'}
                </p>

                <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                  <div>Experience: <strong>{w.experience_years} Years</strong></div>
                  <div>Location: <strong>{w.preferred_location}</strong></div>
                  <div>Rating: <strong>{w.rating_avg} ★ ({w.rating_count} reviews)</strong></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center space-x-2">
                {w.verification_status !== 'verified' ? (
                  <>
                    <button
                      onClick={() => handleVerify(w.worker_id, 'verified')}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Badge</span>
                    </button>
                    <button
                      onClick={() => handleVerify(w.worker_id, 'rejected')}
                      className="py-2 px-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleVerify(w.worker_id, 'rejected')}
                    className="w-full py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                  >
                    Revoke Verification
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

