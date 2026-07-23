import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { entries, paths } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { calculateStats } from "@/lib/stats";
import { today } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { PathForm } from "../new/page";
import { saveEntry } from "@/app/actions";
export default async function PathPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const path = (
    await db
      .select()
      .from(paths)
      .where(and(eq(paths.id, id), eq(paths.userId, user.id)))
      .limit(1)
  )[0];
  if (!path) notFound();
  const logs = await db
    .select()
    .from(entries)
    .where(eq(entries.pathId, path.id))
    .orderBy(asc(entries.date));
  const stats = calculateStats(logs.map((entry) => entry.date));
  const latest = logs.at(-1);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <Link href="/dashboard" className="text-sm text-muted-foreground">
          ← Dashboard
        </Link>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
          <section>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{path.title}</h1>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                    {path.isPublic ? "Public" : "Private"}
                  </span>
                </div>
                <p className="mt-2 text-muted-foreground">
                  {path.description || "No description yet."}
                </p>
              </div>
              <Link
                href={`/${path.slug}`}
                target="_blank"
                className="rounded-lg border px-3 py-2 text-sm"
              >
                View public page ↗
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Stat label="Current streak" value={stats.current} />
              <Stat label="Longest streak" value={stats.longest} />
              <Stat label="Days logged" value={stats.total} />
            </div>
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold">Progress log</h2>
              {logs.length ? (
                <div className="space-y-3">
                  {[...logs].reverse().map((entry) => (
                    <article key={entry.id} className="rounded-xl border p-4">
                      <p className="text-xs text-muted-foreground">{entry.date}</p>
                      <p className="mt-2">{entry.content}</p>
                      {entry.note && (
                        <p className="mt-2 text-sm text-muted-foreground">{entry.note}</p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                  No entries yet. Log what you learned today.
                </div>
              )}
            </div>
          </section>
          <aside className="space-y-8">
            <div className="rounded-xl border p-5">
              <h2 className="font-semibold">Log a day</h2>
              <form action={saveEntry} className="mt-4 space-y-4">
                <input type="hidden" name="pathId" value={path.id} />
                <label className="block text-sm font-medium">
                  Date
                  <input
                    required
                    type="date"
                    name="date"
                    defaultValue={latest?.date === today() ? latest.date : today()}
                    className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
                  />
                </label>
                <label className="block text-sm font-medium">
                  What did you do?
                  <textarea
                    required
                    name="content"
                    rows={4}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
                    placeholder="Read a chapter, shipped a feature…"
                  />
                </label>
                <label className="block text-sm font-medium">
                  Note<span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                  <textarea
                    name="note"
                    rows={2}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
                  />
                </label>
                <button className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background">
                  Save entry
                </button>
              </form>
            </div>
            <details className="rounded-xl border p-5">
              <summary className="cursor-pointer font-semibold">Edit path details</summary>
              <PathForm initial={path} />
            </details>
          </aside>
        </div>
      </main>
    </>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
