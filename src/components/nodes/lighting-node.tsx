"use client";

import type { NodeProps } from "@xyflow/react";
import { Sun } from "lucide-react";
import { BaseNode } from "./base-node";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CustomSelect } from "@/components/ui/custom-select";
import { useEditorStore } from "@/store/editor-store";
import type { NodeData } from "@/types";

export function LightingNode(props: NodeProps) {
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const data = props.data as NodeData;
  const intensity = (data.intensity as number) ?? 0.8;

  return (
    <BaseNode {...props} icon={<Sun className="h-4 w-4" />} color="from-amber-500/20 to-orange-500/10">
      <div className="space-y-2">
        <Label>Intensity: {intensity.toFixed(1)}</Label>
        <Slider
          value={[intensity]}
          min={0}
          max={2}
          step={0.1}
          onValueChange={([v]) => updateNodeData(props.id, { intensity: v })}
        />
        <CustomSelect
          nodrag
          size="sm"
          className="w-full"
          value={(data.mode as string) || "studio"}
          onValueChange={(mode) => updateNodeData(props.id, { mode })}
          options={[
            { value: "studio", label: "Studio" },
            { value: "natural", label: "Natural" },
            { value: "dramatic", label: "Dramatic" },
            { value: "rim", label: "Rim Light" },
          ]}
        />
      </div>
    </BaseNode>
  );
}
