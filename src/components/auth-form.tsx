"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

type Action = (form: FormData) => Promise<void>;

export function AuthForm({
  loginAction,
  registerAction,
  initialRegister = false,
}: {
  loginAction: Action;
  registerAction: Action;
  initialRegister?: boolean;
}) {
  const [isRegister, setIsRegister] = useState(initialRegister);
  const [showPassword, setShowPassword] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [error, formAction, pending] = useActionState(async (_: string | null, form: FormData) => {
    try {
      await (form.get("mode") === "register" ? registerAction : loginAction)(form);
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

  function switchMode(registerMode: boolean) {
    setIsRegister(registerMode);
    setGoogleError(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 rounded-xl bg-muted/70 p-1">
        <button
          type="button"
          onClick={() => switchMode(false)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${!isRegister ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchMode(true)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${isRegister ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Create account
        </button>
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-xl bg-background/50"
        onClick={signInWithGoogle}
        disabled={pending || googlePending}
      >
        <span className="mr-2 text-base font-bold">G</span>
        {googlePending ? "Connecting to Google..." : "Continue with Google"}
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or use your email
        <span className="h-px flex-1 bg-border" />
      </div>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="mode" value={isRegister ? "register" : "login"} />
        {isRegister && (
          <Label className="grid gap-2 text-sm font-medium">
            Name
            <Input
              required
              name="name"
              minLength={2}
              placeholder="Ada Lovelace"
              className="h-11 rounded-xl bg-background/50"
            />
          </Label>
        )}
        <Label className="grid gap-2 text-sm font-medium">
          Email
          <Input
            required
            type="email"
            name="email"
            placeholder="you@example.com"
            className="h-11 rounded-xl bg-background/50"
          />
        </Label>
        <Label className="grid gap-2 text-sm font-medium">
          Password
          <span className="relative">
            <Input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              minLength={8}
              placeholder="8+ characters"
              className="h-11 rounded-xl bg-background/50 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </span>
        </Label>
        {(error || googleError) && (
          <Card className="border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error || googleError}
          </Card>
        )}
        <Button
          type="submit"
          className="h-11 w-full rounded-xl"
          disabled={pending || googlePending}
        >
          {pending ? "Please wait..." : isRegister ? "Create my account" : "Continue to LogBip"}
          {!pending && <ArrowRight className="ml-2" />}
        </Button>
      </form>
      <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <LockKeyhole className="size-3.5" />
        Your data stays private until you choose to share it.
      </p>
    </div>
  );
}
