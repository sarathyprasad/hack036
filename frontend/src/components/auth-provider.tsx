"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  apiFetch,
  clearSession,
  getStoredToken,
  getStoredUser,
  persistSession,
  type TokenResponse,
  type User,
  type UserRole,
} from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: UserRole,
    phone?: string,
    organization?: string,
    jurisdiction_district?: string
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    const stored = getStoredUser();
    if (!token) {
      setLoading(false);
      return;
    }
    if (stored) {
      setUser(stored);
    }
    apiFetch<User>("/auth/me")
      .then((fresh) => {
        setUser(fresh);
        persistSession(token, fresh);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    persistSession(data.access_token, data.user);
    setUser(data.user);
    router.push("/dashboard");
    router.refresh();
  }, [router]);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: UserRole = "trader",
      phone?: string,
      organization?: string,
      jurisdiction_district?: string
    ) => {
      const data = await apiFetch<TokenResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          phone,
          organization,
          jurisdiction_district,
        }),
      });
      persistSession(data.access_token, data.user);
      setUser(data.user);
      router.push("/dashboard");
      router.refresh();
    },
    [router]
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.push("/login");
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
