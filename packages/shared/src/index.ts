export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  error: string;
  message: string;
}

export interface HealthResponse {
  status: "ok";
  timestamp: string;
}

export interface MeResponse {
  user: User | null;
}

export interface NotesResponse {
  notes: Note[];
}

export interface CreateNoteRequest {
  title: string;
  body: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateNoteResponse {
  note: Note;
}

/** Auth methods available in the playground UI */
export type AuthMethodId = "session" | "jwt" | "oauth" | "magic-link" | "webauthn";

export interface AuthMethodMeta {
  id: AuthMethodId;
  name: string;
  description: string;
  project: number | null;
  status: "available" | "coming-soon";
  apiPrefix: string | null;
}

export interface AuthMethodsResponse {
  methods: AuthMethodMeta[];
  activeMethods: AuthMethodId[];
}

/** Project 2 — session cookie auth response */
export interface SessionAuthResponse {
  user: User;
  csrfToken: string;
}

export interface SessionCookieInfo {
  name: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: string;
  maxAgeMs: number;
}

export interface SessionInfoResponse {
  authMethod: "session";
  authenticated: boolean;
  session: {
    createdAt: string | null;
    expiresInMs: number;
    storage: "sqlite";
  };
  cookie: SessionCookieInfo;
  csrf: {
    enabled: boolean;
    header: string;
    tokenPresent: boolean;
  };
}

/** Project 3 — JWT auth response */
export interface JwtAuthResponse {
  user: User;
  accessToken: string;
  accessTokenExpiresInMs: number;
}

export interface RefreshResponse {
  accessToken: string;
  accessTokenExpiresInMs: number;
}

export interface JwtInfoResponse {
  authMethod: "jwt";
  authenticated: boolean;
  accessToken: {
    type: "Bearer";
    storage: "client-memory";
    expiresInMs: number;
    expiresAt: string | null;
    present: boolean;
  };
  refreshToken: {
    storage: "httpOnly-cookie";
    cookieName: string;
    present: boolean;
  };
}

/** Catalog of all auth methods — used by API and UI */
export const AUTH_METHOD_CATALOG: AuthMethodMeta[] = [
  {
    id: "session",
    name: "Session Cookies",
    description:
      "Server-side session stored in SQLite. Browser holds session ID in HttpOnly cookie.",
    project: 2,
    status: "available",
    apiPrefix: "/api/auth/session",
  },
  {
    id: "jwt",
    name: "JWT Access + Refresh",
    description:
      "Short-lived access token in memory + long-lived refresh token in HttpOnly cookie.",
    project: 3,
    status: "available",
    apiPrefix: "/api/auth/jwt",
  },
  {
    id: "oauth",
    name: "OAuth 2.0 / OIDC",
    description: "Sign in with Google, GitHub, etc.",
    project: 4,
    status: "coming-soon",
    apiPrefix: null,
  },
  {
    id: "magic-link",
    name: "Magic Link / OTP",
    description: "Passwordless login via email.",
    project: 5,
    status: "coming-soon",
    apiPrefix: null,
  },
  {
    id: "webauthn",
    name: "WebAuthn / Passkeys",
    description: "Phishing-resistant public-key authentication.",
    project: 6,
    status: "coming-soon",
    apiPrefix: null,
  },
];

export function getAvailableAuthMethods(): AuthMethodMeta[] {
  return AUTH_METHOD_CATALOG.filter((m) => m.status === "available");
}

export function isAuthMethodAvailable(id: AuthMethodId): boolean {
  return AUTH_METHOD_CATALOG.some((m) => m.id === id && m.status === "available");
}
