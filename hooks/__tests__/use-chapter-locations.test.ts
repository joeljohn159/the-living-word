import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useChapterLocations } from "../use-chapter-locations";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const sampleLocations = [
  {
    id: 1,
    name: "Jerusalem",
    slug: "jerusalem",
    description: "Holy city and capital of ancient Israel",
    locationType: "city",
    latitude: 31.7683,
    longitude: 35.2137,
    modernName: "Jerusalem",
    imageUrl: null,
  },
  {
    id: 2,
    name: "Bethlehem",
    slug: "bethlehem",
    description: "Birthplace of King David",
    locationType: "city",
    latitude: 31.7054,
    longitude: 35.2024,
    modernName: "Bethlehem",
    imageUrl: null,
  },
];

describe("useChapterLocations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches locations for a valid book and chapter", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(sampleLocations),
    });

    const { result } = renderHook(() => useChapterLocations("genesis", 1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/locations?bookSlug=genesis&chapter=1"
    );
    expect(result.current.locations).toEqual(sampleLocations);
    expect(result.current.error).toBeNull();
  });

  it("returns empty locations when bookSlug is empty", async () => {
    const { result } = renderHook(() => useChapterLocations("", 1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.locations).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns empty locations when chapter is 0", async () => {
    const { result } = renderHook(() => useChapterLocations("genesis", 0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.locations).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("sets error when fetch returns non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve([]),
    });

    const { result } = renderHook(() => useChapterLocations("exodus", 3));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Could not load locations");
    expect(result.current.locations).toEqual([]);
  });

  it("sets error when fetch throws a network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useChapterLocations("exodus", 3));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Could not load locations");
    expect(result.current.locations).toEqual([]);
  });

  it("handles empty array response from API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { result } = renderHook(() => useChapterLocations("obadiah", 1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.locations).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("encodes bookSlug with special characters in the URL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { result } = renderHook(() =>
      useChapterLocations("1-samuel", 5)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/locations?bookSlug=1-samuel&chapter=5"
    );
  });

  it("re-fetches when bookSlug changes", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(sampleLocations),
    });

    const { result, rerender } = renderHook(
      ({ bookSlug, chapter }) => useChapterLocations(bookSlug, chapter),
      { initialProps: { bookSlug: "genesis", chapter: 1 } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([sampleLocations[0]]),
    });

    rerender({ bookSlug: "exodus", chapter: 1 });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith(
      "/api/locations?bookSlug=exodus&chapter=1"
    );
  });

  it("re-fetches when chapter changes", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(sampleLocations),
    });

    const { result, rerender } = renderHook(
      ({ bookSlug, chapter }) => useChapterLocations(bookSlug, chapter),
      { initialProps: { bookSlug: "genesis", chapter: 1 } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    rerender({ bookSlug: "genesis", chapter: 2 });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith(
      "/api/locations?bookSlug=genesis&chapter=2"
    );
  });
});
