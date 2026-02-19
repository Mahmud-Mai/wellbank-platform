import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "./types";
import { mockApi } from "./mock-api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "wellbank_auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
      email: string;
      password: string;
      role: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
    }) => {
      await mockApi.auth.register(data);
      // After registration, log them in
      const user: User = {
        id: "u-new-001",
        email: data.email,
        role: data.role as User["role"],
        firstName: data.firstName,
        lastName: data.lastName,
        isKycVerified: false,
        kycLevel: 0,
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

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
