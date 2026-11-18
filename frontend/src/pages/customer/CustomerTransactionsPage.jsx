import React, { useState, useEffect } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import { paymentAPI } from '../../services/api';

export default function CustomerTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await paymentAPI.getHistory();
        if (res.data?.success) {
          setTransactions(res.data.transactions);
        }
      } catch (err) {
        console.error('Failed to load transaction history', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  const filtered = transactions.filter((t) =>
    (t.job_title || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.transaction_reference || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.worker_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Transaction History & Tax Invoices</h1>
          <p className="text-xs text-slate-500 mt-1">Audit trail of all digital payments processed through WorkPay AI</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-electric-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading transactions...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No transactions found</h3>
          <p className="text-xs text-slate-500">Payments made for completed jobs will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Transaction Ref</th>
                  <th className="p-4">Project / Job</th>
                  <th className="p-4">Specialist</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-slate-800">{tx.transaction_reference}</td>
                    <td className="p-4 font-medium text-slate-900">{tx.job_title || 'Trade Service'}</td>
                    <td className="p-4 text-slate-600">{tx.worker_name}</td>
                    <td className="p-4 font-extrabold text-slate-900">₹{tx.amount}</td>
                    <td className="p-4 text-slate-500">{tx.payment_method}</td>
                    <td className="p-4 text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {tx.invoice_number ? (
                        <a
                          href={paymentAPI.downloadInvoiceUrl(tx.invoice_number)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-electric-600 hover:text-electric-700 font-bold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      ) : (
                        <span className="text-slate-300">—</span>
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

