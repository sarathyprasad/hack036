'use client';

import React, { useState } from 'react';
import { ShieldCheck, Calculator, Camera, MapPin, FileCheck, CheckCircle2, XCircle, Upload, Signature } from 'lucide-react';

export default function LmoInspectPage() {
  const [lmoId, setLmoId] = useState('LMO-MH-401');
  const [lmoName, setLmoName] = useState('R. K. Sharma');
  const [traderName, setTraderName] = useState('');
  const [instrumentType, setInstrumentType] = useState('Electronic Weighbridge');
  const [serialNumber, setSerialNumber] = useState('');
  const [capacity, setCapacity] = useState('50000');

  const [scaleClass, setScaleClass] = useState<'Class I' | 'Class II' | 'Class III' | 'Class IV'>('Class III');
  const [appliedWeight, setAppliedWeight] = useState<string>('1000');
  const [displayWeight, setDisplayWeight] = useState<string>('1000.5');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [geotag, setGeotag] = useState<string>('18.5204° N, 73.8567° E (Captured)');

  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const getTolerancePercentage = (cls: string) => {
    switch (cls) {
      case 'Class I':
        return 0.01;
      case 'Class II':
        return 0.05;
      case 'Class III':
        return 0.1;
      case 'Class IV':
        return 0.5;
      default:
        return 0.1;
    }
  };

  const numApplied = parseFloat(appliedWeight) || 0;
  const numDisplay = parseFloat(displayWeight) || 0;
  const absError = Math.abs(numDisplay - numApplied);
  const maxAllowedTolerance = (numApplied * getTolerancePercentage(scaleClass)) / 100;
  const isPass = numApplied > 0 && absError <= maxAllowedTolerance;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setGeotag('18.5204° N, 73.8567° E (Live GPS)');
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSignatureFile(file);
      setSignaturePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <header className="bg-[#1E293B] text-white py-5 px-4 shadow-sm border-b border-slate-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2 rounded-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">LMO Field Inspection & Stamping Portal</h1>
              <p className="text-xs text-slate-300">Legal Metrology Officer Verification Desk</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-300">
            <span className="font-mono bg-slate-800 px-2.5 py-1 rounded border border-slate-700">Officer: {lmoId}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {submitted ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-[#1E293B]">Inspection Record Submitted</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              The inspection data and MPE calculation have been recorded with geotagged evidence and digital signature.
            </p>
            <div className="pt-4">
              <button
                onClick={() => setSubmitted(false)}
                className="bg-[#1E293B] hover:bg-slate-800 text-white font-medium text-xs px-5 py-2.5 rounded-md transition-colors shadow-sm"
              >
                Conduct New Inspection
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-[#1E293B] border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-slate-600" />
                1. Officer & Instrument Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Inspector Name & ID</label>
                  <input
                    type="text"
                    value={`${lmoName} (${lmoId})`}
                    onChange={(e) => setLmoName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Trader / Business Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Grain Warehouse"
                    value={traderName}
                    onChange={(e) => setTraderName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Instrument Type</label>
                  <input
                    type="text"
                    value={instrumentType}
                    onChange={(e) => setInstrumentType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. WB-8842-IND"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-700"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-slate-600" />
                  2. Maximum Permissible Error (MPE) Calculator
                </h2>
                <span className="text-xs font-semibold text-slate-500">Legal Metrology Rules 2011</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Scale Accuracy Class</label>
                  <select
                    value={scaleClass}
                    onChange={(e) => setScaleClass(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-700"
                  >
                    <option value="Class I">Class I (Special / Fine - 0.01% MPE)</option>
                    <option value="Class II">Class II (High - 0.05% MPE)</option>
                    <option value="Class III">Class III (Medium - 0.10% MPE)</option>
                    <option value="Class IV">Class IV (Ordinary - 0.50% MPE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Applied Test Weight (kg)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={appliedWeight}
                    onChange={(e) => setAppliedWeight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Scale Display Weight (kg)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={displayWeight}
                    onChange={(e) => setDisplayWeight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 p-4 rounded-md border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="text-slate-600">
                    Calculated Difference: <span className="font-mono font-semibold text-slate-900">{absError.toFixed(4)} kg</span>
                  </div>
                  <div className="text-slate-600">
                    Max Allowed Margin ({getTolerancePercentage(scaleClass)}%): <span className="font-mono font-semibold text-slate-900">±{maxAllowedTolerance.toFixed(4)} kg</span>
                  </div>
                </div>

                <div>
                  {isPass ? (
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      MPE PASS (WITHIN TOLERANCE)
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                      <XCircle className="w-4 h-4 text-red-700" />
                      MPE FAIL (EXCEEDS MPE)
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-[#1E293B] border-b border-slate-100 pb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-slate-600" />
                3. Evidence & Verification Uploads
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Geotagged Photo Evidence</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-slate-400 transition-colors bg-slate-50">
                    {photoPreview ? (
                      <div className="space-y-2">
                        <img src={photoPreview} alt="Geotagged Evidence" className="h-32 mx-auto rounded border border-slate-200 object-cover" />
                        <span className="text-[11px] text-slate-500 block truncate">{photoFile?.name}</span>
                      </div>
                    ) : (
                      <label className="cursor-pointer block space-y-2">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                        <span className="text-xs text-slate-600 block">Click to upload instrument photo</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>GPS Geotag: {geotag}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Inspector Digital Signature</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-slate-400 transition-colors bg-slate-50">
                    {signaturePreview ? (
                      <div className="space-y-2">
                        <img src={signaturePreview} alt="Digital Signature" className="h-32 mx-auto rounded border border-slate-200 object-contain bg-white" />
                        <span className="text-[11px] text-slate-500 block truncate">{signatureFile?.name}</span>
                      </div>
                    ) : (
                      <label className="cursor-pointer block space-y-2">
                        <Signature className="w-6 h-6 text-slate-400 mx-auto" />
                        <span className="text-xs text-slate-600 block">Upload digital signature PNG/JPG</span>
                        <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 pt-1">
                    HMAC-signed verification code generated on submission.
                  </div>
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-[#1E293B] hover:bg-slate-800 text-white font-semibold text-sm px-8 py-3 rounded-md transition-colors shadow-sm flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Submit Field Inspection & Stamping
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
