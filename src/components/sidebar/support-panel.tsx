"use client";

import Link from "next/link";
import { ExternalLink, Mail, MessageCircle } from "lucide-react";
import { SidebarPanelShell } from "@/components/sidebar/sidebar-panel-shell";

const FAQ = [
  {
    q: "How do credits work?",
    a: "Each Make deducts credits based on the model and settings (resolution, video length). The cost is shown before you run. Buy packs anytime — they never expire.",
  },
  {
    q: "Why did my render fail?",
    a: "Check the error in History. Common causes: missing source image, insufficient credits, or an invalid model setting. Credits are still deducted only for completed queue submissions — check your balance after failures.",
  },
  {
    q: "Can I use my own API keys?",
    a: "Vizmake runs generations through our Fal.ai integration. Custom API keys are not required for standard use.",
  },
  {
    q: "How do I get more credits?",
    a: "Open Account in the sidebar and buy a 100, 250, or 500 credit pack. New users receive a small trial balance on signup.",
  },
];

interface SupportPanelProps {
  onClose?: () => void;
  className?: string;
}

export function SupportPanel({ onClose, className }: SupportPanelProps) {
  return (
    <SidebarPanelShell
      title="Help & support"
      subtitle="Answers and ways to reach us"
      onClose={onClose}
      className={className}
    >
      <section className="mb-8">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          FAQ
        </h3>
        <ul className="space-y-3">
          {FAQ.map((item) => (
            <li
              key={item.q}
              className="rounded-xl border border-border/60 bg-card/30 p-4"
            >
              <p className="font-medium">{item.q}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Contact
        </h3>
        <a
          href="mailto:support@vizmake.app"
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/30 p-4 transition-colors hover:border-[hsl(var(--viz-cyan)/0.4)]"
        >
          <Mail className="h-5 w-5 text-[hsl(var(--viz-cyan))]" />
          <div>
            <p className="font-medium">Email support</p>
            <p className="text-sm text-muted-foreground">support@vizmake.app</p>
          </div>
        </a>
        <Link
          href="https://fal.ai/models"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/30 p-4 transition-colors hover:border-[hsl(var(--viz-cyan)/0.4)]"
        >
          <ExternalLink className="h-5 w-5 text-[hsl(var(--viz-cyan))]" />
          <div>
            <p className="font-medium">Model documentation</p>
            <p className="text-sm text-muted-foreground">
              Fal.ai model reference (opens in new tab)
            </p>
          </div>
        </Link>
        <div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--viz-cyan)/0.25)] bg-[hsl(var(--viz-cyan)/0.06)] p-4">
          <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--viz-cyan))]" />
          <p className="text-sm text-muted-foreground">
            Include your account email and a screenshot of the error from{" "}
            <strong className="text-foreground">History</strong> when reporting failed
            renders — we respond faster.
          </p>
        </div>
      </section>
    </SidebarPanelShell>
  );
}
