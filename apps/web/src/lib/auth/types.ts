import type {
  AuthMethodId,
  CreateNoteRequest,
  JwtInfoResponse,
  Note,
  SessionInfoResponse,
  User,
} from "@cyoa/shared";

/** Common interface every auth method client must implement */
export interface AuthClient {
  readonly methodId: AuthMethodId;

  /** Try to restore logged-in state (session cookie or refresh token) */
  restore(): Promise<User | null>;

  register(email: string, password: string): Promise<User>;
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  me(): Promise<User | null>;

  getNotes(): Promise<Note[]>;
  createNote(body: CreateNoteRequest): Promise<Note>;

  /** Fetch method-specific info for the Explore page */
  getInfo(): Promise<SessionInfoResponse | JwtInfoResponse>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
