"use client";

import type { Edge } from "@xyflow/react";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/store/ui-store";
import { useEditorStore, type EditorNode } from "@/store/editor-store";
import { catalogService } from "@/services/catalog.service";
import {
  buildGenerationEdges,
  buildGenerationRenderNode,
  countCommittedGenerationsFromSource,
  defaultGenerationPosition,
  findDraftRenderForSource,
} from "@/lib/generation-nodes";
import { imageEditSettingsPayload } from "@/lib/image-edit-settings";
import { upscaleSettingsPayload } from "@/lib/upscale-settings";
import { videoCreatorSettingsPayload } from "@/lib/video-creator-settings";
import type { ModelInputImage } from "@/types";

function resolveDraftSource(
  nodes: EditorNode[],
  selectedNodeId: string | null
): EditorNode | undefined {
  const selected = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : undefined;
  if (selected?.type === "source") return selected;

  const sources = nodes.filter((n) => n.type === "source");
  if (sources.length === 1) return sources[0];

  const withImage = sources.filter((n) => n.data?.imageUrl);
  if (withImage.length === 1) return withImage[0];

  return sources[sources.length - 1];
}

function buildDraftPayload(
  model: { slug: string; name: string },
  category: { slug: string },
  bottomPrompt: string,
  bottomNegativePrompt: string,
  inputImages: ModelInputImage[],
  categorySettings: Record<string, unknown>
) {
  return {
    label: model.name,
    positive: bottomPrompt,
    negative: bottomNegativePrompt,
    modelSlug: model.slug,
    categorySlug: category.slug,
    model_name: model.name,
    steps: 30,
    inputImages,
    isDraft: true,
    status: "idle" as const,
    ...categorySettings,
  };
}

function draftSyncFingerprint(
  source: EditorNode,
  modelSlug: string,
  categorySlug: string,
  bottomPrompt: string,
  bottomNegativePrompt: string,
  slotIndex: number,
  categorySettings: Record<string, unknown>,
  imageUrl: string
): string {
  return JSON.stringify({
    sourceId: source.id,
    sx: Math.round(source.position.x),
    sy: Math.round(source.position.y),
    modelSlug,
    categorySlug,
    bottomPrompt,
    bottomNegativePrompt,
    slotIndex,
    imageUrl,
    categorySettings,
  });
}

function computeCanvasDraftSig(
  nodes: EditorNode[],
  edges: Edge[],
  selectedNodeId: string | null
): string {
  const source = resolveDraftSource(nodes, selectedNodeId);
  if (!source) return "";
  const slot = countCommittedGenerationsFromSource(source.id, nodes, edges);
  return `${source.id}:${source.data?.imageUrl ?? ""}:${Math.round(source.position.x)}:${Math.round(source.position.y)}:${slot}`;
}

/**
 * Transparent preview node: source selected + model on the right panel.
 * Stays see-through until Make; each Make adds a separate solid node below/after.
 */
export function useSyncDraftGenerationNode() {
  const canvasDraftSig = useEditorStore((s) =>
    computeCanvasDraftSig(s.nodes, s.edges, s.selectedNodeId)
  );
  const draftSyncVersion = useEditorStore((s) => s.draftSyncVersion);
  const lastSyncedKey = useRef<string | null>(null);

  useEffect(() => {
    lastSyncedKey.current = null;
  }, [draftSyncVersion]);

  const {
    selectedModelSlug,
    selectedCategorySlug,
    bottomPrompt,
    bottomNegativePrompt,
    imageEditPriority,
    imageEditResolution,
    imageEditAspectRatio,
    videoDuration,
    videoResolution,
    videoAspectRatio,
    videoGenerateAudio,
    upscaleScale,
    upscaleMaxOutput,
  } = useUIStore();

  const { data: categories = [] } = useQuery({
    queryKey: ["catalog"],
    queryFn: async () => {
      const { data } = await catalogService.list();
      return data;
    },
  });

  useEffect(() => {
    if (!categories.length) return;

    const { nodes, edges, spawnGeneration, updateNodeData } =
      useEditorStore.getState();

    const categorySlug =
      selectedCategorySlug ?? categories[0]?.slug ?? null;
    const category = categories.find((c) => c.slug === categorySlug);
    const modelSlug =
      selectedModelSlug ?? category?.models[0]?.slug ?? null;
    const model = category?.models.find((m) => m.slug === modelSlug);
    if (!category || !model) return;

    const source = resolveDraftSource(
      nodes,
      useEditorStore.getState().selectedNodeId
    );
    if (!source) return;

    const slotIndex = countCommittedGenerationsFromSource(
      source.id,
      nodes,
      edges
    );

    const imageUrl = source.data?.imageUrl ? String(source.data.imageUrl) : "";
    const inputImages: ModelInputImage[] = imageUrl
      ? [
          {
            id: source.id,
            url: imageUrl,
            thumbnailUrl: source.data.thumbnailUrl
              ? String(source.data.thumbnailUrl)
              : undefined,
            name: source.data.label ? String(source.data.label) : undefined,
          },
        ]
      : [];

    const categorySettings =
      categorySlug === "image-edit"
        ? imageEditSettingsPayload(
            imageEditPriority,
            imageEditResolution,
            imageEditAspectRatio
          )
        : categorySlug === "image-to-video"
          ? videoCreatorSettingsPayload(
              videoDuration,
              videoResolution,
              videoAspectRatio,
              videoGenerateAudio
            )
          : categorySlug === "upscale"
            ? upscaleSettingsPayload(upscaleScale, upscaleMaxOutput)
            : { aspect_ratio: "16:9" };

    const syncKey = draftSyncFingerprint(
      source,
      model.slug,
      category.slug,
      bottomPrompt,
      bottomNegativePrompt,
      slotIndex,
      categorySettings,
      imageUrl
    );

    if (lastSyncedKey.current === syncKey) return;

    const payload = buildDraftPayload(
      model,
      category,
      bottomPrompt,
      bottomNegativePrompt,
      inputImages,
      categorySettings
    );

    const existingDraft = findDraftRenderForSource(source.id, nodes, edges);

    if (existingDraft) {
      // Only update prompt/model — never reset user-dragged position.
      updateNodeData(existingDraft.id, payload);
      lastSyncedKey.current = syncKey;
      return;
    }

    const position = defaultGenerationPosition(source, slotIndex);

    const node = buildGenerationRenderNode({
      sourceNodes: [source],
      generationIndex: slotIndex,
      positive: bottomPrompt,
      negative: bottomNegativePrompt,
      modelSlug: model.slug,
      categorySlug: category.slug,
      inputImages,
      modelName: model.name,
      isDraft: true,
    });
    node.id = `draft-preview-${source.id}`;
    node.position = position;
    node.data = { ...node.data, ...categorySettings };

    const newEdges = buildGenerationEdges([source], node.id, true);
    spawnGeneration(node, newEdges);
    lastSyncedKey.current = syncKey;
  }, [
    canvasDraftSig,
    draftSyncVersion,
    selectedModelSlug,
    selectedCategorySlug,
    bottomPrompt,
    bottomNegativePrompt,
    imageEditPriority,
    imageEditResolution,
    imageEditAspectRatio,
    videoDuration,
    videoResolution,
    videoAspectRatio,
    videoGenerateAudio,
    upscaleScale,
    upscaleMaxOutput,
    categories,
  ]);
}
