"use client";

import { useEffect, useState } from "react";

/** Matches Tailwind `lg` — editor switches to mobile layout below this width. */
export const EDITOR_MOBILE_MAX_WIDTH = 1023;

const QUERY = `(max-width: ${EDITOR_MOBILE_MAX_WIDTH}px)`;

export function useIsMobileEditor() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isMobile;
}
