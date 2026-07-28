import Link from "next/link";
import { ArrowRight, Check, Flame, Globe2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
      <section className="relative w-full h-[50rem]">
        <main className="mx-auto max-w-5xl h-full flex items-center justify-start p-5">
          <Image src="/bg.png" alt="Abstract progress background" width={1000} height={1000} className="-z-10 absolute w-full h-full object-cover top-0 left-0 right-0 bottom-0 flex brightness-90 select-none" />
        <div className="h-fit flex flex-col text-background">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">
            Make progress
            <br />
            <span>visible.</span>
          </h1>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" variant={"secondary"} render={<Link href="/new" />}>
              Start your path <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm">
            <Check className="size-4 ml-2" /> No noisy feeds
            <Check className="size-4 ml-2" /> Your work, your pace
          </p>
          </div>
        </main>
      </section>

      <section className="relative border-y border-border bg-muted/30">
        <div className="relative z-10 mx-auto h-[30rem] grid items-center w-full max-w-6xl gap-6 px-5 py-20 md:grid-cols-3">
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
        <Button size="lg" render={<Link href="/new" />}>
          Create an account <ArrowRight className="ml-2" />
        </Button>
      </section>
    </main>
  );
}
