"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const RIGHT_PANEL_MIN_WIDTH = 320;
export const RIGHT_PANEL_MAX_WIDTH = 720;
export const RIGHT_PANEL_DEFAULT_WIDTH = 440;
const STORAGE_KEY = "vizmake-right-panel-width";

function clampWidth(value: number) {
  return Math.min(RIGHT_PANEL_MAX_WIDTH, Math.max(RIGHT_PANEL_MIN_WIDTH, value));
}

function readStoredWidth(): number {
  if (typeof window === "undefined") return RIGHT_PANEL_DEFAULT_WIDTH;
  const parsed = parseInt(window.localStorage.getItem(STORAGE_KEY) ?? "", 10);
  if (!Number.isFinite(parsed)) return RIGHT_PANEL_DEFAULT_WIDTH;
  const clamped = clampWidth(parsed);
  return clamped < 380 ? RIGHT_PANEL_DEFAULT_WIDTH : clamped;
}

export function useResizablePanel() {
  const [width, setWidth] = useState(RIGHT_PANEL_DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const widthRef = useRef(width);

  useEffect(() => {
    setWidth(readStoredWidth());
  }, []);

  useEffect(() => {
    widthRef.current = width;
  }, [width]);

  const startResize = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsResizing(true);
  }, []);

  const resetWidth = useCallback(() => {
    const next = RIGHT_PANEL_DEFAULT_WIDTH;
    setWidth(next);
    widthRef.current = next;
    window.localStorage.setItem(STORAGE_KEY, String(next));
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const onMove = (event: MouseEvent) => {
      const next = clampWidth(window.innerWidth - event.clientX);
      widthRef.current = next;
      setWidth(next);
    };

    const onUp = () => {
      setIsResizing(false);
      window.localStorage.setItem(STORAGE_KEY, String(widthRef.current));
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isResizing]);

  return { width, isResizing, startResize, resetWidth };
}
