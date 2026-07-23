import Link from "next/link";
import { login } from "@/app/actions";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-5 py-20">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Welcome back</p>
        <h1 className="mb-8 text-3xl font-bold">Sign in to LogBip</h1>
        <AuthForm action={login} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link className="text-foreground underline" href="/register">
            Create an account
          </Link>
        </p>
      </main>
    </>
  );
}
