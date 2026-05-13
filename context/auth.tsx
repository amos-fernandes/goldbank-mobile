import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { setAuthTokenGetter } from "@workspace/api-client-react";

const TOKEN_KEY = "gb_mobile_token";
const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export type AsaasStatus = "PENDING" | "ACTIVE" | "REJECTED";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  asaasStatus: AsaasStatus;
  walletId?: string | null;
  message?: string | null;
  token?: string | null;
}

export interface RegisterData {
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  birthDate: string;
  address: string;
  addressNumber: string;
  complement?: string;
  neighborhood: string;
  postalCode: string;
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function apiPost(path: string, body: Record<string, unknown>): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erro na requisição");
  return data as AuthUser;
}

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  }
  return SecureStore.getItemAsync(key);
}

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
    return;
  }
  return SecureStore.setItemAsync(key, value);
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") localStorage.removeItem(key);
    return;
  }
  return SecureStore.deleteItemAsync(key);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);
    return () => setAuthTokenGetter(null);
  }, []);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const stored = await secureGet(TOKEN_KEY);
      if (stored) {
        const res = await fetch(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${stored}` },
        });
        if (res.ok) {
          const userData = (await res.json()) as AuthUser;
          setUser(userData);
          setToken(stored);
          tokenRef.current = stored;
        } else {
          await secureDelete(TOKEN_KEY);
        }
      }
    } catch {
      // network error or expired token
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const data = await apiPost("/api/auth/login", { email, password });
    if (data.token) {
      await secureSet(TOKEN_KEY, data.token);
      setToken(data.token);
      tokenRef.current = data.token;
    }
    setUser(data);
  }

  async function register(registerData: RegisterData) {
    const data = await apiPost("/api/auth/register", registerData as unknown as Record<string, unknown>);
    if (data.token) {
      await secureSet(TOKEN_KEY, data.token);
      setToken(data.token);
      tokenRef.current = data.token;
    }
    setUser(data);
  }

  async function logout() {
    await secureDelete(TOKEN_KEY);
    setToken(null);
    tokenRef.current = null;
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
