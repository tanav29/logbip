import { and, asc, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { entries, paths, users } from "@/db/schema";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const formValue = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export async function registerUser(name: string, email: string, password: string) {
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8)
    throw new Error("Enter a name, valid email, and password (8+ characters).");
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  if (existing.length) throw new Error("An account with that email already exists.");
  const id = crypto.randomUUID();
  await db.insert(users).values({
    id,
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
  });
  await createSession(id);
  return { id, name, email: email.toLowerCase() };
}

export async function loginUser(email: string, password: string) {
  const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (!result[0] || !verifyPassword(password, result[0].passwordHash))
    throw new Error("Invalid email or password.");
  await createSession(result[0].id);
  return result[0];
}

export async function updateProfileForUser(
  userId: string,
  input: { name: string; email: string; xAccount?: string; avatar?: string },
) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const xAccount = input.xAccount?.trim().replace(/^@/, "") ?? "";
  const avatar = input.avatar?.trim() ?? "";
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a name and valid email address.");
  if (avatar && !/^https?:\/\/\S+$/i.test(avatar)) throw new Error("Avatar must be a valid http(s) image URL.");
  const existing = await db.select({ id: users.id }).from(users).where(and(eq(users.email, email), ne(users.id, userId))).limit(1);
  if (existing.length) throw new Error("That email address is already in use.");
  await db.update(users).set({ name, email, xAccount: xAccount || null, avatar: avatar || null, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function savePathForUser(
  userId: string,
  input: { id?: string; title: string; description?: string; slug: string; isPublic: boolean },
) {
  const title = input.title.trim();
  const description = input.description?.trim() ?? "";
  const slug = slugify(input.slug || title);
  if (title.length < 2 || slug.length < 2) throw new Error("Add a title and a valid slug.");

  if (input.id) {
    const owned = await db
      .select({ id: paths.id })
      .from(paths)
      .where(and(eq(paths.id, input.id), eq(paths.userId, userId)))
      .limit(1);
    if (!owned.length) throw new Error("Path not found.");
    await db
      .update(paths)
      .set({ title, description: description || null, slug, isPublic: input.isPublic, updatedAt: new Date() })
      .where(eq(paths.id, input.id));
    return input.id;
  }

  const id = crypto.randomUUID();
  await db.insert(paths).values({
    id,
    userId,
    title,
    description: description || null,
    slug,
    isPublic: input.isPublic,
  });
  return id;
}

export async function saveEntryForUser(
  userId: string,
  input: { pathId: string; date: string; content: string; note?: string },
) {
  const pathId = input.pathId.trim();
  const date = input.date.trim();
  const content = input.content.trim();
  const note = input.note?.trim() ?? "";
  const owned = await db
    .select({ id: paths.id })
    .from(paths)
    .where(and(eq(paths.id, pathId), eq(paths.userId, userId)))
    .limit(1);
  if (!owned.length || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !content)
    throw new Error("Invalid log entry.");
  const existing = await db
    .select({ id: entries.id })
    .from(entries)
    .where(and(eq(entries.pathId, pathId), eq(entries.date, date)))
    .limit(1);
  if (existing[0]) {
    await db.update(entries).set({ content, note: note || null }).where(eq(entries.id, existing[0].id));
    return existing[0].id;
  }
  const id = crypto.randomUUID();
  await db.insert(entries).values({ id, pathId, userId, date, content, note: note || null });
  return id;
}

export async function listUserPaths(userId: string) {
  return db.select().from(paths).where(eq(paths.userId, userId)).orderBy(desc(paths.updatedAt));
}

export async function getUserPath(userId: string, id: string) {
  const path = (await db.select().from(paths).where(and(eq(paths.id, id), eq(paths.userId, userId))).limit(1))[0];
  if (!path) return null;
  const logs = await db.select().from(entries).where(eq(entries.pathId, id)).orderBy(asc(entries.date));
  return { path, entries: logs };
}

export async function getPublicPath(slug: string) {
  const record = (
    await db
      .select({ path: paths, user: users })
      .from(paths)
      .innerJoin(users, eq(paths.userId, users.id))
      .where(and(eq(paths.slug, slug), eq(paths.isPublic, true)))
      .limit(1)
  )[0];
  if (!record) return null;
  const logs = await db.select().from(entries).where(eq(entries.pathId, record.path.id)).orderBy(asc(entries.date));
  return { ...record, entries: logs };
}

export { destroySession, getCurrentUser };
