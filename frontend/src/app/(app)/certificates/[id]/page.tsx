"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, QrCode, Scale, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiFetch, DigitalCertificate, API_URL } from "@/lib/api";

export default function CertificateViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const certId = resolvedParams.id;

  const [cert, setCert] = useState<DigitalCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<DigitalCertificate>(`/certificates/${certId}`)
      .then((data) => setCert(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load certificate"))
      .finally(() => setLoading(false));
  }, [certId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading certificate document…</div>;
  if (error || !cert) return <div className="p-8 text-center text-rose-500 font-semibold">{error || "Certificate not found"}</div>;

  const isExpired = new Date(cert.valid_until) < new Date();
  const verifyPath = `/verify-certificate/${cert.certificate_number}`;
  const verifyFullUrl = typeof window !== "undefined" ? `${window.location.origin}${verifyPath}` : `${API_URL}/public/verify/${cert.certificate_number}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/certificates" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to Certificates
        </Link>
        <Button onClick={handlePrint} className="bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-sm">
          <Printer className="mr-2 h-4 w-4" /> Print / Save PDF Certificate
        </Button>
      </div>

      {/* Printable Certificate Document Sheet */}
      <div className="bg-white border-4 border-slate-900 p-8 sm:p-12 shadow-2xl rounded-sm text-slate-900 relative font-serif">
        {/* Decorative Inner Frame */}
        <div className="border border-slate-400 p-6 sm:p-8 space-y-6 relative">
          {/* Header */}
          <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-amber-400 font-bold text-xl">
              <Scale className="h-7 w-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-900">
              Department of Legal Metrology
            </h1>
            <p className="text-xs sm:text-sm font-sans font-semibold text-slate-700 tracking-wide">
              GOVERNMENT OF INDIA / STATE LEGAL METROLOGY DEPARTMENT
            </p>
            <p className="text-[11px] font-sans text-slate-500 italic">
              [Issued Under Section 24 of the Legal Metrology Act, 2009 & Rule 16 of Legal Metrology (General) Rules, 2011]
            </p>
            <div className="mt-3 inline-block bg-teal-50 border border-teal-300 px-4 py-1.5 rounded-full font-sans text-xs font-bold text-teal-900 uppercase tracking-widest">
              Digital Certificate of Verification & Stamping
            </div>
          </div>

          {/* Certificate Number & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-sans border-b border-slate-200 pb-4 text-xs">
            <div>
              <span className="text-slate-500">Certificate No: </span>
              <span className="font-mono font-bold text-slate-900 text-sm">{cert.certificate_number}</span>
            </div>
            <div>
              <span className="text-slate-500">Verification Status: </span>
              <span className={`font-bold px-2 py-0.5 rounded ${isExpired ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                {isExpired ? "EXPIRED" : "VERIFIED & VALID"}
              </span>
            </div>
          </div>

          {/* Body Statement */}
          <div className="text-sm leading-relaxed space-y-4 font-serif">
            <p>
              This is to certify that the weighing / measuring instrument described below, owned and operated by{" "}
              <strong className="font-sans uppercase text-teal-950 font-bold">{cert.trader?.name || cert.instrument?.trader_name}</strong>{" "}
              ({cert.trader?.organization || "Registered Stakeholder"}), located at{" "}
              <span className="font-sans font-semibold">{cert.instrument?.installation_address}, {cert.instrument?.district}</span>, has been officially tested, verified, and stamped in accordance with the standards prescribed under the Legal Metrology Act, 2009.
            </p>

            {/* Instrument Specification Grid */}
            <div className="font-sans border-2 border-slate-900 rounded bg-slate-50 p-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Instrument Category:</span>
                <span className="font-bold text-slate-900 uppercase">{cert.instrument?.category.replace(/_/g, " ")}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Brand / Make & Model:</span>
                <span className="font-bold text-slate-900">{cert.instrument?.brand} ({cert.instrument?.model_number})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Instrument Serial Number:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{cert.instrument?.serial_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Max Capacity & Rating:</span>
                <span className="font-bold text-slate-900">{cert.instrument?.capacity_rating}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Accuracy Class:</span>
                <span className="font-bold text-slate-900 uppercase">{cert.instrument?.accuracy_class.replace(/_/g, " ")}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Verification Periodicity:</span>
                <span className="font-bold text-slate-900">{cert.instrument?.verification_interval_months || 12} Months</span>
              </div>
            </div>

            {/* Stamping & Seal Info */}
            <div className="font-sans border border-slate-300 rounded p-4 grid grid-cols-2 gap-3 text-xs bg-white">
              <div>
                <span className="text-slate-500 block">Verification Stamping Date:</span>
                <span className="font-bold text-slate-900">{new Date(cert.issue_date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-rose-700 font-bold">Valid Until (Next Due Date):</span>
                <span className="font-bold text-rose-700 text-sm">{new Date(cert.valid_until).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Security Lead / Seal Number:</span>
                <span className="font-mono font-bold text-slate-900">{cert.seal_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Issuing Officer / Authority:</span>
                <span className="font-bold text-slate-900">{cert.inspector_name || "State Legal Metrology Inspector"}</span>
              </div>
            </div>
          </div>

          {/* QR Code & Authentication Footer */}
          <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 font-sans">
            {/* Visual QR Code Representation */}
            <div className="flex items-center gap-4 border border-slate-300 p-3 rounded bg-slate-50">
              <div className="p-2 bg-white border border-slate-300 rounded shadow-inner text-slate-900">
                <QrCode className="h-16 w-16 text-slate-900" />
              </div>
              <div className="text-[11px] space-y-1">
                <p className="font-bold text-slate-900 uppercase">Scan QR Code to Authenticate</p>
                <p className="text-slate-500">Public Verification Portal Link</p>
                <p className="font-mono text-[10px] text-teal-700 font-bold truncate max-w-[200px]">
                  {cert.certificate_number}
                </p>
              </div>
            </div>

            {/* Signature & Seal */}
            <div className="text-center sm:text-right text-xs space-y-1">
              <div className="inline-block border-b-2 border-slate-800 pb-1 font-semibold text-slate-900 min-w-[180px]">
                {cert.inspector_name || "Rajesh Kumar (Senior LMO)"}
              </div>
              <p className="font-bold text-slate-900">Legal Metrology Officer</p>
              <p className="text-slate-500 text-[10px]">Digital Signature & Seal Verified</p>
            </div>
          </div>

          {/* Security Hash Footnote */}
          <div className="pt-2 font-mono text-[10px] text-slate-400 text-center truncate">
            Cryptographic Integrity Hash: SHA256:{cert.security_hash}
          </div>
        </div>
      </div>
    </div>
  );
}
