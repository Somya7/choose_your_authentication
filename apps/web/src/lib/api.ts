import type {
  AuthResponse,
  CreateNoteRequest,
  CreateNoteResponse,
  LoginRequest,
  MeResponse,
  NotesResponse,
  RegisterRequest,
  SessionInfoResponse,
} from "@cyoa/shared";

const API_BASE = "/api";

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

let csrfToken: string | null = null;

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const method = (options?.method ?? "GET").toUpperCase();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (csrfToken && method !== "GET" && method !== "HEAD") {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string> | undefined),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message ?? "Request failed");
  }

  return data as T;
}

export const api = {
  health: () => request<{ status: string; timestamp: string }>("/health"),

  me: () => request<MeResponse>("/auth/me"),

  session: () => request<SessionInfoResponse>("/auth/session"),

  register: (body: RegisterRequest) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: LoginRequest) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: () =>
    request<{ message: string }>("/auth/logout", { method: "POST" }),

  notes: () => request<NotesResponse>("/notes"),

  createNote: (body: CreateNoteRequest) =>
    request<CreateNoteResponse>("/notes", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export type { AuthResponse, CreateNoteResponse, NotesResponse };
