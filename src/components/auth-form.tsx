"use client";

import { useActionState, useState } from "react";
import { authClient } from "@/lib/auth-client";
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
  const [googlePending, setGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [error, formAction, pending] = useActionState(async (_: string | null, form: FormData) => {
    try {
      await action(form);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Something went wrong.";
    }
  }, null);

  async function signInWithGoogle() {
    setGooglePending(true);
    setGoogleError(null);
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (result.error) {
      setGoogleError(result.error.message ?? "Unable to continue with Google.");
      setGooglePending(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="h-10 w-full"
        onClick={signInWithGoogle}
        disabled={pending || googlePending}
      >
        <span className="mr-2 text-base font-bold">G</span>
        {googlePending ? "Connecting to Google…" : "Continue with Google"}
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or continue with email
        <span className="h-px flex-1 bg-border" />
      </div>
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
        {(error || googleError) && (
          <Card className="border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error || googleError}
          </Card>
        )}
        <Button type="submit" className="h-10 w-full" disabled={pending || googlePending}>
          {pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
