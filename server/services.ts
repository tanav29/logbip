import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { entries, feedback, paths, users } from "@/db/schema";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

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
  const id = nanoid();
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
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email))
    throw new Error("Enter a name and valid email address.");
  if (avatar && !/^https?:\/\/\S+$/i.test(avatar))
    throw new Error("Avatar must be a valid http(s) image URL.");
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), ne(users.id, userId)))
    .limit(1);
  if (existing.length) throw new Error("That email address is already in use.");
  await db
    .update(users)
    .set({ name, email, xAccount: xAccount || null, avatar: avatar || null, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function saveFeedbackForUser(userId: string, message: string) {
  const value = message.trim();
  if (value.length < 3) throw new Error("Please enter at least a few words of feedback.");
  if (value.length > 2000) throw new Error("Feedback must be 2,000 characters or fewer.");
  await db.insert(feedback).values({ id: nanoid(), userId, message: value });
}

export async function savePathForUser(
  userId: string,
  input: { id?: string; title: string; description?: string; banner?: string; isPublic: boolean },
) {
  const title = input.title.trim();
  const description = input.description?.trim() ?? "";
  if (title.length < 2) throw new Error("Add a title.");

  if (input.id) {
    const owned = await db
      .select({ id: paths.id, slug: paths.slug })
      .from(paths)
      .where(and(eq(paths.id, input.id), eq(paths.userId, userId)))
      .limit(1);
    if (!owned.length) throw new Error("Path not found.");
    await db
      .update(paths)
      .set({
        title,
        description: description || null,
        banner: input.banner?.trim() || null,
        isPublic: input.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(paths.id, input.id));
    return { id: input.id, slug: owned[0].slug };
  }

  const id = nanoid();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = nanoid(9);
    const existing = await db
      .select({ id: paths.id })
      .from(paths)
      .where(eq(paths.slug, slug))
      .limit(1);
    if (existing.length) continue;
    await db.insert(paths).values({
      id,
      userId,
      title,
      description: description || null,
      banner: input.banner?.trim() || null,
      slug,
      isPublic: input.isPublic,
    });
    return { id, slug };
  }
  throw new Error("Could not create a unique public URL. Please try again.");
}

export async function deletePathForUser(userId: string, pathId: string) {
  const owned = await db
    .select({ id: paths.id })
    .from(paths)
    .where(and(eq(paths.id, pathId), eq(paths.userId, userId)))
    .limit(1);
  if (!owned.length) throw new Error("Path not found.");
  await db.delete(entries).where(eq(entries.pathId, pathId));
  await db.delete(paths).where(eq(paths.id, pathId));
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
    await db
      .update(entries)
      .set({ content, note: note || null })
      .where(eq(entries.id, existing[0].id));
    return existing[0].id;
  }
  const id = nanoid();
  await db.insert(entries).values({ id, pathId, userId, date, content, note: note || null });
  return id;
}

export async function deleteEntryForUser(userId: string, entryId: string) {
  const owned = await db
    .select({ id: entries.id })
    .from(entries)
    .innerJoin(paths, eq(entries.pathId, paths.id))
    .where(and(eq(entries.id, entryId), eq(entries.userId, userId), eq(paths.userId, userId)))
    .limit(1);
  if (!owned.length) throw new Error("Log not found.");
  await db.delete(entries).where(eq(entries.id, entryId));
}

export async function updateEntryForUser(
  userId: string,
  entryId: string,
  input: { date: string; content: string; note?: string },
) {
  const date = input.date.trim();
  const content = input.content.trim();
  const note = input.note?.trim() ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !content) throw new Error("Invalid log entry.");

  const existing = (
    await db
      .select({ entry: entries, path: paths })
      .from(entries)
      .innerJoin(paths, eq(entries.pathId, paths.id))
      .where(and(eq(entries.id, entryId), eq(entries.userId, userId), eq(paths.userId, userId)))
      .limit(1)
  )[0];
  if (!existing) throw new Error("Log not found.");

  const duplicate = await db
    .select({ id: entries.id })
    .from(entries)
    .where(
      and(eq(entries.pathId, existing.path.id), eq(entries.date, date), ne(entries.id, entryId)),
    )
    .limit(1);
  if (duplicate.length) throw new Error("A log already exists for that date.");

  await db
    .update(entries)
    .set({ date, content, note: note || null, updatedAt: new Date() })
    .where(eq(entries.id, entryId));
}

export async function listUserPaths(userId: string) {
  return db.select().from(paths).where(eq(paths.userId, userId)).orderBy(desc(paths.updatedAt));
}

export async function getUserPath(userId: string, id: string) {
  const path = (
    await db
      .select()
      .from(paths)
      .where(and(eq(paths.id, id), eq(paths.userId, userId)))
      .limit(1)
  )[0];
  if (!path) return null;
  const logs = await db
    .select()
    .from(entries)
    .where(eq(entries.pathId, id))
    .orderBy(asc(entries.date));
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
  const logs = await db
    .select()
    .from(entries)
    .where(eq(entries.pathId, record.path.id))
    .orderBy(asc(entries.date));
  return { ...record, entries: logs };
}

export async function getPublicProfile(userId: string) {
  const user = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
  if (!user) return null;
  const publicPaths = await db
    .select()
    .from(paths)
    .where(and(eq(paths.userId, userId), eq(paths.isPublic, true)))
    .orderBy(desc(paths.updatedAt));
  const publicEntries = publicPaths.length
    ? await db
        .select()
        .from(entries)
        .where(
          inArray(
            entries.pathId,
            publicPaths.map((path) => path.id),
          ),
        )
        .orderBy(desc(entries.date))
    : [];
  return { user, paths: publicPaths, entries: publicEntries };
}

export { destroySession, getCurrentUser };
