"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  PlusCircle,
  QrCode,
  Scale,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { apiFetch, DashboardStats } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<DashboardStats>("/dashboard/stats")
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load dashboard stats:", err))
      .finally(() => setLoading(false));
  }, []);

  const roleTitleMap: Record<string, string> = {
    trader: "Trader / Instrument Owner Dashboard",
    lmo: "State Legal Metrology Officer (LMO) Dashboard",
    gatc: "Government Approved Test Centre (GATC) Dashboard",
    admin: "State Executive Administrator Dashboard",
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-teal-900/50 bg-gradient-to-r from-slate-900 via-slate-950 to-teal-950 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 border border-teal-500/20 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              {roleTitleMap[user?.role ?? "trader"] ?? "Legal Metrology Ecosystem"}
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome back, {user?.name}!</h2>
            <p className="text-sm text-slate-300 mt-1">
              Organization: <span className="text-teal-300 font-medium">{user?.organization || "Department of Legal Metrology"}</span> | Jurisdiction: <span className="text-teal-300 font-medium">{user?.jurisdiction_district || "State Wide"}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/applications/new"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition shadow-md"
            >
              <PlusCircle className="h-4 w-4" />
              Apply for Verification
            </Link>
            <Link
              href="/certificates"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition border border-slate-700"
            >
              <QrCode className="h-4 w-4 text-teal-400" />
              Certificates
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Fleet</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Scale className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? "…" : stats?.total_instruments}</p>
          <p className="mt-1 text-xs text-slate-500">Weighing & Measuring Devices</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified & Active</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? "…" : stats?.active_verified_instruments}</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-slate-500">Valid Stamping</span>
            <span className="text-xs font-semibold text-emerald-600">{stats?.compliance_rate_percent}% Compliant</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Verification</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? "…" : stats?.pending_applications}</p>
          <p className="mt-1 text-xs text-amber-600 font-medium">In Verification Pipeline</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiring Soon</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? "…" : stats?.expiring_soon_count}</p>
          <p className="mt-1 text-xs text-rose-600 font-medium">Due within 30 days</p>
        </div>
      </div>

      {/* Workflow Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-100 p-3 text-teal-700">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Instruments Fleet</h3>
              <p className="text-xs text-slate-500">Manage weighing scales, weighbridges, flow meters & petrol pumps</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Register & Track Instruments</span>
            <Link href="/instruments" className="inline-flex items-center text-xs font-semibold text-teal-600 hover:text-teal-700">
              View Fleet <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Verification Requests</h3>
              <p className="text-xs text-slate-500">Online application submission & LMO/GATC inspection allocation</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Applications & Scheduling</span>
            <Link href="/applications" className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700">
              View Workflow <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-3 text-purple-700">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Digital QR Certificates</h3>
              <p className="text-xs text-slate-500">Cryptographically verifiable certificates & public QR authentication</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Digital Repository & QR Codes</span>
            <Link href="/certificates" className="inline-flex items-center text-xs font-semibold text-purple-600 hover:text-purple-700">
              View Repository <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Compliance Information Box */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-slate-800">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
          <ShieldCheck className="h-5 w-5 text-teal-600" />
          Legal Metrology Act, 2009 Compliance Directives
        </h3>
        <ul className="mt-3 space-y-2 text-xs text-slate-600">
          <li className="flex items-start gap-2">
            <span className="font-bold text-teal-600">1. Section 24:</span> Every person having any weight or measure in possession, custody or control in transaction or protection shall present it for periodic verification and stamping.
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-teal-600">2. General Rules, 2011:</span> Digital Verification Certificates generated with embedded QR code are legally authentic proof of stamping under rule 16.
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-teal-600">3. Field Stamping:</span> State LMOs and GATCs must digitally log standard test weight observations, tolerance errors, and official seal numbers before issuing certification.
          </li>
        </ul>
      </div>
    </div>
  );
}
