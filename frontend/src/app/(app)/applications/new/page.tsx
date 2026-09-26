"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, ApplicationType, Instrument } from "@/lib/api";

export default function NewApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedInstId = searchParams.get("instrument_id");

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>(preselectedInstId || "");
  const [applicationType, setApplicationType] = useState<ApplicationType>("initial_verification");
  const [preferredDate, setPreferredDate] = useState<string>("");
  const [traderNotes, setTraderNotes] = useState<string>("");
  const [loadingInsts, setLoadingInsts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Instrument[]>("/instruments")
      .then((data) => {
        setInstruments(data);
        if (data.length > 0 && !selectedInstId) {
          setSelectedInstId(data[0].id);
        }
      })
      .catch((err) => console.error("Failed to load instruments:", err))
      .finally(() => setLoadingInsts(false));
  }, [selectedInstId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstId) {
      setError("Please select a registered instrument.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await apiFetch("/applications", {
        method: "POST",
        body: JSON.stringify({
          instrument_id: selectedInstId,
          application_type: applicationType,
          preferred_date: preferredDate ? new Date(preferredDate).toISOString() : undefined,
          trader_notes: traderNotes,
        }),
      });
      router.push("/applications");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedInst = instruments.find((i) => i.id === selectedInstId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/applications" className="rounded-lg p-2 hover:bg-slate-100 transition text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Application for Verification & Stamping</h2>
          <p className="text-sm text-slate-500">
            Submit request under Legal Metrology Act, 2009 & General Rules, 2011.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Select Instrument */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              Select Weighing / Measuring Device
            </label>
            {loadingInsts ? (
              <div className="text-xs text-slate-500">Loading instrument fleet…</div>
            ) : instruments.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                No instruments registered under your account yet.{" "}
                <Link href="/instruments" className="font-bold underline text-amber-900">
                  Click here to register an instrument first.
                </Link>
              </div>
            ) : (
              <select
                required
                value={selectedInstId}
                onChange={(e) => setSelectedInstId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm font-medium text-slate-900"
              >
                {instruments.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.brand} {inst.model_number} (S/N: {inst.serial_number}) — {inst.capacity_rating} ({inst.district})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedInst && (
            <div className="rounded-lg bg-teal-50 border border-teal-200 p-4 text-xs space-y-1 text-teal-950">
              <div className="font-bold text-teal-900 flex items-center gap-1.5 text-sm">
                <Scale className="h-4 w-4 text-teal-600" />
                Selected Device Summary:
              </div>
              <p><span className="font-semibold">Category:</span> {selectedInst.category.replace(/_/g, " ").toUpperCase()}</p>
              <p><span className="font-semibold">Accuracy Class:</span> {selectedInst.accuracy_class.replace(/_/g, " ").toUpperCase()}</p>
              <p><span className="font-semibold">Address:</span> {selectedInst.installation_address}, {selectedInst.district}</p>
              <p><span className="font-semibold">Current Stamping Status:</span> <span className="uppercase font-bold">{selectedInst.status}</span></p>
            </div>
          )}

          {/* Application Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">Verification Purpose</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setApplicationType("initial_verification")}
                className={`p-3 rounded-lg border text-left text-xs font-semibold transition ${
                  applicationType === "initial_verification"
                    ? "border-teal-600 bg-teal-50 text-teal-900 shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                }`}
              >
                1. Initial Verification
                <p className="text-[11px] font-normal text-slate-500 mt-1">Before putting new instrument into use</p>
              </button>

              <button
                type="button"
                onClick={() => setApplicationType("periodic_reverification")}
                className={`p-3 rounded-lg border text-left text-xs font-semibold transition ${
                  applicationType === "periodic_reverification"
                    ? "border-teal-600 bg-teal-50 text-teal-900 shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                }`}
              >
                2. Periodic Re-verification
                <p className="text-[11px] font-normal text-slate-500 mt-1">Annual / periodic renewal of stamping</p>
              </button>

              <button
                type="button"
                onClick={() => setApplicationType("verification_post_repair")}
                className={`p-3 rounded-lg border text-left text-xs font-semibold transition ${
                  applicationType === "verification_post_repair"
                    ? "border-teal-600 bg-teal-50 text-teal-900 shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                }`}
              >
                3. Verification Post-Repair
                <p className="text-[11px] font-normal text-slate-500 mt-1">Re-stamping after repair or maintenance</p>
              </button>
            </div>
          </div>

          {/* Preferred Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1">
              Preferred Inspection Date
            </label>
            <Input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="bg-slate-50 border-slate-300 text-slate-900"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1">
              Additional Inspection Notes / Access Instructions
            </label>
            <textarea
              rows={3}
              value={traderNotes}
              onChange={(e) => setTraderNotes(e.target.value)}
              placeholder="Provide directions to premises, contact person details, or special test requirements..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900"
            />
          </div>

          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href="/applications" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={submitting || instruments.length === 0}
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold"
            >
              {submitting ? "Submitting Application…" : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
