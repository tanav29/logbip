import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calculateStats } from "@/lib/stats";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) notFound();

  const session = await auth.api.getSession({ headers: await headers() });

  const admin = session && id == session?.user.id;

  const paths = await prisma.path.findMany({
      where: { userId: id },
      orderBy: { updatedAt: "desc" },
    });

  const allEntries = await prisma.entry.findMany({
    where: {
      userId: id,
    },
    orderBy: { date: "desc" },
  });

  const stats = calculateStats(allEntries.map((entry) => entry.date));
  return (
    <>
      <main className="relative mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="relative flex min-h-52 items-end overflow-hidden rounded-2xl bg-[#173b36] p-6 text-[#f6f0e5] sm:min-h-64 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(231,181,107,.35),transparent_35%),linear-gradient(135deg,transparent,rgba(0,0,0,.2))]" />
          <p className="relative max-w-sm text-2xl font-medium leading-tight tracking-tight sm:text-3xl">A record of showing up, even when no one is watching.</p>
        </div>

        <div className="my-8 flex flex-wrap items-end justify-between gap-4">
          <div className="gap-2 flex items-center">
            <img
              src={user?.image ?? "/bg.png"}
              alt=""
              className="size-9 rounded-full border border-border object-cover"
            />
            <div><p className="text-xs text-muted-foreground">Learning in public</p><p className="font-semibold">{user?.name}</p></div>
          </div>
          {admin && <Button render={<Link href="/new" />}>New path</Button>}
        </div>
        <div className="mb-10">
          <div className="grid grid-cols-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <Stat label="Active paths" value={paths.length} />
            <Stat
              label="Current streak"
              value={`${stats.current} day${stats.current === 1 ? "" : "s"}`}
            />
            <Stat
              label="Longest streak"
              value={`${stats.longest} day${stats.longest === 1 ? "" : "s"}`}
            />
          </div>
          <div className="mt-7 grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto">
            {/*skiped the first 10 days for a reason*/}
            {heatmap(stats.dates)
              .slice(10)
              .map((cell) => (
                <span
                  key={cell.date}
                  title={`${cell.date}: ${cell.count} entr${cell.count === 1 ? "y" : "ies"}`}
                  className={`size-3 rounded-[3px] ${cell.count === 0 ? "bg-muted" : cell.count === 1 ? "bg-foreground/35" : cell.count < 3 ? "bg-foreground/65" : "bg-foreground"}`}
                />
              ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="font-semibold">Activity</h2>
            <span className="text-xs text-muted-foreground">Last year</span>
          </div>
        </div>

        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="eyebrow">Your workspace</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Learning paths</h2></div>
            <span className="text-sm text-muted-foreground">
              {paths.length} total
            </span>
          </div>
          {paths.length ? (
            <div className="grid gap-3">
              {paths.map((path) => (
                <Link key={path.id} href={`/p/${path.slug}`}>
                  <Card className="transition-shadow duration-200 hover:shadow-md">
                    <CardHeader className="flex-row items-start justify-between gap-4">
                      <div><CardTitle>{path.title}</CardTitle><p className="mt-2 text-sm text-muted-foreground">{path.description?.slice(0, 100) || "No description yet."}</p></div>
                      <span className="text-xl text-accent-foreground">↗</span>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="font-medium">Your first path starts here.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a small, specific learning goal.
              </p>
              {admin &&
              <Button variant="link" render={<Link href="/new" />}>
                Create a path
              </Button>}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
function heatmap(dates: string[]) {
  const counts = new Map<string, number>();
  dates.forEach((date) => counts.set(date, (counts.get(date) ?? 0) + 1));
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 364);
  return Array.from({ length: 365 }, (_, index) => {
    const dateValue = new Date(start);
    dateValue.setUTCDate(start.getUTCDate() + index);
    const date = dateValue.toISOString().slice(0, 10);
    return { date, count: counts.get(date) ?? 0 };
  });
}
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-none p-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
