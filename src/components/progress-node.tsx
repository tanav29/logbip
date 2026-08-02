"use client";

import { ChevronUp, MoreHorizontal } from "lucide-react";
import Markdown from "react-markdown";
import type { Entry } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, isEntryOlderThanADay } from "@/lib/utils";
import { CopyEntryImage } from "@/components/copy-entry-image";

type ProgressNodeProps = {
  pathId: string;
  pathTitle: string;
  entry: Entry;
  admin: boolean
};

export function ProgressNode({ pathId, pathTitle, entry, admin }: ProgressNodeProps) {
  const [more, setMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [editing, setEditing] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const note = noteRef.current;
    if (!note) return;

    const checkOverflow = () => setHasMore(note.scrollHeight > 56);
    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(note);
    return () => observer.disconnect();
  }, [entry.note]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function updateLog(form: FormData) {
    setSaving(true);

    const response = await fetch(`/api/paths/${pathId}/entries/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.get("date"),
        content: form.get("content"),
        note: form.get("note"),
      }),
    });
    const _result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setSaving(false);
      toast.error(_result.error ?? "Unable to update log.");
      return;
    }
    setSaving(false);
    setEditing(false);
    router.refresh();
    toast.success("Log updated.");
  }

  async function deleteLog() {
    if (!window.confirm("Delete this log? This cannot be undone.")) return;

    const response = await fetch(`/api/paths/${pathId}/entries/${entry.id}`, { method: "DELETE" });
    const _result = await response.json().catch(() => ({}));
    if (!response.ok) {
      // Error handled by toast
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3 items-center py-1">
        <span className="block text-md font-medium text-muted-foreground underline">
          {new Date(entry.date).toLocaleDateString()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base">{entry.content}</span>
        </span>
        {admin &&
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isEntryOlderThanADay(entry.date) && <DropdownMenuItem onClick={() => setEditing(true)}>Edit log</DropdownMenuItem>}
              <DropdownMenuItem
                onClick={deleteLog}
                className="text-destructive focus:text-destructive"
              >
                Delete log
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>}
        <CopyEntryImage pathTitle={pathTitle} date={entry.date} content={entry.content} note={entry.note} />
      </div>
      {entry.note && (
        <div className="typeset typeset-docs text-sm pr-1">
          <div
            ref={noteRef}
            className={cn(
              "relative overflow-hidden  text-foreground/85 transition-[max-height] duration-500 ease-in-out motion-reduce:transition-none",
              more ? "max-h-[1000px]" : "max-h-8",
            )}
          >
            <Markdown>{entry.note}</Markdown>
            {!more && hasMore && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
            )}
          </div>
          {hasMore && (
            <button
              type="button"
              aria-expanded={more}
              onClick={() => setMore(!more)}
              className="mt-1 flex items-center gap-1  text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {more ? "Show less" : "Show more"}
              <ChevronUp className={cn("size-3 transition-transform duration-300", more ? "rotate-0" : "rotate-180")} />
            </button>
          )}
        </div>
      )}

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit log</DialogTitle>
          </DialogHeader>
          <form action={updateLog} className="space-y-4">
            <label className="block text-sm font-medium">
              Date
              <Input required type="date" name="date" defaultValue={entry.date} />
            </label>
            <label className="block text-sm font-medium">
              What did you do?
              <Textarea required name="content" rows={4} defaultValue={entry.content} />
            </label>
            <label className="block text-sm font-medium">
              Note <span className="font-normal text-muted-foreground">(optional)</span>
              <Textarea name="note" rows={2} defaultValue={entry.note ?? ""} />
            </label>
            <Button className="w-full" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
