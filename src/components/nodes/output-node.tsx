"use client";

import type { NodeProps } from "@xyflow/react";
import { Download } from "lucide-react";
import { BaseNode } from "./base-node";

export function OutputNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<Download className="h-4 w-4" />}
      outputs={0}
      color="from-rose-500/20 to-pink-500/10"
    >
      <p className="text-xs text-muted-foreground">Final output destination</p>
    </BaseNode>
  );
}
