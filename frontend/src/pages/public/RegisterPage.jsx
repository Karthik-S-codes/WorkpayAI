import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, Wrench, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') === 'worker' ? 'worker' : 'customer';

  const [role, setRole] = useState(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('Bengaluru South');

  // Worker-specific fields
  const [categoryId, setCategoryId] = useState(1);
  const [experienceYears, setExperienceYears] = useState(3);
  const [expectedSalary, setExpectedSalary] = useState(650);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        role,
        full_name: fullName,
        email,
        phone,
        password,
        address,
        preferred_location: preferredLocation
      };

      if (role === 'worker') {
        payload.category_id = categoryId;
        payload.experience_years = experienceYears;
        payload.expected_salary = expectedSalary;
      }

      const user = await register(payload);
      if (user.role === 'worker') navigate('/worker/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-electric-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-electric-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create your WorkPay AI Account</h2>
          <p className="text-xs text-slate-500">Join the digital verified workforce & hiring ecosystem</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          {/* Role Toggle Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${role === 'customer'
                  ? 'bg-white text-electric-600 shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <User className="w-4 h-4" />
              <span>I want to Hire Workers (Customer)</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('worker')}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${role === 'worker'
                  ? 'bg-white text-electric-600 shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <Wrench className="w-4 h-4" />
              <span>I want to Work & Earn (Worker)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-electric-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-electric-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@workpay.ai"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-electric-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-electric-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. BTM Layout 2nd Stage"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-electric-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
                <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g. Bengaluru South"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-electric-500"
                />
              </div>
            </div>

            {/* Worker Specific Inputs */}
            {role === 'worker' && (
              <div className="p-4 bg-electric-50/50 rounded-2xl border border-electric-100 space-y-4 animate-in fade-in">
                <span className="text-xs font-bold uppercase tracking-wider text-electric-700 block">
                  Worker Professional Profile
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Trade Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      <option value={1}>Electrician</option>
                      <option value={2}>Plumber</option>
                      <option value={3}>Carpenter</option>
                      <option value={4}>Painter</option>
                      <option value={5}>Mason</option>
                      <option value={6}>Driver</option>
                      <option value={7}>Cook & Chef</option>
                      <option value={8}>House Cleaner</option>
                      <option value={9}>Gardener</option>
                      <option value={10}>Babysitter</option>
                      <option value={12}>Teacher & Tutor</option>
                      <option value={13}>Mechanic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Years Experience</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expected Rate (₹/day)</label>
                    <input
                      type="number"
                      step="50"
                      min="200"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-electric-600/20 flex items-center justify-center space-x-2"
            >
              <span>{isLoading ? 'Creating Account...' : `Register as ${role === 'worker' ? 'Worker' : 'Customer'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-electric-600 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}

