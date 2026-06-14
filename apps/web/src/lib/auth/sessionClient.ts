import type {
  CreateNoteRequest,
  MeResponse,
  Note,
  NotesResponse,
  SessionAuthResponse,
  SessionInfoResponse,
} from "@cyoa/shared";
import { ApiError, type AuthClient } from "./types";

const BASE = "/api/auth/session";
const NOTES = "/api/session/notes";

/** CSRF token stored in memory — paired with session cookie auth (Project 2) */
let csrfToken: string | null = null;

export function getSessionCsrfToken(): string | null {
  return csrfToken;
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const method = (options?.method ?? "GET").toUpperCase();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  // CSRF header required for mutating session requests (except login/register)
  if (csrfToken && method !== "GET" && method !== "HEAD") {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${BASE}${path}`, {
    credentials: "include", // sends connect.sid session cookie automatically
    headers,
    ...options,
  });

  return parseResponse<T>(response);
}

async function notesRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const method = (options?.method ?? "GET").toUpperCase();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (csrfToken && method !== "GET" && method !== "HEAD") {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${NOTES}${path}`, {
    credentials: "include",
    headers,
    ...options,
  });

  return parseResponse<T>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(data.message ?? "Request failed", data.error);
  }
  return data as T;
}

export const sessionAuthClient: AuthClient = {
  methodId: "session",

  async restore() {
    try {
      const me = await request<MeResponse & { csrfToken?: string }>("/me");
      csrfToken = me.csrfToken ?? null;
      return me.user;
    } catch {
      csrfToken = null;
      return null;
    }
  },

  async register(email, password) {
    const data = await request<SessionAuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    csrfToken = data.csrfToken;
    return data.user;
  },

  async login(email, password) {
    const data = await request<SessionAuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    csrfToken = data.csrfToken;
    return data.user;
  },

  async logout() {
    await request("/logout", { method: "POST" });
    csrfToken = null;
  },

  async me() {
    const data = await request<MeResponse & { csrfToken?: string }>("/me");
    csrfToken = data.csrfToken ?? null;
    return data.user;
  },

  async getNotes() {
    const data = await notesRequest<NotesResponse>("/");
    return data.notes;
  },

  async createNote(body: CreateNoteRequest) {
    const data = await notesRequest<{ note: Note }>("/", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return data.note;
  },

  async getInfo() {
    return request<SessionInfoResponse>("/info");
  },
};

export function clearSessionAuthState(): void {
  csrfToken = null;
}
