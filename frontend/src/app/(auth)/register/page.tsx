"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Scale, Building2, UserCheck, ShieldCheck } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("trader");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [district, setDistrict] = useState("Central Delhi");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(name, email, password, role, phone, organization, district);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
      <div className="flex items-center gap-2 text-teal-400">
        <Scale className="h-6 w-6" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">Legal Metrology Portal</p>
      </div>
      <h1 className="mt-2 text-2xl font-bold text-white">Stakeholder Registration</h1>
      <p className="mt-1 text-sm text-slate-400">
        Register under the Legal Metrology Act, 2009 & General Rules, 2011.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Stakeholder Role</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setRole("trader")}
              className={`flex flex-col items-center p-3 rounded-lg border text-xs font-medium transition ${
                role === "trader"
                  ? "border-teal-500 bg-teal-950/60 text-teal-300"
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
              }`}
            >
              <Building2 className="h-4 w-4 mb-1 text-amber-400" />
              Trader / Business
            </button>
            <button
              type="button"
              onClick={() => setRole("lmo")}
              className={`flex flex-col items-center p-3 rounded-lg border text-xs font-medium transition ${
                role === "lmo"
                  ? "border-teal-500 bg-teal-950/60 text-teal-300"
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
              }`}
            >
              <UserCheck className="h-4 w-4 mb-1 text-blue-400" />
              State LMO
            </button>
            <button
              type="button"
              onClick={() => setRole("gatc")}
              className={`flex flex-col items-center p-3 rounded-lg border text-xs font-medium transition ${
                role === "gatc"
                  ? "border-teal-500 bg-teal-950/60 text-teal-300"
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
              }`}
            >
              <ShieldCheck className="h-4 w-4 mb-1 text-emerald-400" />
              GATC Center
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm text-slate-300">
            Full Name / Contact Person
            <Input className="mt-1 bg-slate-950 border-slate-800 text-white" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="block text-sm text-slate-300">
            Phone Number
            <Input className="mt-1 bg-slate-950 border-slate-800 text-white" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
        </div>

        <label className="block text-sm text-slate-300">
          Official Email
          <Input
            className="mt-1 bg-slate-950 border-slate-800 text-white"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm text-slate-300">
            Company / Department Name
            <Input className="mt-1 bg-slate-950 border-slate-800 text-white" placeholder="Apex Trading Ltd" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          </label>

          <label className="block text-sm text-slate-300">
            District / Jurisdiction
            <Input className="mt-1 bg-slate-950 border-slate-800 text-white" required value={district} onChange={(e) => setDistrict(e.target.value)} />
          </label>
        </div>

        <label className="block text-sm text-slate-300">
          Password
          <Input
            className="mt-1 bg-slate-950 border-slate-800 text-white"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white" disabled={submitting}>
          {submitting ? "Registering Stakeholder…" : "Complete Registration"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-400">
        Already registered?{" "}
        <Link className="text-teal-400 hover:text-teal-300 font-medium" href="/login">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
