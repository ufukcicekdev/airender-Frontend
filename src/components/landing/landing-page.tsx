"use client";

import Link from "next/link";
import {
  ArrowRight,
  GitBranch,
  Image,
  Layers,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_DEMO_EMAIL, APP_NAME } from "@/lib/brand";
import { LandingHeader } from "./landing-header";
// import { PricingSection } from "./pricing-section";

const FEATURES = [
  {
    icon: GitBranch,
    title: "Node workflow editor",
    description:
      "Connect source, prompt, and render nodes on an infinite canvas—like Vizcom, built for your pipeline.",
  },
  {
    icon: Image,
    title: "Image Generate",
    description:
      "Text and sketch to photorealistic visuals with models you manage from the admin panel.",
  },
  {
    icon: Video,
    title: "Image to Video",
    description:
      "Animate still frames with cinematic camera moves—pick a capability, then the right model.",
  },
  {
    icon: Layers,
    title: "Managed catalog",
    description:
      "Capabilities, models, and prompt presets all load from your backend—no hardcoded UI strings.",
  },
  {
    icon: Zap,
    title: "Real-time progress",
    description:
      "WebSocket render updates, credit tracking, and a Make bar tuned for fast iteration.",
  },
  {
    icon: Sparkles,
    title: "Prompt presets",
    description:
      "One-click presets per model—positive and negative prompts synced to your workflow nodes.",
  },
];

const WORKFLOW_STEPS = [
  { step: "01", title: "Upload or sketch", body: "Drop a source image or start from a blank canvas node." },
  { step: "02", title: "Pick capability & model", body: "Choose Image Generate, Video, Edit, or Upscale from the right panel." },
  { step: "03", title: "Refine prompts", body: "Use presets or type in the bottom bar—synced to selected nodes." },
  { step: "04", title: "Make", body: "Hit Make to queue a render and watch progress live on the canvas." },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--viz-cyan) / 0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, hsl(174 50% 30% / 0.15), transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--viz-cyan)/0.3)] bg-[hsl(var(--viz-cyan)/0.08)] px-3 py-1 text-xs font-medium text-[hsl(var(--viz-cyan))]">
              <Sparkles className="h-3.5 w-3.5" />
              AI node workflows for architectural viz
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Design, connect, and{" "}
              <span className="text-[hsl(var(--viz-cyan))]">render</span> in one canvas
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              {APP_NAME} is a visual editor for AI image and video pipelines—manage plans, models, and
              prompts from your dashboard, then ship renders in minutes.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="gap-2 px-8">
                  Log in
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Demo: {APP_DEMO_EMAIL} / demo1234
            </p>
          </div>

          {/* Editor preview mock */}
          <div className="mx-auto mt-16 max-w-4xl rounded-xl border border-border/50 bg-[hsl(220,18%,9%)] p-1 shadow-glass">
            <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs text-muted-foreground">{APP_NAME} — workflow editor</span>
            </div>
            <div className="grid aspect-[16/9] grid-cols-[48px_1fr_200px] gap-0 bg-[hsl(220,22%,5%)]">
              <div className="border-r border-border/40 bg-[hsl(220,18%,8%)]" />
              <div className="relative flex items-center justify-center p-6">
                <div className="absolute left-[12%] top-[30%] h-20 w-28 rounded-lg border border-[hsl(var(--viz-cyan)/0.4)] bg-[hsl(220,16%,12%)] shadow-node" />
                <div className="absolute left-[38%] top-[22%] h-16 w-24 rounded-lg border border-border/60 bg-[hsl(220,16%,11%)]" />
                <div className="absolute right-[18%] top-[28%] h-24 w-32 rounded-lg border border-[hsl(var(--viz-cyan)/0.5)] bg-[hsl(var(--viz-cyan)/0.06)] shadow-node-hover" />
                <svg className="absolute inset-0 h-full w-full opacity-60" aria-hidden>
                  <path
                    d="M 140 120 Q 220 80 280 100"
                    fill="none"
                    stroke="hsl(var(--viz-cyan))"
                    strokeWidth="2"
                    strokeOpacity="0.5"
                  />
                </svg>
              </div>
              <div className="border-l border-border/40 bg-[hsl(220,18%,9%)] p-3">
                <p className="text-[10px] font-medium text-muted-foreground">Capability</p>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {["Image", "Video"].map((l) => (
                    <div
                      key={l}
                      className="rounded border border-[hsl(var(--viz-cyan)/0.3)] bg-[hsl(var(--viz-cyan)/0.08)] px-1.5 py-1 text-[8px]"
                    >
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 border-t border-border/40 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to ship visuals
            </h2>
            <p className="mt-4 text-muted-foreground">
              From login to render—a full stack with Django admin for billing and catalog control.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border/50 bg-card/30 p-6 transition-colors hover:border-[hsl(var(--viz-cyan)/0.35)]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--viz-cyan)/0.12)]">
                  <Icon className="h-5 w-5 text-[hsl(var(--viz-cyan))]" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="scroll-mt-24 border-t border-border/40 bg-[hsl(220,20%,6%)] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How it works
              </h2>
              <p className="mt-4 text-muted-foreground">
                A simple flow from idea to output—no code required for artists and viz teams.
              </p>
              <Link href="/login" className="mt-8 inline-block">
                <Button className="gap-2">
                  Log in <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <ol className="space-y-6">
              {WORKFLOW_STEPS.map((item) => (
                <li
                  key={item.step}
                  className="flex gap-4 rounded-xl border border-border/40 bg-card/20 p-5"
                >
                  <span className="text-2xl font-bold text-[hsl(var(--viz-cyan)/0.5)]">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Pricing hidden — manual billing */}
      {/* <PricingSection /> */}

      {/* CTA */}
      <section className="border-t border-border/40 py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">Ready to open the editor?</h2>
          <p className="mt-4 text-muted-foreground">
            Log in with your assigned account to explore the full workflow.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {APP_NAME}</p>
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
