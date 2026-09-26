"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, Bell, Check, CheckCircle2, Clock, Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AlertNotification, apiFetch } from "@/lib/api";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = () => {
    setLoading(true);
    apiFetch<AlertNotification[]>("/alerts")
      .then((data) => setAlerts(data))
      .catch((err) => console.error("Failed to load alerts:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkRead = async (alertId: string) => {
    try {
      await apiFetch(`/alerts/${alertId}/read`, { method: "POST" });
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a)));
    } catch (err) {
      console.error("Failed to mark alert as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch("/alerts/read-all", { method: "POST" });
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all alerts read:", err);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "expiry_warning_30d":
      case "expiry_warning_7d":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "expired":
        return <AlertCircle className="h-5 w-5 text-rose-500" />;
      default:
        return <Bell className="h-5 w-5 text-teal-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Verification Expiry & Compliance Alerts</h2>
          <p className="text-sm text-slate-500">
            Automated alerts for expiring validity under Legal Metrology Act, 2009.
          </p>
        </div>
        <Button onClick={handleMarkAllRead} variant="secondary" className="text-xs">
          <Check className="mr-1.5 h-3.5 w-3.5" /> Mark All as Read
        </Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading alerts feed…</div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            No compliance alerts found. All instruments are within valid verification periods.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl border p-5 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                alert.is_read
                  ? "bg-white border-slate-200"
                  : "bg-teal-50/40 border-teal-200 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-slate-100 p-2.5 mt-0.5">{getAlertIcon(alert.alert_type)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{alert.title}</h3>
                    {!alert.is_read && (
                      <span className="rounded-full bg-teal-600 text-white text-[10px] font-bold px-2 py-0.2">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-xl">{alert.message}</p>
                  <span className="text-[11px] text-slate-400 mt-1.5 block">
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {alert.instrument_id && (
                  <Link
                    href={`/applications/new?instrument_id=${alert.instrument_id}`}
                    className="inline-flex items-center gap-1 rounded bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 transition shadow-sm"
                  >
                    Apply Re-verification
                  </Link>
                )}

                {!alert.is_read && (
                  <button
                    onClick={() => handleMarkRead(alert.id)}
                    className="text-xs text-slate-500 hover:text-slate-900 underline font-medium"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
