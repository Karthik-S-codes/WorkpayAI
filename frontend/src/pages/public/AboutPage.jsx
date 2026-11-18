import React from 'react';
import { ShieldCheck, Heart, Award, Users, CheckCircle2, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-electric-600">About WorkPay AI</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900">
          Empowering the Blue-Collar Workforce with AI & FinTech
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 leading-relaxed">
          Developed as an integrated college major project solving genuine economic pain points for informal sector trade workers and urban domestic clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6">
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <h3 className="text-xl font-bold text-slate-900">The Problem We Are Solving</h3>
          <p>
            Millions of skilled tradespeople—electricians, plumbers, carpenters, cooks, and masons—lack verified digital profiles, reliable work discovery, and guaranteed payment protection. Customers face anxiety finding trustworthy local workers with predictable rates.
          </p>
          <p>
            WorkPay AI merges <strong>algorithmic matching</strong>, <strong>fair-market wage estimation</strong>, and <strong>double-entry internal digital escrow</strong> to create mutual trust.
          </p>
          <div className="space-y-2 pt-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Full identity & skills verification audit trail</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Cryptographic payment signatures with tamper-proof ledgers</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>AI multilingual assistant supporting Kannada, Hindi, and English</span>
            </div>
          </div>
        </div>

        <div className="bg-navy-950 text-white p-8 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-electric-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base">WorkPay AI Architecture</h4>
              <span className="text-xs text-electric-400">Enterprise Standard Major Project</span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-navy-900 rounded-xl border border-navy-800 flex justify-between">
              <span>Database Architecture</span>
              <span className="font-bold text-white">Local MySQL 8 (InnoDB + Pooling)</span>
            </div>
            <div className="p-3 bg-navy-900 rounded-xl border border-navy-800 flex justify-between">
              <span>Backend Core</span>
              <span className="font-bold text-white">Node.js Express REST API</span>
            </div>
            <div className="p-3 bg-navy-900 rounded-xl border border-navy-800 flex justify-between">
              <span>Frontend Experience</span>
              <span className="font-bold text-white">React 18 + Vite + Tailwind CSS</span>
            </div>
            <div className="p-3 bg-navy-900 rounded-xl border border-navy-800 flex justify-between">
              <span>Security & Integrity</span>
              <span className="font-bold text-white">Bcrypt + JWT + ACID Transactions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

