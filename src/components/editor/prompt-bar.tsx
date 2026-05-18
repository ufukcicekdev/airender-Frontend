"use client";

import { AlertCircle, Sparkles } from "lucide-react";
import { cn, formatCredits } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { useMakeGeneration } from "@/hooks/use-make-generation";

interface PromptBarProps {
  onMake: (renderNodeId: string) => void;
}

export function PromptBar({ onMake }: PromptBarProps) {
  const { bottomPrompt, setBottomPrompt, setSidebarSection } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const {
    runMake,
    readiness,
    creditCost,
    userCredits,
    canAfford,
    selectedModel,
    selectedCategory,
  } = useMakeGeneration();

  const handleMake = () => {
    const renderNodeId = runMake();
    if (renderNodeId) onMake(renderNodeId);
  };

  const showCreditWarning =
    Boolean(selectedModel) && readiness.reason === "no_credits";
  const showInputWarning =
    Boolean(selectedModel) &&
    canAfford &&
    !readiness.canMake &&
    readiness.reason !== "no_prompt" &&
    readiness.reason !== "no_model" &&
    readiness.reason !== "no_credits";

  const makeDisabled = !readiness.canMake;

  return (
    <div className="shrink-0 border-t border-border/60 bg-[hsl(220,18%,8%)] px-4 py-3">
      {showCreditWarning ? (
        <div
          role="alert"
          className="mb-2.5 flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-100"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div className="min-w-0 flex-1 leading-snug">
            <p className="font-semibold text-amber-50">Insufficient credits</p>
            <p className="mt-0.5 text-amber-100/90">
              {selectedCategory?.name ?? "This operation"}
              {selectedModel ? ` · ${selectedModel.name}` : ""} requires{" "}
              <strong className="text-amber-50">{formatCredits(creditCost)}</strong>{" "}
              credits. Your balance:{" "}
              <strong className="text-amber-50">{formatCredits(userCredits)}</strong>.
            </p>
            <button
              type="button"
              onClick={() => setSidebarSection("account")}
              className="mt-1.5 inline-block font-medium text-[hsl(var(--viz-cyan))] hover:underline"
            >
              Get more credits →
            </button>
          </div>
        </div>
      ) : null}

      {showInputWarning ? (
        <div
          role="alert"
          className="mb-2.5 flex items-start gap-2.5 rounded-lg border border-[hsl(var(--viz-cyan)/0.35)] bg-[hsl(var(--viz-cyan)/0.08)] px-3.5 py-2.5 text-sm"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--viz-cyan))]" />
          <div className="min-w-0 flex-1 leading-snug text-muted-foreground">
            <p className="font-semibold text-foreground">
              {readiness.title ?? "Source image required"}
            </p>
            <p className="mt-0.5">{readiness.description}</p>
          </div>
        </div>
      ) : null}

      <div className="flex items-stretch gap-0 overflow-hidden rounded-lg border border-border/50 bg-[hsl(220,16%,11%)]">
        <input
          value={bottomPrompt}
          onChange={(e) => setBottomPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !makeDisabled && handleMake()}
          placeholder="Create photorealistic image"
          className="min-h-[52px] flex-1 bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={handleMake}
          disabled={makeDisabled}
          title={
            !selectedModel
              ? "Select a model in the right panel"
              : !canAfford
                ? `Requires ${creditCost} credits (${userCredits} available)`
                : !readiness.canMake
                  ? readiness.description
                  : `Run for ${creditCost} credits`
          }
          className={cn(
            "flex min-w-[120px] flex-col items-center justify-center gap-1 px-5 transition-opacity",
            makeDisabled
              ? "cursor-not-allowed bg-[hsl(var(--viz-cyan)/0.35)] text-[hsl(220,25%,6%)/0.7]"
              : "bg-[hsl(var(--viz-cyan))] text-[hsl(220,25%,6%)] hover:opacity-90"
          )}
        >
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Sparkles className="h-4 w-4" />
            Make
          </span>
          <span className="text-center text-xs leading-tight opacity-95">
            {selectedModel ? (
              <>
                <span className="font-semibold">{formatCredits(creditCost)}</span>
                <span className="opacity-80"> cr · </span>
                <span className="opacity-80">
                  {formatCredits(user?.credits ?? userCredits)} left
                </span>
              </>
            ) : (
              <span className="opacity-80">Select model</span>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
