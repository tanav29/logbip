"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";


import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveEntry } from "@/app/actions";
import { toast } from "sonner";
import type { Entry } from "@/generated/prisma/client";

type AddEntryDialogProps = {
  pathId: string;
  existingEntries: Pick<Entry, "id" | "date">[];
};

export function AddEntryDialog({
  pathId,
  existingEntries,
}: AddEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const hasTodayEntry = existingEntries.some((e) => e.date === today);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && hasTodayEntry) {
      toast.info("You already have an entry for today.");
      return;
    }
    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <MessageSquarePlus className="h-4 w-4" />
        Add log
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a day</DialogTitle>
        </DialogHeader>
        <form action={saveEntry} className="mt-4 space-y-4">
          <input type="hidden" name="pathId" value={pathId} />
          <input type="hidden" name="date" value={today} />
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
  );
}
