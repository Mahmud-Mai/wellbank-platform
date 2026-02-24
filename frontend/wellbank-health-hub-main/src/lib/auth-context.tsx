import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, UserRole } from "./types";
import { mockApi } from "./mock-api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    verificationToken: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: "patient" | "doctor" | "provider_admin";
  }) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "wellbank_auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setState((s) => ({ ...s, isLoading: false }));
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await mockApi.auth.login(email, password);
    const user = res.data.user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const register = useCallback(
    async (data: {
      verificationToken: string;
      password: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      role: "patient" | "doctor" | "provider_admin";
    }) => {
      const res = await mockApi.auth.completeRegistration(data);
      const user: User = {
        id: res.data.userId,
        email: "",
        roles: res.data.roles as UserRole[],
        activeRole: res.data.activeRole as UserRole,
        firstName: data.firstName,
        lastName: data.lastName,
        isVerified: true,
        isKycVerified: false,
        kycLevel: 0,
        mfaEnabled: false,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const switchRole = useCallback(async (role: UserRole) => {
    await mockApi.users.switchRole(role);
    setState((prev) => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, activeRole: role };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { ...prev, user: updated };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
