"use client";

import { CheckCircle2, ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import Markdown from "react-markdown";
import type { Entry } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ProgressNodeProps = {
  pathId: string;
  entry: Entry;
  admin: boolean
};

export function ProgressNode({ pathId, entry, admin }: ProgressNodeProps) {
  const [more, setMore] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function updateLog(form: FormData) {
    setSaving(true);
    setError(null);
    const response = await fetch(`/api/paths/${pathId}/entries/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.get("date"),
        content: form.get("content"),
        note: form.get("note"),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error ?? "Unable to update log.");
      setSaving(false);
      return;
    }
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function deleteLog() {
    if (!window.confirm("Delete this log? This cannot be undone.")) return;
    setError(null);
    const response = await fetch(`/api/paths/${pathId}/entries/${entry.id}`, { method: "DELETE" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error ?? "Unable to delete log.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3 items-center">
        <CheckCircle2 className="fill-accent size-4" />
        <span className="mt-1 block text-xs font-medium text-muted-foreground">
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
              <DropdownMenuItem onClick={() => setEditing(true)}>Edit log</DropdownMenuItem>
              <DropdownMenuItem
                onClick={deleteLog}
                className="text-destructive focus:text-destructive"
              >
                Delete log
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>}
      </div>
      {entry.note && (
        <div className="typeset typeset-docs text-sm pr-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="italic text-xs">Note:</p>
            <button
              className={cn("hover:text-primary transition-all", more ? "rotate-180" : "rotate-0")}
              onClick={() => setMore(!more)}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
          <div className="px-2">{more && <Markdown>{entry.note}</Markdown>}</div>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
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
