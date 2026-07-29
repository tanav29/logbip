import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function isEntryOlderThanADay(date: string): boolean {
  const entryDate = new Date(date + "T00:00:00Z");
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - 1);
  cutoff.setUTCHours(0, 0, 0, 0);
  return entryDate < cutoff;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}
