import React, { useState, useEffect } from 'react';
import {
  CreditCard, ShieldCheck, Download, CheckCircle2, Clock,
  ArrowRight, FileText, Lock, AlertCircle, QrCode
} from 'lucide-react';
import { paymentAPI, assignmentAPI } from '../../services/api';
import PaymentGatewayModal from '../../components/PaymentGatewayModal';

export default function CustomerPaymentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Payment Checkout Modal State
  const [selectedPayTarget, setSelectedPayTarget] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [assignRes, historyRes] = await Promise.all([
        assignmentAPI.list(),
        paymentAPI.getHistory()
      ]);

      if (assignRes.data?.success) setAssignments(assignRes.data.assignments);
      if (historyRes.data?.success) setHistory(historyRes.data.transactions);
    } catch (err) {
      console.error('Failed to load payment portal', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInitiatePayment = (a) => {
    setSelectedPayTarget({
      jobId: a.job_id,
      workerId: a.worker_id,
      workerName: a.worker_name,
      workerAvatar: a.worker_avatar,
      categoryName: a.category_name,
      jobTitle: a.job_title || 'Trade Service Assignment',
      amount: a.agreed_rate,
      paymentType: a.payment_type
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Secure Digital Payment Hub</h1>
        <p className="text-xs text-slate-500 mt-1">
          Internal double-entry digital escrow with dynamic UPI QR Code, NPCI & cryptographic HMAC SHA-256 verification
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading payment ledger...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Active Tasks Ready for Payment */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h2 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-electric-600" />
                <span>Pending Project Disbursements</span>
              </h2>

              {assignments.filter((a) => a.status === 'active' || a.status === 'worker_completed').length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500">
                  No active assignments currently awaiting payment. Once you accept a hiring offer or worker completes work, it will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments
                    .filter((a) => a.status === 'active' || a.status === 'worker_completed')
                    .map((a) => (
                      <div
                        key={a.id}
                        className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-xs text-slate-900">{a.job_title || 'Direct Trade Assignment'}</h4>
                            <span className="text-[10px] bg-electric-100 text-electric-700 font-bold px-2 py-0.5 rounded-full capitalize">
                              {a.status.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 mt-1 block">
                            Specialist: {a.worker_name} ({a.category_name})
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 self-end sm:self-center">
                          <div className="text-right">
                            <span className="text-sm font-black text-slate-900 block">₹{a.agreed_rate}</span>
                            <span className="text-[10px] text-slate-400 capitalize">{a.payment_type}</span>
                          </div>

                          <button
                            onClick={() => handleInitiatePayment(a)}
                            className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all transform active:scale-98"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Scan & Pay (UPI)</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Recent Completed Payments & Invoices */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h2 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-electric-600" />
                <span>Verified Tax Invoices & Receipts</span>
              </h2>

              {history.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No completed payments found.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {history.map((tx) => (
                    <div key={tx.id} className="py-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{tx.job_title || 'Trade Service'}</h4>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          To: {tx.worker_name} • Ref: {tx.transaction_reference}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString()} via {tx.payment_method}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-900 block">₹{tx.amount}</span>
                          <span className="text-[10px] text-emerald-600 font-bold uppercase">SETTLED</span>
                        </div>

                        {tx.invoice_number && (
                          <a
                            href={paymentAPI.downloadInvoiceUrl(tx.invoice_number)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 bg-slate-100 hover:bg-electric-50 hover:text-electric-600 text-slate-600 rounded-xl transition-colors flex items-center space-x-1 text-xs font-semibold border border-slate-200"
                            title="Download Tax PDF Invoice"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">PDF</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Security Guarantees & Info */}
          <div className="space-y-6">
            <div className="bg-navy-950 text-white p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-electric-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Escrow Protection</h3>
                  <span className="text-xs text-emerald-400">100% Guaranteed</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                WorkPay AI secures payments through an internal verified ledger. Money is never released to the specialist until you inspect the work and confirm full completion.
              </p>

              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>5% Transparent Platform Fee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant GST-Compliant PDF Invoices</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dynamic QR Code with UPI Deep-linking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct Mediation for Unresolved Disputes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real FinTech Multi-Rail Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={Boolean(selectedPayTarget)}
        onClose={() => setSelectedPayTarget(null)}
        target={selectedPayTarget}
        onPaymentSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}
