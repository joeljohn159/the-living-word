"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CONTEXT_TABS } from "@/components/layout/context-panel-tabs";

interface ContextPanelContentProps {
  activeTab: string;
}

const tabVariants = {
  enter: { opacity: 0, x: 12 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};

/**
 * Animated content area that renders a placeholder for the active tab.
 * Each tab will be replaced with real content in future stories.
 */
export function ContextPanelContent({ activeTab }: ContextPanelContentProps) {
  const tab = CONTEXT_TABS.find((t) => t.key === activeTab);

  if (!tab) return null;

  const Icon = tab.icon;

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
        </motion.div>
      </AnimatePresence>
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
