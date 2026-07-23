"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  destroySession,
  formValue,
  getCurrentUser,
  loginUser,
  registerUser,
  saveEntryForUser,
  savePathForUser,
} from "@/../server/services";

export async function register(form: FormData) {
  await registerUser(formValue(form, "name"), formValue(form, "email"), formValue(form, "password"));
  redirect("/dashboard");
}

export async function login(form: FormData) {
  await loginUser(formValue(form, "email"), formValue(form, "password"));
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function savePath(form: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const id = await savePathForUser(user.id, {
    id: formValue(form, "id") || undefined,
    title: formValue(form, "title"),
    description: formValue(form, "description"),
    slug: formValue(form, "slug"),
    isPublic: form.get("isPublic") === "on",
  });
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/paths/${id}`);
  revalidatePath(`/${formValue(form, "slug")}`);
  redirect(`/dashboard/paths/${id}`);
}

export async function saveEntry(form: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const pathId = formValue(form, "pathId");
  await saveEntryForUser(user.id, {
    pathId,
    date: formValue(form, "date"),
    content: formValue(form, "content"),
    note: formValue(form, "note"),
  });
  revalidatePath(`/dashboard/paths/${pathId}`);
  revalidatePath("/dashboard");
}
