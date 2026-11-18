import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, PlusCircle, ArrowDownRight, ArrowUpRight,
  Calendar, Layers, FileText
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { walletAPI, aiAPI } from '../../services/api';

export default function WorkerEarningsPage() {
  const [insights, setInsights] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Log Expense Form
  const [expCategory, setExpCategory] = useState('Tools & Equipment');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expNotes, setExpNotes] = useState('');
  const [isLoggingExp, setIsLoggingExp] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [aiRes, expRes] = await Promise.all([
        aiAPI.getIncomeInsights('me'),
        walletAPI.getExpenses()
      ]);

      if (aiRes.data?.success) setInsights(aiRes.data.insights);
      if (expRes.data?.success) setExpenses(expRes.data.expenses);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddExpense = async (e) => {
    e?.preventDefault();
    if (!expTitle || !expAmount) return;

    setIsLoggingExp(true);
    try {
      const res = await walletAPI.logExpense({
        category: expCategory,
        title: expTitle,
        amount: parseFloat(expAmount),
        notes: expNotes
      });
      if (res.data?.success) {
        setExpTitle('');
        setExpAmount('');
        setExpNotes('');
        loadData();
      }
    } catch (err) {
      alert('Failed to log expense');
    } finally {
      setIsLoggingExp(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400">Loading earnings analytics...</div>;
  }

  const summary = insights?.summary || {
    totalGrossEarnings: 0,
    totalNetEarnings: 0,
    totalExpenses: 0,
    netProfit: 0,
    availableInWallet: 0
  };

  const trendData = insights?.monthlyTrend || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Earnings & Financial Ledger</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time ledger audit trail, monthly income trajectory, and business expenses</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Gross Revenue</span>
          <div className="text-2xl font-black text-slate-900">₹{summary.totalGrossEarnings.toFixed(2)}</div>
          <span className="text-[10px] text-slate-400 block">Total customer billings</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Logged Expenses</span>
          <div className="text-2xl font-black text-rose-600">₹{summary.totalExpenses.toFixed(2)}</div>
          <span className="text-[10px] text-rose-500 font-medium block">Tools, materials & travel</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Net Take-Home Profit</span>
          <div className="text-2xl font-black text-emerald-600">₹{summary.netProfit.toFixed(2)}</div>
          <span className="text-[10px] text-emerald-600 font-medium block">Revenue minus logged costs</span>
        </div>

        <div className="bg-gradient-to-br from-navy-950 to-navy-900 text-white p-5 rounded-3xl shadow-xl space-y-2">
          <span className="text-[11px] text-slate-300 font-semibold uppercase">Wallet Balance</span>
          <div className="text-2xl font-black text-teal-300">₹{summary.availableInWallet.toFixed(2)}</div>
          <span className="text-[10px] text-slate-400 block">Ready to withdraw</span>
        </div>
      </div>

      {/* Monthly Trajectory Chart */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Income Trajectory (INR)</h3>
            <p className="text-xs text-slate-500">Calculated directly from confirmed MySQL transaction records</p>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
            Real Ledger Data
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="earningsColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`₹${value}`, 'Net Earnings']} />
              <Area type="monotone" dataKey="earnings" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#earningsColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses Logger & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Expense Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
            <PlusCircle className="w-4 h-4 text-rose-500" />
            <span>Record Trade Expense</span>
          </h3>
          <p className="text-xs text-slate-500">Log tool purchases, transit fuel, or consumable parts to track real net income.</p>

          <form onSubmit={handleAddExpense} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expense Category</label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="Tools & Equipment">Tools & Equipment</option>
                <option value="Travel & Fuel">Travel & Fuel</option>
                <option value="Hardware Materials">Hardware Materials</option>
                <option value="Safety Gear">Safety Gear</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description</label>
              <input
                type="text"
                required
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                placeholder="e.g. Digital Multimeter battery & test probes"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                min="10"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                placeholder="e.g. 450"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingExp}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20"
            >
              {isLoggingExp ? 'Saving...' : 'Add Expense Entry'}
            </button>
          </form>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900">Recent Logged Expenses</h3>

          {expenses.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No expenses recorded yet. Use the form to track tool/travel costs.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <div key={exp.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">{exp.title}</h4>
                    <span className="text-[11px] text-slate-400">{exp.category} • {exp.expense_date}</span>
                  </div>
                  <span className="font-black text-rose-600 text-sm">-₹{exp.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

