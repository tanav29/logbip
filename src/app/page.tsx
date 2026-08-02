import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Globe2, PenLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { number: "01", icon: PenLine, title: "Name the work", text: "Give a skill, project, or curiosity a clear home." },
  { number: "02", icon: Sparkles, title: "Leave a trace", text: "Capture the small wins that compound into real progress." },
  { number: "03", icon: Globe2, title: "Open the door", text: "Share a simple page that makes your work easy to follow." },
];

export default function Home() {
  return (
    <main>
      <section className="relative isolate overflow-hidden">
        <Image src="/bg.png" alt="Abstract progress texture" fill priority className="-z-10 object-cover brightness-90" />
        <div className="mx-auto grid min-h-[50rem] w-full max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl text-background">
              Make the work<br /><span className="text-[#e7b56b]">visible.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-[#d5e0d8]">
              Log the things you learn, one honest entry at a time. Build a public record of progress without the noise of a social feed.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button size="lg" className="bg-[#e7b56b] text-[#173b36] hover:bg-[#f0c982]" render={<Link href="/new" />}>
                Start a path <ArrowUpRight className="ml-1 size-4" />
              </Button>
              <span className="flex items-center gap-2 text-sm text-[#c5d5cb]"><Check className="size-4 text-[#e7b56b]" /> No noisy feeds</span>
            </div>
          </div>

        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="mx-auto grid w-full max-w-6xl gap-px px-5 py-20 sm:px-8 md:grid-cols-3 md:py-28">
          {steps.map(({ number, icon: Icon, title, text }) => (
            <div key={title} className="border-t border-border pt-5 md:pr-10">
              <div className="flex items-center justify-between"><span className="font-mono text-xs text-muted-foreground">{number}</span><Icon className="size-5 text-accent-foreground" /></div>
              <h2 className="mt-12 text-xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-3 max-w-xs leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col items-start gap-7 px-5 py-24 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-32">
        <div><p className="eyebrow">The next entry</p><h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">Small steps are still a direction.</h2></div>
        <Button size="lg" render={<Link href="/new" />}>Create your path <ArrowUpRight className="ml-1 size-4" /></Button>
      </section>
    </main>
  );
}
