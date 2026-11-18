import React from 'react';
import { Sparkles, ShieldCheck, TrendingUp, MessageSquare, Mic, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    { title: 'AI Worker Matching', icon: Sparkles, desc: 'Generates a 0-100% compatibility score based on verified skills, experience delta, commute proximity, and customer budget.' },
    { title: 'AI Salary & Wage Predictor', icon: TrendingUp, desc: 'Recommends minimum, recommended, and maximum compensation ranges tailored by city tier and trade difficulty.' },
    { title: 'Multilingual AI Chatbot', icon: MessageSquare, desc: 'Assists informal workers and clients in English, Kannada, and Hindi with speech-friendly interactive answers.' },
    { title: 'Voice-Based Search', icon: Mic, desc: 'Hands-free voice recognition allowing customers to search for trades specialists effortlessly.' },
    { title: 'FinTech Digital Ledger', icon: DollarSign, desc: 'Double-entry wallet accounting ensuring guaranteed payment transfers once client signs off work.' },
    { title: 'Downloadable PDF Invoices', icon: FileText, desc: 'Automated, branded tax receipts with complete customer/worker details and transaction references.' },
    { title: 'AI Profile & Bio Builder', icon: Sparkles, desc: 'Synthesizes rough worker skills into a polished, professional headline and resume summary.' },
    { title: 'AI Fraud & Anomaly Shield', icon: ShieldCheck, desc: 'Monitors payment velocities and cancellation anomalies to safeguard customer and worker balances.' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-electric-600">Platform Capabilities</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900">Comprehensive AI & FinTech Suite</h1>
        <p className="text-sm text-slate-600">Every tool designed to solve real-world informal employment and payment friction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-electric-50 text-electric-600 flex items-center justify-center font-bold">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

