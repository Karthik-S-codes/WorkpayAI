import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, Search, MapPin, IndianRupee, Clock, Send, CheckCircle2 } from 'lucide-react';
import { jobAPI, categoriesAPI } from '../../services/api';
import VoiceSearchButton from '../../components/VoiceSearchButton';

export default function FindJobsPage() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  // Application Modal State
  const [applyTargetJob, setApplyTargetJob] = useState(null);
  const [proposedRate, setProposedRate] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await categoriesAPI.list();
        if (res.data?.success) setCategories(res.data.categories);
      } catch (err) {
        console.error(err);
      }
    }
    loadCats();
  }, []);

  useEffect(() => {
    async function fetchJobs() {
      setIsLoading(true);
      try {
        const params = { status: 'open' };
        if (search) params.search = search;
        if (category) params.category = category;
        if (location) params.location = location;

        const res = await jobAPI.list(params);
        if (res.data?.success) {
          setJobs(res.data.jobs);
        }
      } catch (err) {
        console.error('Failed to load open jobs', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, [search, category, location]);

  const handleOpenApplyModal = (job) => {
    setApplyTargetJob(job);
    setProposedRate(job.budget || '1000');
    setProposalText('');
    setApplySuccess(false);
  };

  const handleSubmitApplication = async (e) => {
    e?.preventDefault();
    if (!applyTargetJob) return;

    setIsApplying(true);
    try {
      const res = await jobAPI.apply(applyTargetJob.id, {
        proposed_rate: parseFloat(proposedRate),
        proposal_text: proposalText
      });

      if (res.data?.success) {
        setApplySuccess(true);
        setTimeout(() => {
          setApplyTargetJob(null);
          setApplySuccess(false);
        }, 1500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Explore Open Job Opportunities</h1>
        <p className="text-xs text-slate-500 mt-1">Discover active client requirements in your trade and location</p>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs by trade skill or keywords..."
            className="w-full bg-transparent py-2.5 text-xs font-medium focus:outline-none"
          />
          <VoiceSearchButton onVoiceResult={(t, p) => setSearch(p?.cleanedSearchQuery || t)} />
        </div>

        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug || c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location filter (e.g. Bellandur)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none"
          />
        </div>
      </div>

      {/* Jobs Listing */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Discovering matching jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No open jobs match your criteria</h3>
          <p className="text-xs text-slate-500">Check back shortly as new customer requests are posted hourly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-electric-600 bg-electric-50 px-2.5 py-0.5 rounded-md">
                    {job.category_name}
                  </span>
                  <span className="text-base font-black text-slate-900">
                    ₹{job.budget}
                    <span className="text-[10px] text-slate-400 font-normal">/{job.payment_type || 'per job'}</span>
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {job.location}
                  </span>
                  <span>•</span>
                  <span>{job.expected_duration || '1 Day'}</span>
                  <span>•</span>
                  <span>{job.required_experience} yrs min exp</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>

                <button
                  onClick={() => handleOpenApplyModal(job)}
                  className="py-2 px-5 bg-electric-600 hover:bg-electric-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-electric-600/20 flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Application</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Proposal Modal */}
      {applyTargetJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-5">
            <h3 className="font-bold text-lg text-slate-900">Apply for Project</h3>
            <p className="text-xs text-slate-500 font-medium">{applyTargetJob.title}</p>

            {applySuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Application submitted to client successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Proposed Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={proposedRate}
                    onChange={(e) => setProposedRate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Client Budget: ₹{applyTargetJob.budget}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Proposal Pitch & Availability</label>
                  <textarea
                    rows={4}
                    required
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                    placeholder="Explain your relevant tools, experience, warranty, and when you can start..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyTargetJob(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="flex-1 py-2.5 bg-electric-600 hover:bg-electric-700 text-white rounded-xl text-xs font-bold shadow-md shadow-electric-600/20"
                  >
                    {isApplying ? 'Submitting...' : 'Send Proposal'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

