import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDictionaryMode } from "../useDictionaryMode";
import { usePreferencesStore } from "@/stores/preferences";

describe("useDictionaryMode", () => {
  beforeEach(() => {
    // Reset store to defaults before each test
    usePreferencesStore.setState({ dictionaryMode: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false when dictionary mode is off", () => {
    const { result } = renderHook(() => useDictionaryMode());
    expect(result.current).toBe(false);
  });

  it("returns true when dictionary mode is on", () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    const { result } = renderHook(() => useDictionaryMode());
    expect(result.current).toBe(true);
  });

  describe("D key toggle", () => {
    it("activates dictionary mode when D is pressed", () => {
      renderHook(() => useDictionaryMode());

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));
      });

      expect(usePreferencesStore.getState().dictionaryMode).toBe(true);
    });

    it("deactivates dictionary mode when D is pressed again", () => {
      usePreferencesStore.setState({ dictionaryMode: true });
      renderHook(() => useDictionaryMode());

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));
      });

      expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
    });

    it("works with uppercase D", () => {
      renderHook(() => useDictionaryMode());

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "D" }));
      });

      expect(usePreferencesStore.getState().dictionaryMode).toBe(true);
    });
  });

  describe("Escape key", () => {
    it("exits dictionary mode when Escape is pressed and mode is active", () => {
      usePreferencesStore.setState({ dictionaryMode: true });
      renderHook(() => useDictionaryMode());

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      });

      expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
    });

    it("does nothing when Escape is pressed and mode is already off", () => {
      renderHook(() => useDictionaryMode());

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      });

      expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
    });
  });

  describe("ignores keypresses in form elements", () => {
    it("ignores D key when typing in an INPUT", () => {
      renderHook(() => useDictionaryMode());
      const input = document.createElement("input");
      document.body.appendChild(input);

      act(() => {
        input.dispatchEvent(
          new KeyboardEvent("keydown", { key: "d", bubbles: true }),
        );
      });

      expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
      document.body.removeChild(input);
    });

    it("ignores D key when typing in a TEXTAREA", () => {
      renderHook(() => useDictionaryMode());
      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);

      act(() => {
        textarea.dispatchEvent(
          new KeyboardEvent("keydown", { key: "d", bubbles: true }),
        );
      });

      expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
      document.body.removeChild(textarea);
    });

    it("ignores D key when typing in a SELECT", () => {
      renderHook(() => useDictionaryMode());
      const select = document.createElement("select");
      document.body.appendChild(select);

      act(() => {
        select.dispatchEvent(
          new KeyboardEvent("keydown", { key: "d", bubbles: true }),
        );
      });

      expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
      document.body.removeChild(select);
    });

    it("ignores D key in contentEditable elements", () => {
      // jsdom has limited isContentEditable support; we verify the guard
      // by dispatching a keydown event whose target reports isContentEditable = true.
      renderHook(() => useDictionaryMode());

      const handler = vi.fn();
      // Capture the handler that was added to window
      const origAddEventListener = window.addEventListener;

      // We test the guard logic indirectly: the source checks e.target.isContentEditable.
      // Dispatch a synthetic event with a mock target that has isContentEditable = true.
      const mockTarget = { tagName: "DIV", isContentEditable: true } as unknown as HTMLElement;
      const event = new KeyboardEvent("keydown", { key: "d", bubbles: true });
      Object.defineProperty(event, "target", { value: mockTarget, writable: false });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
    });
  });

  describe("ignores keypresses with modifier keys", () => {
    it("ignores D key with Ctrl held", () => {
      renderHook(() => useDictionaryMode());

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "d", ctrlKey: true }),
        );
      });

      expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
    });

    it("ignores D key with Meta (Cmd) held", () => {
      renderHook(() => useDictionaryMode());

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "d", metaKey: true }),
        );
      });

      expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
    });

    it("ignores D key with Alt held", () => {
      renderHook(() => useDictionaryMode());

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "d", altKey: true }),
        );
      });

      expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
    });
  });

  it("ignores unrelated keys", () => {
    renderHook(() => useDictionaryMode());

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    });

    expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
  });

  it("cleans up event listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useDictionaryMode());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });
});
