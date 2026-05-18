"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  FilePenLine,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/ui/custom-select";
import { getCatalogIcon } from "@/lib/catalog-icons";
import { PRESET_ICON_OPTIONS } from "@/lib/preset-icon-options";
import { cn } from "@/lib/utils";
import { RP } from "@/lib/right-panel-typography";
import { userPresetService } from "@/services/user-preset.service";
import { useAuthStore } from "@/store/auth-store";
import { useToast } from "@/hooks/use-toast";
import type { CapabilityCategory, ModelPromptPreset, UserPromptPreset } from "@/types";

type PresetTab = "catalog" | "mine";

type PresetLike = Pick<
  ModelPromptPreset,
  "positive_prompt" | "negative_prompt"
>;

interface PromptPresetsPanelProps {
  category: CapabilityCategory | undefined;
  panelWidth: number;
  bottomPrompt: string;
  onApply: (preset: PresetLike) => void;
}

interface FormState {
  title: string;
  icon: string;
  positive_prompt: string;
  negative_prompt: string;
}

const emptyForm = (): FormState => ({
  title: "",
  icon: "sparkles",
  positive_prompt: "",
  negative_prompt: "",
});

function presetGridCols(panelWidth: number) {
  if (panelWidth >= 520) return "grid-cols-4";
  if (panelWidth >= 380) return "grid-cols-3";
  return "grid-cols-2";
}

