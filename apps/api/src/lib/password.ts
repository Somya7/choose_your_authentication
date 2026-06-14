import bcrypt from "bcrypt";

/**
 * Project 1 — Password hashing
 * bcrypt automatically generates a unique salt per hash.
 * SALT_ROUNDS controls how slow hashing is (higher = more secure, slower).
 */
const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
