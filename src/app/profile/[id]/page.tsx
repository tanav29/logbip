import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/../server/services";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { calculateStats } from "@/lib/stats";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  if (!profile) notFound();
  const stats = calculateStats(profile.entries.map((entry) => entry.date));
  const recent = profile.entries.slice(0, 8);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-5 py-12">
        <section className="flex flex-wrap items-center gap-4">
          {profile.user.avatar ? (
            <span
              className="size-16 rounded-full border bg-cover bg-center"
              style={{ backgroundImage: `url(${profile.user.avatar})` }}
              role="img"
              aria-label={`${profile.user.name}'s avatar`}
            />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-full bg-muted text-xl font-semibold">
              {profile.user.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Public profile</p>
            <h1 className="text-3xl font-bold tracking-tight">{profile.user.name}</h1>
            {profile.user.xAccount && (
              <p className="mt-1 text-sm text-muted-foreground">@{profile.user.xAccount}</p>
            )}
          </div>
        </section>
        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          <Stat label="Public goals" value={profile.paths.length} />
          <Stat label="Days completed" value={stats.total} />
          <Stat label="Current streak" value={stats.current} />
          <Stat label="Longest streak" value={stats.longest} />
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <section>
            <h2 className="mb-4 text-lg font-semibold">Public goals</h2>
            <div className="grid gap-3">
              {profile.paths.map((path) => (
                <Card
                  key={path.id}
                  className="p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <Link href={`/${path.slug}`} className="block">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{path.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {path.description || "A public learning goal."}
                        </p>
                      </div>
                      <Badge variant="success">Public</Badge>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
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
                <p className="p-6 text-sm text-muted-foreground">No public activity yet.</p>
              )}
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </Card>
  );
}
