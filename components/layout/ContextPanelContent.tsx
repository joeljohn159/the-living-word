"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CONTEXT_TABS } from "@/components/layout/context-panel-tabs";
import { EvidenceTabContent } from "@/components/layout/EvidenceTabContent";
import { PeopleTabContent } from "@/components/people/PeopleTabContent";
import { NotesTabContent } from "@/components/notes/NotesTabContent";
import { MapTabContent } from "@/components/maps/MapTabContent";

interface ContextPanelContentProps {
  activeTab: string;
  /** Current book name (e.g. "Genesis") — used by Notes tab. */
  book?: string;
  /** Current chapter number — used by Notes tab. */
  chapter?: number;
}

const tabVariants = {
  enter: { opacity: 0, x: 12 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};

/**
 * Animated content area that renders the active tab's content.
 * Evidence tab has full implementation; others show placeholders.
 */
export function ContextPanelContent({
  activeTab,
  book = "Genesis",
  chapter = 1,
}: ContextPanelContentProps) {
  const tab = CONTEXT_TABS.find((t) => t.key === activeTab);

  if (!tab) return null;

  // Map tab needs full-height layout with no padding for the Leaflet container
  if (activeTab === "map") {
    return (
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key="map"
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            <MapTabContent />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="p-4"
        >
          {activeTab === "evidence" ? (
            <EvidenceTabContent />
          ) : activeTab === "people" ? (
            <PeopleTabContent />
          ) : activeTab === "notes" ? (
            <NotesTabContent book={book} chapter={chapter} />
          ) : (
            <TabPlaceholder activeTab={activeTab} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── Placeholder for unimplemented tabs ─────────────────────── */

function TabPlaceholder({ activeTab }: { activeTab: string }) {
  const tab = CONTEXT_TABS.find((t) => t.key === activeTab);
  if (!tab) return null;

  const Icon = tab.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-gold/10 p-4 mb-4">
        <Icon className="h-8 w-8 text-gold" aria-hidden="true" />
      </div>
      <h3 className="font-cormorant text-lg font-semibold text-foreground mb-1">
        {tab.label}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[200px]">
        {getTabDescription(activeTab)}
      </p>
    </div>
  );
}

function getTabDescription(tabKey: string): string {
  switch (tabKey) {
    case "visuals":
      return "Artwork and illustrations for this passage";
    case "evidence":
      return "Archaeological and historical evidence";
    case "map":
      return "Geographic locations mentioned in this passage";
    case "cross-references":
      return "Related verses and passages";
    case "people":
      return "People mentioned in this passage";
    case "notes":
      return "Your personal notes and highlights";
    default:
      return "";
  }
}
