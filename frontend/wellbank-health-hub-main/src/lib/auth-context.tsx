import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { User, UserRole } from "./types";
import { api } from "./api-client";
import { apiService } from "./api-service";

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
    try {
      const res = await apiService.auth.login({ email, password });
      const data = res.data as any;

      // Handle both real (tokens + user) and mock (accessToken + user)
      const accessToken = data.accessToken || data.tokens?.accessToken;
      const user = data.user;

      if (accessToken) {
        api.setToken(accessToken);
        localStorage.setItem(TOKEN_KEY, accessToken);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
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
      try {
        const res = await apiService.auth.completeRegistration(data);
        const userData = res.data as any;

        const user: User = {
          id: userData.userId || userData.id,
          email: userData.email || "",
          roles: (userData.roles || [data.role]) as UserRole[],
          activeRole: (userData.activeRole || data.role) as UserRole,
          firstName: userData.firstName || data.firstName,
          lastName: userData.lastName || data.lastName,
          isVerified: true,
          isKycVerified: userData.isKycVerified || false,
          kycLevel: userData.kycLevel || 0,
          mfaEnabled: userData.mfaEnabled || false,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        console.error("Registration failed:", error);
        throw error;
      }
    },
    [],
  );

  const logout = useCallback(() => {
    apiService.auth.logout().catch(console.error);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    api.setToken(null);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const switchRole = useCallback(async (role: UserRole) => {
    await apiService.users.switchRole({ activeRole: role });
    setState((prev) => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, activeRole: role };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { ...prev, user: updated };
    });
  }, []);

  const addRole = useCallback(async (role: UserRole) => {
    await apiService.users.addRole({ role });
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
    <AuthContext.Provider
      value={{ ...state, login, register, logout, switchRole, addRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// Export APIs for use in components
export { api, apiService };
