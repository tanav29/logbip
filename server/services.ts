import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const formValue = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function registerUser(name: string, email: string, password: string) {
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    throw new Error("Enter a name, valid email, and password (8+ characters).");
  }
  const result = await auth.api.signUpEmail({
    body: { name, email: email.toLowerCase(), password },
    headers: await headers(),
  });
  if (!result?.user) throw new Error("Unable to create your account.");
  return result.user;
}

export async function loginUser(email: string, password: string) {
  const result = await auth.api.signInEmail({
    body: { email: email.toLowerCase(), password },
    headers: await headers(),
  });
  if (!result?.user) throw new Error("Invalid email or password.");
  return result.user;
}

export async function destroySession() {
  await auth.api.signOut({ headers: await headers() });
}

export async function updateProfileForUser(
  userId: string,
  input: { name: string; email: string; xAccount?: string; avatar?: string },
) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const xAccount = input.xAccount?.trim().replace(/^@/, "") || null;
  const avatar = input.avatar?.trim() || null;
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a name and valid email address.");
  if (avatar && !/^https?:\/\/\S+$/i.test(avatar)) throw new Error("Avatar must be a valid http(s) image URL.");
  const existing = await prisma.user.findFirst({ where: { email, NOT: { id: userId } }, select: { id: true } });
  if (existing) throw new Error("That email address is already in use.");
  await prisma.user.update({ where: { id: userId }, data: { name, email, xAccount, avatar } });
}

export async function saveFeedbackForUser(userId: string, message: string) {
  const value = message.trim();
  if (value.length < 3) throw new Error("Please enter at least a few words of feedback.");
  if (value.length > 2000) throw new Error("Feedback must be 2,000 characters or fewer.");
  await prisma.feedback.create({ data: { id: nanoid(), userId, message: value } });
}

export async function savePathForUser(userId: string, input: { id?: string; title: string; description?: string; banner?: string; isPublic: boolean }) {
  const title = input.title.trim();
  if (title.length < 2 || title.length > 120) throw new Error("Title must be between 2 and 120 characters.");
  const data = { title, description: input.description?.trim() || null, banner: input.banner?.trim() || null, isPublic: input.isPublic };
  if (input.id) {
    const path = await prisma.path.findFirst({ where: { id: input.id, userId } });
    if (!path) throw new Error("Path not found.");
    await prisma.path.update({ where: { id: path.id }, data });
    return { id: path.id, slug: path.slug };
  }
  const path = await prisma.path.create({ data: { id: nanoid(), userId, slug: nanoid(9), ...data } });
  return { id: path.id, slug: path.slug };
}

export async function deletePathForUser(userId: string, pathId: string) {
  const path = await prisma.path.findFirst({ where: { id: pathId, userId }, select: { id: true } });
  if (!path) throw new Error("Path not found.");
  await prisma.$transaction([prisma.entry.deleteMany({ where: { pathId } }), prisma.path.delete({ where: { id: pathId } })]);
}

export async function saveEntryForUser(userId: string, input: { pathId: string; date: string; content: string; note?: string }) {
  const date = input.date.trim();
  const content = input.content.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !content || content.length > 5000) throw new Error("Invalid log entry.");
  const path = await prisma.path.findFirst({ where: { id: input.pathId.trim(), userId }, select: { id: true } });
  if (!path) throw new Error("Path not found.");
  const entry = await prisma.entry.upsert({
    where: { pathId_date: { pathId: path.id, date } },
    create: { id: nanoid(), pathId: path.id, userId, date, content, note: input.note?.trim() || null },
    update: { content, note: input.note?.trim() || null },
  });
  return entry.id;
}

export async function updateEntryForUser(userId: string, entryId: string, input: { date: string; content: string; note?: string }) {
  const date = input.date.trim();
  const content = input.content.trim();
  const existing = await prisma.entry.findFirst({ where: { id: entryId, userId, path: { userId } } });
  if (!existing || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !content) throw new Error("Invalid log entry.");
  const duplicate = await prisma.entry.findFirst({ where: { pathId: existing.pathId, date, NOT: { id: entryId } } });
  if (duplicate) throw new Error("A log already exists for that date.");
  await prisma.entry.update({ where: { id: entryId }, data: { date, content, note: input.note?.trim() || null } });
}

export async function deleteEntryForUser(userId: string, entryId: string) {
  const entry = await prisma.entry.findFirst({ where: { id: entryId, userId, path: { userId } }, select: { id: true } });
  if (!entry) throw new Error("Log not found.");
  await prisma.entry.delete({ where: { id: entryId } });
}

export const listUserPaths = (userId: string) => prisma.path.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
export const getUserPath = (userId: string, id: string) => prisma.path.findFirst({ where: { id, userId }, include: { entries: { orderBy: { date: "asc" } } } });
export const getPublicPath = (slug: string) => prisma.path.findFirst({ where: { slug, isPublic: true }, include: { user: true, entries: { orderBy: { date: "asc" } } } });

export async function getPublicProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const paths = await prisma.path.findMany({ where: { userId, isPublic: true }, orderBy: { updatedAt: "desc" } });
  const entries = await prisma.entry.findMany({ where: { pathId: { in: paths.map((path) => path.id) } }, orderBy: { date: "desc" } });
  return { user, paths, entries };
}
