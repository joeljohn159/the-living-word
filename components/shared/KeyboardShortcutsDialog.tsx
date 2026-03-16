"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Single shortcut entry for display in the help dialog. */
export interface ShortcutEntry {
  keys: string[];
  description: string;
}

/** All keyboard shortcuts grouped by category. */
export const SHORTCUT_GROUPS: { label: string; shortcuts: ShortcutEntry[] }[] = [
  {
    label: "Navigation",
    shortcuts: [
      { keys: ["←"], description: "Previous chapter" },
      { keys: ["→"], description: "Next chapter" },
      { keys: ["B"], description: "Open book browser" },
      { keys: ["/", "Ctrl+K"], description: "Focus search" },
    ],
  },
  {
    label: "Reading",
    shortcuts: [
      { keys: ["D"], description: "Toggle dictionary mode" },
      { keys: ["+"], description: "Increase font size" },
      { keys: ["-"], description: "Decrease font size" },
    ],
  },
  {
    label: "Panels & Display",
    shortcuts: [
      { keys: ["F"], description: "Toggle fullscreen reading" },
      { keys: ["M"], description: "Toggle map panel" },
      { keys: ["T"], description: "Cycle theme" },
    ],
  },
  {
    label: "General",
    shortcuts: [
      { keys: ["Esc"], description: "Close panels / exit modes" },
      { keys: ["?"], description: "Show this help dialog" },
    ],
  },
];

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal dialog listing all keyboard shortcuts, triggered by the '?' key.
 * Closes on Escape, backdrop click, or close button.
 */
export function KeyboardShortcutsDialog({ open, onClose }: KeyboardShortcutsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap: focus the dialog when it opens
  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKey, true);
    return () => window.removeEventListener("keydown", handleKey, true);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        tabIndex={-1}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-[90vw] max-w-lg rounded-xl",
          "bg-card border border-border shadow-2xl",
          "outline-none",
          "max-h-[85vh] overflow-y-auto"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-source-sans text-lg font-semibold text-foreground">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className={cn(
              "rounded-md p-1.5",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-secondary/80 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label="Close shortcuts dialog"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Shortcut Groups */}
        <div className="px-6 py-4 space-y-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {group.label}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm text-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {shortcut.keys.map((key, i) => (
                        <span key={key} className="flex items-center gap-1.5">
                          {i > 0 && (
                            <span className="text-xs text-muted-foreground">or</span>
                          )}
                          <kbd
                            className={cn(
                              "inline-flex items-center justify-center",
                              "min-w-[1.75rem] px-1.5 py-0.5",
                              "rounded border border-border bg-secondary",
                              "font-mono text-xs text-foreground"
                            )}
                          >
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t border-border px-6 py-3">
          <p className="text-center text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 rounded bg-secondary font-mono text-[10px]">?</kbd> to
            toggle this dialog
          </p>
        </div>
      </div>
    </>
  );
}
