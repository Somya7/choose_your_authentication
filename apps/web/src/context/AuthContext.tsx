import type { User } from "@cyoa/shared";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearAllAuthState } from "../lib/auth";
import { useAuthMethod } from "./AuthMethodContext";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { authMethod, client } = useAuthMethod();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Re-restore auth whenever the user switches auth method in the UI
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      setLoading(true);
      clearAllAuthState();
      setUser(null);

      try {
        const restored = await client.restore();
        if (!cancelled) setUser(restored);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [authMethod, client]);

  const register = useCallback(
    async (email: string, password: string) => {
      const u = await client.register(email, password);
      setUser(u);
    },
    [client],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const u = await client.login(email, password);
      setUser(u);
    },
    [client],
  );

  const logout = useCallback(async () => {
    await client.logout();
    setUser(null);
  }, [client]);

  const value = useMemo(
    () => ({ user, loading, register, login, logout }),
    [user, loading, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
