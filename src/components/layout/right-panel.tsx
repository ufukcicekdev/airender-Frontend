"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, GripVertical, Loader2, X } from "lucide-react";
import { DrawPanel } from "@/components/editor/draw-panel";
import { PaneExpandButton } from "@/components/editor/pane-expand-button";
import { PreviewMediaPane } from "@/components/editor/preview-media-pane";
import { useResizablePanel } from "@/hooks/use-resizable-panel";
import { ImageEditControls } from "@/components/catalog/image-edit-controls";
import { UpscaleControls } from "@/components/catalog/upscale-controls";
import { PromptPresetsPanel } from "@/components/catalog/prompt-presets-panel";
import { VideoCreatorControls } from "@/components/catalog/video-creator-controls";
import { CatalogModelsEmpty } from "@/components/catalog/catalog-models-empty";
import { ModelEnginePanel } from "@/components/catalog/model-engine-panel";
import { ModelPicker } from "@/components/catalog/model-picker";
import { ModelTagBadge } from "@/components/catalog/model-tag-badge";
import { cn } from "@/lib/utils";
import { getCatalogIcon } from "@/lib/catalog-icons";
import { useUIStore, type PreviewTab } from "@/store/ui-store";
import { useEditorStore } from "@/store/editor-store";
import { catalogService } from "@/services/catalog.service";
import { defaultDownloadFilename, isDownloadableMediaUrl } from "@/lib/download-media";
import { normalizeMediaUrl } from "@/lib/media-url";
import { collectCanvasSourceImages } from "@/lib/canvas-input-images";
import { getNodeMediaInfo, nodeCompareLabel } from "@/lib/node-image-url";
import { useEditorMediaDisplay } from "@/hooks/use-editor-media-display";
import { getModelInputRules } from "@/lib/model-input-rules";
import { RP } from "@/lib/right-panel-typography";
import type { CatalogModel, CapabilityCategory, ModelPromptPreset } from "@/types";

const TABS: { id: PreviewTab; label: string }[] = [
  { id: "preview", label: "Preview" },
  { id: "compare", label: "Compare" },
  { id: "draw", label: "Draw" },
];

function applyCategoryDefaults(
  category: CapabilityCategory,
  model: CatalogModel | undefined,
  setBottomPrompt: (v: string) => void,
  setBottomNegativePrompt: (v: string) => void
) {
  const defaultPreset =
    category.prompt_presets.find((p) => p.is_default) ?? category.prompt_presets[0];
  if (defaultPreset) {
    setBottomPrompt(defaultPreset.positive_prompt);
    setBottomNegativePrompt(defaultPreset.negative_prompt);
  } else if (model?.default_positive) {
    setBottomPrompt(model.default_positive);
    setBottomNegativePrompt(model.default_negative ?? "");
  }
}

