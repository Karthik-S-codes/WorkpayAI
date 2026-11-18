import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search, Filter, ShieldCheck, Star, MapPin, IndianRupee,
  Sparkles, CheckCircle2, ChevronRight, Scale
} from 'lucide-react';
import { workerAPI, categoriesAPI } from '../../services/api';
import VoiceSearchButton from '../../components/VoiceSearchButton';
import AIWorkerMatchModal from '../../components/AIWorkerMatchModal';

export default function FindWorkersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [minRating, setMinRating] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [minExp, setMinExp] = useState('');

  // Selected worker for AI Match Modal
  const [matchedWorker, setMatchedWorker] = useState(null);

  // Workers selected for side-by-side comparison
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoriesAPI.list();
        if (res.data?.success) setCategories(res.data.categories);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function fetchWorkers() {
      setIsLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;
        if (location) params.location = location;
        if (minRating) params.minRating = minRating;
        if (maxSalary) params.maxSalary = maxSalary;
        if (minExp) params.minExp = minExp;

        const res = await workerAPI.list(params);
        if (res.data?.success) {
          setWorkers(res.data.workers);
        }
      } catch (err) {
        console.error('Failed to fetch workers', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkers();
  }, [search, category, location, minRating, maxSalary, minExp]);

  const toggleCompare = (w) => {
    if (selectedForCompare.some((x) => x.worker_id === w.worker_id)) {
      setSelectedForCompare(selectedForCompare.filter((x) => x.worker_id !== w.worker_id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can compare up to 3 workers simultaneously.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, w]);
    }
  };

  const goToCompare = () => {
    const ids = selectedForCompare.map((w) => w.worker_id).join(',');
    navigate(`/compare-workers?ids=${ids}`);
  };

  const handleVoiceResult = (transcript, aiParsed) => {
    if (aiParsed?.detectedCategory) {
      setCategory(aiParsed.detectedCategory);
    }
    setSearch(aiParsed?.cleanedSearchQuery || transcript);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Find & Hire Verified Specialists</h1>
          <p className="text-xs text-slate-500 mt-1">Browse trade professionals audited for quality and guaranteed payments</p>
        </div>

        {selectedForCompare.length > 0 && (
          <button
            onClick={goToCompare}
            className="flex items-center space-x-2 py-2.5 px-5 bg-electric-600 hover:bg-electric-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
          >
            <Scale className="w-4 h-4" />
            <span>Compare ({selectedForCompare.length}) Workers</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Text Search + Voice Button */}
          <div className="md:col-span-2 relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by worker name, trade skill, or keywords..."
              className="w-full bg-transparent py-2.5 text-xs font-medium focus:outline-none"
            />
            <VoiceSearchButton onVoiceResult={handleVoiceResult} />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug || c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Filter by Location (e.g. Bellandur)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none"
            />
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
          <span className="font-semibold text-slate-400 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Quick Filters:
          </span>

          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="">Any Rating</option>
            <option value="4.8">⭐ 4.8 & Above</option>
            <option value="4.5">⭐ 4.5 & Above</option>
            <option value="4.0">⭐ 4.0 & Above</option>
          </select>

          <select
            value={minExp}
            onChange={(e) => setMinExp(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="">Any Experience</option>
            <option value="3">3+ Years</option>
            <option value="5">5+ Years</option>
            <option value="8">8+ Years (Master)</option>
          </select>

          <select
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="">Max Daily Rate</option>
            <option value="600">Up to ₹600/day</option>
            <option value="800">Up to ₹800/day</option>
            <option value="1200">Up to ₹1200/day</option>
          </select>

          {(search || category || location || minRating || maxSalary || minExp) && (
            <button
              onClick={() => {
                setSearch('');
                setCategory('');
                setLocation('');
                setMinRating('');
                setMaxSalary('');
                setMinExp('');
              }}
              className="text-electric-600 hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Workers Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 rounded-full border-2 border-electric-600 border-t-transparent animate-spin mx-auto mb-3"></div>
          <span>Discovering verified workers matching criteria...</span>
        </div>
      ) : workers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-lg">🔍</div>
          <h3 className="font-bold text-slate-800 text-base">No workers match your exact search</h3>
          <p className="text-xs text-slate-500">Try broadening your location or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((w) => {
            const isCompared = selectedForCompare.some((x) => x.worker_id === w.worker_id);

            return (
              <div
                key={w.worker_id}
                className={`bg-white rounded-3xl border transition-all duration-200 p-6 flex flex-col justify-between space-y-5 hover:shadow-xl ${
                  isCompared ? 'border-electric-500 ring-2 ring-electric-500/20' : 'border-slate-200'
                }`}
              >
                {/* Top Row: Avatar & Basic Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={w.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={w.full_name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-bold text-slate-900 text-sm">{w.full_name}</h3>
                        {w.verification_status === 'verified' && (
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" title="WorkPay Verified Badge" />
                        )}
                      </div>
                      <span className="inline-block text-[11px] font-semibold text-electric-600 bg-electric-50 px-2 py-0.5 rounded-md mt-0.5">
                        {w.category_name || 'Trade Specialist'}
                      </span>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                          {w.rating_avg || 4.9} ({w.rating_count || 12})
                        </span>
                        <span>•</span>
                        <span>{w.experience_years} yrs exp</span>
                      </div>
                    </div>
                  </div>

                  {/* Compare Checkbox */}
                  <button
                    onClick={() => toggleCompare(w)}
                    className={`p-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      isCompared
                        ? 'bg-electric-600 text-white border-electric-600'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Add to side-by-side comparison"
                  >
                    {isCompared ? '✓ Added' : '+ Compare'}
                  </button>
                </div>

                {/* Bio Snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {w.bio || 'Skilled, punctual and certified trade practitioner available for residential assignments.'}
                </p>

                {/* Skills Chips */}
                {w.skills_list && (
                  <div className="flex flex-wrap gap-1.5">
                    {w.skills_list.split(',').slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Location and Completed Jobs */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[130px]">{w.preferred_location || 'Bengaluru'}</span>
                  </div>
                  <span className="font-semibold text-slate-700">{w.total_completed_jobs || 10}+ Jobs Done</span>
                </div>

                {/* Price and CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Expected Fee</span>
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{w.expected_salary}
                      <span className="text-xs font-normal text-slate-500">/{w.payment_preference || 'day'}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setMatchedWorker(w)}
                      className="p-2 bg-electric-50 hover:bg-electric-100 text-electric-600 rounded-xl"
                      title="Inspect AI Match"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/workers/${w.worker_id}`}
                      className="py-2 px-3.5 bg-electric-600 hover:bg-electric-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                    >
                      <span>View Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Match Compatibility Modal */}
      {matchedWorker && (
        <AIWorkerMatchModal
          isOpen={!!matchedWorker}
          onClose={() => setMatchedWorker(null)}
          worker={matchedWorker}
          onHire={(worker) => navigate(`/workers/${worker.worker_id}`)}
        />
      )}
    </div>
  );
}

