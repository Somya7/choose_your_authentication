import type {
  CreateNoteRequest,
  JwtAuthResponse,
  JwtInfoResponse,
  MeResponse,
  Note,
  NotesResponse,
  RefreshResponse,
} from "@cyoa/shared";
import { ApiError, type AuthClient } from "./types";

const BASE = "/api/auth/jwt";
const NOTES = "/api/jwt/notes";

/** Access token in memory — sent manually via Authorization header (Project 3) */
let accessToken: string | null = null;

export function getJwtAccessToken(): string | null {
  return accessToken;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(data.message ?? "Request failed", data.error);
  }
  return data as T;
}

async function refreshAccessToken(): Promise<void> {
  const response = await fetch(`${BASE}/refresh`, {
    method: "POST",
    credentials: "include",
  });
  const data = await parseResponse<RefreshResponse>(response);
  accessToken = data.accessToken;
}

async function request<T>(
  path: string,
  options?: RequestInit,
  retried = false,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers,
    ...options,
  });

  const data = await response.json();

  if (
    response.status === 401 &&
    data.error === "TOKEN_EXPIRED" &&
    !retried &&
    path !== "/refresh"
  ) {
    await refreshAccessToken();
    return request<T>(path, options, true);
  }

  if (!response.ok) {
    throw new ApiError(data.message ?? "Request failed", data.error);
  }

  return data as T;
}

async function notesRequest<T>(
  path: string,
  options?: RequestInit,
  retried = false,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${NOTES}${path}`, {
    credentials: "include",
    headers,
    ...options,
  });

  const data = await response.json();

  if (response.status === 401 && data.error === "TOKEN_EXPIRED" && !retried) {
    await refreshAccessToken();
    return notesRequest<T>(path, options, true);
  }

  if (!response.ok) {
    throw new ApiError(data.message ?? "Request failed", data.error);
  }

  return data as T;
}

export const jwtAuthClient: AuthClient = {
  methodId: "jwt",

  async restore() {
    try {
      await refreshAccessToken();
      return await jwtAuthClient.me();
    } catch {
      accessToken = null;
      return null;
    }
  },

  async register(email, password) {
    const data = await request<JwtAuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    accessToken = data.accessToken;
    return data.user;
  },

  async login(email, password) {
    const data = await request<JwtAuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    accessToken = data.accessToken;
    return data.user;
  },

  async logout() {
    await request("/logout", { method: "POST" });
    accessToken = null;
  },

  async me() {
    const data = await request<MeResponse>("/me");
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
    return request<JwtInfoResponse>("/info");
  },
};

export function clearJwtAuthState(): void {
  accessToken = null;
}
