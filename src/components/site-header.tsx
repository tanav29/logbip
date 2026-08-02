"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SiteHeader() {
  // const session = await auth.api.getSession({ headers: await headers() });
  const { data: session } = authClient.useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            ↗
          </span>
          <span>Log<span className="text-accent-foreground">Bip</span></span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {/* {isPending && !session && <Loader className="animate-spin w-4 h-4" />} */}
          {session ? (
            <>
              <Link
                className="hidden rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
                href={`/u/${session.user.id}`}>
                Dashboard
              </Link>
              <Link
                className="hidden rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
                href="/settings">
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
              variant="outline">
              Sign in with Google
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
