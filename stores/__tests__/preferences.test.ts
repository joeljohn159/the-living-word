import { describe, it, expect, beforeEach } from "vitest";
import { usePreferencesStore } from "../preferences";

// Reset the store between tests to ensure independence
beforeEach(() => {
  usePreferencesStore.setState({
    theme: "dark",
    fontSize: 20,
    readingMode: "paragraph",
    sidebarOpen: true,
    activeSidebarTab: "visuals",
    dictionaryMode: false,
  });
});

describe("Preferences store — default state", () => {
  it("starts with dark theme", () => {
    expect(usePreferencesStore.getState().theme).toBe("dark");
  });

  it("starts with font size 20", () => {
    expect(usePreferencesStore.getState().fontSize).toBe(20);
  });

  it("starts with paragraph reading mode", () => {
    expect(usePreferencesStore.getState().readingMode).toBe("paragraph");
  });

  it("starts with sidebar open", () => {
    expect(usePreferencesStore.getState().sidebarOpen).toBe(true);
  });

  it("starts with dictionary mode off", () => {
    expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
  });
});

describe("Preferences store — theme management", () => {
  it("setTheme changes the theme", () => {
    usePreferencesStore.getState().setTheme("light");
    expect(usePreferencesStore.getState().theme).toBe("light");
  });

  it("setTheme accepts sepia theme", () => {
    usePreferencesStore.getState().setTheme("sepia");
    expect(usePreferencesStore.getState().theme).toBe("sepia");
  });

  it("cycleTheme cycles dark → light → sepia → dark", () => {
    const { cycleTheme } = usePreferencesStore.getState();

    // dark → light
    cycleTheme();
    expect(usePreferencesStore.getState().theme).toBe("light");

    // light → sepia
    usePreferencesStore.getState().cycleTheme();
    expect(usePreferencesStore.getState().theme).toBe("sepia");

    // sepia → dark
    usePreferencesStore.getState().cycleTheme();
    expect(usePreferencesStore.getState().theme).toBe("dark");
  });
});

describe("Preferences store — font size controls", () => {
  it("setFontSize sets an exact size", () => {
    usePreferencesStore.getState().setFontSize(24);
    expect(usePreferencesStore.getState().fontSize).toBe(24);
  });

  it("setFontSize clamps to minimum of 14", () => {
    usePreferencesStore.getState().setFontSize(10);
    expect(usePreferencesStore.getState().fontSize).toBe(14);
  });

  it("setFontSize clamps to maximum of 28", () => {
    usePreferencesStore.getState().setFontSize(40);
    expect(usePreferencesStore.getState().fontSize).toBe(28);
  });

  it("increaseFontSize increments by 2", () => {
    usePreferencesStore.getState().increaseFontSize();
    expect(usePreferencesStore.getState().fontSize).toBe(22);
  });

  it("decreaseFontSize decrements by 2", () => {
    usePreferencesStore.getState().decreaseFontSize();
    expect(usePreferencesStore.getState().fontSize).toBe(18);
  });

  it("increaseFontSize does not exceed maximum", () => {
    usePreferencesStore.getState().setFontSize(28);
    usePreferencesStore.getState().increaseFontSize();
    expect(usePreferencesStore.getState().fontSize).toBe(28);
  });

  it("decreaseFontSize does not go below minimum", () => {
    usePreferencesStore.getState().setFontSize(14);
    usePreferencesStore.getState().decreaseFontSize();
    expect(usePreferencesStore.getState().fontSize).toBe(14);
  });
});

describe("Preferences store — reading mode", () => {
  it("setReadingMode changes to verse-per-line", () => {
    usePreferencesStore.getState().setReadingMode("verse-per-line");
    expect(usePreferencesStore.getState().readingMode).toBe("verse-per-line");
  });

  it("setReadingMode changes back to paragraph", () => {
    usePreferencesStore.getState().setReadingMode("verse-per-line");
    usePreferencesStore.getState().setReadingMode("paragraph");
    expect(usePreferencesStore.getState().readingMode).toBe("paragraph");
  });
});

describe("Preferences store — sidebar", () => {
  it("toggleSidebar closes an open sidebar", () => {
    usePreferencesStore.getState().toggleSidebar();
    expect(usePreferencesStore.getState().sidebarOpen).toBe(false);
  });

  it("toggleSidebar opens a closed sidebar", () => {
    usePreferencesStore.getState().toggleSidebar(); // close
    usePreferencesStore.getState().toggleSidebar(); // open
    expect(usePreferencesStore.getState().sidebarOpen).toBe(true);
  });

  it("setActiveSidebarTab changes the active tab", () => {
    usePreferencesStore.getState().setActiveSidebarTab("notes");
    expect(usePreferencesStore.getState().activeSidebarTab).toBe("notes");
  });
});

describe("Preferences store — dictionary mode", () => {
  it("toggleDictionaryMode enables dictionary mode", () => {
    usePreferencesStore.getState().toggleDictionaryMode();
    expect(usePreferencesStore.getState().dictionaryMode).toBe(true);
  });

  it("toggleDictionaryMode disables dictionary mode when on", () => {
    usePreferencesStore.getState().toggleDictionaryMode(); // on
    usePreferencesStore.getState().toggleDictionaryMode(); // off
    expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
  });

  it("setDictionaryMode explicitly sets mode on/off", () => {
    usePreferencesStore.getState().setDictionaryMode(true);
    expect(usePreferencesStore.getState().dictionaryMode).toBe(true);

    usePreferencesStore.getState().setDictionaryMode(false);
    expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
  });
});
