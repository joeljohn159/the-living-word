import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import { useThemeKeyboard } from "../use-theme-keyboard";
import { usePreferencesStore } from "@/stores/preferences";

function fireKey(
  key: string,
  options: Partial<KeyboardEventInit> = {},
  target?: HTMLElement
) {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    ...options,
  });
  // Dispatch from the target element so event.target is set correctly by the DOM
  const dispatchTarget = target ?? window;
  if (target && !target.isConnected) {
    document.body.appendChild(target);
  }
  dispatchTarget.dispatchEvent(event);
}

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

describe("useThemeKeyboard", () => {
  it("cycles theme when T key is pressed", () => {
    renderHook(() => useThemeKeyboard());

    act(() => fireKey("t"));
    expect(usePreferencesStore.getState().theme).toBe("light");

    act(() => fireKey("t"));
    expect(usePreferencesStore.getState().theme).toBe("sepia");

    act(() => fireKey("t"));
    expect(usePreferencesStore.getState().theme).toBe("dark");
  });

  it("responds to uppercase T as well", () => {
    renderHook(() => useThemeKeyboard());

    act(() => fireKey("T"));
    expect(usePreferencesStore.getState().theme).toBe("light");
  });

  it("ignores T key when target is an INPUT element", () => {
    renderHook(() => useThemeKeyboard());

    const input = document.createElement("input");
    act(() => fireKey("t", {}, input));
    expect(usePreferencesStore.getState().theme).toBe("dark");
  });

  it("ignores T key when target is a TEXTAREA element", () => {
    renderHook(() => useThemeKeyboard());

    const textarea = document.createElement("textarea");
    act(() => fireKey("t", {}, textarea));
    expect(usePreferencesStore.getState().theme).toBe("dark");
  });

  it("ignores T key when target is a SELECT element", () => {
    renderHook(() => useThemeKeyboard());

    const select = document.createElement("select");
    act(() => fireKey("t", {}, select));
    expect(usePreferencesStore.getState().theme).toBe("dark");
  });

  it("ignores T key when target is contentEditable", () => {
    renderHook(() => useThemeKeyboard());

    const div = document.createElement("div");
    div.contentEditable = "true";
    document.body.appendChild(div);

    // jsdom doesn't fully support isContentEditable, so we define it explicitly
    Object.defineProperty(div, "isContentEditable", { value: true });

    act(() => {
      div.dispatchEvent(
        new KeyboardEvent("keydown", { key: "t", bubbles: true })
      );
    });
    expect(usePreferencesStore.getState().theme).toBe("dark");
  });

  it("ignores T key when Ctrl modifier is held", () => {
    renderHook(() => useThemeKeyboard());

    act(() => fireKey("t", { ctrlKey: true }));
    expect(usePreferencesStore.getState().theme).toBe("dark");
  });

  it("ignores T key when Meta modifier is held", () => {
    renderHook(() => useThemeKeyboard());

    act(() => fireKey("t", { metaKey: true }));
    expect(usePreferencesStore.getState().theme).toBe("dark");
  });

  it("ignores T key when Alt modifier is held", () => {
    renderHook(() => useThemeKeyboard());

    act(() => fireKey("t", { altKey: true }));
    expect(usePreferencesStore.getState().theme).toBe("dark");
  });

  it("does not respond to other keys", () => {
    renderHook(() => useThemeKeyboard());

    act(() => fireKey("a"));
    act(() => fireKey("Enter"));
    act(() => fireKey(" "));
    expect(usePreferencesStore.getState().theme).toBe("dark");
  });

  it("cleans up event listener on unmount", () => {
    const { unmount } = renderHook(() => useThemeKeyboard());

    unmount();

    act(() => fireKey("t"));
    expect(usePreferencesStore.getState().theme).toBe("dark");
  });
});
