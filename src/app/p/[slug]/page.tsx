import { notFound } from "next/navigation";
import { calculateStats } from "@/lib/stats";
import { ProgressNode } from "@/components/progress-node";
import { PathForm } from "../../new/page";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
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
import { AddEntryDialog } from "@/components/add-entry-dialog";

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
    where: {
      slug,
    },
    include: { user: true },
  });
  if (!path) notFound();

  const entries = await prisma.entry.findMany({
    where: {
      pathId: path.id,
    },
    orderBy: { date: "asc" },
  });

  const admin = path.userId === session?.user.id;

  const logs = entries;
  const stats = calculateStats(logs.map((entry) => entry.date));

  return (
    <main className="mx-auto w-full max-w-6xl p-5 flex gap-6">
      <main className="max-w-[35vw] flex flex-col">
        {
          path.banner ?
          <img
            src={path.banner}
            className="w-full object-cover aspect-4/3 rounded-xl bg-accent-foreground"
          /> : (
          <div className="w-full aspect-4/3 rounded-xl bg-accent-foreground flex items-center justify-center">
            no banner
          </div>
        )
        }
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
            )}
          </div>

          <div className="gap-2 flex items-center">
            <img
              src={path.user?.image ?? undefined}
              className="w-8 h-8 rounded-full"
            />
            <p>{path.user?.name}</p>
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
            <AddEntryDialog
              pathId={path.id}
              existingEntries={entries}
            />
          )}
        </div>

        <hr className="mb-4" />

        {logs.length ? (
          <div className="space-y-3">
            {[...logs].reverse().map((entry) => (
              <ProgressNode
                key={entry.id}
                pathId={path.id}
                pathTitle={path.title}
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
