import Link from "next/link";
import { savePath } from "@/app/actions";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewPath() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-5 py-12">
        <Button
          variant="link"
          className="h-auto px-0 text-muted-foreground"
          render={<Link href="/dashboard" />}
        >
          ← Dashboard
        </Button>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Create a learning path</h1>
        <p className="mt-2 text-muted-foreground">
          Give your practice a home and make progress visible.
        </p>
        <PathForm />
      </main>
    </>
  );
}

export function PathForm({
  initial,
}: {
  initial?: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    isPublic: boolean;
  };
}) {
  return (
    <form action={savePath} className="space-y-5">
      <input type="hidden" name="id" value={initial?.id ?? ""} />
      <Label>Banner</Label>
      <Input
        required
        name="banner"
        defaultValue={initial?.banner}
        placeholder="e.g. Learn TypeScript…"
      />
      <Label>Title</Label>
      <Input
        required
        name="title"
        defaultValue={initial?.title}
        placeholder="e.g. Learn TypeScript…"
      />
      <Label>
        Description <span className="font-normal text-muted-foreground">(markdown)</span>
      </Label>
      <Textarea
        name="description"
        defaultValue={initial?.description ?? ""}
        rows={4}
        placeholder="What are you working toward?"
      />
      <Button type="submit">{initial ? "Save changes" : "Create path"}</Button>
    </form>
  );
}
