"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ToastEffect({
  saved,
  feedback,
}: {
  saved?: string;
  feedback?: string;
}) {
  useEffect(() => {
    if (saved === "1") toast.success("Your profile has been updated.");
    if (feedback === "1") toast.success("Thanks for sharing your feedback.");
  }, [saved, feedback]);
  return null;
}