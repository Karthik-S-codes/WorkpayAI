import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { disputeAPI } from '../../services/api';

export default function DisputeManagementPage() {
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDisputes();
  }, []);

  async function loadDisputes() {
    setIsLoading(true);
    try {
      const res = await disputeAPI.list();
      if (res.data?.success) {
        setDisputes(res.data.disputes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleResolve = async (disputeId) => {
    const status = prompt('Enter status ("resolved", "investigating", "closed"):', 'resolved');
    if (!status) return;
    const notes = prompt('Enter resolution notes:');
    const refundStr = prompt('Enter refund amount (if any):', '0');

    try {
      const res = await disputeAPI.resolve(disputeId, {
        status,
        resolutionNotes: notes,
        refundAmount: parseFloat(refundStr || 0)
      });
      if (res.data?.success) {
        alert(res.data.message);
        loadDisputes();
      }
    } catch (err) {
      alert('Failed to resolve dispute');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dispute & Complaint Mediation</h1>
        <p className="text-xs text-slate-500 mt-1">Investigate customer quality disputes or worker non-payment complaints</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading disputes...</div>
      ) : disputes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Active Disputes</h3>
          <p className="text-xs text-slate-500">All client and worker engagements are currently running smoothly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    d.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {d.status}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">Dispute on: {d.job_title}</h3>
                </div>

                <p className="text-xs text-slate-700 font-medium">"{d.reason}"</p>
                <p className="text-xs text-slate-500 leading-relaxed">{d.details}</p>

                <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                  <span>Raised By: <strong>{d.raised_by_name}</strong></span>
                  <span>•</span>
                  <span>Against: <strong>{d.against_name}</strong></span>
                  <span>•</span>
                  <span>Date: {new Date(d.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleResolve(d.id)}
                  className="py-2 px-4 bg-electric-600 hover:bg-electric-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-electric-600/20"
                >
                  Mediate & Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

