import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        poster?: string;
        exposure?: string;
        "shadow-intensity"?: string;
        "camera-controls"?: boolean | "";
        "auto-rotate"?: boolean | "";
        "interaction-prompt"?: string;
        "touch-action"?: string;
        ar?: boolean | "";
      };
    }
  }
}
