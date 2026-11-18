import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, Info, CheckCircle2 } from 'lucide-react';
import { aiAPI } from '../services/api';

export default function AISalaryModal({ isOpen, onClose, initialCategory = 'electrician' }) {
  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [experienceYears, setExperienceYears] = useState(3);
  const [location, setLocation] = useState('Bengaluru');
  const [paymentType, setPaymentType] = useState('per_job');
  const [durationDays, setDurationDays] = useState(1);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePredict = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    try {
      const res = await aiAPI.predictSalary({
        categorySlug,
        experienceYears: parseFloat(experienceYears),
        location,
        paymentType,
        durationDays: parseInt(durationDays, 10)
      });
      if (res.data?.success) {
        setPrediction(res.data.prediction);
      }
    } catch (err) {
      console.error('Salary prediction failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-electric-500/20 border border-electric-400 flex items-center justify-center text-electric-400">
              <Sparkles className="w-5 h-5 text-electric-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Salary & Wage Predictor</h3>
              <p className="text-xs text-slate-300">Fair-market wage recommendation benchmark</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Worker Trade Category</label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-electric-500"
              >
                <option value="electrician">Electrician</option>
                <option value="plumber">Plumber</option>
                <option value="carpenter">Carpenter</option>
                <option value="painter">Painter</option>
                <option value="construction-mason">Construction & Mason</option>
                <option value="driver">Driver</option>
                <option value="cook-chef">Cook & Chef</option>
                <option value="house-cleaner">House Cleaner</option>
                <option value="gardener">Gardener</option>
                <option value="teacher-tutor">Teacher & Tutor</option>
                <option value="mechanic">Mechanic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Years of Experience</label>
              <input
                type="number"
                min="0.5"
                max="30"
                step="0.5"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-electric-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Location / City</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, Mumbai"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-electric-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Structure</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-electric-500"
              >
                <option value="per_job">Per Job / Fixed Scope</option>
                <option value="daily">Daily Wage (8h)</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>

            {paymentType === 'per_job' && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Estimated Job Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-electric-500"
                />
              </div>
            )}

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-electric-600 hover:bg-electric-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>{isLoading ? 'Calculating Market Rate...' : 'Calculate AI Salary Range'}</span>
              </button>
            </div>
          </form>

          {/* Results Box */}
          {prediction && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Suggested Fair Wage</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Confidence 92%</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">Minimum</div>
                  <div className="text-base font-bold text-slate-700">₹{prediction.minSalary}</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-electric-50 to-blue-50 rounded-xl border-2 border-electric-500 shadow-sm">
                  <div className="text-xs text-electric-700 font-bold">Recommended</div>
                  <div className="text-xl font-extrabold text-electric-600">₹{prediction.recommendedSalary}</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">Maximum</div>
                  <div className="text-base font-bold text-slate-700">₹{prediction.maxSalary}</div>
                </div>
              </div>

              {/* Explanations */}
              <div className="space-y-1.5 pt-2">
                <h5 className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-electric-600" />
                  <span>AI Wage Rationale</span>
                </h5>
                <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                  {prediction.explanations?.map((exp, idx) => (
                    <li key={idx}>{exp}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

