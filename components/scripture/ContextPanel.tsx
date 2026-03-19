"use client";

import { usePreferencesStore } from "@/stores/preferences";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  PanelRightClose,
  PanelRightOpen,
  BookOpen,
  MapPin,
  Users,
  Image,
  Link2,
  ChevronUp,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaGallery } from "@/components/media/MediaGallery";
import type { MediaItem } from "@/components/media/types";
import { PeopleTabContent } from "@/components/people/PeopleTabContent";
import { PlacesTabContent } from "./PlacesTabContent";
import { StudyTabContent } from "./StudyTabContent";
import { NotesTabContent } from "./NotesTabContent";
import { CrossRefTab } from "./CrossRefTab";

const TABS = [
  { id: "visuals", label: "Art", icon: Image },
  { id: "cross-references", label: "Refs", icon: Link2 },
  { id: "places", label: "Places", icon: MapPin },
  { id: "people", label: "People", icon: Users },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "study", label: "Study", icon: BookOpen },
] as const;

interface ContextPanelProps {
  /** Media items for the current chapter (visuals tab). */
  mediaItems?: MediaItem[];
}

/**
 * Context panel — desktop: collapsible right sidebar.
 * Mobile (<1024px): bottom sheet drawer that slides up.
 */
export function ContextPanel({ mediaItems = [] }: ContextPanelProps) {
  const isOpen = usePreferencesStore((s) => s.sidebarOpen);
  const toggle = usePreferencesStore((s) => s.toggleSidebar);
  const activeTab = usePreferencesStore((s) => s.activeSidebarTab);
  const setTab = usePreferencesStore((s) => s.setActiveSidebarTab);
  const isMobile = useMediaQuery("(max-width: 1023px)");

  if (isMobile) {
    return (
      <MobileContextPanel
        isOpen={isOpen}
        toggle={toggle}
        activeTab={activeTab}
        setTab={setTab}
        mediaItems={mediaItems}
      />
    );
  }

  return (
    <DesktopContextPanel
      isOpen={isOpen}
      toggle={toggle}
      activeTab={activeTab}
      setTab={setTab}
      mediaItems={mediaItems}
    />
  );
}

/* ─── Desktop Panel ──────────────────────────────────────── */

interface PanelProps {
  isOpen: boolean;
  toggle: () => void;
  activeTab: string;
  setTab: (tab: string) => void;
  mediaItems: MediaItem[];
}

function DesktopContextPanel({ isOpen, toggle, activeTab, setTab, mediaItems }: PanelProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col shrink-0 border-l border-[var(--border)] bg-[var(--bg-secondary)] transition-all duration-300 overflow-hidden",
        isOpen ? "w-72 xl:w-80 2xl:w-96" : "w-12",
      )}
      aria-label="Context panel"
    >
      {/* Toggle button */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
        {isOpen && (
          <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
            Context
          </span>
        )}
        <button
          onClick={toggle}
          className={cn(
            "p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
            "hover:text-[var(--text-primary)] transition-colors",
            "touch-target flex items-center justify-center",
          )}
          aria-label={isOpen ? "Collapse panel" : "Expand panel"}
        >
          {isOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
      </div>

      {isOpen ? (
        <>
          <TabBar activeTab={activeTab} setTab={setTab} />
          <div className="flex-1 overflow-y-auto">
            <TabContent activeTab={activeTab} mediaItems={mediaItems} />
          </div>
        </>
      ) : (
        <CollapsedRail activeTab={activeTab} setTab={setTab} toggle={toggle} isOpen={isOpen} />
      )}
    </aside>
  );
}

/* ─── Mobile Bottom Sheet ────────────────────────────────── */

function MobileContextPanel({ isOpen, toggle, activeTab, setTab, mediaItems }: PanelProps) {
  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={toggle}
          className={cn(
            "fixed bottom-6 right-4 z-40 lg:hidden",
            "flex items-center gap-2 rounded-full",
            "bg-[var(--accent-gold)] text-[var(--bg-primary)]",
            "px-4 py-3 shadow-lg shadow-black/20",
            "hover:bg-[var(--accent-gold-light)]",
            "transition-colors duration-150",
            "touch-target",
          )}
          aria-label="Open context panel"
        >
          <ChevronUp className="w-4 h-4" aria-hidden="true" />
          <span className="text-xs font-source-sans font-semibold">Context</span>
        </button>
      )}

      {/* Bottom sheet overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={toggle}
          role="dialog"
          aria-modal="true"
          aria-label="Context panel"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 animate-fade-in" />

          {/* Sheet */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0",
              "bg-[var(--bg-secondary)] border-t border-[var(--border)]",
              "rounded-t-2xl",
              "max-h-[70vh] flex flex-col",
              "animate-slide-up",
              "pb-safe",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-[var(--text-muted)]/30" />
            </div>

            {/* Close header */}
            <div className="flex items-center justify-between px-4 pb-2">
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Context
              </span>
              <button
                onClick={toggle}
                className="p-2 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] touch-target flex items-center justify-center"
                aria-label="Close context panel"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            <TabBar activeTab={activeTab} setTab={setTab} />

            <div className="flex-1 overflow-y-auto">
              <TabContent activeTab={activeTab} mediaItems={mediaItems} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Shared Sub-Components ──────────────────────────────── */

function TabBar({ activeTab, setTab }: { activeTab: string; setTab: (t: string) => void }) {
  return (
    <div
      className="flex border-b border-[var(--border)] overflow-x-auto scrollbar-hide shrink-0"
      role="tablist"
      aria-label="Context panel tabs"
    >
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setTab(id)}
          className={cn(
            "flex-1 shrink-0 flex flex-col items-center gap-1 py-3 text-xs whitespace-nowrap transition-colors touch-target min-w-[3.5rem]",
            activeTab === id
              ? "text-[var(--accent-gold)] border-b-2 border-[var(--accent-gold)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
          )}
          aria-label={label}
          aria-selected={activeTab === id}
          role="tab"
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}

/** Renders the active tab's content. */
function TabContent({
  activeTab,
  mediaItems,
}: {
  activeTab: string;
  mediaItems: MediaItem[];
}) {
  switch (activeTab) {
    case "visuals":
      return (
        <div className="p-3">
          <MediaGallery items={mediaItems} />
        </div>
      );
    case "people":
      return (
        <div className="p-3">
          <PeopleTabContent />
        </div>
      );
    case "cross-references":
      return <CrossRefTab />;
    case "places":
      return (
        <div className="p-3">
          <PlacesTabContent />
        </div>
      );
    case "notes":
      return <NotesTabContent />;
    case "study":
      return (
        <div className="p-3">
          <StudyTabContent />
        </div>
      );
    default:
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-[var(--text-muted)] text-center italic">
            Content loading&hellip;
          </p>
        </div>
      );
  }
}

function CollapsedRail({
  activeTab,
  setTab,
  toggle,
  isOpen,
}: {
  activeTab: string;
  setTab: (t: string) => void;
  toggle: () => void;
  isOpen: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 pt-3">
      {TABS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => {
            setTab(id);
            if (!isOpen) toggle();
          }}
          className={cn(
            "p-2 rounded transition-colors touch-target flex items-center justify-center",
            activeTab === id
              ? "text-[var(--accent-gold)] bg-[var(--bg-tertiary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
          )}
          aria-label={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
