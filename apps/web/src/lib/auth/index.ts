import type { AuthMethodId } from "@cyoa/shared";
import { isAuthMethodAvailable } from "@cyoa/shared";
import { clearJwtAuthState, jwtAuthClient } from "./jwtClient";
import {
  clearSessionAuthState,
  sessionAuthClient,
} from "./sessionClient";
import type { AuthClient } from "./types";

const STORAGE_KEY = "cyoa-auth-method";

export function getAuthClient(method: AuthMethodId): AuthClient {
  switch (method) {
    case "session":
      return sessionAuthClient;
    case "jwt":
      return jwtAuthClient;
    default:
      throw new Error(`Auth method "${method}" is not implemented yet`);
  }
}

export function loadSavedAuthMethod(): AuthMethodId {
  const saved = localStorage.getItem(STORAGE_KEY) as AuthMethodId | null;
  if (saved && isAuthMethodAvailable(saved)) return saved;
  return "session";
}

export function saveAuthMethod(method: AuthMethodId): void {
  localStorage.setItem(STORAGE_KEY, method);
}

/** Clear in-memory tokens for all methods when switching */
export function clearAllAuthState(): void {
  clearSessionAuthState();
  clearJwtAuthState();
}
