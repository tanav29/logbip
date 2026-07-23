import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center px-4">
        <main className="flex flex-col items-center gap-8 text-center max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight">LogBip</h1>
          <p className="text-lg text-muted-foreground">
            Track what you&apos;re learning and share your progress with the world.
          </p>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:opacity-90"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input px-6 text-sm font-medium hover:bg-accent"
            >
              Get Started
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
