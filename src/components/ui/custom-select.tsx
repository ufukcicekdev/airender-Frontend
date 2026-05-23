"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  /** Width/layout on the outer wrapper. */
  className?: string;
  /** Visual styles on the trigger button. */
  triggerClassName?: string;
  size?: "sm" | "panel" | "default";
  nodrag?: boolean;
  disabled?: boolean;
}

/** Custom dropdown menu — not native select or Radix Select (avoids update loops). */
export function CustomSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  className,
  triggerClassName,
  size = "default",
  nodrag = false,
  disabled,
}: CustomSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  const safeValue = options.some((o) => o.value === value)
    ? value
    : (options[0]?.value ?? "");

  const selected =
    options.find((o) => o.value === safeValue) ?? options[0] ?? null;

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 200,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      const menu = document.getElementById(listId);
      if (menu?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, listId]);

  const pick = (next: string) => {
    setOpen(false);
    if (next !== safeValue) onValueChange(next);
  };

  if (!options.length) {
    return (
      <div
        className={cn(
          "flex h-9 items-center rounded-md border border-border/60 px-3 text-sm text-muted-foreground",
          size === "panel" && "h-10",
          className,
          triggerClassName
        )}
      >
        {placeholder}
      </div>
    );
  }

  const menu = open ? (
    <ul
      id={listId}
      role="listbox"
      style={menuStyle}
      className={cn(
        "max-h-72 overflow-y-auto rounded-lg border border-border/60",
        "bg-[hsl(220,18%,10%)] p-1 text-foreground shadow-glass",
        "animate-in fade-in-0 zoom-in-95 duration-100"
      )}
    >
      {options.map((opt) => {
        const active = opt.value === safeValue;
        return (
          <li key={opt.value} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => pick(opt.value)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors",
                active
                  ? "bg-[hsl(var(--viz-cyan)/0.12)] text-foreground"
                  : "text-foreground/90 hover:bg-[hsl(var(--viz-cyan)/0.08)]"
              )}
            >
              {opt.icon ? (
                <span className="flex shrink-0 items-center justify-center">
                  {opt.icon}
                </span>
              ) : null}
              <span className="min-w-0 flex-1 truncate">{opt.label}</span>
              {active ? (
                <Check className="h-4 w-4 shrink-0 text-[hsl(var(--viz-cyan))]" />
              ) : (
                <span className="w-4 shrink-0" />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  ) : null;

  return (
    <div ref={rootRef} className={cn("relative w-full min-w-0", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border border-border/60",
          "bg-[hsl(220,16%,12%)] text-foreground ring-offset-background transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--viz-cyan)/0.35)] focus:border-[hsl(var(--viz-cyan)/0.5)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" && "h-8 px-2.5 text-xs",
          size === "panel" && "h-10 px-3 text-sm",
          size === "default" && "h-9 px-3 text-sm",
          nodrag && "nodrag nopan",
          triggerClassName
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
          {selected?.icon ? (
            <span className="flex shrink-0 items-center">{selected.icon}</span>
          ) : null}
          <span className="truncate font-medium">
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground opacity-70 transition-transform",
            open && "rotate-180",
            size === "sm" && "h-3.5 w-3.5"
          )}
          aria-hidden
        />
      </button>
      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
}
