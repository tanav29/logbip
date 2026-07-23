import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { entries, paths, users } from "@/db/schema";
import { calculateStats } from "@/lib/stats";
import { SiteHeader } from "@/components/site-header";
import { CopyLink } from "@/components/copy-link";
export default async function PublicPath({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await db
    .select({ path: paths, user: users })
    .from(paths)
    .innerJoin(users, eq(paths.userId, users.id))
    .where(eq(paths.slug, slug))
    .limit(1);
  const record = result[0];
  if (!record || !record.path.isPublic) notFound();
  const logs = await db
    .select()
    .from(entries)
    .where(eq(entries.pathId, record.path.id))
    .orderBy(asc(entries.date));
  const stats = calculateStats(logs.map((entry) => entry.date));
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 py-12">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              {record.user.avatar ? (
                <span
                  className="size-10 rounded-full border bg-cover bg-center"
                  style={{ backgroundImage: `url(${record.user.avatar})` }}
                  role="img"
                  aria-label={`${record.user.name}'s avatar`}
                />
              ) : (
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {record.user.name.slice(0, 1).toUpperCase()}
                </span>
              )}
              <p className="text-sm text-muted-foreground">{record.user.name}&apos;s learning path</p>
            </div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">{record.path.title}</h1>
            <p className="mt-3 max-w-xl text-lg text-muted-foreground">{record.path.description}</p>
          </div>
          <CopyLink slug={record.path.slug} />
        </div>
        <div className="mt-10 grid grid-cols-3 gap-3">
          <Stat label="Current streak" value={stats.current} />
          <Stat label="Longest streak" value={stats.longest} />
          <Stat label="Days logged" value={stats.total} />
        </div>
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Progress</h2>
          {logs.length ? (
            <div className="space-y-3">
              {[...logs].reverse().map((entry) => (
                <article key={entry.id} className="rounded-xl border p-5">
                  <p className="text-xs font-medium text-muted-foreground">{entry.date}</p>
                  <p className="mt-2">{entry.content}</p>
                  {entry.note && <p className="mt-2 text-sm text-muted-foreground">{entry.note}</p>}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              This path is ready for its first entry.
            </div>
          )}
        </section>
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Tracking progress in public with{" "}
          <a className="underline" href="/">
            LogBip
          </a>
          .
        </p>
      </main>
    </>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
