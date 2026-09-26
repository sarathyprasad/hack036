"use client";

import { FileText, HelpCircle, Lock, QrCode, Scale, ShieldCheck, Server, Database } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-teal-600 mb-1">
          <HelpCircle className="h-6 w-6" />
          <h2 className="text-2xl font-bold text-slate-900">Technical Documentation & Regulatory Framework</h2>
        </div>
        <p className="text-sm text-slate-600">
          Software Architecture, Security Framework, Role-Based Access Control, and Legal Metrology Act, 2009 Compliance Specification.
        </p>
      </div>

      {/* Section 1: Executive Overview & Legal Metrology Act Mapping */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
          <Scale className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-bold">1. Legal Metrology Act, 2009 & Rules, 2011 Compliance Mapping</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Under the Legal Metrology Act, 2009 and the Legal Metrology (General) Rules, 2011, every weighing and measuring instrument used in commercial transaction or public protection is required to be periodically verified and stamped before being put into use.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Section 24 (Verification & Stamping)</h4>
            <p className="text-slate-600">
              Mandates periodic inspection by Legal Metrology Officers (LMOs) or Government Approved Test Centres (GATCs). The portal automates application filing, inspector allocation, and scheduled inspection date management.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Rule 16 (Digital Verification Certificates)</h4>
            <p className="text-slate-600">
              Replaces manual paper certificates with cryptographically signed digital certificates carrying QR codes. Enables instant citizen and regulator online authenticity checks via public URL scanning.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Software Architecture */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
          <Server className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold">2. Software Architecture & Tech Stack</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
            <div className="font-bold text-blue-900 text-sm">Frontend Tier</div>
            <p>Next.js 15 App Router</p>
            <p>React 19 & Tailwind CSS v4</p>
            <p>Lucide Icon Library & Responsive Mobile UI</p>
          </div>

          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
            <div className="font-bold text-emerald-900 text-sm">Backend API Tier</div>
            <p>FastAPI (Python 3.12+)</p>
            <p>Uvicorn ASGI High-Performance Server</p>
            <p>OAuth2 JWT Bearer Tokens</p>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 text-purple-950 space-y-1">
            <div className="font-bold text-purple-900 text-sm">Data & Persistence Tier</div>
            <p>SQLAlchemy 2.0 ORM</p>
            <p>SQLite / PostgreSQL 15 Database</p>
            <p>SHA-256 Cryptographic Hash Generation</p>
          </div>
        </div>
      </section>

      {/* Section 3: Security & Role-Based Access Control (RBAC) */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
          <Lock className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-bold">3. Security Framework & Role-Based Access Control (RBAC)</h3>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3">User Role</th>
                <th className="p-3">Target Stakeholders</th>
                <th className="p-3">Permissions & Platform Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-600">
              <tr>
                <td className="p-3 font-bold text-amber-800">TRADER</td>
                <td className="p-3">Traders, Manufacturers, Dealers, Fuel Pump Owners</td>
                <td className="p-3">Register instruments fleet, submit verification requests, view certificates, receive 30-day expiry reminders.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-blue-800">STATE LMO</td>
                <td className="p-3">State Legal Metrology Officers / Inspectors</td>
                <td className="p-3">Receive field inspection assignments, record standard test observations, enter seal numbers, approve/reject stamping, issue digital certificates.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-emerald-800">GATC</td>
                <td className="p-3">Government Approved Test Centres</td>
                <td className="p-3">Perform laboratory and field testing for notified measuring devices, issue verification records.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-purple-800">ADMIN</td>
                <td className="p-3">Department Administrators & Controllers</td>
                <td className="p-3">System-wide monitoring, pending queue allocation, inspector workloads, enforcement metrics, user management.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Digital Certificate Authentication */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
          <QrCode className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-bold">4. QR Code & Cryptographic Authenticity Verification</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Every generated certificate contains a unique 256-bit SHA-256 cryptographic hash calculated from the certificate number, instrument serial number, physical lead seal number, validity date, and secret government key.
        </p>
        <div className="bg-slate-950 p-4 rounded-lg text-teal-400 font-mono text-xs overflow-x-auto border border-slate-800">
          SHA256(CertificateNo + SerialNo + SealNo + ExpiryDate + SecretSalt) = CryptographicSecurityHash
        </div>
        <p className="text-xs text-slate-500">
          When any consumer or enforcement officer scans the QR code on a weighing scale or certificate, the public endpoint <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">/verify-certificate/[certNo]</code> verifies the digital signature online and confirms whether the instrument is genuinely stamped and active.
        </p>
      </section>
    </div>
  );
}
