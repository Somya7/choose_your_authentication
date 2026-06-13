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

export interface ApiResponse<T> {
  data: T;
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
  csrfToken?: string;
}

export interface SessionCookieInfo {
  name: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: string;
  maxAgeMs: number;
}

export interface SessionInfoResponse {
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

export interface AuthResponse {
  user: User;
  csrfToken: string;
}

export interface CreateNoteResponse {
  note: Note;
}
