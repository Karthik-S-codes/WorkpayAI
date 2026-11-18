import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, UserX, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [role, search]);

  async function loadUsers() {
    setIsLoading(true);
    try {
      const res = await adminAPI.listUsers({ role, search });
      if (res.data?.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggleStatus = async (user) => {
    const nextStatus = !user.is_active;
    const reason = prompt(`Enter reason for ${nextStatus ? 'restoring' : 'suspending'} account "${user.full_name}":`);
    if (reason === null) return;

    try {
      const res = await adminAPI.toggleUserStatus(user.id, {
        is_active: nextStatus,
        reason: reason || 'Administrative action'
      });
      if (res.data?.success) {
        alert(res.data.message);
        loadUsers();
      }
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">User Account Management</h1>
          <p className="text-xs text-slate-500 mt-1">Audit accounts, roles, verified badges, and toggle suspension</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
          >
            <option value="">All Roles</option>
            <option value="worker">Workers Only</option>
            <option value="customer">Customers Only</option>
            <option value="admin">Administrators</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading user accounts...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.full_name}</div>
                          <span className="text-[10px] text-slate-400">ID #{u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>{u.email}</div>
                      <div className="text-[10px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'worker'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.worker_verification === 'verified' ? (
                        <span className="text-emerald-600 font-bold flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Standard</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                            u.is_active
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

