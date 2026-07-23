import Link from "next/link";
import { register } from "@/app/actions";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-5 py-20">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Start your public learning log
        </p>
        <h1 className="mb-8 text-3xl font-bold">Create your account</h1>
        <AuthForm action={register} register />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="text-foreground underline" href="/login">
            Sign in
          </Link>
        </p>
      </main>
    </>
  );
}
