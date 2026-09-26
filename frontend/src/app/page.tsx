'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Search, Scale, FileText, UserCheck, AlertTriangle, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/verify?q=${encodeURIComponent(searchQuery)}`;
    } else {
      window.location.href = '/verify';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <header className="bg-[#1E293B] text-white border-b border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2.5 rounded-md shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Department of Legal Metrology - Online Verification System
              </h1>
              <p className="text-xs text-slate-300">Government of India &bull; Legal Metrology Rules, 2011</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-medium">
            <Link
              href="/verify"
              className="text-slate-200 hover:text-white px-3 py-1.5 rounded hover:bg-slate-800 transition-colors"
            >
              Public Verification
            </Link>
            <Link
              href="/lmo/inspect"
              className="text-slate-200 hover:text-white px-3 py-1.5 rounded hover:bg-slate-800 transition-colors"
            >
              LMO Field Officer Portal
            </Link>
            <Link
              href="/verify"
              className="text-slate-200 hover:text-white px-3 py-1.5 rounded hover:bg-slate-800 transition-colors"
            >
              Trader Registration
            </Link>
            <Link
              href="/lmo/inspect"
              className="text-slate-200 hover:text-white px-3 py-1.5 rounded hover:bg-slate-800 transition-colors"
            >
              Admin Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Official Verification Portal
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
              Verify Calibration, Stamping & Weight Compliance
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Verify legal metrology certificates, check maximum permissible error (MPE) tolerances, and ensure commercial weighing instruments meet official standards.
            </p>

            <form onSubmit={handleSearch} className="pt-2 flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Certificate No. or Instrument Serial No. (e.g. LM-2026-98421-X)"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-[#1E293B] hover:bg-slate-800 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-[#1E293B]">Quick Action Portals</h3>
            <p className="text-xs text-slate-500">Access key services for citizens, traders, and field officers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/verify"
              className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:border-slate-400 transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Scale className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#1E293B] group-hover:text-emerald-700 transition-colors">
                  Verify Scale
                </h4>
                <p className="text-xs text-slate-600">
                  Search and validate digital certificates and stamping history of any registered commercial scale.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-slate-700 group-hover:text-[#1E293B] gap-1 pt-2">
                <span>Public Search</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/verify"
              className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:border-slate-400 transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#1E293B] group-hover:text-slate-900 transition-colors">
                  Apply for Stamping
                </h4>
                <p className="text-xs text-slate-600">
                  Traders and manufacturers can request annual re-verification and scheduling for official stamping.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-slate-700 group-hover:text-[#1E293B] gap-1 pt-2">
                <span>Trader Desk</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/lmo/inspect"
              className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:border-slate-400 transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#1E293B] group-hover:text-amber-800 transition-colors">
                  Officer Login
                </h4>
                <p className="text-xs text-slate-600">
                  LMO field portal for MPE tolerance calculation, geotagged evidence capture, and digital signing.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-slate-700 group-hover:text-[#1E293B] gap-1 pt-2">
                <span>LMO Field Desk</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/verify"
              className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:border-slate-400 transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-md bg-red-100 text-red-700 flex items-center justify-center border border-red-200">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#1E293B] group-hover:text-red-700 transition-colors">
                  Public Fraud Report
                </h4>
                <p className="text-xs text-slate-600">
                  Report uncalibrated scales, missing verification seals, or short-weight fraud to enforcement authorities.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-slate-700 group-hover:text-[#1E293B] gap-1 pt-2">
                <span>Submit Report</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-md text-slate-700 border border-slate-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#1E293B]">12,450+</div>
              <div className="text-xs text-slate-500">Registered Businesses & Traders</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-md text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#1E293B]">45,890+</div>
              <div className="text-xs text-slate-500">Verified & Stamped Instruments</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-md text-amber-800 border border-amber-200">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#1E293B]">99.8%</div>
              <div className="text-xs text-slate-500">Legal Metrology Compliance Rate</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Department of Legal Metrology &bull; Government of India</span>
          <span>Standards of Weights and Measures (Packaged Commodities & Metrology Rules 2011)</span>
        </div>
      </footer>
    </div>
  );
}
