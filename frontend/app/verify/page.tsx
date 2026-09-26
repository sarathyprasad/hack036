'use client';

import React, { useState } from 'react';
import { Search, CheckCircle2, Download, ShieldCheck, Building2, Calendar, Hash, MapPin, Scale, AlertTriangle, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

type Certificate = {
  certificateId: string;
  serialNumber: string;
  status: string;
  instrumentType: string;
  capacity: string;
  licenseOwner: string;
  licenseNumber: string;
  gatcCenter: string;
  stampingDate: string;
  expiryDate: string;
  verificationOfficer: string;
  location: string;
  mpeReading: string;
  qrHash: string;
};

const mockRegister: Certificate[] = [
  {
    certificateId: 'LM-2026-98421-X',
    serialNumber: 'WB-8842-IND',
    status: 'VERIFIED',
    instrumentType: 'Electronic Weighbridge (Class III)',
    capacity: '50,000 kg (50 Tonnes)',
    licenseOwner: 'Apex Grain & Logistics Private Limited',
    licenseNumber: 'LMO/MH/2024/09812',
    gatcCenter: 'Government Approved Test Centre #04 (Nagpur)',
    stampingDate: '15 January 2026',
    expiryDate: '14 January 2027',
    verificationOfficer: 'R. K. Sharma (Senior LMO)',
    location: 'Plot 45, MIDC Industrial Area, Nagpur, Maharashtra',
    mpeReading: '+0.02%',
    qrHash: 'a7f3c9e128b409d5812e99f012a4b8',
  },
  {
    certificateId: 'LM-2026-44182-P',
    serialNumber: 'PS-192-X',
    status: 'VERIFIED',
    instrumentType: 'Platform Scale (Class III)',
    capacity: '500 kg',
    licenseOwner: 'Apex Grain & Logistics Private Limited',
    licenseNumber: 'LMO/MH/2024/09812',
    gatcCenter: 'Government Approved Test Centre #04 (Nagpur)',
    stampingDate: '10 February 2026',
    expiryDate: '22 February 2026',
    verificationOfficer: 'S. P. Deshmukh (LMO)',
    location: 'Plot 45, MIDC Industrial Area, Nagpur, Maharashtra',
    mpeReading: '+0.05%',
    qrHash: 'f1e2d3c4b5a6978001122334455667',
  },
  {
    certificateId: 'LM-2025-71029-B',
    serialNumber: 'PB-3391-MH',
    status: 'VERIFIED',
    instrumentType: 'Precision Balance (Class II)',
    capacity: '2 kg',
    licenseOwner: 'Star Jewelers & Co.',
    licenseNumber: 'LMO/MH/2023/00341',
    gatcCenter: 'Government Approved Test Centre #12 (Mumbai)',
    stampingDate: '01 August 2025',
    expiryDate: '31 July 2026',
    verificationOfficer: 'M. V. Kulkarni (Senior LMO)',
    location: '14, Zaveri Bazaar, Mumbai, Maharashtra',
    mpeReading: '+0.001%',
    qrHash: 'c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5',
  },
];

export default function VerifyPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Certificate | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;

    const match = mockRegister.find(
      (cert) =>
        cert.certificateId.toUpperCase() === trimmed ||
        cert.serialNumber.toUpperCase() === trimmed
    );

    setHasSearched(true);
    if (match) {
      setResult(match);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans print:hidden">
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
            <div className="hidden sm:block text-right text-xs text-slate-300">
              <span>Legal Metrology Rules, 2011</span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8">
          <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1E293B] mb-2">Verify Stamping & Calibration Certificate</h2>
            <p className="text-sm text-slate-600 mb-6">
              Enter the Certificate Number or Instrument Serial Number to verify authenticity and validity.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. LM-2026-98421-X or WB-8842-IND or PS-192-X"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-md shadow-sm transition"
              >
                Verify Certificate
              </button>
            </form>
          </section>

          {hasSearched && notFound && (
            <section className="bg-rose-50 border border-rose-200 rounded-lg px-6 py-5 flex items-start gap-4 shadow-sm">
              <div className="mt-0.5">
                <XCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-900 mb-1">Certificate / Serial Number Not Found in Register</h3>
                <p className="text-xs text-rose-700">
                  No verified record found for <span className="font-mono font-semibold">{query.trim()}</span>. Please check the number and try again, or contact your regional Legal Metrology Office.
                </p>
              </div>
            </section>
          )}

          {result && (
            <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    {result.status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Ref ID: {result.certificateId}</span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium px-4 py-2 rounded-md transition inline-flex items-center justify-center gap-2 print:hidden"
                >
                  <Download className="w-4 h-4" />
                  Download Certificate PDF
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Instrument Type</span>
                    <div className="flex items-center gap-2 text-base font-semibold text-[#1E293B]">
                      <Scale className="w-4 h-4 text-slate-600" />
                      {result.instrumentType}
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Instrument Capacity & Serial No.</span>
                    <div className="text-sm font-medium text-slate-800">
                      {result.capacity} &bull; <span className="font-mono text-slate-600">{result.serialNumber}</span>
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">License Owner</span>
                    <div className="flex items-start gap-2 text-sm font-medium text-slate-800">
                      <Building2 className="w-4 h-4 text-slate-500 mt-0.5" />
                      <div>
                        <div>{result.licenseOwner}</div>
                        <div className="text-xs text-slate-500">License: {result.licenseNumber}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Location of Verification</span>
                    <div className="flex items-start gap-2 text-sm text-slate-700">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                      {result.location}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Stamping Date</span>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {result.stampingDate}
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Expiry Date</span>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {result.expiryDate}
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Testing Centre / Officer</span>
                    <div className="text-sm text-slate-800">
                      <div>{result.gatcCenter}</div>
                      <div className="text-xs text-slate-500">Verified by: {result.verificationOfficer}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">MPE Reading & QR Code</span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
                      <div className="flex flex-col gap-1.5 text-xs font-mono text-slate-600">
                        <div className="flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5 text-slate-400" />
                          <span>MPE: {result.mpeReading}</span>
                        </div>
                        <div className="text-slate-500 truncate max-w-[180px]">Hash: {result.qrHash}</div>
                      </div>
                      <div className="bg-white p-2 rounded-md border border-slate-200 shadow-sm">
                        <QRCodeSVG
                          value={typeof window !== "undefined" ? `${window.location.origin}/verify?cert=${encodeURIComponent(result.certificateId)}` : `https://legal-metrology-frontend.onrender.com/verify?cert=${encodeURIComponent(result.certificateId)}`}
                          size={64}
                        />
                      </div>
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

      {result && (
        <div className="hidden print:block w-full bg-white text-black p-10 relative font-sans max-w-[816px] mx-auto border-4 border-slate-900">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <ShieldCheck className="w-[500px] h-[500px]" />
          </div>

          <div className="text-center border-b-2 border-slate-800 pb-6 mb-8 relative z-10">
            <h1 className="text-3xl font-extrabold uppercase tracking-widest text-slate-900">Government of India</h1>
            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-700 mt-2">Department of Legal Metrology</h2>
            <p className="text-sm font-semibold mt-1">Official Verification Certificate</p>
            <p className="text-xs text-slate-500 mt-1">Issued under Legal Metrology Rules, 2011</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
            <div>
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase block">Certificate No.</span>
                <span className="text-lg font-bold font-mono text-slate-900">{result.certificateId}</span>
              </div>
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase block">License Owner</span>
                <span className="text-base font-bold text-slate-900">{result.licenseOwner}</span>
                <div className="text-sm text-slate-700">Lic: {result.licenseNumber}</div>
              </div>
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase block">Location</span>
                <span className="text-sm text-slate-800">{result.location}</span>
              </div>
            </div>
            <div className="text-right flex flex-col items-end justify-start">
              <QRCodeSVG
                value={typeof window !== "undefined" ? `${window.location.origin}/verify?cert=${encodeURIComponent(result.certificateId)}` : `https://legal-metrology-frontend.onrender.com/verify?cert=${encodeURIComponent(result.certificateId)}`}
                size={120}
              />
              <div className="text-[10px] font-mono text-slate-500 mt-2">HMAC: {result.qrHash}</div>
            </div>
          </div>

          <div className="border border-slate-300 rounded p-4 mb-8 relative z-10">
            <h3 className="text-sm font-bold uppercase border-b border-slate-200 pb-2 mb-3">Equipment Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-slate-600">Instrument Type:</span> {result.instrumentType}
              </div>
              <div>
                <span className="font-semibold text-slate-600">Capacity:</span> {result.capacity}
              </div>
              <div>
                <span className="font-semibold text-slate-600">Serial No:</span> <span className="font-mono">{result.serialNumber}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">MPE Limits:</span> {result.mpeReading}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12 relative z-10">
            <div>
              <div className="mb-2"><span className="text-xs font-bold text-slate-500 uppercase">Date of Stamping</span></div>
              <div className="font-bold text-slate-900">{result.stampingDate}</div>
            </div>
            <div>
              <div className="mb-2"><span className="text-xs font-bold text-slate-500 uppercase">Valid Until</span></div>
              <div className="font-bold text-slate-900">{result.expiryDate}</div>
            </div>
          </div>

          <div className="border-t-2 border-slate-800 pt-6 mt-16 flex justify-between items-end relative z-10">
            <div className="text-xs text-slate-500 max-w-xs">
              This is a digitally generated certificate verified by the Legal Metrology Department. Scan the QR code for live verification.
            </div>
            <div className="text-right">
              <div className="text-lg font-serif italic text-blue-900 mb-2">Digitally Signed by LMO</div>
              <div className="font-bold text-slate-900">{result.verificationOfficer}</div>
              <div className="text-xs text-slate-600">{result.gatcCenter}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
