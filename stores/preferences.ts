import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light" | "sepia";
export type ReadingMode = "paragraph" | "verse-per-line";

interface PreferencesState {
  theme: Theme;
  fontSize: number;
  readingMode: ReadingMode;
  sidebarOpen: boolean;
  activeSidebarTab: string;
  dictionaryMode: boolean;

  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
  setFontSize: (size: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  setReadingMode: (mode: ReadingMode) => void;
  toggleSidebar: () => void;
  setActiveSidebarTab: (tab: string) => void;
  toggleDictionaryMode: () => void;
  setDictionaryMode: (on: boolean) => void;
}

const THEME_ORDER: Theme[] = ["dark", "light", "sepia"];
const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 28;
const FONT_SIZE_STEP = 2;

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      fontSize: 20,
      readingMode: "paragraph",
      sidebarOpen: true,
      activeSidebarTab: "visuals",
      dictionaryMode: false,

      setTheme: (theme) => set({ theme }),

      cycleTheme: () => {
        const current = get().theme;
        const idx = THEME_ORDER.indexOf(current);
        const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
        set({ theme: next });
      },

      setFontSize: (size) =>
        set({ fontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, size)) }),

      increaseFontSize: () => {
        const current = get().fontSize;
        set({ fontSize: Math.min(MAX_FONT_SIZE, current + FONT_SIZE_STEP) });
      },

      decreaseFontSize: () => {
        const current = get().fontSize;
        set({ fontSize: Math.max(MIN_FONT_SIZE, current - FONT_SIZE_STEP) });
      },

      setReadingMode: (mode) => set({ readingMode: mode }),

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),

      toggleDictionaryMode: () => set((s) => ({ dictionaryMode: !s.dictionaryMode })),
      setDictionaryMode: (on) => set({ dictionaryMode: on }),
    }),
    {
      name: "the-living-word-preferences",
    }
  )
);
