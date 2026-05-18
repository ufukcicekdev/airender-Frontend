"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface ModelBrandIconProps {
  brand?: string | null;
  name?: string;
  className?: string;
}

function BrandTile({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
        className
      )}
      title={title}
    >
      {children}
    </div>
  );
}

/** VizMaker-style brand tiles (CSS-only, no external assets). */
export function ModelBrandIcon({ brand, name, className }: ModelBrandIconProps) {
  const key = brand?.toLowerCase() ?? "";

  if (key === "nano-banana") {
    return (
      <BrandTile className={cn("bg-[#2a2410] text-lg", className)} title={name}>
        🍌
      </BrandTile>
    );
  }

  if (key === "flux") {
    return (
      <BrandTile className={cn("bg-[#1a1c22]", className)} title={name}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path
            d="M12 3 L21 19 H3 Z"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </BrandTile>
    );
  }

  if (key === "gpt") {
    return (
      <BrandTile className={cn("bg-[#1a1c22]", className)} title={name}>
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white/90" aria-hidden>
          <path d="M12 2a5 5 0 0 0-5 5v1.5a3.5 3.5 0 0 0 0 7V17a5 5 0 0 0 10 0v-1.5a3.5 3.5 0 0 0 0-7V7a5 5 0 0 0-5-5zm0 2a3 3 0 0 1 3 3v1.2a1.5 1.5 0 0 1 0 2.6V17a3 3 0 0 1-6 0v-7.2a1.5 1.5 0 0 1 0-2.6V7a3 3 0 0 1 3-3z" />
        </svg>
      </BrandTile>
    );
  }

  if (key === "upscale") {
    return (
      <BrandTile className={cn("bg-[#1a1c22]", className)} title={name}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <rect
            x="5"
            y="5"
            width="14"
            height="14"
            rx="2"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="12" r="3" fill="none" stroke="white" strokeWidth="1.5" />
        </svg>
      </BrandTile>
    );
  }

  if (key === "magnific") {
    return (
      <BrandTile className={cn("bg-[#1a1c22]", className)} title={name}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <defs>
            <linearGradient id="mag" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <path
            d="M12 4 L20 18 H4 Z"
            fill="none"
            stroke="url(#mag)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </BrandTile>
    );
  }

  if (key === "kling") {
    return (
      <BrandTile className={cn("bg-[#1a1c22]", className)} title={name}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <circle cx="9" cy="12" r="5" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="15" cy="12" r="5" fill="none" stroke="white" strokeWidth="1.5" />
        </svg>
      </BrandTile>
    );
  }

  if (key === "seedance" || key === "seedream") {
    return (
      <BrandTile
        className={cn("gap-0.5 bg-[#1a1c22] px-1.5", className)}
        title={name}
      >
        {[0.35, 0.55, 0.75, 0.5].map((h, i) => (
          <span
            key={i}
            className="w-1 rounded-sm bg-gradient-to-t from-cyan-500 to-emerald-400"
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </BrandTile>
    );
  }

  if (key === "runway") {
    return (
      <BrandTile
        className={cn(
          "bg-[#1a1c22] text-[10px] font-bold tracking-tight text-white",
          className
        )}
        title={name}
      >
        RW
      </BrandTile>
    );
  }

  if (key === "veo") {
    return (
      <BrandTile
        className={cn(
          "bg-gradient-to-br from-blue-600/30 to-red-500/20 text-[11px] font-bold text-white",
          className
        )}
        title={name}
      >
        V
      </BrandTile>
    );
  }

  if (key === "meshy") {
    return (
      <BrandTile
        className={cn(
          "bg-[#1e2430] text-[10px] font-bold text-[hsl(var(--viz-cyan))]",
          className
        )}
        title={name}
      >
        M
      </BrandTile>
    );
  }

  if (key === "tripo") {
    return (
      <BrandTile
        className={cn("bg-[#1a2030] text-[10px] font-bold text-sky-300", className)}
        title={name}
      >
        T3
      </BrandTile>
    );
  }

  if (key === "rodin") {
    return (
      <BrandTile
        className={cn("bg-[#221a28] text-[10px] font-bold text-violet-300", className)}
        title={name}
      >
        R
      </BrandTile>
    );
  }

  if (key === "hunyuan") {
    return (
      <BrandTile
        className={cn(
          "bg-gradient-to-br from-blue-900/40 to-cyan-900/30 text-[10px] font-bold text-cyan-200",
          className
        )}
        title={name}
      >
        HY
      </BrandTile>
    );
  }

  if (key === "luma") {
    return (
      <BrandTile
        className={cn(
          "bg-gradient-to-br from-indigo-600/30 to-purple-600/20 text-[10px] font-bold text-indigo-200",
          className
        )}
        title={name}
      >
        Lu
      </BrandTile>
    );
  }

  if (key === "csm") {
    return (
      <BrandTile
        className={cn("bg-[#1c2420] text-[10px] font-bold text-emerald-300", className)}
        title={name}
      >
        CSM
      </BrandTile>
    );
  }

  return (
    <BrandTile
      className={cn("bg-[hsl(220,16%,14%)] text-muted-foreground", className)}
      title={name}
    >
      <Sparkles className="h-4 w-4" strokeWidth={1.5} />
    </BrandTile>
  );
}
