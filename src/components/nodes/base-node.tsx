"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodeData } from "@/types";

interface BaseNodeProps extends NodeProps {
  icon: React.ReactNode;
  children?: React.ReactNode;
  inputs?: number;
  outputs?: number;
  color?: string;
}

export function BaseNode({
  data,
  selected,
  icon,
  children,
  inputs = 1,
  outputs = 1,
  color = "from-indigo-500/20 to-purple-500/10",
}: BaseNodeProps) {
  const nodeData = data as NodeData;
  const status = nodeData.status || "idle";
  const progress = nodeData.progress ?? 0;
  const isProcessing = status === "processing" || status === "queued";

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "min-w-[220px] rounded-xl border border-node-border bg-node/90 backdrop-blur-xl shadow-node transition-shadow",
        selected && "border-primary/60 shadow-node-hover ring-1 ring-primary/30",
        status === "error" && "border-destructive/60"
      )}
    >
      {inputs > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !border-2 !border-primary/50 !bg-background"
        />
      )}

      <div className={cn("rounded-t-xl bg-gradient-to-br px-3 py-2", color)}>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-primary">
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{nodeData.label}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{status}</p>
          </div>
          {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          {status === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
        </div>
      </div>

      {isProcessing && (
        <div className="h-1 w-full overflow-hidden bg-secondary">
          <motion.div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {children && <div className="space-y-2 p-3">{children}</div>}

      {nodeData.error && (
        <p className="px-3 pb-2 text-xs text-destructive">{nodeData.error}</p>
      )}

      {outputs > 0 && (
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !border-2 !border-primary/50 !bg-background"
        />
      )}
    </motion.div>
  );
}
