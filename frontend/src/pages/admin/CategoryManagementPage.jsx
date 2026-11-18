import React, { useState, useEffect } from 'react';
import { Layers, PlusCircle, CheckCircle2 } from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [baseDailyRate, setBaseDailyRate] = useState(800);
  const [minHourlyRate, setMinHourlyRate] = useState(150);
  const [maxHourlyRate, setMaxHourlyRate] = useState(800);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCats();
  }, []);

  async function loadCats() {
    setIsLoading(true);
    try {
      const res = await adminAPI.listCategories();
      if (res.data?.success) setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateCategory = async (e) => {
    e?.preventDefault();
    try {
      const res = await adminAPI.createCategory({
        name,
        slug,
        base_daily_rate: parseFloat(baseDailyRate),
        min_hourly_rate: parseFloat(minHourlyRate),
        max_hourly_rate: parseFloat(maxHourlyRate),
        description
      });
      if (res.data?.success) {
        alert('Category added successfully.');
        setName('');
        setSlug('');
        setDescription('');
        loadCats();
      }
    } catch (err) {
      alert('Failed to add category.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Worker Category & Trade Classification</h1>
        <p className="text-xs text-slate-500 mt-1">Configure trade benchmarks, baseline fair wages, and allowed specializations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Category Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
            <PlusCircle className="w-4 h-4 text-electric-600" />
            <span>Add New Category</span>
          </h3>

          <form onSubmit={handleCreateCategory} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                }}
                placeholder="e.g. Appliance Repair"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">URL Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. appliance-repair"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Base Daily (₹)</label>
                <input
                  type="number"
                  required
                  value={baseDailyRate}
                  onChange={(e) => setBaseDailyRate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Min Hourly (₹)</label>
                <input
                  type="number"
                  required
                  value={minHourlyRate}
                  onChange={(e) => setMinHourlyRate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Brief Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description of skills and equipment required..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-electric-600 hover:bg-electric-700 text-white font-bold rounded-xl text-xs shadow-md shadow-electric-600/20"
            >
              Create Category
            </button>
          </form>
        </div>

        {/* Existing Categories Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Configured Categories ({categories.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Trade Name</th>
                  <th className="p-4">Base Daily</th>
                  <th className="p-4">Hourly Range</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{c.slug}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">₹{c.base_daily_rate}</td>
                    <td className="p-4 text-slate-600">₹{c.min_hourly_rate} - ₹{c.max_hourly_rate}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

