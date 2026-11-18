import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function PayoutManagementPage() {
  const [payouts, setPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayouts();
  }, []);

  async function loadPayouts() {
    setIsLoading(true);
    try {
      const res = await adminAPI.listPayouts();
      if (res.data?.success) {
        setPayouts(res.data.payouts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdatePayout = async (payoutId, status) => {
    const adminNotes = prompt(`Enter notes for marking payout #${payoutId} as ${status}:`);
    if (adminNotes === null) return;

    try {
      const res = await adminAPI.updatePayoutStatus(payoutId, {
        status,
        adminNotes: adminNotes || 'Processed by admin finance',
        paymentReference: `BANK_TRF_${Date.now()}`
      });

      if (res.data?.success) {
        alert(res.data.message);
        loadPayouts();
      }
    } catch (err) {
      alert('Failed to update payout request.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Worker Payout Disbursements</h1>
        <p className="text-xs text-slate-500 mt-1">Review withdrawal requests, verify bank/UPI accounts, and mark disbursements</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading payout requests...</div>
      ) : payouts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Wallet className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No payout requests pending</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Req ID</th>
                  <th className="p-4">Worker Specialist</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Destination Details</th>
                  <th className="p-4">Requested On</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-slate-700">#{p.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{p.worker_name}</div>
                      <div className="text-[10px] text-slate-400">{p.worker_phone}</div>
                    </td>
                    <td className="p-4 font-black text-slate-900 text-sm">₹{p.amount}</td>
                    <td className="p-4 font-mono text-slate-600">
                      <span className="font-bold uppercase text-[10px] text-electric-600 block">{p.payment_method}</span>
                      {p.account_details}
                    </td>
                    <td className="p-4 text-slate-500">{new Date(p.requested_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      {p.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdatePayout(p.id, 'completed')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px]"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => handleUpdatePayout(p.id, 'rejected')}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold text-[11px]"
                          >
                            Reject & Refund
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

