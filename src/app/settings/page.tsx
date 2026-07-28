import { redirect } from "next/navigation";
import Link from "next/link";
import { logout, submitFeedback, updateProfile } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; feedback?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  const user = session?.user;
  const { saved, feedback } = await searchParams;
  return (
      <main className="mx-auto w-full max-w-4xl p-5">
        <h1 className="text-2xl mt-6 font-semibold">Profile settings</h1>
        <Button
          variant="link"
          className="mt-2 h-auto px-0"
          render={<Link href={`/u/${user.id}`} target="_blank" />}
        >
          View your public profile ↗
        </Button>
        {saved === "1" && (
          <Badge variant="success" className="mt-6">
            Your profile has been updated.
          </Badge>
        )}
        {feedback === "1" && (
          <Badge variant="success" className="mt-6">
            Thanks for sharing your feedback.
          </Badge>
        )}
          <form action={updateProfile} className="space-y-6 my-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Label className="grid gap-2">
                Name
                <Input required minLength={2} name="name" defaultValue={user.name} />
              </Label>
              <Label className="grid gap-2">
                Email
                <Input required type="email" name="email" defaultValue={user.email} />
              </Label>
            </div>
            <Label className="grid gap-2">
              X / Twitter handle{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
              <div className="flex items-center rounded-lg border bg-background">
                <span className="pl-3 text-muted-foreground">@</span>
                <Input
                  name="xAccount"
                  defaultValue={user.xAccount ?? ""}
                  placeholder="yourhandle"
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
            </Label>
            <Label className="grid gap-2">
              Avatar URL <span className="font-normal text-muted-foreground">(optional)</span>
              <Input
                type="url"
                name="avatar"
                defaultValue={user.avatar ?? ""}
                placeholder="https://example.com/avatar.jpg"
              />
              <span className="text-xs font-normal text-muted-foreground">
                Use a public image URL. Your avatar is used on shared pages.
              </span>
            </Label>
            <div className="flex justify-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
          <h2 className="font-semibold">Share feedback</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us what is working, what is confusing, or what you would like to see next.
          </p>
          <form action={submitFeedback} className="mt-5 space-y-4">
            <Label className="grid gap-2">
              Your feedback
              <Textarea name="message" required minLength={3} maxLength={2000} rows={5} />
            </Label>
            <div className="flex justify-end">
              <Button type="submit">Send feedback</Button>
            </div>
          </form>
        <div className="mt-8 flex justify-end">
          <form action={logout}>
            <Button type="submit" variant="outline">
              Log out
            </Button>
          </form>
        </div>
      </main>
  );
}
