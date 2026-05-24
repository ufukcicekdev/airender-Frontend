"use client";

import { RightPanel } from "@/components/layout/right-panel";
import { useUIStore } from "@/store/ui-store";

/** Slide-over for model settings & preview on small screens — sits above bottom nav. */
export function EditorMobilePanel() {
  const open = useUIStore((s) => s.mobileRightPanelOpen);
  const setOpen = useUIStore((s) => s.setMobileRightPanelOpen);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close panel"
        className="fixed inset-x-0 top-0 bottom-[var(--editor-mobile-nav-height)] z-40 bg-black/55 lg:hidden"
        onClick={() => setOpen(false)}
      />
      <div
        className="fixed inset-x-0 top-0 bottom-[var(--editor-mobile-nav-height)] z-50 ml-auto flex w-full max-w-md flex-col shadow-2xl lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Model and preview panel"
      >
        <RightPanel layout="overlay" onClose={() => setOpen(false)} />
      </div>
    </>
  );
}
