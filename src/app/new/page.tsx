import { savePath } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewPath() {
  return (
    <main className="mx-auto w-full max-w-4xl p-5">
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Create a learning path</h1>
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
  };
}) {
  return (
    <form action={savePath} className="mt-8 space-y-5">
      <input type="hidden" name="id" value={initial?.id ?? ""} />

      <Label className="grid gap-2">
        Title
        <Input
          id="title"
          required
          name="title"
          defaultValue={initial?.title}
          placeholder="e.g. Learn TypeScript"
        />
      </Label>

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
        <Label className="grid gap-2">
          Banner URL (optional)
        <Input
          id="banner"
          name="banner"
          type="url"
          defaultValue={initial?.banner ?? ""}
          placeholder="https://…"
        />
        </Label>
        <Label className="grid gap-2">
          Description (markdown)
        <Textarea
          id="description"
          name="description"
          defaultValue={initial?.description ?? ""}
          rows={4}
          placeholder="What are you working toward?"
        />
        </Label>
      <Button type="submit">{initial ? "Save changes" : "Create path"}</Button>
    </form>
  );
}
