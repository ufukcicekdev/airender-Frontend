import type { EditorNode } from "@/store/editor-store";

/** Inpaint mask stored on a canvas node (white = edit region). */
export function getNodeMaskDataUrl(node: EditorNode | undefined): string | undefined {
  if (!node?.data?.maskDataUrl) return undefined;
  const url = String(node.data.maskDataUrl);
  return url.startsWith("data:") ? url : undefined;
}

export function nodeHasDrawMask(node: EditorNode | undefined): boolean {
  return Boolean(getNodeMaskDataUrl(node));
}

/** Convert brush strokes canvas to white-on-transparent inpaint mask PNG. */
export function exportInpaintMask(strokeCanvas: HTMLCanvasElement): string {
  const w = strokeCanvas.width;
  const h = strokeCanvas.height;
  const src = strokeCanvas.getContext("2d");
  if (!src || w === 0 || h === 0) return "";

  const imageData = src.getImageData(0, 0, w, h);
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const ctx = off.getContext("2d");
  if (!ctx) return "";

  const out = ctx.createImageData(w, h);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const alpha = imageData.data[i + 3];
    if (alpha > 16) {
      out.data[i] = 255;
      out.data[i + 1] = 255;
      out.data[i + 2] = 255;
      out.data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  return off.toDataURL("image/png");
}
