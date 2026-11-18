import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, XCircle, Briefcase } from 'lucide-react';
import { jobAPI, assignmentAPI } from '../../services/api';

export default function WorkerApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      setIsLoading(true);
      try {
        const jobsRes = await jobAPI.list({});
        if (jobsRes.data?.success) {
          setApplications([
            {
              id: 1,
              job_title: 'Complete 3BHK Concealed Rewiring & Inverter Setup',
              proposed_rate: 3000,
              status: 'shortlisted',
              applied_at: '2026-11-08',
              customer_name: 'Rajesh Sharma',
              location: 'Bellandur, Bengaluru'
            }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">Accepted</span>;
      case 'shortlisted': return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-bold">Shortlisted</span>;
      case 'rejected': return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold">Declined</span>;
      default: return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold">Pending Review</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Submitted Job Applications</h1>
        <p className="text-xs text-slate-500 mt-1">Track proposal statuses and client responses</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {applications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            You haven't submitted any job proposals yet. Go to Find Jobs to apply.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.map((app) => (
              <div key={app.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-slate-900">{app.job_title}</h3>
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="text-xs text-slate-500">Client: {app.customer_name} • Location: {app.location}</p>
                  <span className="text-[10px] text-slate-400 block">Applied on {app.applied_at}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase block">Your Proposed Rate</span>
                  <span className="text-base font-black text-slate-900">₹{app.proposed_rate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
