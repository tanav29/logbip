import Link from "next/link";
import { savePath } from "@/app/actions";
import { SiteHeader } from "@/components/site-header";
export default function NewPath() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-5 py-10">
        <Link href="/dashboard" className="text-sm text-muted-foreground">
          ← Dashboard
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Create a learning path</h1>
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
    <form action={savePath} className="mt-8 space-y-5">
      <input type="hidden" name="id" value={initial?.id ?? ""} />
      <label className="block text-sm font-medium">
        Title
        <input
          required
          name="title"
          defaultValue={initial?.title}
          className="mt-1 h-11 w-full rounded-lg border bg-background px-3"
          placeholder="e.g. Learn TypeScript"
        />
      </label>
      <label className="block text-sm font-medium">
        Description<span className="ml-1 font-normal text-muted-foreground">(optional)</span>
        <textarea
          name="description"
          defaultValue={initial?.description ?? ""}
          rows={4}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
          placeholder="What are you working toward?"
        />
      </label>
      <label className="block text-sm font-medium">
        Public URL
        <input
          required
          name="slug"
          defaultValue={initial?.slug}
          className="mt-1 h-11 w-full rounded-lg border bg-background px-3"
          placeholder="learn-typescript"
        />
        <span className="mt-1 block text-xs text-muted-foreground">
          Letters, numbers, and hyphens. This is the link you share.
        </span>
      </label>
      <label className="flex items-start gap-3 rounded-lg border p-4 text-sm">
        <input
          type="checkbox"
          name="isPublic"
          defaultChecked={initial?.isPublic ?? true}
          className="mt-0.5 size-4"
        />
        <span>
          <span className="font-medium">Make this path public</span>
          <span className="mt-1 block text-muted-foreground">
            Anyone with the link can see its entries.
          </span>
        </span>
      </label>
      <button className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background">
        {initial ? "Save changes" : "Create path"}
      </button>
    </form>
  );
}
