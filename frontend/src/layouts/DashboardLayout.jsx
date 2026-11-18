import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Search, Briefcase, PlusCircle, CreditCard,
  FileText, User, Users, ShieldCheck, DollarSign, Wallet,
  TrendingUp, AlertTriangle, Layers, Bell, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import AIChatbotWidget from '../components/AIChatbotWidget';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role || 'customer';

  const customerNav = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Find Workers', path: '/find-workers', icon: Search },
    { name: 'Post a Job', path: '/customer/post-job', icon: PlusCircle },
    { name: 'My Jobs', path: '/customer/my-jobs', icon: Briefcase },
    { name: 'Hiring Requests', path: '/customer/hiring-requests', icon: Users },
    { name: 'Payments & Invoices', path: '/customer/payments', icon: CreditCard },
    { name: 'Transactions', path: '/customer/transactions', icon: FileText },
    { name: 'My Profile', path: '/customer/profile', icon: User }
  ];

  const workerNav = [
    { name: 'Dashboard', path: '/worker/dashboard', icon: LayoutDashboard },
    { name: 'Find Jobs', path: '/find-jobs', icon: Search },
    { name: 'Applications', path: '/worker/applications', icon: FileText },
    { name: 'Hiring Offers', path: '/worker/hiring-requests', icon: Users },
    { name: 'My Work', path: '/worker/my-work', icon: Briefcase },
    { name: 'Earnings & Ledger', path: '/worker/earnings', icon: DollarSign },
    { name: 'Wallet & Payouts', path: '/worker/wallet', icon: Wallet },
    { name: 'AI Income Insights', path: '/worker/ai-income', icon: TrendingUp },
    { name: 'My Profile', path: '/worker/profile', icon: User },
    { name: 'Edit Profile (AI)', path: '/worker/edit-profile', icon: PlusCircle }
  ];

  const adminNav = [
    { name: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Worker Verification', path: '/admin/verifications', icon: ShieldCheck },
    { name: 'Platform Jobs', path: '/admin/jobs', icon: Briefcase },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Transactions', path: '/admin/transactions', icon: CreditCard },
    { name: 'Payout Requests', path: '/admin/payouts', icon: Wallet },
    { name: 'Disputes', path: '/admin/disputes', icon: AlertTriangle },
    { name: 'AI Fraud Alerts', path: '/admin/fraud-alerts', icon: AlertTriangle },
    { name: 'Analytics', path: '/admin/analytics', icon: TrendingUp }
  ];

  const navItems = role === 'admin' ? adminNav : role === 'worker' ? workerNav : customerNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-navy-950 text-white p-4 flex items-center justify-between border-b border-navy-800">
        <Link to="/" className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-electric-500" />
          <span className="font-extrabold text-base">WorkPay<span className="text-electric-500">.AI</span></span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 text-slate-300">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-navy-950 text-slate-300 flex flex-col border-r border-navy-800 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-navy-800 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-electric-600 flex items-center justify-center text-white font-bold shadow-md shadow-electric-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">WorkPay<span className="text-electric-500">.AI</span></span>
              <span className="block text-[10px] text-electric-400 font-semibold uppercase tracking-wider">
                {role} Portal
              </span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 bg-navy-900 rounded-2xl border border-navy-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-electric-600 to-teal-400 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{user?.full_name || 'User'}</h4>
            <span className="text-[10px] text-emerald-400 flex items-center space-x-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="capitalize">{role} Verified</span>
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive
                    ? 'bg-electric-600 text-white shadow-md shadow-electric-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-navy-900'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout Bottom */}
        <div className="p-3 border-t border-navy-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-20">
          <div className="text-xs text-slate-500 font-medium">
            <span>WorkPay AI / </span>
            <span className="text-slate-900 font-semibold capitalize">{location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/find-workers"
              className="text-xs font-semibold text-slate-600 hover:text-electric-600 transition-colors"
            >
              Public Marketplace
            </Link>

            <div className="h-4 w-[1px] bg-slate-200"></div>

            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>MySQL 8: Connected</span>
            </div>
          </div>
        </header>

        {/* View container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <AIChatbotWidget />
    </div>
  );
}

