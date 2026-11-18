import React, { useState, useEffect } from 'react';
import { Users, CheckCircle2, XCircle, Clock, MapPin, IndianRupee } from 'lucide-react';
import { hiringAPI } from '../../services/api';

export default function WorkerHiringRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setIsLoading(true);
    try {
      const res = await hiringAPI.listRequests();
      if (res.data?.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRespond = async (requestId, action) => {
    try {
      const res = await hiringAPI.respondRequest(requestId, action);
      if (res.data?.success) {
        alert(`Hiring offer ${action}!`);
        loadRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update offer');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Direct Customer Hiring Offers</h1>
        <p className="text-xs text-slate-500 mt-1">Review customized project terms dispatched directly to you</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading offers...</div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No incoming hiring offers</h3>
          <p className="text-xs text-slate-500">Keep your profile updated with trade skills to get direct offers.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {requests.map((req) => (
              <div key={req.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-sm">{req.customer_name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">({req.customer_phone})</span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">"{req.message}"</p>

                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                      {req.customer_address || 'Bengaluru'}
                    </span>
                    <span>•</span>
                    <span>Offered: <strong className="text-slate-900">₹{req.offered_rate}</strong> ({req.payment_type})</span>
                  </div>
                </div>

                {req.status === 'pending' ? (
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => handleRespond(req.id, 'rejected')}
                      className="py-2 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, 'accepted')}
                      className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                    >
                      Accept Offer
                    </button>
                  </div>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {req.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

