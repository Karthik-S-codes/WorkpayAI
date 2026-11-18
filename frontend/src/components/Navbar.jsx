import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, LogOut, Menu, X, Sparkles, TrendingUp } from 'lucide-react';
import AISalaryModal from './AISalaryModal';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'worker') return '/worker/dashboard';
    return '/customer/dashboard';
  };

  return (
    <>
      <nav className="sticky top-0 z-30 bg-navy-950/90 backdrop-blur-md border-b border-navy-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-electric-600 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-electric-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-electric-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-electric-400 bg-clip-text text-transparent">
                  WorkPay<span className="text-electric-500">.AI</span>
                </span>
                <span className="text-[9px] tracking-widest uppercase text-slate-400 font-semibold -mt-1">
                  Verified FinTech
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link to="/find-workers" className="text-slate-300 hover:text-white transition-colors">
                Find Workers
              </Link>
              <Link to="/find-jobs" className="text-slate-300 hover:text-white transition-colors">
                Find Jobs
              </Link>
              <Link to="/how-it-works" className="text-slate-300 hover:text-white transition-colors">
                How It Works
              </Link>
              <Link to="/features" className="text-slate-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link to="/about" className="text-slate-300 hover:text-white transition-colors">
                About
              </Link>
              <button
                onClick={() => setSalaryModalOpen(true)}
                className="text-xs bg-navy-800 hover:bg-navy-700 text-teal-400 border border-teal-500/30 px-3 py-1.5 rounded-full flex items-center space-x-1.5 transition-all"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>AI Salary Predictor</span>
              </button>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to={getDashboardPath()}
                    className="flex items-center space-x-2 bg-electric-600 hover:bg-electric-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard ({user.role})</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-bold bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-500 hover:to-electric-600 text-white px-4 py-2 rounded-xl shadow-md transition-all"
                  >
                    Join WorkPay
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-navy-900 border-b border-navy-800 px-4 pt-2 pb-6 space-y-3 text-sm">
            <Link to="/find-workers" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300">
              Find Workers
            </Link>
            <Link to="/find-jobs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300">
              Find Jobs
            </Link>
            <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300">
              How It Works
            </Link>
            <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300">
              Features
            </Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300">
              About
            </Link>
            <div className="pt-3 border-t border-navy-800 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center bg-electric-600 text-white py-2 rounded-xl font-semibold"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-center text-slate-400 py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2 text-slate-300 font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center bg-electric-600 text-white py-2 rounded-xl font-semibold"
                  >
                    Join WorkPay
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <AISalaryModal isOpen={salaryModalOpen} onClose={() => setSalaryModalOpen(false)} />
    </>
  );
}

