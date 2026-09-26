'use client';

import React, { useState } from 'react';
import { Building2, Scale, Clock, CreditCard, FileText, CheckCircle2, AlertTriangle, X, Receipt } from 'lucide-react';
import Link from 'next/link';

type Transaction = {
  ref: string;
  date: string;
  amount: string;
  instrumentType: string;
  paymentMethod: string;
  status: 'COMPLETED' | 'PENDING';
};

const mockTransactions: Transaction[] = [
  { ref: 'TXN-MH-2026-00412', date: '15 Jan 2026', amount: '₹5,000', instrumentType: 'Electronic Weighbridge (Class III)', paymentMethod: 'UPI / PhonePe', status: 'COMPLETED' },
  { ref: 'TXN-MH-2025-09871', date: '03 Aug 2025', amount: '₹1,200', instrumentType: 'Platform Scale (Class III)', paymentMethod: 'Net Banking', status: 'COMPLETED' },
  { ref: 'TXN-MH-2025-00334', date: '17 Jan 2025', amount: '₹5,000', instrumentType: 'Electronic Weighbridge (Class III)', paymentMethod: 'Demand Draft', status: 'COMPLETED' },
  { ref: 'TXN-MH-2024-07712', date: '28 Sep 2024', amount: '₹800', instrumentType: 'Precision Balance (Class II)', paymentMethod: 'UPI / GPay', status: 'COMPLETED' },
];

type Instrument = {
  type: string;
  serial: string;
  capacity: string;
  status: 'VERIFIED' | 'DUE SOON' | 'PENDING VERIFICATION';
  expiresIn: string;
};

const statusStyles: Record<Instrument['status'], string> = {
  'VERIFIED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'DUE SOON': 'bg-amber-100 text-amber-800 border-amber-200',
  'PENDING VERIFICATION': 'bg-slate-100 text-slate-700 border-slate-300',
};

function ExpiryCell({ status, expiresIn }: { status: Instrument['status']; expiresIn: string }) {
  if (status === 'DUE SOON') {
    return (
      <div className="inline-flex items-center gap-1.5 text-amber-700 font-bold">
        <AlertTriangle className="w-3.5 h-3.5" />
        {expiresIn}
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
      <Clock className="w-3.5 h-3.5 text-slate-400" />
      {expiresIn}
    </div>
  );
}

export default function TraderPortal() {
  const [instrumentType, setInstrumentType] = useState('Electronic Weighbridge (Class III)');
  const [applicationType, setApplicationType] = useState('Initial Verification');
  const [serialNumber, setSerialNumber] = useState('');
  const [successBanner, setSuccessBanner] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const [activeInstruments, setActiveInstruments] = useState<Instrument[]>([
    { type: 'Weighbridge Class III', serial: 'WB-8842-IND', capacity: '50,000 kg', status: 'VERIFIED', expiresIn: '298 Days' },
    { type: 'Platform Scale', serial: 'PS-192-X', capacity: '500 kg', status: 'DUE SOON', expiresIn: '12 Days' },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim()) return;

    const refId = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInstrument: Instrument = {
      type: instrumentType.split(' (')[0],
      serial: serialNumber.trim(),
      capacity: 'Pending',
      status: 'PENDING VERIFICATION',
      expiresIn: 'N/A',
    };

    setActiveInstruments(prev => [...prev, newInstrument]);
    setSuccessBanner(`Application Submitted Successfully! Reference ID: ${refId}`);
    setInstrumentType('Electronic Weighbridge (Class III)');
    setApplicationType('Initial Verification');
    setSerialNumber('');
    setTimeout(() => setSuccessBanner(''), 6000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <header className="bg-[#1E293B] text-white py-6 px-4 shadow-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 text-white p-2 rounded-md border border-slate-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Trader & Manufacturer Portal</h1>
              <p className="text-xs text-slate-300">License Management & Instrument Verification</p>
            </div>
          </div>
          <Link href="/" className="text-xs text-slate-300 hover:text-white transition">Back to Home</Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">License Profile</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs text-slate-500 font-semibold mb-1">Business Name</div>
                  <div className="font-medium text-slate-900">Apex Grain & Logistics Pvt Ltd</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold mb-1">License Number</div>
                  <div className="font-mono text-slate-700">LMO/MH/2024/09812</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold mb-1">Status</div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3" /> ACTIVE
                  </span>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold mb-1">Registered Address</div>
                  <div className="text-slate-700">Plot 45, MIDC Industrial Area, Nagpur, Maharashtra</div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Fee Payment Status</h2>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                  <CreditCard className="w-4 h-4" />
                  Outstanding Dues
                </div>
                <div className="text-lg font-bold text-[#1E293B]">₹0.00</div>
              </div>
              <button
                onClick={() => setShowHistory(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-md shadow-sm transition">
                View Transaction History
              </button>
            </section>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> New Verification Application
              </h2>

              {successBanner && (
                <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md text-sm font-semibold flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  {successBanner}
                </div>
              )}

              <form className="space-y-4 text-sm" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Instrument Type</label>
                    <select
                      value={instrumentType}
                      onChange={(e) => setInstrumentType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-700"
                    >
                      <option>Electronic Weighbridge (Class III)</option>
                      <option>Platform Scale (Class III)</option>
                      <option>Precision Balance (Class II)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Application Type</label>
                    <select
                      value={applicationType}
                      onChange={(e) => setApplicationType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-700"
                    >
                      <option>Initial Verification</option>
                      <option>Annual Re-verification</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacturer Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Enter Serial No. (e.g. WB-5501-MH)"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-700"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-400">All fields are required to proceed.</p>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2 rounded-md shadow-sm transition"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4" /> Active Instruments
                </h2>
                <span className="text-xs text-slate-500 font-medium">{activeInstruments.length} registered</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Instrument & Serial</th>
                      <th className="px-4 py-3 font-semibold">Capacity</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Expires In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeInstruments.map((inst, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{inst.type}</div>
                          <div className="text-xs text-slate-500 font-mono">{inst.serial}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{inst.capacity}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${statusStyles[inst.status]}`}>
                            {inst.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <ExpiryCell status={inst.status} expiresIn={inst.expiresIn} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>

      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-slate-600" />
                <h2 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">Transaction History</h2>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium p-1.5 rounded-md transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {mockTransactions.map((txn) => (
                <div key={txn.ref} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="text-xs font-mono text-slate-500 mb-0.5">{txn.ref}</div>
                      <div className="text-sm font-bold text-slate-900">{txn.instrumentType}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> {txn.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Date</div>
                      <div className="text-slate-800 font-medium">{txn.date}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Amount</div>
                      <div className="text-slate-900 font-bold text-sm">{txn.amount}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Payment Mode</div>
                      <div className="text-slate-800 font-medium">{txn.paymentMethod}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowHistory(false)}
                className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium px-4 py-2 rounded-md transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
