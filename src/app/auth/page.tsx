import { Check, Sparkles } from "lucide-react";
import { login, register } from "@/app/actions";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthPage() {
  return (
    <main className="relative flex flex-1 items-center overflow-hidden px-5 py-12 sm:py-20">
      <div className="bg-gradient-glow" />
      <div className="relative z-10 mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card/70 shadow-[0_30px_100px_-40px_rgb(0_0_0_/_0.7)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-foreground p-10 text-background lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-background/10 blur-3xl" />
          <div className="relative">
            <div className="mb-12 flex size-11 items-center justify-center rounded-2xl bg-background text-lg font-bold text-foreground shadow-xl">
              L
            </div>
            <p className="flex items-center gap-2 text-sm font-medium text-background/60">
              <Sparkles className="size-4" /> A calmer way to grow
            </p>
            <h1 className="mt-5 max-w-sm text-4xl font-semibold leading-tight tracking-[-0.04em]">
              Make the work you do count.
            </h1>
            <p className="mt-5 max-w-sm leading-7 text-background/65">
              Turn the quiet progress nobody sees into a story you can look back on—and share when
              you&apos;re ready.
            </p>
          </div>
          <div className="relative space-y-4 text-sm text-background/75">
            {[
              "Build a learning habit that lasts",
              "Reflect without noisy feeds",
              "Share your path on your terms",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex size-5 items-center justify-center rounded-full bg-background/15">
                  <Check className="size-3" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </section>
        <section className="p-6 sm:p-10 lg:p-14">
          <div className="mb-8 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-foreground text-sm font-bold text-background">
              L
            </div>
          </div>
          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-primary">Welcome to LogBip</p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">
              Your progress starts here.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sign in to pick up where you left off, or create your free account in a few seconds.
            </p>
          </div>
          <Card className="border-0 bg-transparent p-0 shadow-none">
            <CardContent className="p-0">
              <AuthForm loginAction={login} registerAction={register} />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
