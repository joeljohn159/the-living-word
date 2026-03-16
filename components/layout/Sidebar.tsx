"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { usePreferencesStore } from "@/stores/preferences";
import { useContextPanelKeyboard } from "@/hooks/use-context-panel-keyboard";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ContextPanelContent } from "@/components/layout/ContextPanelContent";
import { CONTEXT_TABS } from "@/components/layout/context-panel-tabs";
import { cn } from "@/lib/utils";

const PANEL_WIDTH = "w-[380px]";

/**
 * Right-side context panel for the chapter reading page.
 *
 * Desktop: fixed right panel, collapsible with 'F' key.
 * Mobile: bottom sheet/drawer using shadcn Sheet.
 * Tabs: Visuals, Evidence, Map, Cross-References, People, Notes.
 * Shortcuts: 'F' toggles panel, 'M' opens Map tab.
 */
export function Sidebar() {
  const sidebarOpen = usePreferencesStore((s) => s.sidebarOpen);
  const activeTab = usePreferencesStore((s) => s.activeSidebarTab);
  const toggleSidebar = usePreferencesStore((s) => s.toggleSidebar);
  const setActiveTab = usePreferencesStore((s) => s.setActiveSidebarTab);
  const isMobile = useMediaQuery("(max-width: 1023px)");

  useContextPanelKeyboard();

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
    },
    [setActiveTab]
  );

  const handleMobileOpenChange = useCallback(
    (open: boolean) => {
      if (open !== sidebarOpen) {
        toggleSidebar();
      }
    },
    [sidebarOpen, toggleSidebar]
  );

  // Mobile: bottom sheet
  if (isMobile) {
    return (
      <MobileSidebar
        open={sidebarOpen}
        activeTab={activeTab}
        onOpenChange={handleMobileOpenChange}
        onTabChange={handleTabChange}
      />
    );
  }

  // Desktop: collapsible right panel
  return (
    <DesktopSidebar
      open={sidebarOpen}
      activeTab={activeTab}
      onToggle={toggleSidebar}
      onTabChange={handleTabChange}
    />
  );
}

/* ─── Desktop Panel ─────────────────────────────────────────── */

interface DesktopSidebarProps {
  open: boolean;
  activeTab: string;
  onToggle: () => void;
  onTabChange: (tab: string) => void;
}

function DesktopSidebar({
  open,
  activeTab,
  onToggle,
  onTabChange,
}: DesktopSidebarProps) {
  return (
    <>
      {/* Toggle button — always visible */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-20 z-30 rounded-l-md p-2",
          "bg-card border border-r-0 border-border shadow-md",
          "text-muted-foreground hover:text-foreground",
          "transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open ? "right-[380px]" : "right-0"
        )}
        aria-label={open ? "Close context panel (F)" : "Open context panel (F)"}
        title={open ? "Close panel (F)" : "Open panel (F)"}
      >
        {open ? (
          <PanelRightClose className="h-4 w-4" aria-hidden="true" />
        ) : (
          <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "fixed top-16 right-0 bottom-0 z-20",
              PANEL_WIDTH,
              "bg-card border-l border-border shadow-xl",
              "flex flex-col"
            )}
            role="complementary"
            aria-label="Context panel"
          >
            <PanelHeader activeTab={activeTab} onTabChange={onTabChange} />
            <ContextPanelContent activeTab={activeTab} />
            <PanelFooter />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Mobile Sheet ──────────────────────────────────────────── */

interface MobileSidebarProps {
  open: boolean;
  activeTab: string;
  onOpenChange: (open: boolean) => void;
  onTabChange: (tab: string) => void;
}

function MobileSidebar({
  open,
  activeTab,
  onOpenChange,
  onTabChange,
}: MobileSidebarProps) {
  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => onOpenChange(true)}
          className={cn(
            "fixed bottom-6 right-6 z-40 lg:hidden",
            "rounded-full bg-gold p-3 shadow-lg",
            "text-background hover:bg-gold-dark",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label="Open context panel"
        >
          <PanelRightOpen className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          className={cn(
            "inset-y-auto inset-x-0 bottom-0 top-auto right-auto",
            "w-full max-w-full h-[70vh]",
            "rounded-t-2xl",
            "flex flex-col",
            "data-[state=open]:translate-x-0 data-[state=closed]:translate-x-0",
            "data-[state=open]:translate-y-0 data-[state=closed]:translate-y-full"
          )}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          <PanelHeader activeTab={activeTab} onTabChange={onTabChange} />
          <ContextPanelContent activeTab={activeTab} />
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ─── Shared Sub-Components ─────────────────────────────────── */

interface PanelHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function PanelHeader({ activeTab, onTabChange }: PanelHeaderProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList aria-label="Context panel tabs">
        {CONTEXT_TABS.map(({ key, label, icon: Icon }) => (
          <TabsTrigger key={key} value={key}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function PanelFooter() {
  return (
    <div className="px-4 py-2 border-t border-border">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono text-[10px]">
            F
          </kbd>{" "}
          toggle panel
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono text-[10px]">
            M
          </kbd>{" "}
          map
        </span>
      </div>
    </div>
  );
}
