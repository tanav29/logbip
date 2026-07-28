"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

const formValue = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

async function currentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function register(form: FormData) {
  const name = formValue(form, "name");
  const email = formValue(form, "email").toLowerCase();
  const password = formValue(form, "password");
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8)
    throw new Error("Enter a name, valid email, and password (8+ characters).");
  const result = await auth.api.signUpEmail({ body: { name, email, password }, headers: await headers() });
  if (!result?.user) throw new Error("Unable to create your account.");
  redirect(`/u/${result.user.id}`);
}

export async function login(form: FormData) {
  const result = await auth.api.signInEmail({
    body: { email: formValue(form, "email").toLowerCase(), password: formValue(form, "password") },
    headers: await headers(),
  });
  if (!result?.user) throw new Error("Invalid email or password.");
  redirect(`/u/${result.user.id}`);
}

export async function logout() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

export async function savePath(form: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  const id = formValue(form, "id");
  const title = formValue(form, "title");
  if (title.length < 2 || title.length > 120) throw new Error("Title must be between 2 and 120 characters.");
  const data = { title, description: formValue(form, "description") || null, banner: formValue(form, "banner") || null };
  const existing = id ? await prisma.path.findFirst({ where: { id, userId: user.id }, select: { id: true, slug: true } }) : null;
  if (id && !existing) throw new Error("Path not found.");
  const result = existing
    ? await prisma.path.update({ where: { id: existing.id }, data, select: { id: true, slug: true } })
    : await prisma.path.create({ data: { id: nanoid(), userId: user.id, slug: nanoid(9), ...data }, select: { id: true, slug: true } });
  revalidatePath(`/u/${user.id}`);
  revalidatePath(`/p/${result.slug}`);
  redirect(`/p/${result.slug}`);
}

export async function deletePath(form: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  const id = formValue(form, "id");
  const path = await prisma.path.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!path) throw new Error("Path not found.");
  await prisma.$transaction([
    prisma.entry.deleteMany({ where: { pathId: id } }),
    prisma.path.delete({ where: { id } }),
  ]);
  revalidatePath(`/u/${user.id}`);
  redirect(`/u/${user.id}`);
}

export async function saveEntry(form: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  const pathId = formValue(form, "pathId");
  const date = formValue(form, "date");
  const content = formValue(form, "content");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !content || content.length > 5000)
    throw new Error("Invalid log entry.");
  const path = await prisma.path.findFirst({ where: { id: pathId, userId: user.id }, select: { id: true, slug: true } });
  if (!path) throw new Error("Path not found.");
  await prisma.entry.upsert({
    where: { pathId_date: { pathId, date } },
    create: { id: nanoid(), pathId, userId: user.id, date, content, note: formValue(form, "note") || null },
    update: { content, note: formValue(form, "note") || null },
  });
  revalidatePath(`/p/${path.slug}`);
  revalidatePath(`/u/${user.id}`);
}

export async function deleteEntry(form: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  const pathId = formValue(form, "pathId");
  const entry = await prisma.entry.findFirst({ where: { id: formValue(form, "id"), userId: user.id, path: { userId: user.id } }, include: { path: { select: { slug: true } } } });
  if (!entry) throw new Error("Log not found.");
  await prisma.entry.delete({ where: { id: entry.id } });
  const path = await prisma.path.findFirst({ where: { id: pathId, userId: user.id }, select: { slug: true } });
  if (path) revalidatePath(`/p/${path.slug}`);
  revalidatePath(`/u/${user.id}`);
}

export async function updateProfile(form: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  const name = formValue(form, "name");
  const email = formValue(form, "email").toLowerCase();
  const avatar = formValue(form, "avatar") || null;
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a name and valid email address.");
  if (avatar && !/^https?:\/\/\S+$/i.test(avatar)) throw new Error("Avatar must be a valid http(s) image URL.");
  const existing = await prisma.user.findFirst({ where: { email, NOT: { id: user.id } }, select: { id: true } });
  if (existing) throw new Error("That email address is already in use.");
  await prisma.user.update({ where: { id: user.id }, data: { name, email, xAccount: formValue(form, "xAccount").replace(/^@/, "") || null, avatar } });
  revalidatePath("/settings");
  revalidatePath(`/u/${user.id}`);
  redirect("/settings?saved=1");
}

export async function submitFeedback(form: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  const message = formValue(form, "message");
  if (message.length < 3 || message.length > 2000) throw new Error("Feedback must be between 3 and 2,000 characters.");
  await prisma.feedback.create({ data: { id: nanoid(), userId: user.id, message } });
  redirect("/settings?feedback=1");
}
