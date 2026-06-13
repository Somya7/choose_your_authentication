import type {
  AuthResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
  SessionInfoResponse,
} from "@cyoa/shared";
import { Router } from "express";
import { hashPassword, verifyPassword } from "../lib/password.js";
import {
  assignUserSession,
  ensureCsrfToken,
  regenerateSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  sessionCookieOptions,
} from "../lib/session.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  getPasswordHash,
} from "../repositories/users.js";

export const authRouter = Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validateEmail(email: unknown): string {
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    throw new AppError(400, "INVALID_EMAIL", "A valid email is required");
  }
  return email.trim().toLowerCase();
}

function validatePassword(password: unknown): string {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(
      400,
      "INVALID_PASSWORD",
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }
  return password;
}

async function startAuthenticatedSession(
  req: Parameters<typeof assignUserSession>[0],
  userId: string,
): Promise<AuthResponse> {
  await regenerateSession(req);
  const csrfToken = assignUserSession(req, userId);
  const user = findUserById(userId)!;
  return { user, csrfToken };
}

authRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body as RegisterRequest;
    const validEmail = validateEmail(email);
    const validPassword = validatePassword(password);

    if (findUserByEmail(validEmail)) {
      throw new AppError(
        409,
        "EMAIL_EXISTS",
        "An account with this email already exists",
      );
    }

    const passwordHash = await hashPassword(validPassword);
    const user = createUser(validEmail, passwordHash);
    const body = await startAuthenticatedSession(req, user.id);

    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as LoginRequest;
    const validEmail = validateEmail(email);

    if (typeof password !== "string" || password.length === 0) {
      throw new AppError(400, "INVALID_PASSWORD", "Password is required");
    }

    const existingUser = findUserByEmail(validEmail);
    const passwordHash = existingUser?.password_hash;
    const valid =
      passwordHash !== undefined &&
      (await verifyPassword(password, passwordHash));

    if (!valid || !existingUser) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password",
      );
    }

    const body = await startAuthenticatedSession(req, existingUser.id);
    res.json(body);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(new AppError(500, "LOGOUT_FAILED", "Could not log out"));
      return;
    }
    res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions());
    res.json({ message: "Logged out" });
  });
});

authRouter.get("/me", (req, res) => {
  const user = req.session.userId
    ? findUserById(req.session.userId) ?? null
    : null;

  const csrfToken = ensureCsrfToken(req);
  const body: MeResponse = { user, csrfToken };
  res.json(body);
});

authRouter.get("/session", (req, res) => {
  const cookie = sessionCookieOptions();
  const authenticated = Boolean(req.session.userId);

  const body: SessionInfoResponse = {
    authenticated,
    session: {
      createdAt: req.session.createdAt ?? null,
      expiresInMs: SESSION_MAX_AGE_MS,
      storage: "sqlite",
    },
    cookie: {
      name: SESSION_COOKIE_NAME,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      maxAgeMs: cookie.maxAge ?? SESSION_MAX_AGE_MS,
    },
    csrf: {
      enabled: true,
      header: "X-CSRF-Token",
      tokenPresent: Boolean(req.session.csrfToken),
    },
  };

  res.json(body);
});
