import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Star, MapPin, IndianRupee, Calendar, CheckCircle2,
  FileText, Clock, Send, Sparkles, Award, ArrowLeft
} from 'lucide-react';
import { workerAPI, hiringAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function WorkerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [worker, setWorker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hireModalOpen, setHireModalOpen] = useState(false);

  // Hiring Form State
  const [offeredRate, setOfferedRate] = useState('');
  const [paymentType, setPaymentType] = useState('per_job');
  const [hireMessage, setHireMessage] = useState('');
  const [hireSubmitting, setHireSubmitting] = useState(false);
  const [hireSuccess, setHireSuccess] = useState(false);

  useEffect(() => {
    async function fetchWorker() {
      setIsLoading(true);
      try {
        const res = await workerAPI.getById(id);
        if (res.data?.success) {
          setWorker(res.data.worker);
          setOfferedRate(res.data.worker.expected_salary || '800');
        }
      } catch (err) {
        console.error('Failed to load worker', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorker();
  }, [id]);

  const handleSendHiringOffer = async (e) => {
    e?.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'customer') {
      alert('Only customers can send hiring offers. Please switch to a customer account.');
      return;
    }

    setHireSubmitting(true);
    try {
      const res = await hiringAPI.createRequest({
        worker_id: worker.id,
        offered_rate: parseFloat(offeredRate),
        payment_type: paymentType,
        message: hireMessage
      });

      if (res.data?.success) {
        setHireSuccess(true);
        setTimeout(() => {
          setHireModalOpen(false);
          setHireSuccess(false);
          navigate('/customer/hiring-requests');
        }, 1500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send hiring offer.');
    } finally {
      setHireSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-electric-600 border-t-transparent animate-spin mx-auto mb-3"></div>
        <span>Loading specialist profile...</span>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Worker profile not found</h2>
        <button onClick={() => navigate(-1)} className="text-electric-600 font-semibold text-sm">
          ← Back to Workers
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to search</span>
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center space-x-5">
          <img
            src={worker.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200'}
            alt={worker.full_name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-white shadow-lg shrink-0"
          />
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900">{worker.full_name}</h1>
              {worker.verification_status === 'verified' && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Badge</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="font-bold text-electric-600 bg-electric-50 px-2.5 py-1 rounded-lg">
                {worker.category_name}
              </span>
              <span className="flex items-center text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                {worker.rating_avg} ({worker.rating_count} reviews)
              </span>
              <span>•</span>
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                {worker.preferred_location}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Hire Button */}
        <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 gap-3">
          <div className="text-left md:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Expected Compensation</span>
            <span className="text-2xl font-black text-slate-900">
              ₹{worker.expected_salary}
              <span className="text-xs font-normal text-slate-500">/{worker.payment_preference || 'day'}</span>
            </span>
          </div>

          <button
            onClick={() => setHireModalOpen(true)}
            className="py-3 px-6 bg-electric-600 hover:bg-electric-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-electric-600/20 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Hiring Offer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Bio & Skills & Reviews */}
        <div className="md:col-span-2 space-y-8">
          {/* Bio */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm">
            <h3 className="font-bold text-base text-slate-900">Professional Summary</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {worker.bio || 'Skilled, punctual and certified trade practitioner available for residential assignments.'}
            </p>
          </div>

          {/* Trade Skills */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-slate-900">Specialized Skills</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {worker.skills?.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{s.name}</span>
                  <span className="text-[10px] bg-electric-100 text-electric-700 font-semibold px-2 py-0.5 rounded-full capitalize">
                    {s.proficiency_level || 'Expert'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Past Client Reviews */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Verified Client Reviews</h3>
              <span className="text-xs text-slate-500 font-medium">({worker.reviews?.length || 0} reviews)</span>
            </div>

            {worker.reviews?.length === 0 ? (
              <p className="text-xs text-slate-400">No client reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {worker.reviews?.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{r.reviewer_name}</span>
                      <span className="flex items-center text-amber-500 text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-400 mr-1" />
                        {r.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.review_text}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Credentials & Weekly Timetable */}
        <div className="space-y-6">
          {/* Verified Certificates */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-electric-600" />
              <span>Verified Certificates</span>
            </h4>

            {worker.certificates?.length === 0 ? (
              <p className="text-xs text-slate-400">No documents uploaded.</p>
            ) : (
              <div className="space-y-3">
                {worker.certificates?.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{c.title}</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        Verified
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">{c.issuing_org}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Availability Schedule */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-electric-600" />
              <span>Weekly Availability</span>
            </h4>

            <div className="space-y-2 text-xs">
              {(worker.availability || [
                { day_of_week: 'Monday', is_available: true, start_time: '08:30:00', end_time: '18:30:00' },
                { day_of_week: 'Tuesday', is_available: true, start_time: '08:30:00', end_time: '18:30:00' },
                { day_of_week: 'Wednesday', is_available: true, start_time: '08:30:00', end_time: '18:30:00' },
                { day_of_week: 'Thursday', is_available: true, start_time: '08:30:00', end_time: '18:30:00' },
                { day_of_week: 'Friday', is_available: true, start_time: '08:30:00', end_time: '18:30:00' },
                { day_of_week: 'Saturday', is_available: true, start_time: '09:00:00', end_time: '17:00:00' },
                { day_of_week: 'Sunday', is_available: false, start_time: '10:00:00', end_time: '14:00:00' }
              ]).map((day, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                  <span className="font-medium text-slate-700">{day.day_of_week}</span>
                  <span className={`text-[11px] font-bold ${day.is_available ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {day.is_available ? `${day.start_time.slice(0, 5)} - ${day.end_time.slice(0, 5)}` : 'Off Duty'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Direct Hiring Offer Modal */}
      {hireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-5">
            <h3 className="font-bold text-lg text-slate-900">Send Hiring Offer to {worker.full_name}</h3>
            <p className="text-xs text-slate-500">Provide project terms. Worker will receive a real-time dispatch notification.</p>

            {hireSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Hiring request sent successfully! Redirecting...</span>
              </div>
            ) : (
              <form onSubmit={handleSendHiringOffer} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Offered Compensation (₹)</label>
                    <input
                      type="number"
                      required
                      value={offeredRate}
                      onChange={(e) => setOfferedRate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Basis</label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="per_job">Per Job</option>
                      <option value="daily">Daily Wage</option>
                      <option value="hourly">Hourly Rate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scope Details & Timing</label>
                  <textarea
                    rows={3}
                    required
                    value={hireMessage}
                    onChange={(e) => setHireMessage(e.target.value)}
                    placeholder="Describe task scope, address, and requested start date..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setHireModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={hireSubmitting}
                    className="flex-1 py-2.5 bg-electric-600 hover:bg-electric-700 text-white rounded-xl text-xs font-bold shadow-md shadow-electric-600/20"
                  >
                    {hireSubmitting ? 'Sending Offer...' : 'Confirm & Dispatch'}
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

