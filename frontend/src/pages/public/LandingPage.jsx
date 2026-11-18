import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Search, Sparkles, CheckCircle2, ArrowRight, Zap,
  Wrench, Hammer, Palette, Building, Car, Utensils, Sparkle,
  TrendingUp, Lock, FileText, Star, Users, Briefcase
} from 'lucide-react';
import VoiceSearchButton from '../../components/VoiceSearchButton';
import AISalaryModal from '../../components/AISalaryModal';
import { categoriesAPI } from '../../services/api';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);

  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await categoriesAPI.list();
        if (res.data?.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        // Fallback default categories
        setCategories([
          { id: 1, name: 'Electrician', slug: 'electrician', icon: 'Zap' },
          { id: 2, name: 'Plumber', slug: 'plumber', icon: 'Wrench' },
          { id: 3, name: 'Carpenter', slug: 'carpenter', icon: 'Hammer' },
          { id: 4, name: 'Painter', slug: 'painter', icon: 'Palette' },
          { id: 5, name: 'Construction & Mason', slug: 'construction-mason', icon: 'Building' },
          { id: 6, name: 'Driver', slug: 'driver', icon: 'Car' },
          { id: 7, name: 'Cook & Chef', slug: 'cook-chef', icon: 'Utensils' },
          { id: 8, name: 'House Cleaner', slug: 'house-cleaner', icon: 'Sparkles' }
        ]);
      }
    }
    fetchCats();
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/find-workers?${params.toString()}`);
  };

  const handleVoiceResult = (transcript, aiParsed) => {
    if (aiParsed?.detectedCategory) {
      setSelectedCategory(aiParsed.detectedCategory);
    }
    setSearchQuery(aiParsed?.cleanedSearchQuery || transcript);
    navigate(`/find-workers?search=${encodeURIComponent(aiParsed?.cleanedSearchQuery || transcript)}&category=${aiParsed?.detectedCategory || ''}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-navy-800/80 border border-electric-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-electric-400">
            <Sparkles className="w-3.5 h-3.5 text-electric-400" />
            <span>AI-Powered Worker Hiring & Digital FinTech Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Connecting Workers, <span className="bg-gradient-to-r from-electric-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Securing Payments</span>, Empowering Growth.
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            Discover verified electricians, plumbers, carpenters, cooks, and skilled professionals. Backed by AI matching, fair wage estimation, and digital escrow payment ledgers.
          </p>

          {/* Search Box with Voice Search */}
          <div className="max-w-3xl mx-auto bg-white p-2.5 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 text-slate-800">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 flex items-center px-3 w-full">
                <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What service do you need? (e.g. Electrician, Bathroom repair)"
                  className="w-full text-sm font-medium focus:outline-none placeholder:text-slate-400 py-2"
                />
                <VoiceSearchButton onVoiceResult={handleVoiceResult} />
              </div>

              <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

              <div className="w-full sm:w-48 px-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-sm font-medium bg-transparent focus:outline-none text-slate-600 cursor-pointer py-2"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug || c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-1.5 shrink-0"
              >
                <span>Find Workers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Metrics */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-navy-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl font-black text-white">14+</div>
              <div className="text-xs text-slate-400 font-medium">Trade Categories</div>
            </div>
            <div className="bg-navy-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 font-medium">Verified Credentials</div>
            </div>
            <div className="bg-navy-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl font-black text-electric-400">0%</div>
              <div className="text-xs text-slate-400 font-medium">Hidden Payment Fees</div>
            </div>
            <div className="bg-navy-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl font-black text-teal-400">10 AI</div>
              <div className="text-xs text-slate-400 font-medium">Smart Algorithmic Tools</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Trade Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-electric-600">Explore Trade Skills</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Hire by Specialization</h2>
          </div>
          <Link
            to="/find-workers"
            className="text-xs font-bold text-electric-600 hover:text-electric-700 flex items-center space-x-1 mt-2 sm:mt-0"
          >
            <span>View all 14 categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              to={`/find-workers?category=${cat.slug || cat.id}`}
              className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-electric-500/50 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-electric-50 text-electric-600 flex items-center justify-center font-bold group-hover:bg-electric-600 group-hover:text-white transition-colors mb-4">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-electric-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {cat.description || 'Verified professionals with guaranteed workmanship.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Avg. ₹{cat.base_daily_rate || 750}/day</span>
                <span className="text-electric-600 font-bold group-hover:translate-x-1 transition-transform">Hire →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. AI Features Section */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-electric-600">State-of-the-Art Intelligence</span>
            <h2 className="text-3xl font-extrabold text-slate-900">How AI Powers WorkPay</h2>
            <p className="text-sm text-slate-600">
              Unlike generic classifieds, WorkPay AI builds transparency, eliminates payment disputes, and recommends fair compensation using mathematical optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-electric-100 text-electric-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">AI Worker Matching (0-100%)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates skills overlap, commute distance, budget alignment, and client rating history to recommend top-tier specialists with transparent match reasons.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">AI Salary & Wage Predictor</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates fair-market minimum, recommended, and maximum wages benchmarked against local economic tiers to stop underpayment and unfair gouging.
              </p>
              <button
                onClick={() => setSalaryModalOpen(true)}
                className="text-xs font-bold text-electric-600 hover:underline"
              >
                Try Salary Calculator →
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">AI Fraud & Velocity Detection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scans payment spikes, abnormal cancellation trends, and suspicious duplicate behavior to alert administrators and safeguard user funds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FinTech & Payment Flow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Guaranteed Financial Safety</span>
          <h2 className="text-3xl font-extrabold text-slate-900">Safe Digital Payment Architecture</h2>
          <p className="text-sm text-slate-600">
            WorkPay AI uses an internal double-entry ledger with cryptographic signature verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center mx-auto text-sm">1</div>
            <h4 className="font-bold text-sm text-slate-900">Offer Accepted</h4>
            <p className="text-xs text-slate-500">Customer and worker agree on the scope, rate, and delivery date.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-full bg-electric-100 text-electric-700 font-extrabold flex items-center justify-center mx-auto text-sm">2</div>
            <h4 className="font-bold text-sm text-slate-900">Digital Payment</h4>
            <p className="text-xs text-slate-500">Customer pays securely via UPI or Netbanking. Held in internal escrow.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-extrabold flex items-center justify-center mx-auto text-sm">3</div>
            <h4 className="font-bold text-sm text-slate-900">Client Sign-Off</h4>
            <p className="text-xs text-slate-500">Worker marks task complete. Customer inspects and confirms satisfaction.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center mx-auto text-sm">4</div>
            <h4 className="font-bold text-sm text-slate-900">Instant Wallet Credit</h4>
            <p className="text-xs text-slate-500">Funds unlock into worker's wallet with downloadable tax invoice.</p>
          </div>
        </div>
      </section>

      {/* 5. CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-950 via-electric-900 to-navy-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to hire or start earning on WorkPay?</h3>
            <p className="text-slate-300 text-sm">Join thousands of verified workers and domestic clients on India's premier AI labor platform.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/register?role=customer"
              className="py-3 px-6 bg-white text-navy-950 font-bold rounded-xl text-center text-sm hover:bg-slate-100 transition-all shadow-md"
            >
              Hire Workers
            </Link>
            <Link
              to="/register?role=worker"
              className="py-3 px-6 bg-electric-600 text-white font-bold rounded-xl text-center text-sm hover:bg-electric-500 transition-all shadow-md"
            >
              Join as a Worker
            </Link>
          </div>
        </div>
      </section>

      <AISalaryModal isOpen={salaryModalOpen} onClose={() => setSalaryModalOpen(false)} />
    </div>
  );
}

