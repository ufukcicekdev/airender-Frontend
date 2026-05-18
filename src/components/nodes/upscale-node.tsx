"use client";

import type { NodeProps } from "@xyflow/react";
import { Maximize2 } from "lucide-react";
import { BaseNode } from "./base-node";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/ui/custom-select";
import { useEditorStore } from "@/store/editor-store";
import type { NodeData } from "@/types";

export function UpscaleNode(props: NodeProps) {
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const data = props.data as NodeData;

  return (
    <BaseNode {...props} icon={<Maximize2 className="h-4 w-4" />} color="from-cyan-500/20 to-sky-500/10">
      <div className="flex items-center justify-between">
        <Label>4x Upscale</Label>
        <Switch
          checked={(data.upscale4x as boolean) ?? false}
          onCheckedChange={(v) => updateNodeData(props.id, { upscale4x: v })}
        />
      </div>
      <CustomSelect
        nodrag
        size="sm"
        className="mt-2 w-full"
        value={(data.model as string) || "esrgan"}
        onValueChange={(model) => updateNodeData(props.id, { model })}
        options={[
          { value: "esrgan", label: "ESRGAN" },
          { value: "real-esrgan", label: "Real-ESRGAN" },
          { value: "latent", label: "Latent" },
        ]}
      />
    </BaseNode>
  );
}
