"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Loader } from "lucide-react";

export function SiteHeader() {
  // const session = await auth.api.getSession({ headers: await headers() });
  const {
        data: session,
        isPending
    } = authClient.useSession()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-14 w-full max-w-6xl items-center justify-between gap-4 px-5">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <span className="flex size-6 items-center justify-center rounded-[5px] bg-foreground text-xs text-background">
            L
          </span>
          LogBip
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {isPending && <Loader className="animate-spin w-4 h-4" />}
          {session ? (
            <>
              <Link className="hidden sm:inline-flex hover:text-muted-foreground" href="/dashboard">
                Dashboard
              </Link>
              <Link className="hidden sm:inline-flex hover:text-muted-foreground" href="/settings">
                Settings
              </Link>
            </>
          ) : (
            <Button
                onClick={async () => {
                  await authClient.signIn.social({
                      provider: "google",
                    });
              }}
                variant="outline"
            >
              Continue with Google
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
