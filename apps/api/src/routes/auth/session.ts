import type {
  LoginRequest,
  MeResponse,
  RegisterRequest,
  SessionAuthResponse,
  SessionInfoResponse,
} from "@cyoa/shared";
import { Router } from "express";
import { validateEmail, validatePassword } from "../../lib/credentials.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import {
  ensureCsrfToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  sessionCookieOptions,
  startSessionAuth,
} from "../../lib/session.js";
import { validateSessionCsrf } from "../../middleware/sessionCsrf.js";
import { AppError } from "../../middleware/errorHandler.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../../repositories/users.js";

/** Project 2 — Session cookie authentication routes */
export const sessionAuthRouter = Router();

sessionAuthRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body as RegisterRequest;
    const validEmail = validateEmail(email);
    const validPassword = validatePassword(password);

    if (findUserByEmail(validEmail)) {
      throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists");
    }

    const passwordHash = await hashPassword(validPassword);
    const user = createUser(validEmail, passwordHash);
    const csrfToken = await startSessionAuth(req, user.id);

    const body: SessionAuthResponse = { user, csrfToken };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
});

sessionAuthRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as LoginRequest;
    const validEmail = validateEmail(email);

    if (typeof password !== "string" || password.length === 0) {
      throw new AppError(400, "INVALID_PASSWORD", "Password is required");
    }

    const existingUser = findUserByEmail(validEmail);
    const valid =
      existingUser?.password_hash !== undefined &&
      (await verifyPassword(password, existingUser.password_hash));

    if (!valid || !existingUser) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const csrfToken = await startSessionAuth(req, existingUser.id);
    const body: SessionAuthResponse = {
      user: findUserById(existingUser.id)!,
      csrfToken,
    };
    res.json(body);
  } catch (err) {
    next(err);
  }
});

// CSRF required for mutating routes below (logout, notes)
sessionAuthRouter.use(validateSessionCsrf);

sessionAuthRouter.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(new AppError(500, "LOGOUT_FAILED", "Could not log out"));
      return;
    }
    res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions());
    res.json({ message: "Logged out" });
  });
});

sessionAuthRouter.get("/me", (req, res) => {
  const user = req.session.userId
    ? findUserById(req.session.userId) ?? null
    : null;
  const csrfToken = ensureCsrfToken(req);
  const body: MeResponse & { csrfToken?: string } = { user, csrfToken };
  res.json(body);
});

/** Learning endpoint — inspect session + cookie + CSRF state */
sessionAuthRouter.get("/info", (req, res) => {
  const cookie = sessionCookieOptions();
  const body: SessionInfoResponse = {
    authMethod: "session",
    authenticated: Boolean(req.session.userId),
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
