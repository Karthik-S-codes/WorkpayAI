import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, CheckCircle2, XCircle, CreditCard, ArrowRight, Download, FileText, QrCode } from 'lucide-react';
import { hiringAPI, paymentAPI } from '../../services/api';
import PaymentGatewayModal from '../../components/PaymentGatewayModal';

export default function HiringRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayTarget, setSelectedPayTarget] = useState(null);

  const fetchRequests = async () => {
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
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenPayment = (req) => {
    setSelectedPayTarget({
      jobId: req.job_id || null,
      workerId: req.worker_id,
      workerName: req.worker_name,
      workerAvatar: req.worker_avatar,
      categoryName: req.category_name,
      jobTitle: req.job_title || req.message || 'Direct Trade Assignment',
      amount: req.offered_rate,
      paymentType: req.payment_type
    });
  };

  const getStatusBadge = (status, isPaid) => {
    if (isPaid || status === 'paid') {
      return (
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center space-x-1.5 border border-emerald-300 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Paid & Settled</span>
        </span>
      );
    }

    switch (status) {
      case 'accepted':
        return (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Offer Accepted</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold flex items-center space-x-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Declined</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Response</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Direct Hiring Requests</h1>
          <p className="text-xs text-slate-500 mt-1">Track direct job offers and disburse payments via UPI Scan & Pay Gateway</p>
        </div>
        <Link
          to="/find-workers"
          className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all self-start sm:self-auto"
        >
          + Hire Another Specialist
        </Link>
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
            {requests.map((req) => {
              const isPaid = (req.status === 'paid') || (req.paid_count > 0) || (req.job_status === 'completed') || (req.assignment_status === 'fully_completed');

              return (
                <div key={req.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <img
                      src={req.worker_avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                      alt={req.worker_name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-sm">{req.worker_name}</h3>
                        <span className="text-[11px] bg-electric-50 text-electric-700 font-semibold px-2 py-0.5 rounded-lg border border-electric-100">
                          {req.category_name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 italic line-clamp-2 max-w-xl">"{req.message}"</p>
                      <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1">
                        <span>Sent on {new Date(req.created_at).toLocaleDateString()}</span>
                        {req.job_id && <span>• Job Ref #{req.job_id}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">₹{req.offered_rate}</span>
                      <span className="text-[10px] text-slate-400 capitalize">/{req.payment_type || 'per job'}</span>
                    </div>

                    <div>{getStatusBadge(req.status, isPaid)}</div>

                    {/* ACTIONS: Once paid, NEVER show Proceed to Pay again! */}
                    {isPaid ? (
                      <div className="flex items-center space-x-2">
                        {req.invoice_number ? (
                          <a
                            href={paymentAPI.downloadInvoiceUrl(req.invoice_number)}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all border border-emerald-200 shadow-sm"
                            title="Download Official Tax Invoice PDF"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Download Tax Invoice (PDF)</span>
                          </a>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1.5 py-2 px-3 bg-emerald-50 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Payment Completed</span>
                          </span>
                        )}
                      </div>
                    ) : req.status === 'accepted' ? (
                      <button
                        type="button"
                        onClick={() => handleOpenPayment(req)}
                        className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center space-x-2 transition-all transform active:scale-98"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Proceed to Pay (Scan QR)</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Real FinTech Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={Boolean(selectedPayTarget)}
        onClose={() => setSelectedPayTarget(null)}
        target={selectedPayTarget}
        onPaymentSuccess={() => {
          fetchRequests();
        }}
      />
    </div>
  );
}
