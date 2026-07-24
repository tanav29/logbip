import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { entries, paths } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { calculateStats } from "@/lib/stats";
import { today } from "@/lib/utils";
import { ProgressNode } from "@/components/progress-node";
import { PathForm } from "../../new/page";
import { saveEntry } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus, ArrowUpRight, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Markdown from "react-markdown";

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
    <main className="mx-auto w-full max-w-4xl px-5 py-10 relative">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq57t_1zl75cDwpuWWMbwHC0IfzkVXMn49MH4q1X1NCQ&s=10"
        className="w-full object-cover aspect-4/1 rounded-xl bg-accent-foreground"
      />

      <div className="mt-6 flex gap-3">
        <Stat label="Current streak" value={stats.current} />
        <Stat label="Longest streak" value={stats.longest} />
        <Stat label="Days logged" value={stats.total} />
      </div>

      <section className="mt-6 flex flex-col space-y-4">
        <div className="flex items-start justify-between gap-1">
          <h1 className="text-3xl font-semibold tracking-tight flex-1 truncate">{path.title}</h1>

          <Button
            variant="outline"
            size="icon"
            render={<Link href={`/${path.slug}`} target="_blank" />}
          >
            <ArrowUpRight />
          </Button>
          <Dialog>
            <DialogTrigger render={<Button size={"icon"} variant={"outline"} />}>
              <Pencil />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Path</DialogTitle>
              </DialogHeader>
              <PathForm initial={path} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="typeset typeset-docs text-muted-foreground text-sm">
          <Markdown>{path.description}</Markdown>
        </div>
      </section>

      <section>
        <div className="mt-6">
          <div className="flex items-center justify-between pb-4">
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

          <hr className="mb-4" />

          {logs.length ? (
            <div className="space-y-4">
              {[...logs].reverse().map((entry) => (
                <ProgressNode key={entry.id} pathId={path.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              No entries yet. Log what you learned today.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/70 p-3 min-w-36 flex-1">
      <p className="text-xl font-semibold">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
