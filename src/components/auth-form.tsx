"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

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
        <Label className="grid gap-2">
          Name
          <Input required name="name" minLength={2} placeholder="Ada Lovelace" />
        </Label>
      )}
      <Label className="grid gap-2">
        Email
        <Input required type="email" name="email" placeholder="you@example.com" />
      </Label>
      <Label className="grid gap-2">
        Password
        <Input required type="password" name="password" minLength={8} placeholder="8+ characters" />
      </Label>
      {error && (
        <Card className="border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </Card>
      )}
      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}
