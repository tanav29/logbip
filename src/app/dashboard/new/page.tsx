import Link from "next/link";
import { savePath } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewPath() {
  return (
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
  );
}

export function PathForm({
  initial,
}: {
  initial?: {
    id: string;
    title: string;
    description: string | null;
    banner: string | null;
    slug: string;
    isPublic: boolean;
  };
}) {
  return (
    <form action={savePath} className="mt-8 space-y-5">
      <input type="hidden" name="id" value={initial?.id ?? ""} />
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          required
          name="title"
          defaultValue={initial?.title}
          placeholder="e.g. Learn TypeScript"
        />
      </div>
      {initial && (
        <div>
          <Label>Public URL</Label>
          <p className="mt-1 font-mono text-sm text-muted-foreground">/{initial.slug}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your 9-character public URL is generated automatically.
          </p>
        </div>
      )}
      {!initial && (
        <p className="text-xs text-muted-foreground">
          A unique 9-character public URL will be generated automatically.
        </p>
      )}
      <div>
        <Label htmlFor="banner">
          Banner URL <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="banner"
          name="banner"
          type="url"
          defaultValue={initial?.banner ?? ""}
          placeholder="https://…"
        />
      </div>
      <div>
        <Label htmlFor="description">
          Description <span className="font-normal text-muted-foreground">(markdown)</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initial?.description ?? ""}
          rows={4}
          placeholder="What are you working toward?"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublic" defaultChecked={initial?.isPublic ?? true} /> Make
        this path public
      </label>
      <Button type="submit">{initial ? "Save changes" : "Create path"}</Button>
    </form>
  );
}
