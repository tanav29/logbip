import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

const COOKIE = "logbip_session";
const DAYS = 30;

function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(key, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function createSession(userId: string) {
  const raw = randomBytes(32).toString("hex");
  await db.insert(sessions).values({ id: digest(raw), userId, expiresAt: new Date(Date.now() + DAYS * 86400000) });
  (await cookies()).set(COOKIE, raw, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: DAYS * 86400 });
}

export async function getCurrentUser() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const result = await db.select({ user: users }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(eq(sessions.id, digest(raw)), gt(sessions.expiresAt, new Date()))).limit(1);
  return result[0]?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function destroySession() {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (raw) await db.delete(sessions).where(eq(sessions.id, digest(raw)));
  store.delete(COOKIE);
}
