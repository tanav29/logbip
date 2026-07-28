import Link from "next/link";
import { getCurrentUser } from "@/../server/services";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getCurrentUser();
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
              <Link
                className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                href="/auth"
              >
                Sign in
              </Link>
              <Button size="sm" render={<Link href="/auth" />}>
                Get started
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
