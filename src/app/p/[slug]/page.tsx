import Link from "next/link";
import { notFound } from "next/navigation";
import { calculateStats } from "@/lib/stats";
import { today } from "@/lib/utils";
import { ProgressNode } from "@/components/progress-node";
import { PathForm } from "../../dashboard/new/page";
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
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function PathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const path = await prisma.path.findFirst({
    where: { slug },
  });
  if (!path) notFound();

  const adminObj = await prisma.user.findFirst({
    where: { id: path.userId },
  });

  const entries = await prisma.entry.findMany({
    where: {
      pathId: path.id,
    },
  });

  const admin = path.userId == session?.user.id;

  const logs = entries;
  const stats = calculateStats(logs.map((entry: any) => entry.date));
  const latest = logs.at(-1);

  return (
    <main className="mx-auto w-full max-w-6xl p-5 flex gap-6">
      <main className="max-w-[35vw] flex flex-col">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq57t_1zl75cDwpuWWMbwHC0IfzkVXMn49MH4q1X1NCQ&s=10"
          className="w-full object-cover aspect-4/3 rounded-xl bg-accent-foreground"
        />
        <div className="mt-6 flex gap-3">
          <Stat label="Current streak" value={stats.current} />
          <Stat label="Longest streak" value={stats.longest} />
          <Stat label="Days logged" value={stats.total} />
        </div>

        <div className="mt-6 flex flex-col space-y-4">
          <div className="flex items-start justify-between gap-1">
            <h1 className="text-3xl font-semibold tracking-tight flex-1 truncate">
              {path.title}
            </h1>

            {admin && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  render={<Link href={`/${path.slug}`} target="_blank" />}>
                  <ArrowUpRight />
                </Button>
                <Dialog>
                  <DialogTrigger
                    render={<Button size={"icon"} variant={"outline"} />}>
                    <Pencil />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Path</DialogTitle>
                    </DialogHeader>
                    <PathForm initial={path} />
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>

          <div className="gap-2 flex items-center">
            <img
              src={"https://avatar.vercel.sh/" + adminObj?.name}
              className="w-8 h-8 rounded-full"
            />
            <p>{adminObj?.name}</p>
          </div>

          <div className="typeset typeset-docs text-muted-foreground text-sm overflow-auto">
            <p className="italic text-xs">Description:</p>
            <Markdown>{path.description}</Markdown>
          </div>
        </div>
      </main>

      <div className="max-w-[65vw] flex flex-col w-full">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-xl font-semibold">Progress logs</h2>
          {admin && (
            <Dialog>
              <DialogTrigger render={<Button className="gap-2" />}>
                <MessageSquarePlus className="h-4 w-4" />
                Add log
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
                      defaultValue={
                        latest?.date === today() ? latest.date : today()
                      }
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
                    <span className="ml-1 font-normal text-muted-foreground">
                      (optional)
                    </span>
                    <Textarea name="note" rows={2} />
                  </label>
                  <Button className="w-full" type="submit">
                    Save entry
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <hr className="mb-4" />

        {logs.length ? (
          <div className="space-y-4">
            {[...logs].reverse().map((entry) => (
              <ProgressNode
                key={entry.id}
                pathId={path.id}
                entry={entry}
                admin={admin}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No entries yet. Log what you learned today.
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-none p-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
