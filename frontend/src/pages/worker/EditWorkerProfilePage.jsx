import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Award, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { workerAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AIProfileBuilderModal from '../../components/AIProfileBuilderModal';

export default function EditWorkerProfilePage() {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('Bengaluru South');
  const [categoryId, setCategoryId] = useState(1);
  const [experienceYears, setExperienceYears] = useState(3);
  const [expectedSalary, setExpectedSalary] = useState(650);
  const [paymentPreference, setPaymentPreference] = useState('daily');
  const [availabilityStatus, setAvailabilityStatus] = useState('available');

  // Certificate upload
  const [certTitle, setCertTitle] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certDate, setCertDate] = useState('');

  const [aiBuilderOpen, setAiBuilderOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await workerAPI.getDashboard();
        if (res.data?.success && res.data.dashboard?.worker) {
          const w = res.data.dashboard.worker;
          setBio(w.bio || '');
          setAddress(w.address || '');
          setPreferredLocation(w.preferred_location || 'Bengaluru South');
          setCategoryId(w.category_id || 1);
          setExperienceYears(w.experience_years || 3);
          setExpectedSalary(w.expected_salary || 650);
          setPaymentPreference(w.payment_preference || 'daily');
          setAvailabilityStatus(w.availability_status || 'available');
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await workerAPI.updateProfile({
        full_name: fullName,
        phone,
        bio,
        address,
        preferred_location: preferredLocation,
        category_id: categoryId,
        experience_years: parseFloat(experienceYears),
        expected_salary: parseFloat(expectedSalary),
        payment_preference: paymentPreference,
        availability_status: availabilityStatus
      });

      if (res.data?.success) {
        updateUser({ full_name: fullName, phone });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      alert('Failed to update worker profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadCert = async (e) => {
    e?.preventDefault();
    if (!certTitle) return;
    try {
      const res = await workerAPI.uploadCertificate({
        title: certTitle,
        issuing_org: certOrg,
        issue_date: certDate
      });
      if (res.data?.success) {
        alert('Certificate uploaded for administrative verification!');
        setCertTitle('');
        setCertOrg('');
        setCertDate('');
      }
    } catch (err) {
      alert('Failed to upload certificate');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Edit Worker Profile & Credentials</h1>
          <p className="text-xs text-slate-500 mt-1">Keep your rates and trade bio updated to maximize customer booking matches</p>
        </div>

        <button
          type="button"
          onClick={() => setAiBuilderOpen(true)}
          className="py-2.5 px-4 bg-gradient-to-r from-electric-600 to-teal-500 text-white font-bold rounded-xl text-xs shadow-md shadow-electric-600/20 flex items-center space-x-1.5 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Profile Bio Builder</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile saved successfully!</span>
        </div>
      )}

      {/* Main Profile Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-electric-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-electric-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Trade Introduction & Bio</label>
              <button
                type="button"
                onClick={() => setAiBuilderOpen(true)}
                className="text-xs text-electric-600 hover:underline font-bold flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-draft with AI</span>
              </button>
            </div>
            <textarea
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Detail your trade background, types of installations you perform, and safety guarantees..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-electric-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Years in Trade</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Fee (₹)</label>
              <input
                type="number"
                step="50"
                min="200"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-electric-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Basis</label>
              <select
                value={paymentPreference}
                onChange={(e) => setPaymentPreference(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-electric-500"
              >
                <option value="daily">Daily Wage</option>
                <option value="per_job">Per Job</option>
                <option value="hourly">Hourly Rate</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Zone</label>
              <input
                type="text"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Availability Status</label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-electric-500"
              >
                <option value="available">🟢 Available for new jobs</option>
                <option value="busy">🟡 Currently on active project</option>
                <option value="unavailable">🔴 Off-duty / Unavailable</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-electric-600/20"
          >
            {isSubmitting ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Upload Certificate Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
          <Award className="w-4 h-4 text-electric-600" />
          <span>Upload Trade Certificate or Vocational Diploma</span>
        </h3>
        <p className="text-xs text-slate-500">
          Upload certificates from ITI, NSDC, or vocational councils to receive your WorkPay Verified Badge.
        </p>

        <form onSubmit={handleUploadCert} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Certificate Title</label>
            <input
              type="text"
              required
              value={certTitle}
              onChange={(e) => setCertTitle(e.target.value)}
              placeholder="e.g. National Trade Certificate - Electrician"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Issuing Authority</label>
            <input
              type="text"
              value={certOrg}
              onChange={(e) => setCertOrg(e.target.value)}
              placeholder="e.g. NCVT / Indian Plumbing Assoc."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Issue Date</label>
            <input
              type="date"
              value={certDate}
              onChange={(e) => setCertDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="sm:col-span-3 pt-2">
            <button
              type="submit"
              className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Submit for Admin Verification
            </button>
          </div>
        </form>
      </div>

      <AIProfileBuilderModal
        isOpen={aiBuilderOpen}
        onClose={() => setAiBuilderOpen(false)}
        onApplyProfile={(p) => setBio(p.bio)}
      />
    </div>
  );
}

