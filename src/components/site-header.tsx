import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-2">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <span className="flex size-6 items-center justify-center rounded-[6px] bg-foreground text-xs text-background transition-transform group-hover:rotate-6">
            L
          </span>
          LogBip
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link className="hidden sm:inline-flex hover:text-muted-foreground" href="/dashboard">
                Dashboard
              </Link>
              <Link className="hidden sm:inline-flex hover:text-muted-foreground" href="/settings">
                Settings
              </Link>
            </>
          ) : (
            <>
              <Link className="hidden sm:inline-flex hover:text-muted-foreground" href="/login">
                Sign in
              </Link>
              <Link className="hidden sm:inline-flex hover:text-muted-foreground" href="/register">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
