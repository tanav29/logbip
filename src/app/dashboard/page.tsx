import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { entries, paths } from "@/db/schema";
import { calculateStats } from "@/lib/stats";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const allPaths = await db
    .select()
    .from(paths)
    .where(eq(paths.userId, user.id))
    .orderBy(desc(paths.updatedAt));
  const allEntries = await db
    .select()
    .from(entries)
    .where(eq(entries.userId, user.id))
    .orderBy(desc(entries.date));
  const recent = allEntries.slice(0, 8);
  const stats = calculateStats(allEntries.map((entry) => entry.date));
  return (
    <>
      <SiteHeader />
      <div className="bg-gradient-glow" />
      <main className="mx-auto w-full max-w-6xl px-5 py-10 relative">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Your learning workspace</p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight gradient-text bg-[length:200%_auto]">Good to see you, {user.name.split(" ")[0]}.</h1>
          </div>
          <Button render={<Link href="/dashboard/paths/new" />}>New path</Button>
        </div>
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <Stat label="Active paths" value={allPaths.length} />
          <Stat
            label="Current streak"
            value={`${stats.current} day${stats.current === 1 ? "" : "s"}`}
          />
          <Stat
            label="Longest streak"
            value={`${stats.longest} day${stats.longest === 1 ? "" : "s"}`}
          />
        </div>
        <Card className="mb-10 p-5 glass-card border-none">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Activity</h2>
            <span className="text-xs text-muted-foreground">Last 10 weeks</span>
          </div>
          <div className="grid grid-cols-31 gap-1.5">
            {heatmap(stats.dates).map((cell) => (
              <span
                key={cell.date}
                title={`${cell.date}: ${cell.count} entr${cell.count === 1 ? "y" : "ies"}`}
                className={`aspect-square w-5 h-5 rounded-sm ${cell.count ? "bg-foreground" : "bg-muted"}`}
              />
            ))}
          </div>
        </Card>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your paths</h2>
              <span className="text-sm text-muted-foreground">{allPaths.length} total</span>
            </div>
            {allPaths.length ? (
              <div className="grid gap-3">
                {allPaths.map((path) => (
                  <Card key={path.id} className="transition-all duration-300 hover:-translate-y-1 glass-card hover:border-primary/50">
                    <Link href={`/dashboard/paths/${path.id}`} className="block p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold">{path.title}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {path.description || "No description yet."}
                          </p>
                        </div>
                        <Badge variant={path.isPublic ? "success" : "secondary"}>
                          {path.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                      <p className="mt-4 text-xs text-muted-foreground">/{path.slug}</p>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-10 text-center">
                <p className="font-medium">Your first path starts here.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a small, specific learning goal.
                </p>
                <Button variant="link" render={<Link href="/dashboard/paths/new" />}>
                  Create a path
                </Button>
              </div>
            )}
          </section>
          <section>
            <h2 className="mb-4 text-lg font-semibold">Recent activity</h2>
            <Card>
              {recent.length ? (
                recent.map((entry) => (
                  <div key={entry.id} className="border-b p-4 last:border-0">
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                    <p className="mt-1 text-sm">{entry.content}</p>
                  </div>
                ))
              ) : (
                <p className="p-6 text-sm text-muted-foreground">
                  Your completed days will appear here.
                </p>
              )}
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}
function heatmap(dates: string[]) {
  const counts = new Map<string, number>();
  dates.forEach((date) => counts.set(date, (counts.get(date) ?? 0) + 1));
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end.getTime() - 69 * 86400000);
  return Array.from({ length: 70 }, (_, index) => {
    const date = new Date(start.getTime() + index * 86400000).toISOString().slice(0, 10);
    return { date, count: counts.get(date) ?? 0 };
  });
}
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="glass-card border-none">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
