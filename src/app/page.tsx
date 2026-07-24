import Link from "next/link";
import { ArrowRight, Check, Flame, Globe2, PenLine } from "lucide-react";
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
    <main className="relative overflow-hidden">
      <div className="bg-gradient-glow" />
      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-5 pb-20 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-28 lg:pt-28">
        <div>
          <Badge variant="outline" className="mb-6 rounded-full px-3 py-1 text-xs font-medium">
            Learning in public
          </Badge>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] sm:text-7xl">
            Make progress
            <br />
            <span className="gradient-text">visible.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            LogBip turns everyday learning into a public record you can be proud of. Keep your
            momentum, reflect on the work, and share the path as it unfolds.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" render={<Link href="/dashboard" />}>
              Start your path <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="size-4 text-primary" /> Free to start
            <Check className="size-4 text-primary ml-2" /> No noisy feeds
            <Check className="size-4 text-primary ml-2" /> Your work, your pace
          </p>
        </div>
        <Card className="glass-card relative shadow-[0_24px_80px_-32px_rgb(0_0_0_/_0.5)]">
          <CardHeader className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Learning path
                </p>
                <CardTitle className="mt-2 text-2xl font-semibold">Build with TypeScript</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  A daily record of becoming a better builder.
                </p>
              </div>
              <Badge variant="secondary">Public</Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-3 gap-3">
              {[
                ["12", "day streak"],
                ["28", "days logged"],
                ["4", "this week"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-md border border-border bg-background p-4 text-center"
                >
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-3">
              {[
                "Shipped the first typed API route",
                "Refactored the form state",
                "Read about discriminated unions",
              ].map((item, index) => (
                <div
                  key={item}
                  className="group flex items-center gap-4 rounded-md border border-border bg-background p-4 text-sm transition-colors hover:bg-muted"
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform group-hover:scale-110 ${index === 0 ? "bg-primary text-primary-foreground shadow-primary/30" : "bg-muted text-muted-foreground"}`}
                  >
                    <Check className="size-4" />
                  </span>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="relative border-y border-border bg-muted/30">
        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 px-5 py-20 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }) => (
            <div key={title} className="glass-card rounded-lg p-7">
              <div className="flex size-10 items-center justify-center rounded-md bg-muted text-foreground">
                <Icon className="size-6" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-8 px-5 py-32 text-center">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your next small step is enough.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Start a path today and let the record grow with you.
          </p>
        </div>
        <Button size="lg" render={<Link href="/dashboard" />}>
          Create an account <ArrowRight className="ml-2" />
        </Button>
      </section>
    </main>
  );
}
