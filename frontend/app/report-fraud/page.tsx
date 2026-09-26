'use client';

import React, { useState } from 'react';
import { AlertTriangle, MapPin, Camera, Ticket, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ReportFraudPortal() {
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketId(`FRD-${Math.floor(Math.random() * 100000)}`);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <header className="bg-[#1E293B] text-white py-6 px-4 shadow-sm border-b border-slate-700">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-rose-600 text-white p-2 rounded-md border border-rose-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Public Fraud Reporting</h1>
              <p className="text-xs text-slate-300">Report Uncalibrated Scales & Short-Weight Suspicions</p>
            </div>
          </div>
          <Link href="/" className="text-xs text-slate-300 hover:text-white transition">Back to Home</Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {submitted ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full mb-2">
              <Ticket className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E293B]">Report Submitted Successfully</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Thank you for reporting. Your vigilance helps maintain fair trade practices. A Legal Metrology Officer will review the evidence shortly.
            </p>
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-md inline-block">
              <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Your Tracking Ticket ID</div>
              <div className="text-xl font-mono font-bold text-slate-900">{ticketId}</div>
            </div>
            <div className="pt-6">
              <button 
                onClick={() => setSubmitted(false)}
                className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium px-4 py-2 rounded-md transition"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">Consumer Escalation Form</h2>
              <p className="text-xs text-slate-500">All fields are optional but detailed information helps faster enforcement.</p>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shop Name / Vendor Details</label>
                <input type="text" placeholder="e.g. ABC Grocery Store" className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-700" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Incident Location
                </label>
                <input type="text" placeholder="Full address or nearby landmark" className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-700" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scale Serial Number (If visible)</label>
                <input type="text" placeholder="e.g. WB-1234" className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-700" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description of Issue</label>
                <textarea rows={4} placeholder="Describe the suspected tampering, missing seal, or short weight incident..." className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-700" required></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Photographic Evidence (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors bg-slate-50 cursor-pointer">
                  <span className="text-xs text-slate-500 font-medium">Click or drag images of the scale, receipt, or goods here.</span>
                  <input type="file" accept="image/*" className="hidden" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-2.5 rounded-md transition flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Submit Fraud Report
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
