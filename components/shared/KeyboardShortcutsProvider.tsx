"use client";

import { useState, useCallback } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsDialog } from "@/components/shared/KeyboardShortcutsDialog";

/**
 * Root-level provider that registers all global keyboard shortcuts
 * and renders the help dialog (? key).
 *
 * Place this inside ThemeProvider in the root layout.
 */
export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [helpOpen, setHelpOpen] = useState(false);

  const toggleHelp = useCallback(() => {
    setHelpOpen((prev) => !prev);
  }, []);

  const closeHelp = useCallback(() => {
    setHelpOpen(false);
  }, []);

  useKeyboardShortcuts({ onToggleHelp: toggleHelp });

  return (
    <>
      {children}
      <KeyboardShortcutsDialog open={helpOpen} onClose={closeHelp} />
    </>
  );
}