function PresetTile({
  title,
  iconName,
  active,
  onClick,
  onEdit,
  onDelete,
  showActions,
}: {
  title: string;
  iconName: string;
  active: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}) {
  const Icon = getCatalogIcon(iconName);

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={cn(
          "flex aspect-square w-full min-h-[96px] flex-col items-center justify-center gap-2.5 rounded-lg p-3 transition-colors",
          active
            ? "border-2 border-[hsl(var(--viz-cyan)/0.7)] bg-[hsl(var(--viz-cyan)/0.14)]"
            : "border border-[hsl(28,8%,22%)] bg-[hsl(28,9%,15%)] hover:bg-[hsl(28,9%,18%)]"
        )}
      >
        <Icon
          className={cn(
            "h-10 w-10 shrink-0",
            active ? "text-[hsl(var(--viz-cyan))]" : "text-white"
          )}
          strokeWidth={1.5}
        />
        <span
          className={cn(
            "line-clamp-3 w-full px-1 text-center text-sm font-semibold leading-snug",
            active ? "text-white" : "text-white/90"
          )}
        >
          {title}
        </span>
      </button>
      {showActions ? (
        <div className="absolute right-0.5 top-0.5 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="rounded-md bg-black/80 p-1.5 text-foreground hover:bg-[hsl(var(--viz-cyan)/0.35)]"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="rounded-md bg-black/80 p-1.5 text-red-300 hover:bg-red-500/35"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function PromptPresetsPanel({
  category,
  panelWidth,
  bottomPrompt,
  onApply,
}: PromptPresetsPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<PresetTab>("catalog");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const categorySlug = category?.slug ?? "";

  const { data: myPresets = [], isLoading: loadingMine } = useQuery({
    queryKey: ["my-presets", categorySlug],
    queryFn: async () => {
      const { data } = await userPresetService.list(categorySlug);
      return data;
    },
    enabled: Boolean(user && categorySlug && tab === "mine"),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["my-presets", categorySlug] });

  const createMutation = useMutation({
    mutationFn: () =>
      userPresetService.create({
        title: form.title.trim(),
        icon: form.icon,
        positive_prompt: form.positive_prompt.trim(),
        negative_prompt: form.negative_prompt.trim(),
        category_slug: categorySlug,
      }),
    onSuccess: () => {
      invalidate();
      closeForm();
      toast({ title: "Preset saved" });
    },
    onError: () => toast({ title: "Could not save preset", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      userPresetService.update(editingId!, {
        title: form.title.trim(),
        icon: form.icon,
        positive_prompt: form.positive_prompt.trim(),
        negative_prompt: form.negative_prompt.trim(),
      }),
    onSuccess: () => {
      invalidate();
      closeForm();
      toast({ title: "Preset updated" });
    },
    onError: () => toast({ title: "Could not update preset", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userPresetService.delete(id),
    onSuccess: () => {
      invalidate();
      toast({ title: "Preset deleted" });
    },
    onError: () => toast({ title: "Could not delete preset", variant: "destructive" }),
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  useEffect(() => {
    closeForm();
    setTab("catalog");
  }, [categorySlug]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
    setTab("mine");
  };

  const openEdit = (preset: UserPromptPreset) => {
    setEditingId(preset.id);
    setForm({
      title: preset.title,
      icon: preset.icon || "sparkles",
      positive_prompt: preset.positive_prompt,
      negative_prompt: preset.negative_prompt ?? "",
    });
    setFormOpen(true);
    setTab("mine");
  };

  const submitForm = () => {
    if (!form.title.trim() || !form.positive_prompt.trim()) {
      toast({ title: "Title and prompt are required", variant: "destructive" });
      return;
    }
    if (editingId) updateMutation.mutate();
    else createMutation.mutate();
  };

  const gridCols = presetGridCols(panelWidth);
  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <details open className="group">
      <summary className={RP.sectionSummary}>
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Prompt presets
        </span>
        <ChevronDown className={RP.sectionChevron} />
      </summary>

      <div className="grid grid-cols-2 border-b border-border/30">
        <button
          type="button"
          onClick={() => setTab("catalog")}
          className={cn(
            "flex flex-col items-center gap-2 border-b-2 px-2 py-3.5 text-sm font-semibold transition-colors",
            tab === "catalog"
              ? "border-[hsl(var(--viz-cyan))] bg-[hsl(28,8%,13%)] text-foreground"
              : "border-transparent text-muted-foreground hover:bg-[hsl(28,8%,11%)] hover:text-foreground/80"
          )}
        >
          <FileText className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.5} />
          <span>Prompt presets</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("mine")}
          className={cn(
            "flex flex-col items-center gap-2 border-b-2 px-2 py-3.5 text-sm font-semibold transition-colors",
            tab === "mine"
              ? "border-[hsl(var(--viz-cyan))] bg-[hsl(28,8%,13%)] text-foreground"
              : "border-transparent text-muted-foreground hover:bg-[hsl(28,8%,11%)] hover:text-foreground/80"
          )}
        >
          <FilePenLine className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.5} />
          <span className="leading-snug">My presets</span>
        </button>
      </div>

      {tab === "mine" && user ? (
        <div
          className={cn(
            "flex items-center justify-between gap-3 border-b border-border/20 py-3",
            RP.pad
          )}
        >
          <p className="text-sm font-semibold text-foreground/90">{category?.name}</p>
          <Button
            type="button"
            variant="outline"
            className="h-11 min-w-[100px] gap-2 rounded-lg border-border/50 px-4 text-sm font-semibold"
            onClick={openCreate}
          >
            <Plus className="h-5 w-5 shrink-0" strokeWidth={2} />
            Add
          </Button>
        </div>
      ) : null}

      {formOpen && tab === "mine" && user ? (
        <div
          className={cn(
            "mb-2 mt-2 space-y-3 rounded-lg border border-[hsl(var(--viz-cyan)/0.35)] bg-[hsl(220,16%,11%)] p-4",
            RP.pad
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              {editingId ? "Edit preset" : "New preset"}
            </span>
            <button
              type="button"
              onClick={closeForm}
              className="rounded p-0.5 text-muted-foreground hover:bg-white/10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="h-10 border-border/50 bg-[hsl(220,16%,9%)] text-sm"
              placeholder="My style"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Icon</Label>
            <CustomSelect
              value={form.icon}
              onValueChange={(v) => setForm((f) => ({ ...f, icon: v }))}
              options={PRESET_ICON_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              size="panel"
              triggerClassName="h-10 border-border/50 bg-[hsl(220,16%,9%)] text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Prompt</Label>
            <textarea
              value={form.positive_prompt}
              onChange={(e) =>
                setForm((f) => ({ ...f, positive_prompt: e.target.value }))
              }
              rows={3}
              className="w-full resize-none rounded-md border border-border/50 bg-[hsl(220,16%,9%)] px-3 py-2 text-sm text-foreground outline-none focus:border-[hsl(var(--viz-cyan)/0.5)]"
              placeholder="Describe the effect…"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">
              Negative prompt (optional)
            </Label>
            <textarea
              value={form.negative_prompt}
              onChange={(e) =>
                setForm((f) => ({ ...f, negative_prompt: e.target.value }))
              }
              rows={2}
              className="w-full resize-none rounded-md border border-border/50 bg-[hsl(220,16%,9%)] px-3 py-2 text-sm text-foreground outline-none focus:border-[hsl(var(--viz-cyan)/0.5)]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="h-11 px-4 text-sm font-medium"
              onClick={closeForm}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-11 px-5 bg-[hsl(var(--viz-cyan))] text-sm font-semibold text-[hsl(220,25%,6%)] hover:opacity-90"
              disabled={saving}
              onClick={submitForm}
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {editingId ? "Save" : "Add preset"}
            </Button>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "grid max-h-[min(52vh,440px)] gap-2 overflow-y-auto px-2.5 py-2.5",
          gridCols
        )}
      >
        {tab === "catalog" ? (
          !category?.prompt_presets.length ? (
            <p className={cn("col-span-full", RP.empty)}>
              No presets for this capability.
            </p>
          ) : (
            category.prompt_presets.map((preset) => (
              <PresetTile
                key={preset.id}
                title={preset.title}
                iconName={preset.icon}
                active={bottomPrompt === preset.positive_prompt}
                onClick={() => onApply(preset)}
              />
            ))
          )
        ) : !user ? (
          <p className={cn("col-span-full", RP.empty)}>
            Sign in to save your own presets.
          </p>
        ) : loadingMine ? (
          <div className="col-span-full flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : myPresets.length === 0 && !formOpen ? (
          <p className={cn("col-span-full", RP.empty)}>
            No custom presets yet. Use the Add button above to create one.
          </p>
        ) : (
          myPresets.map((preset) => (
            <PresetTile
              key={preset.id}
              title={preset.title}
              iconName={preset.icon}
              active={bottomPrompt === preset.positive_prompt}
              onClick={() => onApply(preset)}
              showActions
              onEdit={() => openEdit(preset)}
              onDelete={() => {
                if (confirm(`Delete "${preset.title}"?`)) {
                  deleteMutation.mutate(preset.id);
                }
              }}
            />
          ))
        )}
      </div>
    </details>
  );
}
