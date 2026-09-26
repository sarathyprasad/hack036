'use client';

import React, { useState } from 'react';
import { Activity, Users, ShieldCheck, IndianRupee, BarChart3, AlertOctagon, TrendingUp, AlertTriangle, Send, ShieldBan, XCircle, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type SlaLevel = 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'BALANCED';

type DistrictRow = {
  id: string;
  name: string;
  pending: number;
  sla: SlaLevel;
  gatcOptions: string[];
  selectedGatc: string;
};

export default function ExecutiveAdminDashboard() {
  const [lbToast, setLbToast] = useState('');

  const [districts, setDistricts] = useState<DistrictRow[]>([
    {
      id: 'pune-north',
      name: 'Pune North (Zone A)',
      pending: 450,
      sla: 'CRITICAL',
      gatcOptions: ['Route to GATC #04', 'Route to GATC #12'],
      selectedGatc: 'Route to GATC #04',
    },
    {
      id: 'nagpur',
      name: 'Nagpur Industrial',
      pending: 120,
      sla: 'WARNING',
      gatcOptions: ['Auto Balance', 'Route to GATC #04'],
      selectedGatc: 'Auto Balance',
    },
    {
      id: 'mumbai-south',
      name: 'Mumbai South',
      pending: 45,
      sla: 'HEALTHY',
      gatcOptions: [],
      selectedGatc: '',
    },
  ]);

  const [fraudFeed, setFraudFeed] = useState([
    { id: 'FRD-99120', shop: 'ABC Grocery Store', location: 'Pune South', issue: 'Suspected missing seal on electronic scale', time: '10 mins ago', status: 'NEW' },
    { id: 'FRD-88411', shop: 'Star Jewelers', location: 'Nagpur Central', issue: 'Customer claims 5g short weight on 100g purchase', time: '45 mins ago', status: 'NEW' },
    { id: 'FRD-77293', shop: 'AgriTrade Warehouse', location: 'Amravati Zone', issue: 'Weighbridge displaying incorrect tare weight', time: '2 hours ago', status: 'NEW' },
  ]);

  const handleGatcSelect = (districtId: string, value: string) => {
    setDistricts(prev =>
      prev.map(d => d.id === districtId ? { ...d, selectedGatc: value } : d)
    );
  };

  const handleApplyBalance = (districtId: string) => {
    setDistricts(prev =>
      prev.map(d => {
        if (d.id !== districtId) return d;
        const reduced = Math.max(0, Math.floor(d.pending * 0.35));
        return { ...d, sla: 'BALANCED', pending: reduced };
      })
    );
    setLbToast('Success: Workload re-allocated and load-balanced to selected GATC Center');
    setTimeout(() => setLbToast(''), 6000);
  };

  const handleFraudAction = (id: string) => {
    setFraudFeed(feed => feed.filter(f => f.id !== id));
  };

  const slaBadge: Record<SlaLevel, React.ReactNode> = {
    CRITICAL: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
        <AlertOctagon className="w-3 h-3" /> CRITICAL
      </span>
    ),
    WARNING: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
        <AlertTriangle className="w-3 h-3" /> WARNING
      </span>
    ),
    HEALTHY: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3 h-3" /> HEALTHY
      </span>
    ),
    BALANCED: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3 h-3" /> BALANCED
      </span>
    ),
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <header className="bg-[#1E293B] text-white py-6 px-4 shadow-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 text-white p-2 rounded-md border border-slate-700">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Executive Compliance & Analytics</h1>
              <p className="text-xs text-slate-300">State-wide Metrology Operations & Fraud Command Center</p>
            </div>
          </div>
          <Link href="/" className="text-xs text-slate-300 hover:text-white transition">Back to Home</Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-slate-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">Instruments Registered</h3>
            </div>
            <div className="text-2xl font-extrabold text-[#1E293B]">124,592</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12% this month</div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-slate-600">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">Pending Inspections</h3>
            </div>
            <div className="text-2xl font-extrabold text-[#1E293B]">1,845</div>
            <div className="text-xs text-amber-600 font-semibold mt-1">42 SLA breached</div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-slate-600">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">Active LMOs</h3>
            </div>
            <div className="text-2xl font-extrabold text-[#1E293B]">412</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Across 36 districts</div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-slate-600">
              <IndianRupee className="w-5 h-5 text-slate-700" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">Stamping Fees Collected</h3>
            </div>
            <div className="text-2xl font-extrabold text-[#1E293B]">₹8.4 Cr</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +5% vs last year</div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-slate-600">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">Flagged Miscalibrations</h3>
            </div>
            <div className="text-2xl font-extrabold text-[#1E293B]">128</div>
            <div className="text-xs text-rose-600 font-semibold mt-1">Requires immediate review</div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> District Pendency & SLA Monitoring
                </h2>
              </div>

              {lbToast && (
                <div className="mx-4 mt-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md text-sm font-semibold flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  {lbToast}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">District / Zone</th>
                      <th className="px-4 py-3 font-semibold">Inspection Load</th>
                      <th className="px-4 py-3 font-semibold">SLA Status</th>
                      <th className="px-4 py-3 font-semibold">GATC Load Balance Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {districts.map(district => (
                      <tr key={district.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">{district.name}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {district.pending} <span className="text-xs text-slate-400">pending</span>
                        </td>
                        <td className="px-4 py-3">{slaBadge[district.sla]}</td>
                        <td className="px-4 py-3">
                          {district.gatcOptions.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={district.selectedGatc}
                                onChange={e => handleGatcSelect(district.id, e.target.value)}
                                className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none"
                              >
                                {district.gatcOptions.map(opt => (
                                  <option key={opt}>{opt}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleApplyBalance(district.id)}
                                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded transition"
                              >
                                Apply
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">Auto Balanced</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="xl:col-span-1">
            <section className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-rose-50 flex items-center justify-between">
                <h2 className="text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Live Fraud Escalation Feed
                </h2>
                <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></div>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[600px]">
                {fraudFeed.length === 0 ? (
                  <div className="text-center text-sm text-slate-500 py-8">No active escalations.</div>
                ) : (
                  fraudFeed.map(report => (
                    <div key={report.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-mono text-slate-500 mb-1">{report.id} &bull; {report.time}</div>
                          <h4 className="text-sm font-bold text-slate-900">{report.shop}</h4>
                          <div className="text-xs text-slate-600">{report.location}</div>
                        </div>
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          NEW
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                        "{report.issue}"
                      </p>
                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleFraudAction(report.id)}
                          className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded transition shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" /> Dispatch LMO to Site
                        </button>
                        <button
                          onClick={() => handleFraudAction(report.id)}
                          className="w-full inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-2 rounded transition shadow-sm"
                        >
                          <ShieldBan className="w-3.5 h-3.5" /> Issue Suspension Notice
                        </button>
                        <button
                          onClick={() => handleFraudAction(report.id)}
                          className="w-full inline-flex items-center justify-center gap-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium px-3 py-2 rounded transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Dismiss
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
