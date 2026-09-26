# Unified Online Verification & Digital Certification Platform
## Legal Metrology Act, 2009 & Legal Metrology (General) Rules, 2011

---

### System Overview

This software platform provides a centralized, secure web-based and mobile-enabled ecosystem for online verification, digital certification, and lifecycle management of weighing and measuring instruments across State Legal Metrology Departments and Government Approved Test Centres (GATCs).

---

### Core Functional Capabilities

1. **Multi-Stakeholder Portal**:
   - Registration and authentication for **Traders / Users of Weights & Measures**, **State Legal Metrology Officers (LMOs)**, **Government Approved Test Centres (GATCs)**, and **Administrators**.
2. **Instrument Lifecycle Management**:
   - Online registration of weighing scales, weighbridges, flow meters, petrol dispensing pumps, and standard weights with accuracy class (Class I, II, III, IIII), capacity, serial number, and location district.
3. **Application & Workflow Automation**:
   - Online submission of applications for initial verification, periodic re-verification, and post-repair verification.
   - Pending allocation queue management, officer assignment (LMO/GATC), and date scheduling.
4. **Digital Field Inspections**:
   - Mobile-optimized interface for field officers to enter standard test weights used, maximum error readings, tolerance compliance, stamping mark numbers, and physical lead seal numbers.
5. **QR-Enabled Digital Verification Certificates**:
   - Dynamic generation of official digital certificates featuring embedded QR codes, valid-until dates, and cryptographic SHA-256 security hashes.
6. **Public QR Code Authenticator (`/verify-certificate/[cert_no]`)**:
   - Instant online authenticity verification accessible by consumers, regulators, and businesses scanning the QR code printed on instruments or certificates without requiring login.
7. **Expiry Alerts & Compliance Tracking**:
   - Automatic 30-day and 7-day re-verification expiry alerts, real-time validity tracking, and overdue status flagging.
8. **Role-Based Dashboards & Analytics**:
   - Aggregated status metrics, compliance rates, active certificates count, pending inspection queues, and officer workload distribution.

---

### Software Architecture & Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- **Backend API**: FastAPI (Python 3.12+), Uvicorn ASGI Server, Pydantic v2.
- **Database & ORM**: SQLAlchemy 2.0 ORM with support for SQLite and PostgreSQL 15.
- **Security & Authentication**: OAuth2 Password Flow with JWT bearer tokens, bcrypt password hashing, and SHA-256 certificate security hashes.

---

### Deployment Methodology

#### 1. Running Backend locally
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`

#### 2. Running Frontend locally
```powershell
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

### Legal Metrology Compliance Mapping Matrix

| Legal Rule / Section | Requirement | System Feature Implementation |
|---|---|---|
| **LM Act 2009 Section 24** | Mandatory periodic verification & stamping | Instrument fleet tracking, automated application submission, and inspection scheduling. |
| **LM Rules 2011 Rule 14** | Submission of weights/measures for verification | Online workflow connecting Traders to assigned LMOs and GATC test centres. |
| **LM Rules 2011 Rule 16** | Certificate of Verification | Digital Certificate generation with seal number, valid until date, and QR code. |
| **Public Inspection & Consumer Protection** | Verification history & proof of stamping | Public QR scanner landing page (`/verify-certificate/[certNo]`). |
