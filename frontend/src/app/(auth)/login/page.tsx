"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Scale, KeyRound, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetDemoPasswords, resetPassword } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resettingDemo, setResettingDemo] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        const res = await resetPassword(email, newPassword);
        setSuccess(res.message);
        setPassword(newPassword);
        setTimeout(() => setMode("login"), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetDemo() {
    setResettingDemo(true);
    setError("");
    setSuccess("");
    try {
      const res = await resetDemoPasswords();
      setSuccess(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset demo passwords");
    } finally {
      setResettingDemo(false);
    }
  }

  function fillDemo(demoEmail: string, demoPass: string) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
    setSuccess("");
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
      <div className="flex items-center gap-2 text-teal-400">
        <Scale className="h-6 w-6" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">Legal Metrology Portal</p>
      </div>

      {mode === "login" ? (
        <>
          <h1 className="mt-2 text-2xl font-bold text-white">Sign In</h1>
          <p className="mt-1 text-sm text-slate-400">
            Verification, Certification & Enforcement Management System
          </p>

          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-teal-950/80 border border-teal-800 p-3 text-sm text-teal-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
              <span>{success}</span>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm text-slate-300">
              Email Address
              <Input
                className="mt-1 bg-slate-950 border-slate-800 text-white"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <div>
              <div className="flex justify-between items-center text-sm text-slate-300">
                <span>Password</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-xs text-teal-400 hover:text-teal-300"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                className="mt-1 bg-slate-950 border-slate-800 text-white"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium" disabled={submitting}>
              {submitting ? "Authenticating…" : "Sign In to Portal"}
            </Button>
          </form>

          {/* Demo Credentials Quick Fill */}
          <div className="mt-6 border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                <KeyRound className="h-3.5 w-3.5" />
                <span>Demo Role Quick Fill:</span>
              </div>
              <button
                type="button"
                onClick={handleResetDemo}
                disabled={resettingDemo}
                title="Reset default passwords for all 4 demo accounts"
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition"
              >
                <RefreshCw className={`h-3 w-3 ${resettingDemo ? "animate-spin" : ""}`} />
                <span>Reset Demo Passwords</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => fillDemo("apex.logistics@trader.com", "Trader@12345")}
                className="px-2 py-1.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-left transition truncate"
              >
                🏢 <span className="font-semibold text-white">Trader</span> User
              </button>
              <button
                type="button"
                onClick={() => fillDemo("lmo.delhi@legalmetrology.gov.in", "Lmo@12345")}
                className="px-2 py-1.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-left transition truncate"
              >
                👮 <span className="font-semibold text-white">State LMO</span> Officer
              </button>
              <button
                type="button"
                onClick={() => fillDemo("gatc.north@gatc.gov.in", "Gatc@12345")}
                className="px-2 py-1.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-left transition truncate"
              >
                🔬 <span className="font-semibold text-white">GATC Center</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("admin@legalmetrology.gov.in", "Admin@123")}
                className="px-2 py-1.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-left transition truncate"
              >
                🛡️ <span className="font-semibold text-white">System Admin</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            New stakeholder?{" "}
            <Link className="text-teal-400 hover:text-teal-300 font-medium" href="/register">
              Register account
            </Link>
          </p>
        </>
      ) : (
        <>
          <div className="mt-2 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Enter your official registered email and choose a new password.
          </p>

          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-teal-950/80 border border-teal-800 p-3 text-sm text-teal-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
              <span>{success}</span>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm text-slate-300">
              Official Email
              <Input
                className="mt-1 bg-slate-950 border-slate-800 text-white"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block text-sm text-slate-300">
              New Password
              <Input
                className="mt-1 bg-slate-950 border-slate-800 text-white"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium" disabled={submitting}>
              {submitting ? "Updating Password…" : "Save New Password & Sign In"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
