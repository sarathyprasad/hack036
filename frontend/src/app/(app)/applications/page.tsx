"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  Plus,
  Scale,
  UserCheck,
  XCircle,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  apiFetch,
  ApplicationStatus,
  User,
  VerificationApplication,
} from "@/lib/api";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<string>("all");

  // Assign Modal
  const [selectedApp, setSelectedApp] = useState<VerificationApplication | null>(null);
  const [assignedType, setAssignedType] = useState<"LMO" | "GATC">("LMO");
  const [assignedOfficerId, setAssignedOfficerId] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [assigning, setAssigning] = useState(false);

  const isOfficer = user?.role && ["admin", "lmo", "gatc", "enforcement_official"].includes(user.role);

  const loadApplications = () => {
    setLoading(true);
    apiFetch<VerificationApplication[]>("/applications")
      .then((data) => setApplications(data))
      .catch((err) => console.error("Failed to load applications:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApplications();
    if (isOfficer) {
      apiFetch<User[]>("/auth/officers")
        .then((data) => {
          setOfficers(data);
          if (data.length > 0) setAssignedOfficerId(data[0].id);
        })
        .catch((err) => console.error("Failed to load officers:", err));
    }
  }, [isOfficer]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setAssigning(true);
    try {
      await apiFetch(`/applications/${selectedApp.id}/assign`, {
        method: "POST",
        body: JSON.stringify({
          assigned_type: assignedType,
          assigned_officer_id: assignedOfficerId,
          scheduled_date: scheduledDate ? new Date(scheduledDate).toISOString() : new Date().toISOString(),
        }),
      });
      setSelectedApp(null);
      loadApplications();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to assign application");
    } finally {
      setAssigning(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (statusTab === "all") return true;
    if (statusTab === "pending") return ["submitted", "assigned", "scheduled"].includes(app.status);
    return app.status === statusTab;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "submitted":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Submitted</span>;
      case "assigned":
      case "scheduled":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Scheduled for Inspection</span>;
      case "approved":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Approved & Certified</span>;
      case "rejected":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Verification & Re-verification Requests</h2>
          <p className="text-sm text-slate-500">
            Online application lifecycle under Legal Metrology Rules, 2011.
          </p>
        </div>
        <Link
          href="/applications/new"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> New Verification Request
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setStatusTab("all")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
            statusTab === "all" ? "border-teal-600 text-teal-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          All Applications ({applications.length})
        </button>
        <button
          onClick={() => setStatusTab("pending")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
            statusTab === "pending" ? "border-teal-600 text-teal-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Pending / Scheduled
        </button>
        <button
          onClick={() => setStatusTab("approved")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
            statusTab === "approved" ? "border-teal-600 text-teal-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setStatusTab("rejected")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
            statusTab === "rejected" ? "border-teal-600 text-teal-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Applications Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading verification applications…</div>
        ) : filteredApps.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No verification applications found in this view.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">App Number & Date</th>
                  <th className="px-6 py-3">Instrument Details</th>
                  <th className="px-6 py-3">Trader / Owner</th>
                  <th className="px-6 py-3">Assigned Inspector</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-900">{app.application_number}</div>
                      <div className="text-xs text-slate-500">
                        Type: {app.application_type.replace(/_/g, " ").toUpperCase()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(app.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {app.instrument ? (
                        <div>
                          <div className="font-semibold text-slate-900">{app.instrument.brand} {app.instrument.model_number}</div>
                          <div className="text-xs text-slate-500">S/N: {app.instrument.serial_number}</div>
                          <div className="text-[11px] text-slate-500">{app.instrument.capacity_rating} | {app.instrument.district}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Instrument Record</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-semibold text-slate-900">{app.trader?.name || app.instrument?.trader_name || "Trader User"}</div>
                      <div className="text-slate-500">{app.trader?.organization || "Business Entity"}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {app.assigned_officer_name ? (
                        <div>
                          <div className="font-semibold text-purple-900">{app.assigned_officer_name}</div>
                          <div className="text-slate-500">({app.assigned_type})</div>
                          {app.scheduled_date && (
                            <div className="text-[11px] text-teal-600 font-medium">
                              Sched: {new Date(app.scheduled_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-amber-600 font-medium italic">Pending Officer Allocation</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {isOfficer && ["submitted", "assigned"].includes(app.status) && (
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSelectedApp(app);
                            setScheduledDate(new Date().toISOString().split("T")[0]);
                          }}
                          className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs"
                        >
                          <UserCheck className="mr-1 h-3.5 w-3.5" /> Assign Officer
                        </Button>
                      )}

                      {isOfficer && ["scheduled", "assigned", "submitted"].includes(app.status) && (
                        <Link
                          href={`/inspections?app_id=${app.id}`}
                          className="inline-flex items-center gap-1 rounded bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 transition shadow-sm"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Perform Inspection
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocation Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold text-white mb-2">Allocate Inspection Officer</h3>
            <p className="text-xs text-slate-400 mb-4">
              Application: <span className="font-mono text-teal-300 font-bold">{selectedApp.application_number}</span>
            </p>

            <form onSubmit={handleAssign} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 mb-1">Agency Type</label>
                <select
                  value={assignedType}
                  onChange={(e) => setAssignedType(e.target.value as "LMO" | "GATC")}
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="LMO">State Legal Metrology Inspector (LMO)</option>
                  <option value="GATC">Government Approved Test Centre (GATC)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Assign Officer</label>
                <select
                  value={assignedOfficerId}
                  onChange={(e) => setAssignedOfficerId(e.target.value)}
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                >
                  {officers.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.name} ({off.role.toUpperCase()} - {off.organization || "Govt Inspectorate"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Scheduled Inspection Date</label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button type="button" variant="secondary" onClick={() => setSelectedApp(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white" disabled={assigning}>
                  {assigning ? "Assigning…" : "Confirm Allocation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
