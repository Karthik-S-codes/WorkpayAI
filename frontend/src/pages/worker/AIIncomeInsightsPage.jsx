import React, { useState, useEffect } from 'react';
import {
  Sparkles, TrendingUp, Lightbulb, Award, CheckCircle2,
  DollarSign, ArrowUpRight, BarChart2
} from 'lucide-react';
import { aiAPI, workerAPI } from '../../services/api';

export default function AIIncomeInsightsPage() {
  const [insights, setInsights] = useState(null);
  const [upskilling, setUpskilling] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [incRes, dashRes] = await Promise.all([
          aiAPI.getIncomeInsights('me'),
          workerAPI.getDashboard()
        ]);

        if (incRes.data?.success) setInsights(incRes.data.insights);

        // Fetch AI Skill recommendations
        const categorySlug = dashRes.data?.dashboard?.worker?.category_slug || 'electrician';
        const skillsRes = await aiAPI.recommendSkills({
          categorySlug,
          currentSkills: []
        });

        if (skillsRes.data?.success) setUpskilling(skillsRes.data);
      } catch (err) {
        console.error('Failed to load AI income insights', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-electric-600 border-t-transparent animate-spin mx-auto mb-3"></div>
        <span>Generating AI Financial Analytics & Personalized Optimization Tips...</span>
      </div>
    );
  }

  const summary = insights?.summary || {};
  const aiTips = insights?.aiSuggestions || [];
  const roadmaps = upskilling?.recommendations || [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-electric-900 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-electric-500/20 border border-electric-400/30 px-3 py-1 rounded-full text-xs font-semibold text-teal-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Financial Advisory & Demand Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Personalized Income Optimization</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Insights synthesized using your historical MySQL wallet transactions and city-wide trade pricing benchmarks.
          </p>
        </div>

        <div className="p-4 bg-navy-900/80 rounded-2xl border border-white/10 text-right shrink-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Est. Monthly Potential</span>
          <span className="text-2xl font-black text-emerald-400">
            ₹{Math.round((summary.totalNetEarnings || 15000) * 1.35)}
          </span>
          <span className="text-[10px] text-teal-300 block mt-0.5">With weekend trade clustering</span>
        </div>
      </div>

      {/* AI Personalized Suggestions */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span>Tailored Financial Insights for Your Profile</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiTips.map((tip, idx) => (
            <div key={idx} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-amber-600" />
                <span>Insight #{idx + 1}</span>
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Upskilling Recommendations */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <Award className="w-5 h-5 text-electric-600" />
              <span>Recommended High-Earning Skills to Learn</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">High-demand trade specialties that increase your daily earning bracket</p>
          </div>
          <span className="text-xs text-electric-600 font-bold bg-electric-50 px-3 py-1 rounded-full">
            {upskilling?.category || 'Specialist'} Trade Roadmap
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {roadmaps.map((item, idx) => (
            <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Demand: {item.demand}
                  </span>
                  <span className="text-xs font-black text-electric-600">
                    {item.earningBoost} Revenue
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">{item.skill}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.reason}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center text-[11px] text-electric-600 font-bold">
                <span>View Free Trade Learning Path →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

