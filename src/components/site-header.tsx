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
          href={user ? "/dashboard" : "/"}
          className="group flex items-center gap-2 text-[15px] font-semibold tracking-tight"
        >
          <span className="flex size-6 items-center justify-center rounded-[6px] bg-foreground text-xs text-background transition-transform group-hover:rotate-6">
            L
          </span>
          Log<span className="text-muted-foreground">Bip</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          {user ? (
            <>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                render={<Link href="/dashboard" />}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                render={<Link href="/settings" />}
              >
                Settings
              </Button>
              <form action={logout}>
                <Button variant="ghost" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" render={<Link href="/login" />}>
                Sign in
              </Button>
              <Button render={<Link href="/register" />}>Get started</Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
