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
import { api, setCsrfToken } from "../lib/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then((data) => {
        setUser(data.user);
        setCsrfToken(data.csrfToken ?? null);
      })
      .catch(() => {
        setUser(null);
        setCsrfToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const data = await api.register({ email, password });
    setUser(data.user);
    setCsrfToken(data.csrfToken);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login({ email, password });
    setUser(data.user);
    setCsrfToken(data.csrfToken);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setCsrfToken(null);
  }, []);

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
