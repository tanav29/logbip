import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="border-b bg-background/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href={user ? "/dashboard" : "/"} className="text-lg font-bold tracking-tight">
          Log<span className="text-muted-foreground">Bip</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/settings" className="text-muted-foreground hover:text-foreground">
                Settings
              </Link>
              <form action={logout}>
                <button className="text-muted-foreground hover:text-foreground">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
              <Link href="/register" className="rounded-lg bg-foreground px-4 py-2 text-background">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
