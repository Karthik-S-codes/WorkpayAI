import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, PlusCircle, Sparkles, MapPin, IndianRupee,
  Calendar, CheckCircle2, Star, ShieldCheck, ChevronRight
} from 'lucide-react';
import { jobAPI } from '../../services/api';
import AIWorkerMatchModal from '../../components/AIWorkerMatchModal';

export default function MyJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [inspectWorker, setInspectWorker] = useState(null);

  useEffect(() => {
    async function loadMyJobs() {
      setIsLoading(true);
      try {
        const res = await jobAPI.list({ myJobs: 'true' });
        if (res.data?.success) {
          setJobs(res.data.jobs);
          if (res.data.jobs.length > 0) {
            handleSelectJob(res.data.jobs[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load my jobs', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMyJobs();
  }, []);

  const handleSelectJob = async (jobId) => {
    setSelectedJob(jobId);
    setLoadingDetails(true);
    try {
      const res = await jobAPI.getById(jobId);
      if (res.data?.success) {
        setJobDetails(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'applications_received': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Posted Job Requirements</h1>
          <p className="text-xs text-slate-500 mt-1">Manage active listings and review applicants with AI Compatibility</p>
        </div>

        <Link
          to="/customer/post-job"
          className="py-2.5 px-4 bg-electric-600 hover:bg-electric-700 text-white rounded-xl text-xs font-bold shadow-md shadow-electric-600/20 flex items-center space-x-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading your jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">You haven't posted any jobs yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first job listing to get AI recommendations and direct worker applications.
          </p>
          <Link
            to="/customer/post-job"
            className="inline-block py-2.5 px-6 bg-electric-600 text-white rounded-xl text-xs font-bold"
          >
            Post a Job Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job List Left Pane */}
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleSelectJob(job.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedJob === job.id
                    ? 'bg-white border-electric-500 shadow-md ring-2 ring-electric-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getStatusBadge(job.status)}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-black text-slate-900">₹{job.budget}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{job.title}</h3>
                <div className="flex items-center space-x-3 text-xs text-slate-500 mt-2">
                  <span>{job.category_name}</span>
                  <span>•</span>
                  <span className="flex items-center text-purple-600 font-semibold">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    {job.application_count || 0} applicants
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Job Details & AI Applications Right Pane */}
          <div className="lg:col-span-2 space-y-6">
            {loadingDetails ? (
              <div className="py-20 text-center text-slate-400">Loading details & applicants...</div>
            ) : jobDetails ? (
              <div className="space-y-6">
                {/* Job Overview Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">{jobDetails.job.title}</h2>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                        <span className="text-electric-600 font-bold">{jobDetails.job.category_name}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                          {jobDetails.job.location}
                        </span>
                        <span>•</span>
                        <span>Budget: ₹{jobDetails.job.budget}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {jobDetails.job.description}
                  </p>
                </div>

                {/* Applications & AI Match Roster */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-electric-600" />
                      <span>Applicant Roster with AI Compatibility</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {jobDetails.applications?.length || 0} candidates
                    </span>
                  </div>

                  {jobDetails.applications?.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No applications received yet for this requirement. You can also search workers directly from the marketplace!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jobDetails.applications.map((app) => (
                        <div
                          key={app.id}
                          className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center space-x-3.5">
                            <img
                              src={app.worker_avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                              alt={app.worker_name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                            />
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <h4 className="font-bold text-slate-900 text-xs">{app.worker_name}</h4>
                                {app.verification_status === 'verified' && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                                <span>₹{app.proposed_rate} proposed</span>
                                <span>•</span>
                                <span className="text-amber-500 font-bold">⭐ {app.rating_avg}</span>
                                <span>•</span>
                                <span>{app.experience_years} yrs exp</span>
                              </div>
                            </div>
                          </div>

                          {/* AI Compatibility Badge & Actions */}
                          <div className="flex items-center space-x-3 self-end sm:self-center">
                            <button
                              onClick={() => setInspectWorker(app)}
                              className="flex items-center space-x-1.5 bg-gradient-to-r from-electric-50 to-teal-50 border border-electric-200 text-electric-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:scale-105 transition-all shadow-sm"
                            >
                              <Sparkles className="w-3 h-3 text-electric-600" />
                              <span>{app.aiMatchScore}% Match</span>
                            </button>

                            <Link
                              to={`/workers/${app.worker_id}`}
                              className="py-1.5 px-3 bg-electric-600 hover:bg-electric-700 text-white rounded-xl text-xs font-bold shadow-sm"
                            >
                              Hire
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {inspectWorker && (
        <AIWorkerMatchModal
          isOpen={!!inspectWorker}
          onClose={() => setInspectWorker(null)}
          worker={inspectWorker}
          jobTitle={jobDetails?.job?.title}
          onHire={(w) => navigate(`/workers/${w.worker_id}`)}
        />
      )}
    </div>
  );
}

