"use client";

import {
  Coins,
  ImagePlus,
  Link2,
  MousePointerClick,
  Sparkles,
  Wand2,
} from "lucide-react";
import { SidebarPanelShell } from "@/components/sidebar/sidebar-panel-shell";
import { APP_NAME } from "@/lib/brand";

const STEPS = [
  {
    icon: ImagePlus,
    title: "Add a source image",
    body: "Use the left toolbar to place a Source node, then upload your photo or render.",
  },
  {
    icon: Wand2,
    title: "Pick a capability",
    body: "In the right panel, choose Image Edit, Video, Upscale, or Generate. Select an engine and preset.",
  },
  {
    icon: Link2,
    title: "Connect & prompt",
    body: "Connect the source to a generation node. Write your prompt in the bar at the bottom.",
  },
  {
    icon: Sparkles,
    title: "Make",
    body: "Click Make (or ⌘ Enter). Credits are shown before each run — buy a pack when you need more.",
  },
  {
    icon: Coins,
    title: "Pay as you go",
    body: "New accounts get trial credits. Purchase 100 / 250 / 500 credit packs from Account — no subscription.",
  },
  {
    icon: MousePointerClick,
    title: "Shortcuts",
    body: "⌘ S save · ⌘ Z undo · ⌘ ⇧ Z redo · ⌘ K command palette · Delete removes selection.",
  },
];

interface TutorialPanelProps {
  onClose?: () => void;
  className?: string;
}

export function TutorialPanel({ onClose, className }: TutorialPanelProps) {
  return (
    <SidebarPanelShell
      title="Quick start"
      subtitle={`How to run your first generation in ${APP_NAME}`}
      onClose={onClose}
      className={className}
    >
      <ol className="space-y-4">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-xl border border-border/60 bg-card/30 p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--viz-cyan)/0.12)] text-[hsl(var(--viz-cyan))]">
              <step.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-[hsl(var(--viz-cyan))]">
                Step {index + 1}
              </p>
              <p className="mt-0.5 font-semibold">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </SidebarPanelShell>
  );
}
