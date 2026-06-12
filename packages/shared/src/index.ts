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
}
