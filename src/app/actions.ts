"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  destroySession,
  deleteEntryForUser,
  deletePathForUser,
  formValue,
  getCurrentUser,
  loginUser,
  registerUser,
  saveFeedbackForUser,
  saveEntryForUser,
  savePathForUser,
  updateProfileForUser,
} from "@/../server/services";

export async function register(form: FormData) {
  await registerUser(
    formValue(form, "name"),
    formValue(form, "email"),
    formValue(form, "password"),
  );
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
  const result = await savePathForUser(user.id, {
    id: formValue(form, "id") || undefined,
    title: formValue(form, "title"),
    description: formValue(form, "description"),
    banner: formValue(form, "banner"),
    isPublic: form.get("isPublic") === "on",
  });
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/paths/${result.id}`);
  revalidatePath(`/${result.slug}`);
  redirect(`/dashboard/paths/${result.id}`);
}

export async function deletePath(form: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const id = formValue(form, "id");
  await deletePathForUser(user.id, id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
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

export async function deleteEntry(form: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const pathId = formValue(form, "pathId");
  await deleteEntryForUser(user.id, formValue(form, "id"));
  revalidatePath(`/dashboard/paths/${pathId}`);
  revalidatePath("/dashboard");
}

export async function updateProfile(form: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await updateProfileForUser(user.id, {
    name: formValue(form, "name"),
    email: formValue(form, "email"),
    xAccount: formValue(form, "xAccount"),
    avatar: formValue(form, "avatar"),
  });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  redirect("/settings?saved=1");
}

export async function submitFeedback(form: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await saveFeedbackForUser(user.id, formValue(form, "message"));
  redirect("/settings?feedback=1");
}
