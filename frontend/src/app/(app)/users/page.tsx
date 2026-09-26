"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, type User } from "@/lib/api";

export default function UsersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "enforcement_official">("enforcement_official");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  async function loadUsers() {
    const data = await apiFetch<User[]>("/users");
    setUsers(data);
  }

  useEffect(() => {
    if (user?.role !== "admin") return;
    loadUsers().catch((err) => setError(err instanceof Error ? err.message : "Unable to load users"));
  }, [user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiFetch<User>("/users", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });
      setName("");
      setEmail("");
      setPassword("");
      setRole("enforcement_official");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create user");
    } finally {
      setSubmitting(false);
    }
  }

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form className="space-y-3 rounded-xl border border-slate-200 bg-white p-5" onSubmit={onSubmit}>
        <h2 className="text-sm font-semibold text-slate-900">Create user</h2>
        <Input placeholder="Full name" required value={name} onChange={(event) => setName(event.target.value)} />
        <Input placeholder="Email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input
          placeholder="Password (min 8 characters)"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <select
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          value={role}
          onChange={(event) => setRole(event.target.value as "admin" | "enforcement_official")}
        >
          <option value="enforcement_official">Enforcement Official</option>
          <option value="admin">Admin</option>
        </select>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Add user"}
        </Button>
      </form>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-900">{item.name}</td>
                <td className="px-4 py-3 text-slate-600">{item.email}</td>
                <td className="px-4 py-3 capitalize text-slate-600">{item.role.replaceAll("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
