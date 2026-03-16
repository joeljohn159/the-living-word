"use client";

import { usePreferencesStore } from "@/stores/preferences";
import { PanelRightClose, PanelRightOpen, BookOpen, MapPin, Users, Image } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "visuals", label: "Art", icon: Image },
  { id: "places", label: "Places", icon: MapPin },
  { id: "people", label: "People", icon: Users },
  { id: "study", label: "Study", icon: BookOpen },
] as const;

/** Placeholder context panel for the right side on desktop. */
export function ContextPanel() {
  const isOpen = usePreferencesStore((s) => s.sidebarOpen);
  const toggle = usePreferencesStore((s) => s.toggleSidebar);
  const activeTab = usePreferencesStore((s) => s.activeSidebarTab);
  const setTab = usePreferencesStore((s) => s.setActiveSidebarTab);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-l border-[var(--border)] bg-[var(--bg-secondary)] transition-all duration-300",
        isOpen ? "w-80 xl:w-96" : "w-12",
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
          className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]
                     hover:text-[var(--text-primary)] transition-colors"
          aria-label={isOpen ? "Collapse panel" : "Expand panel"}
        >
          {isOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
      </div>

      {isOpen ? (
        <>
          {/* Tabs */}
          <div className="flex border-b border-[var(--border)]">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors",
                  activeTab === id
                    ? "text-[var(--accent-gold)] border-b-2 border-[var(--accent-gold)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                )}
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Placeholder content */}
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-sm text-[var(--text-muted)] text-center italic">
              Context content coming soon&hellip;
            </p>
          </div>
        </>
      ) : (
        /* Collapsed icon rail */
        <div className="flex flex-col items-center gap-3 pt-3">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                if (!isOpen) toggle();
              }}
              className={cn(
                "p-2 rounded transition-colors",
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
      )}
    </aside>
  );
}
