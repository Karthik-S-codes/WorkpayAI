import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, CheckCircle2, XCircle, CreditCard, ArrowRight } from 'lucide-react';
import { hiringAPI } from '../../services/api';

export default function HiringRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await hiringAPI.listRequests();
        if (res.data?.success) {
          setRequests(res.data.requests);
        }
      } catch (err) {
        console.error('Failed to load hiring requests', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center space-x-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>Accepted</span></span>;
      case 'rejected':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold flex items-center space-x-1"><XCircle className="w-3.5 h-3.5" /><span>Declined</span></span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>Pending Response</span></span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Direct Hiring Requests</h1>
        <p className="text-xs text-slate-500 mt-1">Track direct job offers dispatched to trade specialists</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No hiring requests sent yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse verified workers and send direct job offers tailored to your budget.
          </p>
          <Link
            to="/find-workers"
            className="inline-block py-2.5 px-6 bg-electric-600 text-white rounded-xl text-xs font-bold"
          >
            Find Workers Now
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {requests.map((req) => (
              <div key={req.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={req.worker_avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                    alt={req.worker_name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{req.worker_name}</h3>
                    <span className="text-xs text-electric-600 font-semibold">{req.category_name}</span>
                    <p className="text-xs text-slate-500 mt-1 italic">"{req.message}"</p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Sent on {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block">₹{req.offered_rate}</span>
                    <span className="text-[10px] text-slate-400 capitalize">/{req.payment_type || 'per job'}</span>
                  </div>

                  <div>{getStatusBadge(req.status)}</div>

                  {req.status === 'accepted' && (
                    <Link
                      to="/customer/payments"
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Proceed to Pay</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

