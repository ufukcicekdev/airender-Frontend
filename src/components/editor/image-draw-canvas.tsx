"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { exportInpaintMask } from "@/lib/node-draw-mask";
import { cn } from "@/lib/utils";

export type DrawTool = "brush" | "eraser";

type ImageLayout = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type ImageDrawCanvasProps = {
  imageUrl: string;
  maskDataUrl?: string | null;
  brushSize: number;
  tool: DrawTool;
  onMaskChange: (maskDataUrl: string | null) => void;
  className?: string;
};

function computeContainLayout(
  containerW: number,
  containerH: number,
  imgW: number,
  imgH: number
): ImageLayout {
  if (!containerW || !containerH || !imgW || !imgH) {
    return { x: 0, y: 0, w: 0, h: 0 };
  }
  const scale = Math.min(containerW / imgW, containerH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  return {
    x: (containerW - w) / 2,
    y: (containerH - h) / 2,
    w,
    h,
  };
}

export function ImageDrawCanvas({
  imageUrl,
  maskDataUrl,
  brushSize,
  tool,
  onMaskChange,
  className,
}: ImageDrawCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [layout, setLayout] = useState<ImageLayout>({ x: 0, y: 0, w: 0, h: 0 });
  const [imageReady, setImageReady] = useState(false);

  const syncLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container || !natural.w) return;
    setLayout(
      computeContainLayout(
        container.clientWidth,
        container.clientHeight,
        natural.w,
        natural.h
      )
    );
  }, [natural]);

  useEffect(() => {
    setImageReady(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setImageReady(true);
    };
    img.onerror = () => setNatural({ w: 0, h: 0 });
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    syncLayout();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(syncLayout);
    ro.observe(el);
    return () => ro.disconnect();
  }, [syncLayout, imageReady]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || layout.w < 1) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(layout.w * dpr);
    canvas.height = Math.floor(layout.h * dpr);
    canvas.style.width = `${layout.w}px`;
    canvas.style.height = `${layout.h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, [layout]);

  useEffect(() => {
    resizeCanvas();
  }, [resizeCanvas]);

  const loadMaskOntoCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || layout.w < 1) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, layout.w, layout.h);
    if (!maskDataUrl) return;

    await new Promise<void>((resolve) => {
      const maskImg = new Image();
      maskImg.crossOrigin = "anonymous";
      maskImg.onload = () => {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(maskImg, 0, 0, layout.w, layout.h);
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = "rgba(45, 212, 191, 0.55)";
        ctx.fillRect(0, 0, layout.w, layout.h);
        ctx.restore();
        resolve();
      };
      maskImg.onerror = () => resolve();
      maskImg.src = maskDataUrl;
    });
  }, [layout, maskDataUrl]);

  useEffect(() => {
    if (!imageReady) return;
    void loadMaskOntoCanvas();
  }, [imageReady, loadMaskOntoCanvas, maskDataUrl]);

  const clientToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  const stroke = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brushSize;

      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "rgba(45, 212, 191, 0.55)";
      }

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    },
    [brushSize, tool]
  );

  const commitMask = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let hasInk = false;
    for (let i = 3; i < pixels.data.length; i += 4) {
      if (pixels.data[i] > 16) {
        hasInk = true;
        break;
      }
    }

    if (!hasInk) {
      onMaskChange(null);
      return;
    }

    const exported = exportInpaintMask(canvas);
    onMaskChange(exported || null);
  }, [onMaskChange]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const pt = clientToCanvas(e.clientX, e.clientY);
      if (!pt) return;
      drawingRef.current = true;
      lastPointRef.current = pt;
      canvasRef.current?.setPointerCapture(e.pointerId);

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brushSize;
      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(45, 212, 191, 0.55)";
      }
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    },
    [brushSize, clientToCanvas, tool]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drawingRef.current) return;
      const pt = clientToCanvas(e.clientX, e.clientY);
      const last = lastPointRef.current;
      if (!pt || !last) return;
      stroke(last, pt);
      lastPointRef.current = pt;
    },
    [clientToCanvas, stroke]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!drawingRef.current) return;
      drawingRef.current = false;
      lastPointRef.current = null;
      try {
        canvasRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      commitMask();
    },
    [commitMask]
  );

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !layout.w) return;
    ctx.clearRect(0, 0, layout.w, layout.h);
    onMaskChange(null);
  }, [layout.w, onMaskChange]);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full select-none bg-black", className)}
      style={{ touchAction: "none" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        draggable={false}
      />
      {imageReady && layout.w > 0 && (
        <canvas
          ref={canvasRef}
          className="absolute z-10 cursor-crosshair"
          style={{
            left: layout.x,
            top: layout.y,
            width: layout.w,
            height: layout.h,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
      )}
      <ClearDrawBridge onClear={clearCanvas} />
    </div>
  );
}

/** Lets parent toolbar trigger clear via custom event. */
export function ClearDrawBridge({ onClear }: { onClear: () => void }) {
  useEffect(() => {
    const handler = () => onClear();
    window.addEventListener("viz:draw-clear", handler);
    return () => window.removeEventListener("viz:draw-clear", handler);
  }, [onClear]);
  return null;
}
