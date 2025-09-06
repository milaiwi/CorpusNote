// FloatingCommand.tsx
import React, { useEffect } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./command";

import {
  useFloating,
  offset,
  flip,
  shift,
  size,
  autoUpdate,
  useRole,
  useDismiss,
  useInteractions,
  FloatingPortal,
  type Placement,
} from "@floating-ui/react";

type RectLike = { top: number; left: number; right: number; bottom: number };

export type FloatingCommandItem = {
  id: string;
  value: string;       // used by cmdk to filter/select
  label?: string;      // what to render if you don't provide renderItem
  [key: string]: any;


};

export type FloatingCommandProps = {
  /** Controls visibility */
  open: boolean;
  /** Called when the component wants to open/close (Escape / outside click / select) */
  onOpenChange?: (open: boolean) => void;

  /** Anchor rect (e.g., from posToDOMRect) */
  anchorRect?: RectLike | DOMRect | null;

  /** Items to render/select from */
  items: FloatingCommandItem[];

  /** Called with the selected item (or its value) */
  onSelect: (item: FloatingCommandItem) => void;

  /** Optional custom renderer for each item */
  renderItem?: (item: FloatingCommandItem) => React.ReactNode;

  /** Initial placement relative to the rect */
  placement?: Placement; // default "bottom-start"

  /** Placeholder for the input */
  placeholder?: string;

  /** Text when no results */
  emptyText?: string;

  /** Optional className for the floating panel */
  className?: string;

  /** Fixed width or max width hint (otherwise intrinsic / capped by size middleware) */
  width?: number | string;
  maxWidth?: number;

  /** Max viewport padding when shifting to avoid overflow */
  viewportPadding?: number;

  /** Called when input text changes (useful if you fetch as-you-type) */
  onQueryChange?: (q: string) => void;

  /** Whether selecting an item should auto-close the popover (default true) */
  closeOnSelect?: boolean;
};

export function FloatingCommand({
  open,
  onOpenChange,
  anchorRect,
  items,
  onSelect,
  renderItem,
  placement = "bottom-start",
  placeholder = "Search…",
  emptyText = "No results found.",
  className,
  width,
  maxWidth = 360,
  viewportPadding = 8,
  onQueryChange,
  closeOnSelect = true,
}: FloatingCommandProps) {
  const floatingRef = React.useRef<HTMLDivElement | null>(null);

  // Virtual anchor from a rect (caret, selection, etc.)
  const virtualAnchor = React.useMemo(() => {
    const r = anchorRect;
    return {
      getBoundingClientRect: () => {
        if (!r) return new DOMRect(0, 0, 0, 0);
        const left = "left" in r ? r.left : 0;
        const top = "top" in r ? r.top : 0;
        const right = "right" in r ? r.right : left;
        const bottom = "bottom" in r ? r.bottom : top;
        const w = Math.max(1, right - left);
        const h = Math.max(1, bottom - top);
        return new DOMRect(left, top, w, h);
      },
    };
  }, [anchorRect]);

  const { x, y, refs, strategy, context } = useFloating({
    open,
    onOpenChange,
    placement,
    strategy: "fixed",
    middleware: [
      offset(6),
      flip({ fallbackPlacements: ["top-start", "right-start", "left-start"] }),
      shift({ padding: viewportPadding }),
      size({
        apply({ availableWidth, availableHeight, elements }) {
          const el = elements.floating as HTMLElement;
          if (!el) return;

          // Width behavior: explicit width prop wins; otherwise, cap width
          if (width != null) {
            el.style.width = typeof width === "number" ? `${width}px` : String(width);
          } else {
            el.style.maxWidth = `${Math.min(availableWidth, maxWidth)}px`;
          }

          // Height behavior: never overflow viewport
          el.style.maxHeight = `${availableHeight}px`;
          el.style.overflow = "auto";
        },
      }),
    ],
  });

  // Attach virtual reference
  useEffect(() => {
    refs.setReference(virtualAnchor as any);
  }, [refs, virtualAnchor]);

  // Auto update position on scroll/resize
  useEffect(() => {
    if (!open) return;
    const refEl = (refs.reference as any).current ?? virtualAnchor;
    const floatEl = refs.floating.current;
    if (!refEl || !floatEl) return;
    return autoUpdate(refEl, floatEl, () => context.update());
  }, [open, refs.reference, refs.floating, context, virtualAnchor]);

  // Interactions: outside click to dismiss + ARIA role
  const role = useRole(context, { role: "dialog" });
  const dismiss = useDismiss(context, {
    outsidePress: true,
    escapeKey: true,
  });
  const { getFloatingProps } = useInteractions([role, dismiss]);

  // Close on Escape (cmdk already handles some, this is a safety net)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onOpenChange?.(false);
  };

  // Track input for consumers (fetch-as-you-type etc.)
  const [query, setQuery] = React.useState("");
  React.useEffect(() => {
    onQueryChange?.(query);
  }, [query, onQueryChange]);

  if (!open || !anchorRect) return null;

  return (
    <FloatingPortal>
      <div
        ref={(node) => {
          floatingRef.current = node;
          refs.setFloating(node)
        }}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
          zIndex: 1000,
        }}
        {...getFloatingProps({
          onKeyDown,
        })}
      >
        <Command
          className={
            `rounded-lg border bg-popover text-popover-foreground shadow-md ${className ?? ""}`
          }
          value={query}
          onValueChange={setQuery}
        >
          <CommandInput
            placeholder={placeholder}
            autoFocus
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup heading="Results">
              {items.map((it) => (
                <CommandItem
                  key={it.id}
                  value={it.value}
                  onSelect={() => {
                    onSelect(it);
                    if (closeOnSelect) onOpenChange?.(false);
                  }}
                  className="cursor-pointer hover:text-accent-foreground"
                >
                  {renderItem ? renderItem(it) : (it.label ?? it.value)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </FloatingPortal>
  );
}