export function RightPanel() {
  const { width, isResizing, startResize, resetWidth } = useResizablePanel();
  const {
    previewTab,
    setPreviewTab,
    previewDimensions,
    bottomPrompt,
    setBottomPrompt,
    bottomNegativePrompt,
    setBottomNegativePrompt,
    selectedCategorySlug,
    selectedModelSlug,
    setSelectedCategory,
    setSelectedModel,
    compareSlotA,
    compareSlotB,
    compareSplit,
    previewSplit,
    setCompareSplit,
    setPreviewSplit,
    clearCompare,
    setCompareSlotA,
    setCompareSlotB,
  } = useUIStore();

  const projectName = useEditorStore((s) => s.projectName);
  const nodes = useEditorStore((s) => s.nodes);
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const { displayImage, previewMedia, displayProgress, selectedNode } =
    useEditorMediaDisplay();
  const renderStage = useUIStore((s) => s.renderStage);
  const nodeIsRendering =
    selectedNode &&
    (selectedNode.data.status === "processing" ||
      selectedNode.data.status === "queued");

  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["catalog"],
    queryFn: async () => {
      const { data } = await catalogService.list();
      return data;
    },
    staleTime: 60_000,
  });

  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === selectedCategorySlug) ?? categories[0],
    [categories, selectedCategorySlug]
  );

  const selectedModel = useMemo(() => {
    if (!selectedCategory?.models.length) return undefined;
    return (
      selectedCategory.models.find((m) => m.slug === selectedModelSlug) ??
      selectedCategory.models[0]
    );
  }, [selectedCategory, selectedModelSlug]);

  useEffect(() => {
    if (!categories.length) return;
    if (!selectedCategorySlug) {
      const first = categories[0];
      setSelectedCategory(first.slug, first.models[0]?.slug ?? null);
    }
  }, [categories, selectedCategorySlug, setSelectedCategory]);

  useEffect(() => {
    if (!selectedCategory?.models.length || useUIStore.getState().isCanvasDragging) return;
    if (!selectedModelSlug) return;

    const node = nodes.find((n) => n.id === selectedNodeId);
    if (node?.type === "render" || node?.type === "detail") return;

    const fallback = selectedCategory.models[0].slug;
    const valid = selectedCategory.models.some((m) => m.slug === selectedModelSlug);
    if (!valid && selectedModelSlug !== fallback) {
      setSelectedModel(fallback);
    }
  }, [
    selectedCategory?.slug,
    selectedCategorySlug,
    selectedModelSlug,
    selectedNodeId,
    nodes,
    setSelectedModel,
  ]);

  useEffect(() => {
    if (!selectedCategory) return;
    const node = nodes.find((n) => n.id === selectedNodeId);
    // Source + draft sync owns prompts; render nodes sync via useSyncPanelFromNode
    if (node?.type === "source" || node?.type === "render" || node?.type === "detail") {
      return;
    }
    applyCategoryDefaults(
      selectedCategory,
      selectedModel,
      setBottomPrompt,
      setBottomNegativePrompt
    );
  }, [selectedCategory?.id, selectedNodeId, nodes, setBottomPrompt, setBottomNegativePrompt]);

  const inputRules = getModelInputRules(selectedModel, selectedCategory?.slug);
  const canvasImages = collectCanvasSourceImages(nodes);

  const previewDownload = (() => {
    const fromNode = getNodeMediaInfo(selectedNode);
    if (fromNode && isDownloadableMediaUrl(fromNode.url)) {
      const label = selectedNode ? nodeCompareLabel(selectedNode) : "preview";
      return {
        ...fromNode,
        filename: defaultDownloadFilename(
          `${projectName}-${label}`,
          fromNode.kind,
          undefined,
          fromNode.url
        ),
      };
    }
    const url = isDownloadableMediaUrl(displayImage) ? displayImage : null;
    if (!isDownloadableMediaUrl(url)) return null;
    const kind = url.includes(".mp4") || url.includes(".webm") ? "video" as const : "image" as const;
    return {
      url,
      kind,
      filename: defaultDownloadFilename(projectName, kind, undefined, url),
    };
  })();

  const pushPromptToNode = (positive: string, negative?: string) => {
    setBottomPrompt(positive);
    if (negative !== undefined) setBottomNegativePrompt(negative);

    const selected = selectedNodeId
      ? nodes.find((n) => n.id === selectedNodeId)
      : undefined;
    const draftRender = nodes.find(
      (n) => n.type === "render" && n.data.isDraft === true
    );
    const targetId =
      selected?.type === "render" || selected?.type === "detail"
        ? selected.id
        : draftRender?.id ??
          nodes.find((n) => n.type === "render" || n.type === "prompt")?.id;

    if (targetId) {
      updateNodeData(targetId, {
        positive,
        ...(negative !== undefined ? { negative } : {}),
        modelSlug: selectedModel?.slug,
        categorySlug: selectedCategory?.slug,
        inputImages: canvasImages,
      });
      if (targetId !== selectedNodeId) {
        useEditorStore.getState().setSelectedNode(targetId);
      }
    }
  };

  const applyPreset = (
    preset: Pick<ModelPromptPreset, "positive_prompt" | "negative_prompt">
  ) => {
    pushPromptToNode(preset.positive_prompt, preset.negative_prompt ?? "");
  };

  const selectCategory = (cat: CapabilityCategory) => {
    const first = cat.models[0];
    setSelectedCategory(cat.slug, first?.slug ?? null);
    applyCategoryDefaults(cat, first, setBottomPrompt, setBottomNegativePrompt);
  };

  const selectModel = (model: CatalogModel) => {
    setSelectedModel(model.slug);
    const targetId =
      selectedNodeId ||
      nodes.find((n) => n.type === "render" && n.data.isDraft)?.id;
    if (targetId) {
      updateNodeData(targetId, {
        label: model.name,
        model_name: model.name,
        modelSlug: model.slug,
        categorySlug: selectedCategory?.slug,
      });
    }
  };

  return (
    <aside
      style={{ width }}
      className={cn(
        "viz-right-panel relative flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-l border-border/60 bg-[hsl(220,18%,9%)]",
        isResizing && "select-none"
      )}
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        title="Drag to resize · double-click to reset"
        onMouseDown={startResize}
        onDoubleClick={resetWidth}
        className={cn(
          "absolute left-0 top-0 z-30 flex h-full w-2 -translate-x-1/2 cursor-col-resize items-center justify-center",
          "group/resize"
        )}
      >
        <div
          className={cn(
            "flex h-12 w-1.5 items-center justify-center rounded-full transition-colors",
            isResizing
              ? "bg-[hsl(var(--viz-cyan))]"
              : "bg-border/60 group-hover/resize:bg-[hsl(var(--viz-cyan)/0.7)]"
          )}
        >
          <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover/resize:opacity-100" />
        </div>
      </div>
      <div className="flex items-center border-b border-border/60 pr-1">
        <div className="flex min-w-0 flex-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPreviewTab(tab.id)}
              className={cn(
                "flex-1 py-3 text-center text-sm font-semibold transition-colors",
                previewTab === tab.id
                  ? "border-b-2 border-[hsl(var(--viz-cyan))] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <PaneExpandButton className="shrink-0" />
      </div>

      {previewTab === "compare" && (compareSlotA || compareSlotB) && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 px-3 py-2">
          {compareSlotA && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[hsl(var(--viz-cyan)/0.12)] px-2 py-0.5 text-xs text-[hsl(var(--viz-cyan))]">
              A: {compareSlotA.label}
              <button
                type="button"
                className="rounded p-0.5 hover:bg-white/10"
                onClick={() => setCompareSlotA(null)}
                aria-label="Remove A"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {compareSlotB && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[hsl(var(--viz-cyan)/0.12)] px-2 py-0.5 text-xs text-[hsl(var(--viz-cyan))]">
              B: {compareSlotB.label}
              <button
                type="button"
                className="rounded p-0.5 hover:bg-white/10"
                onClick={() => setCompareSlotB(null)}
                aria-label="Remove B"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={clearCompare}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}

      {previewTab === "draw" ? <DrawPanel /> : null}

      {previewTab !== "draw" && (
      <PreviewMediaPane
        mode={previewTab === "compare" ? "compare" : "preview"}
        singleImage={displayImage}
        singleMediaKind={previewMedia.kind}
        isRendering={Boolean(nodeIsRendering)}
        renderStage={renderStage}
        slotA={compareSlotA}
        slotB={compareSlotB}
        split={previewTab === "compare" ? compareSplit : previewSplit}
        onSplitChange={
          previewTab === "compare" ? setCompareSplit : setPreviewSplit
        }
        storageKey={
          previewTab === "compare"
            ? "viz-right-compare-height"
            : "viz-right-preview-height"
        }
        defaultHeight={previewTab === "compare" ? 320 : 280}
        downloadUrl={previewTab === "preview" ? previewDownload?.url : null}
        downloadKind={previewDownload?.kind}
        downloadFilename={previewDownload?.filename}
      />
      )}

      {previewTab !== "draw" && (
      <div className="border-b border-border/60 px-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-[hsl(var(--viz-cyan))] transition-all"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <span className="shrink-0 text-sm text-muted-foreground">
            {displayProgress}% · {previewDimensions}
          </span>
        </div>
      </div>
      )}

      <div className="viz-right-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8">
        {selectedModel && inputRules.showPanel && (
          <div className={cn("border-b border-border/60 py-3", RP.pad, RP.body)}>
            <span className={RP.bodyStrong}>{inputRules.label}</span>
            {" — "}
            Upload a <strong className="text-foreground">Source</strong>, pick a model here —
            a result node appears automatically (like Vizmaker). Press{" "}
            <strong className="text-foreground">Make</strong> to generate.
            {inputRules.min > 0 && (
              <span className="mt-2 block text-sm font-medium text-[hsl(var(--viz-cyan))]">
                This model: at least {inputRules.min} image
                {inputRules.min > 1 ? "s" : ""} on canvas
                {!inputRules.unlimited && inputRules.max > 0
                  ? ` (max ${inputRules.max})`
                  : inputRules.unlimited
                    ? " (no limit)"
                    : ""}
                .
              </span>
            )}
          </div>
        )}

        <details open className="group border-b border-border/60">
          <summary className={RP.sectionSummary}>
            Capability
            <ChevronDown className={RP.sectionChevron} />
          </summary>
          <div className={cn(RP.pad, "pb-4")}>
            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : isError ? (
              <div className={RP.empty}>
                <p>Could not load models.</p>
                <button
                  type="button"
                  className="mt-2 text-sm text-[hsl(var(--viz-cyan))] hover:underline"
                  onClick={() => void refetch()}
                >
                  Retry
                </button>
              </div>
            ) : categories.length === 0 ? (
              <p className={RP.empty}>
                No capabilities yet. Restart the backend or run{" "}
                <code className="rounded bg-secondary px-1 text-xs">
                  python manage.py seed_catalog
                </code>
                .
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const Icon = getCatalogIcon(cat.icon);
                  const active = selectedCategory?.slug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => selectCategory(cat)}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors",
                        active
                          ? "border-[hsl(var(--viz-cyan)/0.6)] bg-[hsl(var(--viz-cyan)/0.1)]"
                          : "border-border/40 bg-[hsl(220,16%,11%)] hover:border-[hsl(var(--viz-cyan)/0.35)]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-8 w-8",
                          active ? "text-[hsl(var(--viz-cyan))]" : "text-foreground/70"
                        )}
                        strokeWidth={1.5}
                      />
                      <span className="text-sm font-semibold leading-snug">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </details>

        {selectedCategory && selectedCategory.models.length === 0 ? (
          <CatalogModelsEmpty categoryName={selectedCategory.name} />
        ) : selectedCategory?.slug === "image-edit" ? (
          <ImageEditControls
            models={selectedCategory.models}
            selectedSlug={selectedModel?.slug}
            onSelectModel={selectModel}
          />
        ) : selectedCategory?.slug === "upscale" ? (
          <UpscaleControls
            models={selectedCategory.models}
            selectedSlug={selectedModel?.slug}
            onSelectModel={selectModel}
          />
        ) : selectedCategory?.slug === "image-to-video" ? (
          <VideoCreatorControls
            models={selectedCategory.models}
            selectedSlug={selectedModel?.slug}
            onSelectModel={selectModel}
          />
        ) : selectedCategory?.slug === "image-generate" ? (
          <ModelEnginePanel
            models={selectedCategory.models}
            selectedSlug={selectedModel?.slug}
            onSelectModel={selectModel}
          />
        ) : selectedCategory?.slug === "3d-model" ? (
          <ModelEnginePanel
            models={selectedCategory.models}
            selectedSlug={selectedModel?.slug}
            onSelectModel={selectModel}
          />
        ) : selectedCategory && selectedCategory.models.length > 0 ? (
          <details open className="group border-b border-border/60">
            <summary className={RP.sectionSummary}>
              Model
              <ChevronDown className={RP.sectionChevron} />
            </summary>
            <div className={cn("space-y-3 pb-4", RP.pad)}>
              <ModelPicker
                models={selectedCategory.models}
                selectedSlug={selectedModel?.slug}
                onSelect={selectModel}
              />
              {selectedModel && (
                <p className={cn(RP.body, "leading-snug")}>
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <span className={RP.bodyStrong}>{selectedModel.name}</span>
                    <ModelTagBadge tag={selectedModel.tag} size="sm" />
                  </span>
                  <span className="mt-2 block">{selectedModel.description}</span>
                  <span className={cn("mt-2 block", RP.metaAccent)}>
                    {selectedModel.credit_cost} credits · {selectedModel.provider || "local"}
                  </span>
                </p>
              )}
            </div>
          </details>
        ) : null}

        <PromptPresetsPanel
          category={selectedCategory}
          panelWidth={width}
          bottomPrompt={bottomPrompt}
          onApply={applyPreset}
        />

        {bottomNegativePrompt ? (
          <div className={cn("border-t border-border/60 py-3", RP.pad)}>
            <p className="text-sm font-semibold text-muted-foreground">Negative prompt</p>
            <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-foreground/80">
              {bottomNegativePrompt}
            </p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
