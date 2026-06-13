import type { User } from "@cyoa/shared";
import { db } from "../db/index.js";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
  };
}

export function findUserByEmail(email: string): UserRow | undefined {
  return db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.trim().toLowerCase()) as UserRow | undefined;
}

export function findUserById(id: string): User | undefined {
  const row = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(id) as UserRow | undefined;
  return row ? toUser(row) : undefined;
}

export function createUser(
  email: string,
  passwordHash: string,
): User {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const normalizedEmail = email.trim().toLowerCase();

  db.prepare(
    "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
  ).run(id, normalizedEmail, passwordHash, createdAt);

  return { id, email: normalizedEmail, createdAt };
}

export function getPasswordHash(email: string): string | undefined {
  const row = findUserByEmail(email);
  return row?.password_hash;
}
