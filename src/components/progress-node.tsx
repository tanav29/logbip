"use client";

import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import Markdown from "react-markdown";
import type { InferSelectModel } from "drizzle-orm";
import { entries } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

type ProgressNodeProps = {
  entry: InferSelectModel<typeof entries>;
};

export function ProgressNode({ entry }: ProgressNodeProps) {
  const [more, setMore] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <span className="mt-1 block text-xs font-medium text-muted-foreground">
          {new Date(entry.date).toLocaleDateString()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base">{entry.content}</span>
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
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
        <div className="typeset typeset-docs text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="italic">Note:</p>
            <Button variant={"ghost"} size="icon-sm" onClick={() => setMore(!more)}>
              {more ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>
          {more && <Markdown>{entry.note}</Markdown>}
        </div>
      )}
    </div>
  );
}
