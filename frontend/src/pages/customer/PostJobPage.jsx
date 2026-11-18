import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Sparkles, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { jobAPI, categoriesAPI } from '../../services/api';
import AIJobDescModal from '../../components/AIJobDescModal';
import AISalaryModal from '../../components/AISalaryModal';

export default function PostJobPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [requiredExperience, setRequiredExperience] = useState(2);
  const [location, setLocation] = useState('Bengaluru South');
  const [budget, setBudget] = useState(1800);
  const [paymentType, setPaymentType] = useState('per_job');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedDuration, setExpectedDuration] = useState('1 Day');
  const [workingHours, setWorkingHours] = useState('8 Hours/Day');

  const [aiJobDescOpen, setAiJobDescOpen] = useState(false);
  const [aiSalaryOpen, setAiSalaryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  const handleApplyDraft = (draft) => {
    setTitle(draft.title);
    setDescription(draft.description);
    setBudget(draft.budget);
    setPaymentType(draft.payment_type);
    setExpectedDuration(draft.expected_duration);
    setWorkingHours(draft.working_hours);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await jobAPI.create({
        title,
        category_id: categoryId,
        description,
        required_skills: requiredSkills,
        required_experience: parseFloat(requiredExperience),
        location,
        budget: parseFloat(budget),
        payment_type: paymentType,
        start_date: startDate,
        expected_duration: expectedDuration,
        working_hours: workingHours
      });

      if (res.data?.success) {
        navigate('/customer/my-jobs');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Post a New Job Requirement</h1>
          <p className="text-xs text-slate-500 mt-1">Hire verified trade professionals with AI recommendation & safe escrow</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setAiSalaryOpen(true)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-electric-600" />
            <span>AI Wage Check</span>
          </button>
          <button
            type="button"
            onClick={() => setAiJobDescOpen(true)}
            className="text-xs bg-electric-600 hover:bg-electric-700 text-white font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-md shadow-electric-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Draft with AI</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete 3BHK Concealed Electrical Rewiring & Inverter Fitting"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-electric-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Worker Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-electric-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Address</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bellandur, Bengaluru South"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description & Deliverables</label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the work scope, tools needed, and specific expectations..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-electric-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Budget / Offered Fee (₹)</label>
              <input
                type="number"
                required
                min="100"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-electric-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Structure</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-electric-500"
              >
                <option value="per_job">Per Job (Fixed Total)</option>
                <option value="daily">Daily Wage Rate</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Required Experience (Yrs)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={requiredExperience}
                onChange={(e) => setRequiredExperience(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Duration</label>
              <input
                type="text"
                value={expectedDuration}
                onChange={(e) => setExpectedDuration(e.target.value)}
                placeholder="e.g. 2 Days"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Hours</label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="e.g. 8 Hours/Day"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (Comma separated)</label>
            <input
              type="text"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="e.g. House Wiring & Rewiring, MCB Setup, Inverter Testing"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-electric-600 hover:bg-electric-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-electric-600/20 flex items-center justify-center space-x-2"
          >
            <span>{isSubmitting ? 'Publishing Job...' : 'Publish Job Requirement'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <AIJobDescModal
        isOpen={aiJobDescOpen}
        onClose={() => setAiJobDescOpen(false)}
        onApplyJobDraft={handleApplyDraft}
      />

      <AISalaryModal
        isOpen={aiSalaryOpen}
        onClose={() => setAiSalaryOpen(false)}
      />
    </div>
  );
}

