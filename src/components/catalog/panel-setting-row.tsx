"use client";

import { CustomSelect } from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/components/ui/custom-select";

interface PanelSettingRowProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  hint?: string;
  className?: string;
}

export function PanelSettingRow({
  label,
  value,
  onValueChange,
  options,
  hint,
  className,
}: PanelSettingRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-border/40 px-4 py-3",
        className
      )}
      title={hint}
    >
      <span className="min-w-0 flex-1 text-sm font-medium text-foreground/85">
        {label}
      </span>
      <CustomSelect
        value={value}
        onValueChange={onValueChange}
        options={options}
        size="panel"
        triggerClassName="h-10 w-[148px] shrink-0 border-border/50 bg-[hsl(220,16%,11%)] text-sm"
      />
    </div>
  );
}
