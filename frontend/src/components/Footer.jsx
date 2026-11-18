import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-navy-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-electric-600 flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                WorkPay<span className="text-electric-500">.AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-Powered Worker Hiring, Financial Management, and Digital Payment Platform. Connecting verified trade specialists with domestic & commercial clients with guaranteed payment security.
            </p>
            <div className="text-xs text-slate-500 flex items-center space-x-1">
              <span>Made with pride in Bengaluru, India</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/find-workers" className="hover:text-white transition-colors">Browse Workers</Link></li>
              <li><Link to="/find-jobs" className="hover:text-white transition-colors">Browse Job Listings</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">AI & FinTech Features</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Trade Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Popular Trades</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/find-workers?category=electrician" className="hover:text-white">Electricians</Link></li>
              <li><Link to="/find-workers?category=plumber" className="hover:text-white">Plumbers & Pipefitters</Link></li>
              <li><Link to="/find-workers?category=carpenter" className="hover:text-white">Carpenters & Woodwork</Link></li>
              <li><Link to="/find-workers?category=cook-chef" className="hover:text-white">Cooks & Private Chefs</Link></li>
              <li><Link to="/find-workers?category=house-cleaner" className="hover:text-white">Deep House Cleaning</Link></li>
            </ul>
          </div>

          {/* FinTech & Security */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">FinTech & Compliance</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Internal Digital Ledger with Double-Entry Accounting</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-electric-400 shrink-0"></span>
                <span>Verified Payment Signatures & PDF Tax Invoices</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>support@workpay.ai</span>
              </p>
              <p className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Bengaluru South, Karnataka, India</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-navy-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} WorkPay AI Platform. All rights reserved. Built as an integrated college major project.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Security Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

