"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  FileCheck2,
  FileText,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  QrCode,
  Scale,
  Shield,
  Users,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isOfficer = user?.role && ["admin", "lmo", "gatc", "enforcement_official"].includes(user.role);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/instruments", label: "Instruments Fleet", icon: Scale },
    { href: "/applications", label: "Verification Requests", icon: FileText },
    ...(isOfficer
      ? [{ href: "/inspections", label: "Field Inspections", icon: CheckCircle2 }]
      : []),
    { href: "/certificates", label: "Digital Certificates", icon: QrCode },
    { href: "/alerts", label: "Expiry Alerts & Reminders", icon: Bell },
    { href: "/docs", label: "System Documentation", icon: HelpCircle },
  ];

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-slate-950 text-slate-200">
      <div className="border-b border-slate-800 px-5 py-5">
        <div className="flex items-center gap-2 text-teal-400">
          <Scale className="h-6 w-6" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">Legal Metrology</p>
        </div>
        <p className="mt-1 text-sm font-semibold text-white">Verification & Certification</p>
        <p className="text-[10px] text-slate-400">Under LM Act, 2009 & Rules, 2011</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                active ? "bg-teal-700 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <Link
            href="/users"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition mt-2 border-t border-slate-800 pt-3",
              pathname.startsWith("/users")
                ? "bg-teal-700 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Users className="h-4 w-4 text-amber-400" />
            Officer & User Admin
          </Link>
        )}
      </nav>

      <div className="border-t border-slate-800 p-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-teal-400" />
          <span>Govt of India Compliant</span>
        </div>
      </div>
    </aside>
  );
}
