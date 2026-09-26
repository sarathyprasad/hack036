"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  QrCode,
  Scale,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { API_URL, PublicVerificationResult } from "@/lib/api";

export default function PublicVerifyCertificatePage({
  params,
}: {
  params: Promise<{ certNo: string }>;
}) {
  const resolvedParams = use(params);
  const certNo = resolvedParams.certNo;

  const [data, setData] = useState<PublicVerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/public/verify/${certNo}`)
      .then((res) => {
        if (!res.ok) throw new Error("Certificate record not found or invalid.");
        return res.json();
      })
      .then((resData) => setData(resData))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [certNo]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Header Bar */}
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-teal-400">
          <Scale className="h-6 w-6" />
          <div>
            <h1 className="font-bold text-white text-base">Department of Legal Metrology</h1>
            <p className="text-[11px] text-slate-400">Government of India Public Verification Portal</p>
          </div>
        </div>

        <Link
          href="/login"
          className="text-xs font-semibold text-teal-400 hover:text-teal-300 border border-teal-500/30 rounded-lg px-3 py-1.5 bg-teal-950/40"
        >
          Stakeholder Login
        </Link>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-2xl mx-auto w-full my-8">
        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Authenticating certificate details against State Legal Metrology Register…
          </div>
        ) : error || !data ? (
          <div className="rounded-xl border border-rose-900/60 bg-rose-950/40 p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-900/50 text-rose-400">
              <XCircle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-rose-200">Unverified / Invalid Certificate</h2>
            <p className="text-sm text-rose-300">{error || "No matching Legal Metrology verification record found."}</p>
            <div className="text-xs text-slate-400 font-mono">Certificate Query: {certNo}</div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Authenticity Badge */}
            <div
              className={`p-6 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left ${
                data.is_valid
                  ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-200"
                  : "bg-rose-950/50 border-rose-500/40 text-rose-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
                    data.is_valid ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {data.is_valid ? <CheckCircle2 className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Verification Authenticity Status
                  </div>
                  <h2 className="text-xl font-bold">{data.status}</h2>
                  <p className="text-xs text-slate-300">Under Legal Metrology Rules, 2011</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Certificate No:</span>
                <span className="font-mono font-bold text-white text-sm">{data.certificate_number}</span>
              </div>
            </div>

            {/* Verification Parameters */}
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                1. Instrument & Trader Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Owner / Trader Name:</span>
                  <span className="font-bold text-white text-sm">{data.trader_name}</span>
                  {data.organization && <span className="block text-slate-400">{data.organization}</span>}
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">District / Jurisdiction:</span>
                  <span className="font-bold text-white text-sm">{data.district}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider border-b border-slate-800 pb-2 pt-2">
                2. Device Specifications
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-300">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Category:</span>
                  <span className="font-semibold text-white">{data.instrument_category}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Brand & Model:</span>
                  <span className="font-semibold text-white">{data.instrument_brand} ({data.instrument_model})</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Serial Number:</span>
                  <span className="font-mono font-bold text-amber-300">{data.instrument_serial}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Accuracy Class:</span>
                  <span className="font-semibold text-white">{data.accuracy_class}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Capacity Rating:</span>
                  <span className="font-semibold text-white">{data.capacity_rating}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Security Seal No:</span>
                  <span className="font-mono font-bold text-teal-400">{data.seal_number}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider border-b border-slate-800 pb-2 pt-2">
                3. Validity & Regulatory Authority
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Verification Date:</span>
                  <span className="font-semibold text-white">{new Date(data.issue_date).toLocaleDateString()}</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Valid Until (Re-verification Due):</span>
                  <span className={`font-bold ${data.is_valid ? "text-emerald-400" : "text-rose-400"}`}>
                    {new Date(data.valid_until).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-slate-400 space-y-1">
                <p><strong className="text-slate-200">Inspecting Authority:</strong> {data.inspector_name}</p>
                <p><strong className="text-slate-200">Department:</strong> {data.verification_authority}</p>
              </div>

              <div className="font-mono text-[10px] text-slate-500 pt-2 text-center truncate">
                Digital Hash: {data.security_hash}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
        Legal Metrology Unified Online Verification System &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
