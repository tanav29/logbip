import Link from "next/link";
import { ArrowRight, Check, Flame, Globe2, PenLine } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    icon: PenLine,
    title: "Choose a path",
    text: "Give a skill, project, or curiosity a clear home.",
  },
  {
    icon: Flame,
    title: "Show up daily",
    text: "Capture the small wins that compound into real progress.",
  },
  {
    icon: Globe2,
    title: "Share the journey",
    text: "Publish a simple page that makes your work easy to follow.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-16 px-5 pb-20 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-28 lg:pt-28">
          <div>
            <Badge variant="outline" className="mb-6 rounded-full px-3 py-1 text-xs font-normal">
              A calmer way to learn in public
            </Badge>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] sm:text-7xl">
              Make progress
              <br />
              visible.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              LogBip turns everyday learning into a public record you can be proud of. Keep your
              momentum, reflect on the work, and share the path as it unfolds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" render={<Link href="/register" />}>
                Start your path <ArrowRight />
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/login" />}>
                Sign in
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free to start · No noisy feeds · Your work, your pace
            </p>
          </div>
          <div className="relative rounded-2xl border border-border/80 bg-muted/20 p-3 sm:p-5">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Learning path</p>
                    <CardTitle className="mt-1 text-2xl">Build with TypeScript</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      A daily record of becoming a better builder.
                    </p>
                  </div>
                  <Badge variant="secondary">Public</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["12", "day streak"],
                    ["28", "days logged"],
                    ["4", "this week"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-lg bg-muted/70 p-3">
                      <p className="text-xl font-semibold">{value}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    "Shipped the first typed API route",
                    "Refactored the form state",
                    "Read about discriminated unions",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                    >
                      <span
                        className={`flex size-6 items-center justify-center rounded-full ${index === 0 ? "bg-foreground text-background" : "bg-muted"}`}
                      >
                        <Check className="size-3.5" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        <section className="border-y border-border/80 bg-muted/20">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <div className="flex size-8 items-center justify-center rounded-full border border-border bg-background">
                  <Icon className="size-4" />
                </div>
                <h2 className="mt-4 font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-5 py-16 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Your next small step is enough.
            </h2>
            <p className="mt-2 text-muted-foreground">
              Start a path today and let the record grow with you.
            </p>
          </div>
          <Button render={<Link href="/register" />}>
            Create an account <ArrowRight />
          </Button>
        </section>
      </main>
    </>
  );
}
