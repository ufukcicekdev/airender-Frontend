"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ImageCompareSliderProps = {
  imageA: string;
  imageB: string;
  labelA?: string;
  labelB?: string;
  split: number;
  onSplitChange: (value: number) => void;
  className?: string;
};

export function ImageCompareSlider({
  imageA,
  imageB,
  labelA = "A",
  labelB = "B",
  split,
  onSplitChange,
  className,
}: ImageCompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerWidth(el.offsetWidth));
    ro.observe(el);
    setContainerWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      onSplitChange(Math.min(98, Math.max(2, pct)));
    },
    [onSplitChange]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(true);
      updateFromClientX(e.clientX);
    },
    [updateFromClientX]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      updateFromClientX(e.clientX);
    },
    [dragging, updateFromClientX]
  );

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full select-none overflow-hidden rounded-md bg-black",
        dragging && "cursor-ew-resize",
        className
      )}
      style={{ touchAction: "none" }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageB}
        alt={labelB}
        className="block h-full w-full object-contain"
        draggable={false}
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${split}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageA}
          alt={labelA}
          className="block h-full object-contain"
          style={{ width: containerWidth || "100%", maxWidth: "none" }}
          draggable={false}
        />
      </div>

      <div
        className="absolute inset-y-0 z-10 flex cursor-ew-resize items-center justify-center"
        style={{ left: `${split}%`, transform: "translateX(-50%)", width: 24 }}
        onPointerDown={onPointerDown}
      >
        <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-[hsl(var(--viz-cyan))] shadow-[0_0_12px_hsl(var(--viz-cyan)/0.6)]" />
        <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[hsl(var(--viz-cyan))] bg-[hsl(220,18%,12%)] shadow-lg">
          <span className="text-[10px] font-bold text-[hsl(var(--viz-cyan))]">‖</span>
        </div>
      </div>

      <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white/90">
        {labelA}
      </span>
      <span className="pointer-events-none absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white/90">
        {labelB}
      </span>
    </div>
  );
}
