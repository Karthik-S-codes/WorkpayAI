import React, { useState, useEffect } from 'react';
import { Star, Sparkles, MessageSquare, CheckCircle2 } from 'lucide-react';
import { workerAPI, aiAPI } from '../../services/api';

export default function WorkerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      setIsLoading(true);
      try {
        const dashRes = await workerAPI.getDashboard();
        if (dashRes.data?.success) {
          const revs = dashRes.data.dashboard?.recentReviews || [];
          setReviews(revs);

          // Trigger AI sentiment analysis
          if (revs.length > 0) {
            const aiRes = await aiAPI.analyzeReviews({ reviews: revs });
            if (aiRes.data?.success) setAnalysis(aiRes.data.analysis);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Client Reviews & Sentiment Analysis</h1>
        <p className="text-xs text-slate-500 mt-1">Customer feedback parsed by AI to extract trade strengths and satisfaction score</p>
      </div>

      {analysis && (
        <div className="bg-gradient-to-r from-navy-950 to-navy-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Feedback Summary</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Quality Satisfaction Index</span>
              <div className="text-3xl font-black text-emerald-400">{analysis.qualityIndex}%</div>
              <span className="text-[10px] text-slate-300">Stellar client approval rating</span>
            </div>

            <div className="md:col-span-2 space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Customer-Praised Strengths</span>
              <div className="flex flex-wrap gap-2">
                {analysis.topStrengths?.map((str, idx) => (
                  <span key={idx} className="bg-white/10 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-white/10">
                    ✓ {str}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-base text-slate-900">All Client Reviews</h3>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No reviews recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{r.reviewer_name}</span>
                  <span className="flex items-center text-amber-500 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                    {r.rating}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">"{r.review_text}"</p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  Verified Completion • {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

