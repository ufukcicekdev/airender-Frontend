import type { MediaKind } from "@/lib/download-media";
import type { EditorNode } from "@/store/editor-store";

const VIDEO_SUFFIXES = [".mp4", ".webm", ".mov", ".m4v"];
const MODEL3D_SUFFIXES = [".glb", ".gltf", ".obj", ".fbx"];
const IMAGE_SUFFIXES = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

export function looksLikeVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const path = url.split("?")[0].toLowerCase();
  return VIDEO_SUFFIXES.some((suffix) => path.endsWith(suffix));
}

export function looksLikeModel3dUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const path = url.split("?")[0].toLowerCase();
  return MODEL3D_SUFFIXES.some((suffix) => path.endsWith(suffix));
}

/** GLB/GLTF can be rotated in the embedded viewer; OBJ/FBX are download-only here. */
export function isModel3dPreviewable(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("data:model/gltf-binary")) return true;
  const path = url.split("?")[0].toLowerCase();
  return path.endsWith(".glb") || path.endsWith(".gltf");
}

export function looksLikeImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("data:image/")) return true;
  const path = url.split("?")[0].toLowerCase();
  return IMAGE_SUFFIXES.some((suffix) => path.endsWith(suffix));
}

export function isMeshMediaUrl(url: string | null | undefined): boolean {
  return isModel3dPreviewable(url) || looksLikeModel3dUrl(url);
}

export function inferMediaKind(
  url: string | null | undefined,
  node?: EditorNode
): MediaKind {
  if (node?.data?.modelUrl && isMeshMediaUrl(String(node.data.modelUrl))) {
    return "model3d";
  }
  if (String(node?.data?.outputType || "").toLowerCase() === "model3d") {
    if (isMeshMediaUrl(url) || isMeshMediaUrl(String(node?.data?.modelUrl || ""))) {
      return "model3d";
    }
  }
  if (node?.data?.categorySlug === "3d-model") {
    if (looksLikeModel3dUrl(url) || looksLikeModel3dUrl(String(node.data.modelUrl || ""))) {
      return "model3d";
    }
  }
  if (node?.data?.videoUrl) return "video";
  if (String(node?.data?.outputType || "").toLowerCase() === "video") return "video";
  if (node?.data?.categorySlug === "image-to-video") return "video";
  if (looksLikeVideoUrl(url)) return "video";
  if (looksLikeModel3dUrl(url)) return "model3d";
  if (
    url &&
    url.includes("/api/render/") &&
    url.endsWith("/preview") &&
    node?.data?.categorySlug === "image-to-video"
  ) {
    return "video";
  }
  return "image";
}

/** Prefer same-origin URLs for playback in the editor. */
export function toPlayableMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("/api/") || url.startsWith("/media/")) return url;
  try {
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : undefined);
    if (parsed.pathname.startsWith("/media/")) {
      return parsed.pathname;
    }
  } catch {
    /* keep absolute URL */
  }
  return url;
}
