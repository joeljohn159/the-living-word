import {
  Image,
  ShieldCheck,
  MapPin,
  Link2,
  Users,
  StickyNote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ContextTab {
  key: string;
  label: string;
  icon: LucideIcon;
  shortLabel: string;
}

/**
 * Tab definitions for the context panel.
 * Order determines display order in the tab bar.
 */
export const CONTEXT_TABS: ContextTab[] = [
  { key: "visuals", label: "Visuals", icon: Image, shortLabel: "Art" },
  { key: "evidence", label: "Evidence", icon: ShieldCheck, shortLabel: "Proof" },
  { key: "map", label: "Map", icon: MapPin, shortLabel: "Map" },
  { key: "cross-references", label: "Cross-Refs", icon: Link2, shortLabel: "Refs" },
  { key: "people", label: "People", icon: Users, shortLabel: "Ppl" },
  { key: "notes", label: "Notes", icon: StickyNote, shortLabel: "Notes" },
];
