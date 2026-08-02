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
    <main className="mx-auto grid w-full h-full max-w-6xl gap-10 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-14">
      <section className="flex flex-col">
        {
          path.banner ?
          <img
            src={path.banner}
            alt=""
            className="w-full object-cover aspect-[5/3] rounded-2xl bg-primary"
          /> : (
          <div className="w-full aspect-[5/3] rounded-2xl bg-primary p-6 text-2xl font-medium leading-tight text-primary-foreground flex items-end">
            A path in progress.
          </div>
        )
        }
        <div className="mt-6 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card p-4">
          <Stat label="Current streak" value={stats.current} />
          <Stat label="Longest streak" value={stats.longest} />
          <Stat label="Days logged" value={stats.total} />
        </div>

        <div className="mt-6 flex flex-col space-y-4">
          <div className="flex items-start justify-between gap-1">
            <h1 className="flex-1 text-3xl font-semibold tracking-tight">
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
              src={path.user?.image ?? path.user.avatar ?? "/bg.png"}
              alt=""
              className="size-8 rounded-full object-cover"
            />
            <p>{path.user?.name}</p>
          </div>

          <div className="typeset typeset-docs text-muted-foreground text-sm overflow-auto border rounded-md p-2">
            <Markdown>{path.description}</Markdown>
          </div>
        </div>
      </section>

      <section className="flex w-full flex-col h-full overflow-y-auto scrollbar-none">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <h2 className="text-xl font-semibold">Progress logs</h2>
          {admin && (
            <AddEntryDialog
              pathId={path.id}
              existingEntries={entries}
            />
          )}
        </div>

        <div className="mb-5" />

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
      </section>
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
