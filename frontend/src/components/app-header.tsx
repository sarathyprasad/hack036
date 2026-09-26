"use client";

import { useState } from "react";
import { KeyRound, LogOut, X, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/lib/api";

const titles: Record<string, string> = {
  "/dashboard": "System Overview & Compliance Dashboard",
  "/instruments": "Weighing & Measuring Instruments Fleet",
  "/applications": "Verification & Re-verification Requests",
  "/applications/new": "Submit New Verification Application",
  "/inspections": "Field Inspection & Calibration Portal",
  "/certificates": "Digital Certificates & Stamps Repository",
  "/alerts": "Verification Expiry & Compliance Alerts",
  "/docs": "Technical & Regulatory Documentation",
  "/users": "User & Officer Account Management",
};

export function AppHeader({ pathname }: { pathname: string }) {
  const { user, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  let title = "Legal Metrology Portal";
  for (const key of Object.keys(titles)) {
    if (pathname === key || pathname.startsWith(`${key}/`)) {
      title = titles[key];
      break;
    }
  }

  const roleMap: Record<string, { label: string; bg: string }> = {
    admin: { label: "System Admin", bg: "bg-purple-100 text-purple-800" },
    lmo: { label: "State LMO Inspector", bg: "bg-blue-100 text-blue-800" },
    gatc: { label: "GATC Testing Center", bg: "bg-emerald-100 text-emerald-800" },
    trader: { label: "Trader / Business User", bg: "bg-amber-100 text-amber-800" },
    enforcement_official: { label: "Enforcement Official", bg: "bg-indigo-100 text-indigo-800" },
  };

  const roleBadge = roleMap[user?.role ?? "trader"] ?? { label: user?.role ?? "User", bg: "bg-slate-100 text-slate-800" };

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setSuccess(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500">Legal Metrology Act, 2009 & General Rules, 2011</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${roleBadge.bg}`}>
                {roleBadge.label}
              </span>
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          
          <Button
            variant="secondary"
            onClick={() => {
              setShowPasswordModal(true);
              setError("");
              setSuccess("");
            }}
            className="text-xs py-1.5 px-3 text-slate-700 hover:bg-slate-100 border-slate-300"
          >
            <KeyRound className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
            Password
          </Button>

          <Button variant="secondary" onClick={logout} className="text-xs py-1.5 px-3 border-slate-300">
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-teal-400 mb-1">
              <KeyRound className="h-5 w-5" />
              <h2 className="text-lg font-bold">Change Password</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Update password for account <span className="text-slate-200 font-medium">{user?.email}</span>
            </p>

            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-teal-950/80 border border-teal-800 p-3 text-sm text-teal-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <label className="block text-xs font-medium text-slate-300">
                Current Password
                <Input
                  className="mt-1 bg-slate-950 border-slate-800 text-white"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </label>

              <label className="block text-xs font-medium text-slate-300">
                New Password
                <Input
                  className="mt-1 bg-slate-950 border-slate-800 text-white"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowPasswordModal(false)}
                  className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-medium"
                >
                  {submitting ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
