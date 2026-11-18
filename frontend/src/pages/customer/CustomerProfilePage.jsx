import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { customerAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CustomerProfilePage() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('Bengaluru South');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await customerAPI.getProfile();
        if (res.data?.success) {
          const c = res.data.customer;
          setFullName(c.full_name || '');
          setPhone(c.phone || '');
          setAddress(c.address || '');
          setPreferredLocation(c.preferred_location || 'Bengaluru South');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    try {
      const res = await customerAPI.updateProfile({
        full_name: fullName,
        phone,
        address,
        preferred_location: preferredLocation
      });
      if (res.data?.success) {
        updateUser({ full_name: fullName, phone });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Customer Profile & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your contact details and default work dispatch address</p>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSave} className="space-y-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Default Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Flat 402, Green Glen Layout"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-electric-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
            <input
              type="text"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              placeholder="e.g. Bengaluru South"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-electric-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-electric-600/20"
          >
            Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
}

