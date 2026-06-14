/**
 * Extends Express Request with userId set by requireAuth after JWT verification.
 * Replaces req.session.userId from Project 2 — identity now comes from the token.
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};
