'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Calendar,
  Hash,
  MapPin,
  Scale,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { API_URL, PublicVerificationResult } from '@/lib/api';

export default function VerifyPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicVerificationResult | null>(null);
  const [error, setError] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = query.trim();
    if (!cleaned) return;

    setLoading(true);
    setError('');
    setResult(null);
    setSearchedQuery(cleaned);

    try {
      const res = await fetch(`${API_URL}/public/verify/${encodeURIComponent(cleaned)}`);
      if (!res.ok) {
        throw new Error(`No verified certificate record found matching "${cleaned}".`);
      }
      const data: PublicVerificationResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <header className="bg-[#1E293B] text-white py-6 px-4 shadow-sm border-b border-slate-700">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2 rounded-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Legal Metrology Public Verification Portal</h1>
              <p className="text-xs text-slate-300">Government Certificate & Instrument Authenticity Register</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-slate-300">Legal Metrology Rules, 2011</span>
            <Link
              href="/login"
              className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded transition-colors"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1E293B] mb-2">Verify Stamping & Calibration Certificate</h2>
          <p className="text-sm text-slate-600 mb-6">
            Enter an official Digital Certificate Number (e.g. <code className="bg-slate-100 text-teal-800 px-1.5 py-0.5 rounded font-mono text-xs">LM-CERT-2026-XXXXXX</code>) to perform instant authenticity verification against the official Legal Metrology Register.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Certificate Number (e.g., LM-CERT-2026-251874)"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-transparent font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1E293B] hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-sm px-6 py-2.5 rounded-md transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verify Certificate</span>
                </>
              )}
            </button>
          </form>
        </section>

        {loading && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500 shadow-sm space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-emerald-600"></div>
            <p className="text-sm font-medium">Querying Government Legal Metrology Register for "{searchedQuery}"...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-rose-900">Certificate Verification Failed</h3>
            <p className="text-sm text-rose-700 max-w-md mx-auto">{error}</p>
            <p className="text-xs text-slate-500 font-mono">Searched Query: {searchedQuery}</p>
          </div>
        )}

        {result && !loading && (
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden space-y-0">
            <div
              className={`border-b px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                result.is_valid ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    result.is_valid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {result.is_valid ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-rose-700" />}
                  {result.status}
                </span>
                <span className="text-xs text-slate-600 font-mono font-bold">Cert No: {result.certificate_number}</span>
              </div>
              <button
                onClick={() => router.push(`/verify-certificate/${result.certificate_number}`)}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors"
              >
                View Digital Certificate Page
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Instrument Category & Brand</span>
                  <div className="flex items-center gap-2 text-base font-semibold text-[#1E293B]">
                    <Scale className="w-4 h-4 text-slate-600" />
                    {result.instrument_category} &bull; {result.instrument_brand} ({result.instrument_model})
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Serial Number & Capacity</span>
                  <div className="text-sm font-medium text-slate-800">
                    <span className="font-mono text-teal-700 font-bold">{result.instrument_serial}</span> &bull; {result.capacity_rating} (Class: {result.accuracy_class})
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Registered Trader / Licensee</span>
                  <div className="flex items-start gap-2 text-sm font-medium text-slate-800">
                    <Building2 className="w-4 h-4 text-slate-500 mt-0.5" />
                    <div>
                      <div className="font-bold">{result.trader_name}</div>
                      {result.organization && <div className="text-xs text-slate-500">{result.organization}</div>}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Jurisdiction District</span>
                  <div className="flex items-start gap-2 text-sm text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                    {result.district}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Verification Date</span>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {new Date(result.issue_date).toLocaleDateString()}
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Valid Until (Next Due Date)</span>
                  <div className={`flex items-center gap-2 text-sm font-bold ${result.is_valid ? 'text-emerald-700' : 'text-rose-700'}`}>
                    <Calendar className="w-4 h-4" />
                    {new Date(result.valid_until).toLocaleDateString()}
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Security Lead Seal & Officer</span>
                  <div className="text-sm text-slate-800">
                    <div>Seal No: <span className="font-mono font-bold text-slate-900">{result.seal_number}</span></div>
                    <div className="text-xs text-slate-500">Verified by: {result.inspector_name}</div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Security Hash</span>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[280px]">SHA256: {result.security_hash}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        Legal Metrology Department &bull; Government Verification Portal &bull; Standard Rules 2011
      </footer>
    </div>
  );
}
