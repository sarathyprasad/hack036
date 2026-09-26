"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  FileCheck2,
  QrCode,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  apiFetch,
  InspectionRecord,
  InspectionResult,
  VerificationApplication,
} from "@/lib/api";

export default function InspectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appIdParam = searchParams.get("app_id");

  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>(appIdParam || "");
  const [loadingApps, setLoadingApps] = useState(true);

  // Form states
  const [standardWeights, setStandardWeights] = useState(
    "Standard Working Test Weights Set (Class F1 / M1 Certified)"
  );
  const [observedError, setObservedError] = useState<string>("0.01");
  const [toleranceLimit, setToleranceLimit] = useState<string>("0.05");
  const [result, setResult] = useState<InspectionResult>("passed");
  const [stampingMarkNo, setStampingMarkNo] = useState("");
  const [sealNumber, setSealNumber] = useState("");
  const [remarks, setRemarks] = useState(
    "Tested across capacity range. Zero-drift, eccentric loading and repeat errors within permissible MPE limits."
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successCertNum, setSuccessCertNum] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<VerificationApplication[]>("/applications")
      .then((data) => {
        // Filter for scheduled/assigned/submitted applications
        const sched = data.filter((a) => ["scheduled", "assigned", "submitted"].includes(a.status));
        setApplications(sched);
        if (sched.length > 0 && !selectedAppId) {
          setSelectedAppId(sched[0].id);
        }
      })
      .catch((err) => console.error("Failed to load applications:", err))
      .finally(() => setLoadingApps(false));
  }, [selectedAppId]);

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) {
      setError("Please select an application to inspect.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const record = await apiFetch<InspectionRecord>("/inspections", {
        method: "POST",
        body: JSON.stringify({
          application_id: selectedAppId,
          standard_weights_used: standardWeights,
          observed_max_error: parseFloat(observedError),
          tolerance_limit: parseFloat(toleranceLimit),
          result,
          stamping_mark_no: stampingMarkNo || undefined,
          seal_number: sealNumber || undefined,
          remarks,
        }),
      });

      if (record.result === "passed") {
        setSuccessCertNum("CERT-GENERATED");
      } else {
        router.push("/applications");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record inspection");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-blue-900/40 bg-gradient-to-r from-slate-900 to-blue-950 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-500/20 p-2.5 text-teal-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Field Officer Inspection & Stamping Portal</h2>
            <p className="text-xs text-slate-300">
              Record standard weight calibration tests & issue QR digital certificates directly from mobile/tablet.
            </p>
          </div>
        </div>
      </div>

      {successCertNum ? (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-8 text-center text-emerald-950 shadow-md space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-900">Verification Inspection Passed!</h3>
          <p className="text-sm text-emerald-800 max-w-md mx-auto">
            The Digital Verification Certificate has been successfully generated with QR authentication under Legal Metrology Rules, 2011.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/certificates"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 shadow transition"
            >
              <QrCode className="h-4 w-4" /> View Digital Certificates
            </Link>
            <Link
              href="/applications"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 border border-emerald-300 transition"
            >
              Return to Applications Queue
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmitInspection} className="space-y-6">
            {/* Select Application */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                Select Pending Verification Application
              </label>
              {loadingApps ? (
                <div className="text-xs text-slate-500">Loading assigned queue…</div>
              ) : applications.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                  No pending verification applications currently assigned for field inspection.
                </div>
              ) : (
                <select
                  required
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm font-medium text-slate-900"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      Application #{app.application_number} — {app.instrument?.brand} {app.instrument?.model_number} (S/N: {app.instrument?.serial_number})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedApp && selectedApp.instrument && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
                <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                  <span>Instrument Verification Context</span>
                  <span className="font-mono text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                    S/N: {selectedApp.instrument.serial_number}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block">Category:</span>
                    <span className="font-semibold">{selectedApp.instrument.category.replace(/_/g, " ").toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Accuracy Class:</span>
                    <span className="font-semibold">{selectedApp.instrument.accuracy_class.replace(/_/g, " ").toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Max Capacity:</span>
                    <span className="font-semibold">{selectedApp.instrument.capacity_rating}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Location District:</span>
                    <span className="font-semibold">{selectedApp.instrument.district}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block">Premises Address:</span>
                  <span className="font-medium text-slate-900">{selectedApp.instrument.installation_address}</span>
                </div>
              </div>
            )}

            {/* Verification Results Form */}
            <div className="border-t border-slate-200 pt-4 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-teal-700">
                1. Field Test Observations & Tolerances
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Standard Weights / Verification Reference Used
                </label>
                <Input
                  required
                  value={standardWeights}
                  onChange={(e) => setStandardWeights(e.target.value)}
                  placeholder="e.g. Class F1 Test Weights Set #504 certified by NPL"
                  className="bg-slate-50 border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Observed Max Error Reading (+/-)
                  </label>
                  <Input
                    type="number"
                    step="0.001"
                    required
                    value={observedError}
                    onChange={(e) => setObservedError(e.target.value)}
                    className="bg-slate-50 border-slate-300 text-slate-900 text-xs"
                  />
                  <span className="text-[11px] text-slate-500">e.g. 0.01g or 0.015kg deviation</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Maximum Permissible Error (MPE Tolerance Limit)
                  </label>
                  <Input
                    type="number"
                    step="0.001"
                    required
                    value={toleranceLimit}
                    onChange={(e) => setToleranceLimit(e.target.value)}
                    className="bg-slate-50 border-slate-300 text-slate-900 text-xs"
                  />
                  <span className="text-[11px] text-slate-500">Legal limit under Rules 2011</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Inspection Decision
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setResult("passed")}
                    className={`p-3 rounded-lg border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      result === "passed"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> PASSED (Issue Cert)
                  </button>

                  <button
                    type="button"
                    onClick={() => setResult("failed")}
                    className={`p-3 rounded-lg border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      result === "failed"
                        ? "border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <XCircle className="h-4 w-4 text-rose-600" /> FAILED
                  </button>

                  <button
                    type="button"
                    onClick={() => setResult("rectification_required")}
                    className={`p-3 rounded-lg border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      result === "rectification_required"
                        ? "border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <ShieldAlert className="h-4 w-4 text-amber-600" /> RECTIFICATION
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Stamping Mark Number
                  </label>
                  <Input
                    placeholder="e.g. LM-STAMP-2026-DEL-082"
                    value={stampingMarkNo}
                    onChange={(e) => setStampingMarkNo(e.target.value)}
                    className="bg-slate-50 border-slate-300 text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Physical Security Seal / Lead Seal Number
                  </label>
                  <Input
                    placeholder="e.g. SEAL-DL-2026-9842"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    className="bg-slate-50 border-slate-300 text-slate-900 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Inspector Remarks & Field Notes
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900"
                />
              </div>

              {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={submitting || applications.length === 0}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-2.5"
                >
                  {submitting ? "Processing Stamping & Certification…" : "Submit & Generate Digital Certificate"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
