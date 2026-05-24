"use client";

import { useEffect } from "react";
import { Minimize2, X } from "lucide-react";
import { DrawPanel } from "@/components/editor/draw-panel";
import { PreviewMediaPane } from "@/components/editor/preview-media-pane";
import { DownloadMediaButton } from "@/components/editor/download-media-button";
import { useEditorMediaDisplay } from "@/hooks/use-editor-media-display";
import { useEditorStore } from "@/store/editor-store";
import { defaultDownloadFilename, isDownloadableMediaUrl } from "@/lib/download-media";
import { getNodeMediaInfo } from "@/lib/node-image-url";
import { cn } from "@/lib/utils";
import { useUIStore, type PreviewTab } from "@/store/ui-store";

const TAB_LABELS: Record<PreviewTab, string> = {
  preview: "Preview",
  compare: "Compare",
  draw: "Draw",
};

export function MediaWorkspaceOverlay() {
  const mediaWorkspaceExpanded = useUIStore((s) => s.mediaWorkspaceExpanded);
  const setMediaWorkspaceExpanded = useUIStore(
    (s) => s.setMediaWorkspaceExpanded
  );
  const previewTab = useUIStore((s) => s.previewTab);
  const setPreviewTab = useUIStore((s) => s.setPreviewTab);
  const {
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
  const { displayImage, previewMedia, selectedNode } = useEditorMediaDisplay();
  const renderStage = useUIStore((s) => s.renderStage);
  const nodeIsRendering =
    selectedNode &&
    (selectedNode.data.status === "processing" ||
      selectedNode.data.status === "queued");
  const projectName = useEditorStore((s) => s.projectName);
  const previewDownload = (() => {
    const fromNode = getNodeMediaInfo(selectedNode);
    if (fromNode && isDownloadableMediaUrl(fromNode.url)) {
      return {
        ...fromNode,
        filename: defaultDownloadFilename(projectName, fromNode.kind, undefined, fromNode.url),
      };
    }
    if (!isDownloadableMediaUrl(displayImage)) return null;
    const kind =
      previewMedia.kind ??
      (displayImage.includes(".mp4") || displayImage.includes(".webm")
        ? ("video" as const)
        : /\.(glb|gltf|obj|fbx)(\?|$)/i.test(displayImage)
          ? ("model3d" as const)
          : ("image" as const));
    return {
      url: displayImage,
      kind,
      filename: defaultDownloadFilename(projectName, kind, undefined, displayImage),
    };
  })();

  useEffect(() => {
    if (!mediaWorkspaceExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMediaWorkspaceExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mediaWorkspaceExpanded, setMediaWorkspaceExpanded]);

  if (!mediaWorkspaceExpanded) return null;

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col bg-[hsl(220,20%,6%)]"
      role="dialog"
      aria-label={`${TAB_LABELS[previewTab]} workspace`}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-3 py-2">
        <div className="flex flex-1 gap-1">
          {(Object.keys(TAB_LABELS) as PreviewTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setPreviewTab(tab)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                previewTab === tab
                  ? "bg-[hsl(var(--viz-cyan)/0.15)] text-[hsl(var(--viz-cyan))]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
        {previewTab !== "draw" && previewDownload && (
          <DownloadMediaButton
            url={previewDownload.url}
            kind={previewDownload.kind}
            filename={previewDownload.filename}
            label="Download"
          />
        )}
        <button
          type="button"
          title="Minimize (Esc)"
          onClick={() => setMediaWorkspaceExpanded(false)}
          className="flex h-9 items-center gap-1.5 rounded-md border border-border/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <Minimize2 className="h-4 w-4" />
          Minimize
        </button>
      </div>

      {previewTab === "compare" && (compareSlotA || compareSlotB) && (
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border/40 px-4 py-2">
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {previewTab === "draw" ? (
          <DrawPanel layout="workspace" />
        ) : (
          <PreviewMediaPane
            layout="workspace"
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
            downloadUrl={previewTab === "preview" ? previewDownload?.url : null}
            downloadKind={previewDownload?.kind}
            downloadFilename={previewDownload?.filename}
          />
        )}
      </div>
    </div>
  );
}
