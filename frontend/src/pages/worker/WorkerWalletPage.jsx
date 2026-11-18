import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownRight, Clock, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { walletAPI } from '../../services/api';

export default function WorkerWalletPage() {
  const [wallet, setWallet] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [accountDetails, setAccountDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [walletRes, payoutsRes] = await Promise.all([
        walletAPI.getWallet(),
        walletAPI.getPayouts()
      ]);
      if (walletRes.data?.success) setWallet(walletRes.data.wallet);
      if (payoutsRes.data?.success) setPayouts(payoutsRes.data.payouts);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRequestPayout = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await walletAPI.requestPayout({
        amount: parseFloat(amount),
        paymentMethod,
        accountDetails
      });

      if (res.data?.success) {
        alert('Payout request submitted to platform finance team.');
        setPayoutModalOpen(false);
        setAmount('');
        setAccountDetails('');
        loadData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Payout request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">Transferred</span>;
      case 'approved': return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold">Approved</span>;
      case 'rejected': return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold">Rejected</span>;
      default: return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold">Under Review</span>;
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400">Loading wallet...</div>;
  }

  const available = parseFloat(wallet?.available_balance || 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Worker Digital Wallet</h1>
          <p className="text-xs text-slate-500 mt-1">Internal earnings ledger with direct Bank / UPI withdrawal capabilities</p>
        </div>

        <button
          onClick={() => setPayoutModalOpen(true)}
          disabled={available <= 0}
          className="py-2.5 px-6 bg-electric-600 hover:bg-electric-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-electric-600/20 flex items-center space-x-1.5 transition-all"
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>Request Payout</span>
        </button>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-navy-950 to-navy-900 text-white p-6 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold uppercase">Available for Withdrawal</span>
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">₹{available.toFixed(2)}</div>
          <span className="text-xs text-emerald-400 font-medium block">Ready for transfer</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Pending Escrow</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600">₹{parseFloat(wallet?.pending_balance || 0).toFixed(2)}</div>
          <span className="text-xs text-slate-400 block">Unlocks when customer confirms work</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Lifetime Earnings</span>
            <ShieldCheck className="w-5 h-5 text-electric-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">₹{parseFloat(wallet?.total_lifetime_earnings || 0).toFixed(2)}</div>
          <span className="text-xs text-slate-400 block">All-time settled volume</span>
        </div>
      </div>

      {/* Payout Withdrawal History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-base text-slate-900">Payout Withdrawal Requests</h3>

        {payouts.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No payout withdrawals requested yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {payouts.map((p) => (
              <div key={p.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">Payout #{p.id}</span>
                    <span className="text-xs text-slate-500 uppercase font-semibold">• {p.payment_method}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono block mt-0.5">{p.account_details}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Requested on {new Date(p.requested_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-center">
                  <span className="text-base font-black text-slate-900">₹{p.amount}</span>
                  <div>{getStatusBadge(p.status)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-5">
            <h3 className="font-bold text-lg text-slate-900">Request Wallet Withdrawal</h3>
            <p className="text-xs text-slate-500">Available Balance: <strong>₹{available.toFixed(2)}</strong></p>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="50"
                  max={available}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Max ₹${available}`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Destination</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="upi">UPI ID (e.g. mobile@upi, name@okhdfcbank)</option>
                  <option value="bank_transfer">Bank Account Transfer (NEFT / IMPS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {paymentMethod === 'upi' ? 'UPI Virtual Payment Address (VPA)' : 'Bank Account No. & IFSC Code'}
                </label>
                <input
                  type="text"
                  required
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder={paymentMethod === 'upi' ? 'ramesh@upi' : 'Account: 5010023..., IFSC: HDFC0001...'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-electric-600 hover:bg-electric-700 text-white rounded-xl text-xs font-bold shadow-md shadow-electric-600/20"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

