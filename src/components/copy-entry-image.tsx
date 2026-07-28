"use client";

import { useState } from "react";
import { Check, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyEntryImage({
  pathTitle,
  date,
  content,
  note,
}: {
  pathTitle: string;
  date: string;
  content: string;
  note?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  async function copyImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = note ? 760 : 630;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#111111";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#8f8f8f";
    context.font = "28px Arial";
    context.fillText("LOGBIP  /  " + pathTitle.toUpperCase(), 72, 88);
    context.fillStyle = "#ffffff";
    context.font = "bold 54px Arial";
    drawWrapped(context, content, 72, 205, 1050, 70);
    context.fillStyle = "#9f9f9f";
    context.font = "28px Arial";
    context.fillText(formatDate(date), 72, 570);
    if (note) {
      context.fillStyle = "#242424";
      context.fillRect(72, 620, 1056, 2);
      context.fillStyle = "#bdbdbd";
      context.font = "26px Arial";
      drawWrapped(context, `Note: ${note}`, 72, 680, 1050, 38);
    }
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob || !("ClipboardItem" in window) || !navigator.clipboard?.write) return;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Button type="button" variant="ghost" size="icon-sm" onClick={copyImage} aria-label="Copy entry as image">
      {copied ? <Check className="size-4" /> : <ImageIcon className="size-4" />}
    </Button>
  );
}

function drawWrapped(context: CanvasRenderingContext2D, value: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = value.split(/\s+/);
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else line = next;
  }
  if (line) context.fillText(line, x, y);
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
