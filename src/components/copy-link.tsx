"use client";
import { useState } from "react";
export function CopyLink({ slug }: { slug: string }) { const [copied, setCopied] = useState(false); return <button onClick={async () => { await navigator.clipboard.writeText(`${location.origin}/${slug}`); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">{copied ? "Copied" : "Copy link"}</button>; }
