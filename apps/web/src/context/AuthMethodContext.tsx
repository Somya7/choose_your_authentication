import type { AuthMethodId, AuthMethodMeta } from "@cyoa/shared";
import { AUTH_METHOD_CATALOG } from "@cyoa/shared";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getAuthClient,
  loadSavedAuthMethod,
  saveAuthMethod,
} from "../lib/auth";

interface AuthMethodContextValue {
  authMethod: AuthMethodId;
  setAuthMethod: (method: AuthMethodId) => void;
  methods: AuthMethodMeta[];
  client: ReturnType<typeof getAuthClient>;
}

const AuthMethodContext = createContext<AuthMethodContextValue | null>(null);

export function AuthMethodProvider({ children }: { children: ReactNode }) {
  const [authMethod, setAuthMethodState] = useState<AuthMethodId>(
    loadSavedAuthMethod,
  );

  const setAuthMethod = useCallback((method: AuthMethodId) => {
    setAuthMethodState(method);
    saveAuthMethod(method);
  }, []);

  const client = useMemo(() => getAuthClient(authMethod), [authMethod]);

  const value = useMemo(
    () => ({
      authMethod,
      setAuthMethod,
      methods: AUTH_METHOD_CATALOG,
      client,
    }),
    [authMethod, setAuthMethod, client],
  );

  return (
    <AuthMethodContext.Provider value={value}>
      {children}
    </AuthMethodContext.Provider>
  );
}

export function useAuthMethod(): AuthMethodContextValue {
  const ctx = useContext(AuthMethodContext);
  if (!ctx) {
    throw new Error("useAuthMethod must be used within AuthMethodProvider");
  }
  return ctx;
}
