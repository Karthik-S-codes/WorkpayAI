import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, Wand2 } from 'lucide-react';
import { aiAPI } from '../services/api';

export default function AIJobDescModal({ isOpen, onClose, onApplyJobDraft }) {
  const [category, setCategory] = useState('Electrician');
  const [shortSummary, setShortSummary] = useState('');
  const [location, setLocation] = useState('Bengaluru');
  const [budget, setBudget] = useState(2000);
  const [duration, setDuration] = useState('1 Day');
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    try {
      const res = await aiAPI.generateJobDesc({
        category,
        shortSummary,
        location,
        budget: parseFloat(budget),
        duration
      });
      if (res.data?.success) {
        setGeneratedDraft(res.data.jobDraft);
      }
    } catch (err) {
      console.error('Job desc generation error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (onApplyJobDraft && generatedDraft) {
      onApplyJobDraft({
        title: generatedDraft.title,
        description: `${generatedDraft.description}\n\nKey Deliverables:\n• ${generatedDraft.deliverables.join('\n• ')}\n\nSafety Requirements:\n• ${generatedDraft.safetyAndTools.join('\n• ')}`,
        budget: generatedDraft.suggestedBudget,
        payment_type: generatedDraft.paymentType,
        expected_duration: generatedDraft.expectedDuration,
        working_hours: generatedDraft.workingHours
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-electric-500/20 border border-electric-400 flex items-center justify-center text-electric-400">
              <Sparkles className="w-5 h-5 text-electric-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Job Description Generator</h3>
              <p className="text-xs text-slate-300">Generate clear, attractive job requirements in seconds</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="Construction Worker & Mason">Mason</option>
                <option value="Cook & Chef">Cook & Chef</option>
                <option value="House Cleaner">House Cleaner</option>
                <option value="Gardener">Gardener</option>
                <option value="Driver">Driver</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-electric-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Brief Task Outline (a few words)</label>
              <input
                type="text"
                value={shortSummary}
                onChange={(e) => setShortSummary(e.target.value)}
                placeholder="e.g. 3BHK flat rewiring, installing inverter & fixing ceiling fan"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-electric-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-electric-600 hover:bg-electric-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-sm"
              >
                <Wand2 className="w-4 h-4" />
                <span>{isLoading ? 'Drafting Job Specification...' : 'Generate Professional Job Description'}</span>
              </button>
            </div>
          </form>

          {/* Generated Result */}
          {generatedDraft && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Generated Title</span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">{generatedDraft.title}</h4>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Scope of Work</span>
                <p className="text-xs text-slate-700 leading-relaxed mt-1">{generatedDraft.description}</p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Deliverables</span>
                <ul className="text-xs text-slate-700 space-y-1 mt-1 pl-4 list-disc">
                  {generatedDraft.deliverables.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md"
                >
                  Insert Draft into Job Post Form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

