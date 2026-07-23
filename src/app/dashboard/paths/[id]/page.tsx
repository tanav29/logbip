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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MoreVertical, MessageSquarePlus, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      <main className="mx-auto w-full max-w-4xl px-5 py-10 relative">
        <div className="mt-6 flex flex-col gap-10">
          <section>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-semibold tracking-tight">{path.title}</h1>
                  <Badge variant={path.isPublic ? "success" : "secondary"} className="shadow-sm">
                    {path.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
                <p className="mt-2 text-muted-foreground">
                  {path.description || "No description yet."}
                </p>
              </div>
              <div className="flex gap-1 items-center justify-center">
              <Button
                variant="outline"
                render={
                  <Link
                    href={`/${path.slug}`}
                    target="_blank"
                    className="rounded-lg border px-3 py-2 text-sm"
                  />
                }
              >
                View public page
              </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button
                      variant="outline"
                      size="icon"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>} />
                    <DropdownMenuContent align="end">
                      <Dialog>
                        <DialogTrigger>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Edit path details
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Path</DialogTitle>
                          </DialogHeader>
                          <PathForm initial={path} />
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Stat label="Current streak" value={stats.current} />
              <Stat label="Longest streak" value={stats.longest} />
              <Stat label="Days logged" value={stats.total} />
            </div>

            <div className="mt-12">
              <div className="mb-6 flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-semibold">Progress log</h2>
                <Dialog>
                  <DialogTrigger>
                    <Button className="gap-2">
                      <MessageSquarePlus className="h-4 w-4" />
                      Add log
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log a day</DialogTitle>
                    </DialogHeader>
                    <form action={saveEntry} className="mt-4 space-y-4">
                      <input type="hidden" name="pathId" value={path.id} />
                      <label className="block text-sm font-medium">
                        Date
                        <Input
                          required
                          type="date"
                          name="date"
                          defaultValue={latest?.date === today() ? latest.date : today()}
                        />
                      </label>
                      <label className="block text-sm font-medium">
                        What did you do?
                        <Textarea
                          required
                          name="content"
                          rows={4}
                          placeholder="Read a chapter, shipped a feature…"
                        />
                      </label>
                      <label className="block text-sm font-medium">
                        Note
                        <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                        <Textarea name="note" rows={2} />
                      </label>
                      <Button className="w-full" type="submit">
                        Save entry
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {logs.length ? (
                <div className="space-y-4">
                  {[...logs].reverse().map((entry) => (
                    <div key={entry.id} className="group flex gap-2">
                      <CheckCircle2 className="h-5 w-5 fill-primary stroke-background" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 items-center justify-center">
                            <p className="text-base">{entry.content}</p>
                            <p className="text-xs font-medium text-muted-foreground">{new Date(entry.date).toDateString()}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit log</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                Delete log
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {entry.note && (
                          <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                  No entries yet. Log what you learned today.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-none">
      <p className="text-xs text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
