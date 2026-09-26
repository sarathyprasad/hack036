"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Printer,
  QrCode,
  Scale,
  Search,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Input } from "@/components/ui/input";
import { apiFetch, DigitalCertificate } from "@/lib/api";

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<DigitalCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch<DigitalCertificate[]>("/certificates")
      .then((data) => setCertificates(data))
      .catch((err) => console.error("Failed to load certificates:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCerts = certificates.filter(
    (c) =>
      c.certificate_number.toLowerCase().includes(search.toLowerCase()) ||
      c.seal_number.toLowerCase().includes(search.toLowerCase()) ||
      c.trader?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.instrument?.serial_number.toLowerCase().includes(search.toLowerCase()) ||
      c.instrument?.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Digital Verification Certificates Repository</h2>
          <p className="text-sm text-slate-500">
            Legal Metrology Act, 2009 & General Rules, 2011 — Centralized Verifiable Certificates.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <Search className="absolute left-7 top-6.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search certificate number, seal number, serial number, or trader name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-50 border-slate-200"
        />
      </div>

      {/* Certificates Cards Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading digital certificate repository…</div>
      ) : filteredCerts.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          No digital certificates found. Certificates are generated automatically when a field inspection is approved.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCerts.map((cert) => {
            const isExpired = new Date(cert.valid_until) < new Date();
            const verifyUrl = `/verify-certificate/${cert.certificate_number}`;

            return (
              <div
                key={cert.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-teal-600" />
                        <span className="font-mono font-bold text-slate-900 text-base">
                          {cert.certificate_number}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Issued: {new Date(cert.issue_date).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isExpired
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isExpired ? "EXPIRED" : "VERIFIED & ACTIVE"}
                    </span>
                  </div>

                  {/* Instrument Summary */}
                  {cert.instrument && (
                    <div className="mt-4 rounded-lg bg-slate-50 p-3.5 border border-slate-200 text-xs space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Scale className="h-4 w-4 text-teal-600" />
                        {cert.instrument.brand} {cert.instrument.model_number}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-slate-600">
                        <p><span className="font-semibold">Serial No:</span> {cert.instrument.serial_number}</p>
                        <p><span className="font-semibold">Capacity:</span> {cert.instrument.capacity_rating}</p>
                        <p><span className="font-semibold">Accuracy:</span> {cert.instrument.accuracy_class.replace(/_/g, " ").toUpperCase()}</p>
                        <p><span className="font-semibold">District:</span> {cert.instrument.district}</p>
                      </div>
                    </div>
                  )}

                  {/* Security & Dates */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Security Seal No:</span>
                      <span className="font-mono font-semibold text-slate-800">{cert.seal_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Valid Until (Re-verification):</span>
                      <span className={`font-bold ${isExpired ? "text-rose-600" : "text-emerald-700"}`}>
                        {new Date(cert.valid_until).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <Link
                    href={verifyUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    <QrCode className="h-4 w-4" /> Public Verification Link <ExternalLink className="h-3 w-3" />
                  </Link>

                  <Link
                    href={`/certificates/${cert.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 font-semibold text-white hover:bg-teal-500 transition shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5" /> View / Print Certificate
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
