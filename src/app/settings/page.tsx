import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { updateProfile } from "@/app/actions";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { saved } = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:py-16">
        <p className="text-sm text-muted-foreground">Account</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Profile settings</h1><p className="mt-2 text-muted-foreground">Keep your public identity and account details up to date.</p>
        {saved === "1" && <p className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">Your profile has been updated.</p>}
        <form action={updateProfile} className="mt-8 space-y-6 rounded-xl border p-5 sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-medium">Name<input required minLength={2} name="name" defaultValue={user.name} className="mt-2 h-11 w-full rounded-lg border bg-background px-3" /></label><label className="block text-sm font-medium">Email<input required type="email" name="email" defaultValue={user.email} className="mt-2 h-11 w-full rounded-lg border bg-background px-3" /></label></div>
          <label className="block text-sm font-medium">X / Twitter handle<span className="ml-1 font-normal text-muted-foreground">(optional)</span><div className="mt-2 flex items-center rounded-lg border bg-background"><span className="pl-3 text-muted-foreground">@</span><input name="xAccount" defaultValue={user.xAccount ?? ""} placeholder="yourhandle" className="h-11 w-full bg-transparent px-1 outline-none" /></div></label>
          <label className="block text-sm font-medium">Avatar URL<span className="ml-1 font-normal text-muted-foreground">(optional)</span><input type="url" name="avatar" defaultValue={user.avatar ?? ""} placeholder="https://example.com/avatar.jpg" className="mt-2 h-11 w-full rounded-lg border bg-background px-3" /><span className="mt-1 block text-xs font-normal text-muted-foreground">Use a public image URL. Your avatar is used on shared pages.</span></label>
          <div className="flex justify-end border-t pt-5"><button className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background">Save changes</button></div>
        </form>
      </main>
    </>
  );
}
