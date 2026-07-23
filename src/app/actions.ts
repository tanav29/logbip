"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { entries, paths, users } from "@/db/schema";
import { createSession, destroySession, hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const value = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export async function register(form: FormData) {
  const name = value(form, "name"), email = value(form, "email").toLowerCase(), password = value(form, "password");
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) throw new Error("Enter a name, valid email, and password (8+ characters).");
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) throw new Error("An account with that email already exists.");
  const id = crypto.randomUUID();
  await db.insert(users).values({ id, name, email, passwordHash: hashPassword(password) });
  await createSession(id);
  redirect("/dashboard");
}

export async function login(form: FormData) {
  const email = value(form, "email").toLowerCase(), password = value(form, "password");
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!result[0] || !verifyPassword(password, result[0].passwordHash)) throw new Error("Invalid email or password.");
  await createSession(result[0].id);
  redirect("/dashboard");
}

export async function logout() { await destroySession(); redirect("/"); }

export async function savePath(form: FormData) {
  const user = await requireUser();
  const title = value(form, "title"), description = value(form, "description"), slug = slugify(value(form, "slug") || title), id = value(form, "id");
  if (title.length < 2 || slug.length < 2) throw new Error("Add a title and a valid slug.");
  if (id) {
    const owned = await db.select({ id: paths.id }).from(paths).where(and(eq(paths.id, id), eq(paths.userId, user.id))).limit(1);
    if (!owned.length) throw new Error("Path not found.");
    await db.update(paths).set({ title, description: description || null, slug, isPublic: form.get("isPublic") === "on", updatedAt: new Date() }).where(eq(paths.id, id));
    revalidatePath(`/dashboard/paths/${id}`); revalidatePath(`/${slug}`); redirect(`/dashboard/paths/${id}`);
  }
  const newId = crypto.randomUUID();
  await db.insert(paths).values({ id: newId, userId: user.id, title, description: description || null, slug, isPublic: form.get("isPublic") === "on" });
  revalidatePath("/dashboard"); redirect(`/dashboard/paths/${newId}`);
}

export async function saveEntry(form: FormData) {
  const user = await requireUser();
  const pathId = value(form, "pathId"), date = value(form, "date"), content = value(form, "content"), note = value(form, "note");
  const owned = await db.select({ id: paths.id }).from(paths).where(and(eq(paths.id, pathId), eq(paths.userId, user.id))).limit(1);
  if (!owned.length || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !content) throw new Error("Invalid log entry.");
  const existing = await db.select({ id: entries.id }).from(entries).where(and(eq(entries.pathId, pathId), eq(entries.date, date))).limit(1);
  if (existing[0]) await db.update(entries).set({ content, note: note || null }).where(eq(entries.id, existing[0].id));
  else await db.insert(entries).values({ id: crypto.randomUUID(), pathId, userId: user.id, date, content, note: note || null });
  revalidatePath(`/dashboard/paths/${pathId}`); revalidatePath("/dashboard");
}
