'use client';

import React, { useState } from 'react';
import { Database, ClipboardList, PenTool, CheckCircle2, Play, Loader2 } from 'lucide-react';
import Link from 'next/link';

type QueueItem = {
  id: string;
  trackingId: string;
  instrumentType: string;
  trader: string;
  status: 'PENDING' | 'IN PROGRESS';
};

type BatchEntry = {
  ref: string;
  batchId: string;
  standardWeight: string;
  certRef: string;
  timestamp: string;
};

export default function GATCPortal() {
  const [batchId, setBatchId] = useState('');
  const [standardWeight, setStandardWeight] = useState('');
  const [certRef, setCertRef] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [incomingQueue, setIncomingQueue] = useState<QueueItem[]>([
    { id: '1', trackingId: 'REQ-2026-8812', instrumentType: 'Precision Balance (Class II)', trader: 'Jewelers Inc.', status: 'PENDING' },
    { id: '2', trackingId: 'REQ-2026-8815', instrumentType: 'Platform Scale (Class III)', trader: 'AgriTrade Co.', status: 'PENDING' },
    { id: '3', trackingId: 'REQ-2026-8821', instrumentType: 'Electronic Weighbridge (Class III)', trader: 'Apex Logistics', status: 'PENDING' },
  ]);

  const [processedBatches, setProcessedBatches] = useState<BatchEntry[]>([
    { ref: 'CAL-2026-MH-388', batchId: 'REQ-8800, REQ-8801', standardWeight: '100 kg', certRef: 'CAL-2026-AA', timestamp: '20 Sep 2026, 09:12 AM' },
    { ref: 'CAL-2026-MH-395', batchId: 'REQ-8805', standardWeight: '50 kg', certRef: 'CAL-2026-AB', timestamp: '20 Sep 2026, 10:40 AM' },
  ]);

  const handleBeginTest = (id: string) => {
    setIncomingQueue(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'IN PROGRESS' } : item
      )
    );
  };

  const handleLogBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId.trim() || !standardWeight.trim() || !certRef.trim()) return;

    const seqNum = 400 + processedBatches.length + 1;
    const newRef = `CAL-2026-MH-${seqNum}`;
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

    const newBatch: BatchEntry = {
      ref: newRef,
      batchId: batchId.trim(),
      standardWeight: `${standardWeight.trim()} kg`,
      certRef: certRef.trim(),
      timestamp,
    };

    setProcessedBatches(prev => [newBatch, ...prev]);
    setSuccessMessage(`Batch Logged & Verified Successfully! Reference: ${newRef}`);
    setBatchId('');
    setStandardWeight('');
    setCertRef('');
    setTimeout(() => setSuccessMessage(''), 6000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <header className="bg-[#1E293B] text-white py-6 px-4 shadow-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 text-white p-2 rounded-md border border-slate-700">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">GATC Testing Portal</h1>
              <p className="text-xs text-slate-300">Government Approved Test Centre Operations</p>
            </div>
          </div>
          <Link href="/" className="text-xs text-slate-300 hover:text-white transition">Back to Home</Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Incoming Test Queue
                </h2>
                <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded">
                  {incomingQueue.filter(q => q.status === 'PENDING').length} Pending
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Tracking ID</th>
                      <th className="px-4 py-3 font-semibold">Instrument Type</th>
                      <th className="px-4 py-3 font-semibold">Trader</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {incomingQueue.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-700">{item.trackingId}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{item.instrumentType}</td>
                        <td className="px-4 py-3 text-slate-700">{item.trader}</td>
                        <td className="px-4 py-3">
                          {item.status === 'IN PROGRESS' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Loader2 className="w-3 h-3 animate-spin" /> IN PROGRESS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.status === 'PENDING' ? (
                            <button
                              onClick={() => handleBeginTest(item.id)}
                              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 text-xs rounded shadow-sm transition"
                            >
                              <Play className="w-3 h-3" /> Begin Test
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Test running...</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Batch Verification Logging
              </h2>

              {successMessage && (
                <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md text-sm font-semibold flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  {successMessage}
                </div>
              )}

              <form className="space-y-4 text-sm" onSubmit={handleLogBatch}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batch ID / Request IDs (Comma separated)</label>
                  <input
                    type="text"
                    value={batchId}
                    onChange={e => setBatchId(e.target.value)}
                    placeholder="e.g. REQ-8812, REQ-8815"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-700"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Weight Used (kg)</label>
                    <input
                      type="number"
                      value={standardWeight}
                      onChange={e => setStandardWeight(e.target.value)}
                      placeholder="50.00"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Calibration Certificate Ref</label>
                    <input
                      type="text"
                      value={certRef}
                      onChange={e => setCertRef(e.target.value)}
                      placeholder="CAL-2026-XX"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-700"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-400">All fields required to log a batch.</p>
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-md transition shadow-sm">
                    Log Batch Verification
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recently Processed Batches
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Reference</th>
                      <th className="px-4 py-3 font-semibold">Batch / Request IDs</th>
                      <th className="px-4 py-3 font-semibold">Std. Weight</th>
                      <th className="px-4 py-3 font-semibold">Cal. Cert Ref</th>
                      <th className="px-4 py-3 font-semibold">Logged At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processedBatches.map((batch, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-800">{batch.ref}</td>
                        <td className="px-4 py-3 text-slate-700 text-xs">{batch.batchId}</td>
                        <td className="px-4 py-3 text-slate-700">{batch.standardWeight}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{batch.certRef}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{batch.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <PenTool className="w-4 h-4" /> Lab Equipment Status
              </h2>
              <div className="space-y-4">
                <div className="p-3 border border-slate-200 rounded-md bg-slate-50">
                  <div className="text-sm font-bold text-slate-800 mb-1">Master Standard Weight Set A</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Calibration Valid Till:</span>
                    <span className="font-semibold text-slate-900">12 Dec 2026</span>
                  </div>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    CERTIFIED
                  </div>
                </div>
                <div className="p-3 border border-slate-200 rounded-md bg-slate-50">
                  <div className="text-sm font-bold text-slate-800 mb-1">Digital Comparator Balance</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Calibration Valid Till:</span>
                    <span className="font-semibold text-slate-900">05 Nov 2026</span>
                  </div>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    CERTIFIED
                  </div>
                </div>
                <div className="p-3 border border-red-200 rounded-md bg-red-50">
                  <div className="text-sm font-bold text-red-900 mb-1">Master Volume Measure (20L)</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-700">Calibration Valid Till:</span>
                    <span className="font-semibold text-red-900">Expired</span>
                  </div>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                    NEEDS CALIBRATION
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
