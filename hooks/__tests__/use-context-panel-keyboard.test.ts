import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useContextPanelKeyboard } from "../use-context-panel-keyboard";
import { usePreferencesStore } from "@/stores/preferences";

function resetStore(overrides: Record<string, unknown> = {}) {
  usePreferencesStore.setState({
    theme: "dark",
    fontSize: 20,
    readingMode: "paragraph",
    sidebarOpen: true,
    activeSidebarTab: "visuals",
    dictionaryMode: false,
    ...overrides,
  });
}

function pressKey(key: string, opts: Partial<KeyboardEventInit> = {}) {
  window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...opts }));
}

describe("useContextPanelKeyboard", () => {
  beforeEach(() => {
    resetStore();
  });

  // --- F key: toggle sidebar ---

  it("toggles sidebar closed when 'f' is pressed and sidebar is open", () => {
    renderHook(() => useContextPanelKeyboard());
    pressKey("f");
    expect(usePreferencesStore.getState().sidebarOpen).toBe(false);
  });

  it("toggles sidebar open when 'F' is pressed and sidebar is closed", () => {
    resetStore({ sidebarOpen: false });
    renderHook(() => useContextPanelKeyboard());
    pressKey("F");
    expect(usePreferencesStore.getState().sidebarOpen).toBe(true);
  });

  // --- M key: map tab ---

  it("switches to the map tab when 'm' is pressed", () => {
    renderHook(() => useContextPanelKeyboard());
    pressKey("m");
    expect(usePreferencesStore.getState().activeSidebarTab).toBe("map");
  });

  it("opens sidebar and switches to map tab when 'M' is pressed with sidebar closed", () => {
    resetStore({ sidebarOpen: false });
    renderHook(() => useContextPanelKeyboard());
    pressKey("M");
    expect(usePreferencesStore.getState().activeSidebarTab).toBe("map");
    expect(usePreferencesStore.getState().sidebarOpen).toBe(true);
  });

  it("does not re-toggle sidebar if already open when 'M' is pressed", () => {
    resetStore({ sidebarOpen: true });
    renderHook(() => useContextPanelKeyboard());
    pressKey("m");
    expect(usePreferencesStore.getState().sidebarOpen).toBe(true);
    expect(usePreferencesStore.getState().activeSidebarTab).toBe("map");
  });

  // --- Modifier keys should be ignored ---

  it("ignores 'f' when metaKey is held", () => {
    renderHook(() => useContextPanelKeyboard());
    pressKey("f", { metaKey: true });
    expect(usePreferencesStore.getState().sidebarOpen).toBe(true); // unchanged
  });

  it("ignores 'm' when ctrlKey is held", () => {
    renderHook(() => useContextPanelKeyboard());
    pressKey("m", { ctrlKey: true });
    expect(usePreferencesStore.getState().activeSidebarTab).toBe("visuals"); // unchanged
  });

  it("ignores 'f' when altKey is held", () => {
    renderHook(() => useContextPanelKeyboard());
    pressKey("f", { altKey: true });
    expect(usePreferencesStore.getState().sidebarOpen).toBe(true); // unchanged
  });

  // --- Input fields should be ignored ---

  it("ignores keypresses when target is an INPUT element", () => {
    renderHook(() => useContextPanelKeyboard());
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "f", bubbles: true }));
    expect(usePreferencesStore.getState().sidebarOpen).toBe(true); // unchanged
    document.body.removeChild(input);
  });

  it("ignores keypresses when target is a TEXTAREA element", () => {
    renderHook(() => useContextPanelKeyboard());
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "f", bubbles: true }));
    expect(usePreferencesStore.getState().sidebarOpen).toBe(true); // unchanged
    document.body.removeChild(textarea);
  });

  it("ignores keypresses on contentEditable elements", () => {
    renderHook(() => useContextPanelKeyboard());
    const div = document.createElement("div");
    div.contentEditable = "true";
    // Manually define isContentEditable since jsdom doesn't compute it
    Object.defineProperty(div, "isContentEditable", { value: true });
    document.body.appendChild(div);
    div.dispatchEvent(new KeyboardEvent("keydown", { key: "f", bubbles: true }));
    expect(usePreferencesStore.getState().sidebarOpen).toBe(true); // unchanged
    document.body.removeChild(div);
  });

  // --- Cleanup ---

  it("removes the event listener on unmount", () => {
    const { unmount } = renderHook(() => useContextPanelKeyboard());
    unmount();
    pressKey("f");
    // Should still be true because listener was removed
    expect(usePreferencesStore.getState().sidebarOpen).toBe(true);
  });

  // --- Unrelated keys ---

  it("does not react to unrelated keys", () => {
    renderHook(() => useContextPanelKeyboard());
    pressKey("a");
    pressKey("Escape");
    pressKey("1");
    expect(usePreferencesStore.getState().sidebarOpen).toBe(true);
    expect(usePreferencesStore.getState().activeSidebarTab).toBe("visuals");
  });
});
