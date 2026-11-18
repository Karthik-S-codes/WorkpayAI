import React, { useState } from 'react';
import { X, Sparkles, Wand2, Check } from 'lucide-react';
import { aiAPI } from '../services/api';

export default function AIProfileBuilderModal({ isOpen, onClose, onApplyProfile, defaultCategory = 'Electrician' }) {
  const [category, setCategory] = useState(defaultCategory);
  const [experienceYears, setExperienceYears] = useState(4);
  const [rawDescription, setRawDescription] = useState('');
  const [location, setLocation] = useState('Bengaluru');
  const [generatedProfile, setGeneratedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    try {
      const res = await aiAPI.buildProfile({
        category,
        experienceYears: parseFloat(experienceYears),
        rawDescription,
        location
      });
      if (res.data?.success) {
        setGeneratedProfile(res.data.profile);
      }
    } catch (err) {
      console.error('Profile builder error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (onApplyProfile && generatedProfile) {
      onApplyProfile({
        bio: `${generatedProfile.headline}\n\n${generatedProfile.bio}\n\nCore Highlights:\n• ${generatedProfile.highlights.join('\n• ')}`
      });
      onClose();
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
              <h3 className="font-bold text-lg">AI Worker Profile Builder</h3>
              <p className="text-xs text-slate-300">Turn raw skills into a high-paying profile introduction</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Trade Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-electric-500"
                >
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Painter">Painter</option>
                  <option value="Cook-Chef">Cook & Chef</option>
                  <option value="House Cleaner">House Cleaner</option>
                  <option value="Driver">Driver</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Years in Trade</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-electric-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Raw Skill Notes (tell us in your words)</label>
              <textarea
                rows={3}
                value={rawDescription}
                onChange={(e) => setRawDescription(e.target.value)}
                placeholder="e.g. I do residential wiring, fix MCB trips, install inverters, have 4 yrs experience in BTM, always carry test meter"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-electric-600 hover:bg-electric-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isLoading ? 'Synthesizing Professional Bio...' : 'Generate Profile with AI'}</span>
            </button>
          </form>

          {/* Result */}
          {generatedProfile && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 animate-in fade-in">
              <h4 className="text-sm font-bold text-slate-900">{generatedProfile.headline}</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{generatedProfile.bio}</p>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Highlights</span>
                <ul className="text-xs text-slate-700 space-y-1 mt-1 pl-4 list-disc">
                  {generatedProfile.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApply}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md"
                >
                  Insert Bio Into My Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

