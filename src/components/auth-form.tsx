"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";

type Action = (form: FormData) => Promise<void>;
export function AuthForm({
  action,
  register: isRegister = false,
}: {
  action: Action;
  register?: boolean;
}) {
  const [error, formAction, pending] = useActionState(async (_: string | null, form: FormData) => {
    try {
      await action(form);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Something went wrong.";
    }
  }, null);
  return (
    <form action={formAction} className="space-y-4">
      {isRegister && (
        <label className="block text-sm font-medium">
          Name
          <input
            required
            name="name"
            minLength={2}
            className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
            placeholder="Ada Lovelace"
          />
        </label>
      )}
      <label className="block text-sm font-medium">
        Email
        <input
          required
          type="email"
          name="email"
          className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
          placeholder="you@example.com"
        />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input
          required
          type="password"
          name="password"
          minLength={8}
          className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
          placeholder="8+ characters"
        />
      </label>
      {error && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}
      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}
