import { create } from "zustand";
import type {
  ImageEditAspectRatio,
  ImageEditPriority,
  ImageEditResolution,
} from "@/lib/image-edit-settings";
import type {
  VideoAspectRatio,
  VideoDuration,
  VideoResolution,
} from "@/lib/video-creator-settings";
import type { UpscaleMaxOutput, UpscaleScale } from "@/lib/upscale-settings";
import type { ModelInputImage } from "@/types";

export type SidebarSection =
  | "editor"
  | "history"
  | "account"
  | "tutorial"
  | "support"
  | "settings";

export type PreviewTab = "preview" | "compare" | "draw";

export type CompareSlot = {
  nodeId: string;
  imageUrl: string;
  label: string;
};

export type DrawTarget = CompareSlot;

export type DrawTool = "brush" | "eraser";

interface UIState {
  sidebarSection: SidebarSection;
  previewTab: PreviewTab;
  commandPaletteOpen: boolean;
  bottomPrompt: string;
  bottomNegativePrompt: string;
  selectedCategorySlug: string | null;
  selectedModelSlug: string | null;
  modelInputImages: ModelInputImage[];
  renderMode: string;
  serverConnected: boolean;
  renderProgress: number;
  renderStage: string;
  previewDimensions: string;
  imageEditPriority: ImageEditPriority;
  imageEditResolution: ImageEditResolution;
  imageEditAspectRatio: ImageEditAspectRatio;
  videoDuration: VideoDuration;
  videoResolution: VideoResolution;
  videoAspectRatio: VideoAspectRatio;
  videoGenerateAudio: boolean;
  upscaleScale: UpscaleScale;
  upscaleMaxOutput: UpscaleMaxOutput;
  showCanvasDots: boolean;
  compareSlotA: CompareSlot | null;
  compareSlotB: CompareSlot | null;
  compareSplit: number;
  previewSplit: number;
  drawTarget: DrawTarget | null;
  drawTool: DrawTool;
  drawBrushSize: number;
  mediaWorkspaceExpanded: boolean;
  /** True while a canvas node is being dragged — pauses panel↔node sync loops. */
  isCanvasDragging: boolean;
  /** Incremented to place a new group at viewport center (FlowCanvas). */
  groupCreateSignal: number;
  requestNewGroup: () => void;
  setSidebarSection: (section: SidebarSection) => void;
  setPreviewTab: (tab: PreviewTab) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setBottomPrompt: (prompt: string) => void;
  setBottomNegativePrompt: (prompt: string) => void;
  /** Pass modelSlug to set category + model atomically (avoids Select re-render loops). */
  setSelectedCategory: (slug: string, modelSlug?: string | null) => void;
  setSelectedModel: (slug: string) => void;
  addModelInputImage: (image: ModelInputImage) => void;
  removeModelInputImage: (id: string) => void;
  setModelInputImages: (images: ModelInputImage[]) => void;
  setRenderMode: (mode: string) => void;
  setServerConnected: (connected: boolean) => void;
  setRenderProgress: (progress: number) => void;
  setRenderStage: (stage: string) => void;
  setImageEditPriority: (priority: ImageEditPriority) => void;
  setImageEditResolution: (resolution: ImageEditResolution) => void;
  setImageEditAspectRatio: (ratio: ImageEditAspectRatio) => void;
  setVideoDuration: (duration: VideoDuration) => void;
  setVideoResolution: (resolution: VideoResolution) => void;
  setVideoAspectRatio: (ratio: VideoAspectRatio) => void;
  setVideoGenerateAudio: (enabled: boolean) => void;
  setUpscaleScale: (scale: UpscaleScale) => void;
  setUpscaleMaxOutput: (maxOutput: UpscaleMaxOutput) => void;
  setShowCanvasDots: (show: boolean) => void;
  toggleCanvasDots: () => void;
  setCompareSlotA: (slot: CompareSlot | null) => void;
  setCompareSlotB: (slot: CompareSlot | null) => void;
  clearCompare: () => void;
  setCompareSplit: (split: number) => void;
  setPreviewSplit: (split: number) => void;
  setDrawTarget: (target: DrawTarget | null) => void;
  setDrawTool: (tool: DrawTool) => void;
  setDrawBrushSize: (size: number) => void;
  setMediaWorkspaceExpanded: (expanded: boolean) => void;
  setCanvasDragging: (dragging: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarSection: "editor",
  previewTab: "preview",
  commandPaletteOpen: false,
  bottomPrompt: "Create photorealistic image",
  bottomNegativePrompt: "",
  selectedCategorySlug: null,
  selectedModelSlug: null,
  modelInputImages: [],
  renderMode: "2. Details editor",
  serverConnected: true,
  renderProgress: 36,
  renderStage: "",
  previewDimensions: "1024 × 494",
  imageEditPriority: "standard",
  imageEditResolution: "1k",
  imageEditAspectRatio: "original",
  videoDuration: "4",
  videoResolution: "1080p",
  videoAspectRatio: "9:16",
  videoGenerateAudio: false,
  upscaleScale: "4",
  upscaleMaxOutput: "auto",
  showCanvasDots: true,
  compareSlotA: null,
  compareSlotB: null,
  compareSplit: 50,
  previewSplit: 50,
  drawTarget: null,
  drawTool: "brush",
  drawBrushSize: 24,
  mediaWorkspaceExpanded: false,
  isCanvasDragging: false,
  setSidebarSection: (sidebarSection) => set({ sidebarSection }),
  setPreviewTab: (previewTab) => set({ previewTab }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setBottomPrompt: (bottomPrompt) => set({ bottomPrompt }),
  setBottomNegativePrompt: (bottomNegativePrompt) => set({ bottomNegativePrompt }),
  setSelectedCategory: (selectedCategorySlug, modelSlug) =>
    set({
      selectedCategorySlug,
      selectedModelSlug:
        modelSlug !== undefined ? modelSlug : null,
    }),
  setSelectedModel: (selectedModelSlug) => set({ selectedModelSlug }),
  addModelInputImage: (image) =>
    set((s) => ({ modelInputImages: [...s.modelInputImages, image] })),
  removeModelInputImage: (id) =>
    set((s) => ({
      modelInputImages: s.modelInputImages.filter((img) => img.id !== id),
    })),
  setModelInputImages: (modelInputImages) => set({ modelInputImages }),
  setRenderMode: (renderMode) => set({ renderMode }),
  setServerConnected: (serverConnected) => set({ serverConnected }),
  setRenderProgress: (renderProgress) => set({ renderProgress }),
  setRenderStage: (renderStage) => set({ renderStage }),
  setImageEditPriority: (imageEditPriority) => set({ imageEditPriority }),
  setImageEditResolution: (imageEditResolution) => set({ imageEditResolution }),
  setImageEditAspectRatio: (imageEditAspectRatio) => set({ imageEditAspectRatio }),
  setVideoDuration: (videoDuration) => set({ videoDuration }),
  setVideoResolution: (videoResolution) => set({ videoResolution }),
  setVideoAspectRatio: (videoAspectRatio) => set({ videoAspectRatio }),
  setVideoGenerateAudio: (videoGenerateAudio) => set({ videoGenerateAudio }),
  setUpscaleScale: (upscaleScale) => set({ upscaleScale }),
  setUpscaleMaxOutput: (upscaleMaxOutput) => set({ upscaleMaxOutput }),
  setShowCanvasDots: (showCanvasDots) => set({ showCanvasDots }),
  toggleCanvasDots: () => set((s) => ({ showCanvasDots: !s.showCanvasDots })),
  setCompareSlotA: (compareSlotA) => set({ compareSlotA }),
  setCompareSlotB: (compareSlotB) => set({ compareSlotB }),
  clearCompare: () => set({ compareSlotA: null, compareSlotB: null }),
  setCompareSplit: (compareSplit) => set({ compareSplit }),
  setPreviewSplit: (previewSplit) => set({ previewSplit }),
  setDrawTarget: (drawTarget) => set({ drawTarget }),
  setDrawTool: (drawTool) => set({ drawTool }),
  setDrawBrushSize: (drawBrushSize) => set({ drawBrushSize }),
  setMediaWorkspaceExpanded: (mediaWorkspaceExpanded) =>
    set({ mediaWorkspaceExpanded }),
  setCanvasDragging: (isCanvasDragging) => set({ isCanvasDragging }),
  groupCreateSignal: 0,
  requestNewGroup: () =>
    set((s) => ({ groupCreateSignal: s.groupCreateSignal + 1 })),
}));
