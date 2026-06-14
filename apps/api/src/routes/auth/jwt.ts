import type {
  JwtAuthResponse,
  JwtInfoResponse,
  LoginRequest,
  MeResponse,
  RefreshResponse,
  RegisterRequest,
} from "@cyoa/shared";
import type { Response } from "express";
import { Router } from "express";
import { validateEmail, validatePassword } from "../../lib/credentials.js";
import {
  ACCESS_TOKEN_TTL_MS,
  generateOpaqueRefreshToken,
  getAccessTokenExpiry,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL_MS,
  refreshCookieOptions,
  signAccessToken,
  verifyAccessToken,
} from "../../lib/jwt.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { AppError } from "../../middleware/errorHandler.js";
import {
  findUserIdByRefreshToken,
  purgeExpiredRefreshTokens,
  revokeRefreshToken,
  storeRefreshToken,
} from "../../repositories/refreshTokens.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../../repositories/users.js";

/** Project 3 — JWT authentication routes */
export const jwtAuthRouter = Router();

function issueTokenPair(res: Response, userId: string): JwtAuthResponse {
  purgeExpiredRefreshTokens();

  const user = findUserById(userId)!;
  const accessToken = signAccessToken(userId);

  const plainRefresh = generateOpaqueRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  storeRefreshToken(userId, plainRefresh, expiresAt);

  res.cookie(REFRESH_COOKIE_NAME, plainRefresh, refreshCookieOptions());

  return {
    user,
    accessToken,
    accessTokenExpiresInMs: ACCESS_TOKEN_TTL_MS,
  };
}

jwtAuthRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body as RegisterRequest;
    const validEmail = validateEmail(email);
    const validPassword = validatePassword(password);

    if (findUserByEmail(validEmail)) {
      throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists");
    }

    const passwordHash = await hashPassword(validPassword);
    const user = createUser(validEmail, passwordHash);
    const body = issueTokenPair(res, user.id);
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
});

jwtAuthRouter.post("/login", async (req, res, next) => {
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

    const body = issueTokenPair(res, existingUser.id);
    res.json(body);
  } catch (err) {
    next(err);
  }
});

jwtAuthRouter.post("/refresh", (req, res, next) => {
  try {
    const plainRefresh = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;

    if (!plainRefresh) {
      throw new AppError(401, "NO_REFRESH_TOKEN", "No refresh token — log in again");
    }

    const userId = findUserIdByRefreshToken(plainRefresh);
    if (!userId) {
      res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token invalid — log in again");
    }

    const body: RefreshResponse = {
      accessToken: signAccessToken(userId),
      accessTokenExpiresInMs: ACCESS_TOKEN_TTL_MS,
    };
    res.json(body);
  } catch (err) {
    next(err);
  }
});

jwtAuthRouter.post("/logout", (req, res, next) => {
  try {
    const plainRefresh = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (plainRefresh) revokeRefreshToken(plainRefresh);
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
});

jwtAuthRouter.get("/me", (req, res) => {
  const header = req.headers.authorization;
  let user = null;

  if (header?.startsWith("Bearer ")) {
    const userId = verifyAccessToken(header.slice("Bearer ".length));
    if (userId) user = findUserById(userId) ?? null;
  }

  const body: MeResponse = { user };
  res.json(body);
});

/** Learning endpoint — inspect JWT + refresh cookie state */
jwtAuthRouter.get("/info", (req, res) => {
  const header = req.headers.authorization;
  const accessToken = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : null;
  const userId = accessToken ? verifyAccessToken(accessToken) : null;
  const expiry = accessToken ? getAccessTokenExpiry(accessToken) : null;

  const body: JwtInfoResponse = {
    authMethod: "jwt",
    authenticated: Boolean(userId),
    accessToken: {
      type: "Bearer",
      storage: "client-memory",
      expiresInMs: ACCESS_TOKEN_TTL_MS,
      expiresAt: expiry?.toISOString() ?? null,
      present: Boolean(accessToken && userId),
    },
    refreshToken: {
      storage: "httpOnly-cookie",
      cookieName: REFRESH_COOKIE_NAME,
      present: Boolean(req.cookies?.[REFRESH_COOKIE_NAME]),
    },
  };
  res.json(body);
});
