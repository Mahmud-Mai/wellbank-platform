import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, UserRole } from "./types";
import { api, authApi, patientsApi, doctorsApi, organizationsApi } from "./api-client";
import { mockApi } from "./mock-api";

const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === "true";

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
  addRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "wellbank_auth";
const TOKEN_KEY = "access_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (stored && token) {
      try {
        const user = JSON.parse(stored) as User;
        api.setToken(token);
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
        setState((s) => ({ ...s, isLoading: false }));
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (USE_REAL_API) {
      try {
        const res = await authApi.login(email, password);
        const tokens = res.data as { accessToken: string; refreshToken: string; user: User };
        
        api.setToken(tokens.accessToken);
        localStorage.setItem(TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens.user));
        
        setState({ user: tokens.user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    } else {
      const res = await mockApi.auth.login(email, password);
      const user = res.data.user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
    }
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
      if (USE_REAL_API) {
        try {
          const res = await authApi.completeRegistration(data);
          const userData = res.data as { userId: string; roles: string[]; activeRole: string };
          
          const user: User = {
            id: userData.userId,
            email: "",
            roles: userData.roles as UserRole[],
            activeRole: userData.activeRole as UserRole,
            firstName: data.firstName,
            lastName: data.lastName,
            isVerified: true,
            isKycVerified: false,
            kycLevel: 0,
            mfaEnabled: false,
          };
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          setState({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Registration failed:", error);
          throw error;
        }
      } else {
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
      }
    },
    []
  );

  const logout = useCallback(() => {
    if (USE_REAL_API) {
      authApi.logout().catch(console.error);
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    api.setToken(null);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const switchRole = useCallback(async (role: UserRole) => {
    if (USE_REAL_API) {
      await authApi.switchRole(role);
    } else {
      await mockApi.users.switchRole(role);
    }
    setState((prev) => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, activeRole: role };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { ...prev, user: updated };
    });
  }, []);

  const addRole = useCallback(async (role: UserRole) => {
    if (USE_REAL_API) {
      await authApi.addRole(role);
    } else {
      await mockApi.users.addRole(role);
    }
    setState((prev) => {
      if (!prev.user) return prev;
      const newRoles = prev.user.roles.includes(role)
        ? prev.user.roles
        : [...prev.user.roles, role];
      const updated = { ...prev.user, roles: newRoles };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { ...prev, user: updated };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, switchRole, addRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// Export both APIs for use in components
export { api, authApi, patientsApi, doctorsApi, organizationsApi, mockApi, USE_REAL_API };
