export const TOKEN_COOKIE = "lm_access_token";
export const USER_STORAGE_KEY = "lm_user";

export type UserRole = "admin" | "lmo" | "gatc" | "trader" | "enforcement_official";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  jurisdiction_district?: string;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type InstrumentCategory =
  | "electronic_weighing_scale"
  | "weighbridge"
  | "flow_meter"
  | "petrol_dispenser"
  | "weights"
  | "measures"
  | "capacity_measure"
  | "other";

export type AccuracyClass = "class_i" | "class_ii" | "class_iii" | "class_iiii" | "not_applicable";
export type InstrumentStatus = "unverified" | "pending_verification" | "verified" | "expired" | "rejected";

export type Instrument = {
  id: string;
  trader_id: string;
  category: InstrumentCategory;
  brand: string;
  model_number: string;
  serial_number: string;
  capacity_rating: string;
  accuracy_class: AccuracyClass;
  verification_interval_months: number;
  installation_address: string;
  district: string;
  state: string;
  pincode?: string;
  status: InstrumentStatus;
  last_verified_at?: string;
  next_due_date?: string;
  created_at: string;
  trader_name?: string;
};

export type ApplicationType = "initial_verification" | "periodic_reverification" | "verification_post_repair";
export type ApplicationStatus = "submitted" | "assigned" | "scheduled" | "inspected" | "approved" | "rejected" | "cancelled";

export type VerificationApplication = {
  id: string;
  application_number: string;
  instrument_id: string;
  trader_id: string;
  application_type: ApplicationType;
  status: ApplicationStatus;
  preferred_date?: string;
  assigned_type?: string;
  assigned_officer_id?: string;
  assigned_officer_name?: string;
  scheduled_date?: string;
  trader_notes?: string;
  created_at: string;
  updated_at: string;
  instrument?: Instrument;
  trader?: User;
};

export type InspectionResult = "passed" | "failed" | "rectification_required";

export type InspectionRecord = {
  id: string;
  application_id: string;
  instrument_id: string;
  inspector_id: string;
  inspection_date: string;
  standard_weights_used: string;
  observed_max_error: number;
  tolerance_limit: number;
  result: InspectionResult;
  stamping_mark_no?: string;
  seal_number?: string;
  photo_url?: string;
  remarks?: string;
  created_at: string;
  inspector_name?: string;
};

export type DigitalCertificate = {
  id: string;
  certificate_number: string;
  application_id: string;
  instrument_id: string;
  trader_id: string;
  inspector_id: string;
  issue_date: string;
  valid_until: string;
  seal_number: string;
  security_hash: string;
  qr_code_url?: string;
  is_active: boolean;
  created_at: string;
  instrument?: Instrument;
  trader?: User;
  inspector_name?: string;
};

export type PublicVerificationResult = {
  is_valid: boolean;
  certificate_number: string;
  status: string;
  issue_date: string;
  valid_until: string;
  seal_number: string;
  security_hash: string;
  trader_name: string;
  organization?: string;
  district: string;
  instrument_category: string;
  instrument_brand: string;
  instrument_model: string;
  instrument_serial: string;
  accuracy_class: string;
  capacity_rating: string;
  inspector_name: string;
  verification_authority: string;
};

export type AlertNotification = {
  id: string;
  user_id: string;
  instrument_id?: string;
  certificate_id?: string;
  alert_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type DashboardStats = {
  total_instruments: number;
  active_verified_instruments: number;
  pending_applications: number;
  expiring_soon_count: number;
  expired_count: number;
  total_certificates: number;
  assigned_inspections: number;
  compliance_rate_percent: number;
};

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function persistSession(token: string, user: User) {
  localStorage.setItem(TOKEN_COOKIE, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  const maxAge = 60 * 60 * 24;
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_COOKIE);
  localStorage.removeItem(USER_STORAGE_KEY);
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_COOKIE);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = (await response.json()) as { detail?: string | Array<{ msg: string }> };
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        message = data.detail[0].msg;
      }
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

export async function resetPassword(email: string, newPassword: string) {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, new_password: newPassword }),
  });
}

export async function resetDemoPasswords() {
  return apiFetch<{ message: string }>("/auth/reset-demo-passwords", {
    method: "POST",
  });
}

