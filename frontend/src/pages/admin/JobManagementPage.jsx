import React, { useState, useEffect } from 'react';
import { Briefcase, Search, MapPin, IndianRupee, Trash2 } from 'lucide-react';
import { jobAPI } from '../../services/api';

export default function JobManagementPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [search]);

  async function loadJobs() {
    setIsLoading(true);
    try {
      const res = await jobAPI.list({ search });
      if (res.data?.success) setJobs(res.data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async (jobId) => {
    if (!window.confirm(`Delete job requirement #${jobId}?`)) return;
    try {
      const res = await jobAPI.delete(jobId);
      if (res.data?.success) {
        alert('Job requirement deleted.');
        loadJobs();
      }
    } catch (err) {
      alert('Failed to delete job.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Platform Job Listings Moderation</h1>
          <p className="text-xs text-slate-500 mt-1">Audit active client postings across all trade specializations</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading jobs...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Job Title</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{j.title}</div>
                      <span className="text-[10px] text-slate-400">ID #{j.id} • Posted {new Date(j.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{j.customer_name}</td>
                    <td className="p-4 text-electric-600 font-semibold">{j.category_name}</td>
                    <td className="p-4 font-bold text-slate-900">₹{j.budget}</td>
                    <td className="p-4 text-slate-500">{j.location}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {j.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(j.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

