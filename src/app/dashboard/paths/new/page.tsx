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
    <Card className="mt-8 p-6 sm:p-8">
      <form action={savePath} className="space-y-5">
        <input type="hidden" name="id" value={initial?.id ?? ""} />
        <Label className="grid gap-2">
          Title
          <Input
            required
            name="title"
            defaultValue={initial?.title}
            placeholder="e.g. Learn TypeScript…"
          />
        </Label>
        <Label className="grid gap-2">
          Description <span className="font-normal text-muted-foreground">(optional)</span>
          <Textarea
            name="description"
            defaultValue={initial?.description ?? ""}
            rows={4}
            placeholder="What are you working toward?"
          />
        </Label>
        {initial ? (
          <Label className="grid gap-2">
            Public URL
            <Input required name="slug" defaultValue={initial.slug} />
            <span className="text-xs font-normal text-muted-foreground">
              This link identifies your path and can be edited later.
            </span>
          </Label>
        ) : (
          <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            A unique share link will be generated automatically when you create this path.
          </p>
        )}
        <label className="flex items-start gap-3 rounded-lg border p-4 text-sm">
          <Checkbox name="isPublic" defaultChecked={initial?.isPublic ?? true} />
          <span>
            <span className="font-medium">Make this path public</span>
            <span className="mt-1 block text-muted-foreground">
              Anyone with the link can see its entries.
            </span>
          </span>
        </label>
        <Button type="submit">{initial ? "Save changes" : "Create path"}</Button>
      </form>
    </Card>
  );
}
