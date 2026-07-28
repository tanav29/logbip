import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calculateStats } from "@/lib/stats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  let paths;

  if (admin) {
    paths = await prisma.path.findMany({
      where: { userId: id },
      orderBy: { updatedAt: "desc" },
    });
  } else {
    paths = await prisma.path.findMany({
      where: { userId: id, isPublic: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  const allEntries = await prisma.entry.findMany({
    where: { userId: id },
    orderBy: { date: "desc" },
  });

  const stats = calculateStats(allEntries.map((entry) => entry.date));
  return (
    <>
      <main className="relative mx-auto w-full max-w-4xl p-5">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
            Good to see you, {user.name.split(" ")[0]}.
          </h1>
          <Button render={<Link href="/new" />}>New path</Button>
        </div>
        <div className="mb-10">
          <div className="grid grid-cols-3 divide-x divide-border">
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

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your paths</h2>
            <span className="text-sm text-muted-foreground">
              {paths.length} total
            </span>
          </div>
          {paths.length ? (
            <div className="grid gap-3">
              {paths.map((path) => (
                <Link key={path.id} href={`/p/${path.slug}`}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{path.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {path.description?.slice(0, 20) ||
                          "No description yet."}
                      </p>
                      <Badge variant={path.isPublic ? "success" : "secondary"}>
                        {path.isPublic ? "Public" : "Private"}
                      </Badge>
                    </CardContent>
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
              <Button variant="link" render={<Link href="/dashboard/new" />}>
                Create a path
              </Button>
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
