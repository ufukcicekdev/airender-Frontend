"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useResizablePaneHeight(
  storageKey: string,
  defaultHeight: number,
  minHeight = 140,
  maxHeight = 560
) {
  const [height, setHeight] = useState(defaultHeight);
  const [isResizing, setIsResizing] = useState(false);
  const heightRef = useRef(defaultHeight);
  const startYRef = useRef(0);
  const startHRef = useRef(defaultHeight);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = parseInt(window.localStorage.getItem(storageKey) ?? "", 10);
    if (Number.isFinite(raw)) {
      const clamped = Math.min(maxHeight, Math.max(minHeight, raw));
      setHeight(clamped);
      heightRef.current = clamped;
    }
  }, [storageKey, minHeight, maxHeight]);

  const startResize = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      startYRef.current = event.clientY;
      startHRef.current = heightRef.current;
      setIsResizing(true);
    },
    []
  );

  const resetHeight = useCallback(() => {
    setHeight(defaultHeight);
    heightRef.current = defaultHeight;
    window.localStorage.setItem(storageKey, String(defaultHeight));
  }, [defaultHeight, storageKey]);

  useEffect(() => {
    if (!isResizing) return;

    const onMove = (event: MouseEvent) => {
      const delta = event.clientY - startYRef.current;
      const next = Math.min(
        maxHeight,
        Math.max(minHeight, startHRef.current + delta)
      );
      heightRef.current = next;
      setHeight(next);
    };

    const onUp = () => {
      setIsResizing(false);
      window.localStorage.setItem(storageKey, String(heightRef.current));
    };

    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isResizing, minHeight, maxHeight, storageKey]);

  return { height, isResizing, startResize, resetHeight };
}
