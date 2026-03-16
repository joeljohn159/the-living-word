import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useChapterEvidence } from "../use-chapter-evidence";

// Mock next/navigation
const mockParams = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => mockParams(),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const sampleResponse = [
  {
    id: 1,
    title: "Dead Sea Scrolls",
    slug: "dead-sea-scrolls",
    description: "Ancient manuscripts",
    category: "manuscript",
    dateDiscovered: "1947",
    locationFound: "Qumran Caves",
    currentLocation: "Israel Museum",
    significance: "Oldest biblical copies",
    imageUrl: "/images/dss.jpg",
    sourceUrl: null,
  },
];

describe("useChapterEvidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches evidence for the current chapter from URL params", async () => {
    mockParams.mockReturnValue({ bookSlug: "genesis", chapter: "1" });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(sampleResponse),
    });

    const { result } = renderHook(() => useChapterEvidence());

    // Initially loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/evidence?bookSlug=genesis&chapter=1"
    );
    expect(result.current.evidence).toEqual(sampleResponse);
    expect(result.current.error).toBeNull();
  });

  it("returns empty evidence and stops loading when bookSlug is missing", async () => {
    mockParams.mockReturnValue({ chapter: "1" });

    const { result } = renderHook(() => useChapterEvidence());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.evidence).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns empty evidence when chapter is missing", async () => {
    mockParams.mockReturnValue({ bookSlug: "genesis" });

    const { result } = renderHook(() => useChapterEvidence());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.evidence).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns empty evidence when params is null", async () => {
    mockParams.mockReturnValue(null);

    const { result } = renderHook(() => useChapterEvidence());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.evidence).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("sets error when fetch returns non-ok response", async () => {
    mockParams.mockReturnValue({ bookSlug: "exodus", chapter: "3" });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Internal Server Error" }),
    });

    const { result } = renderHook(() => useChapterEvidence());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to fetch evidence");
    expect(result.current.evidence).toEqual([]);
  });

  it("sets error when fetch throws a network error", async () => {
    mockParams.mockReturnValue({ bookSlug: "exodus", chapter: "3" });
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useChapterEvidence());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.evidence).toEqual([]);
  });

  it("handles empty array response from API", async () => {
    mockParams.mockReturnValue({ bookSlug: "obadiah", chapter: "1" });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { result } = renderHook(() => useChapterEvidence());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.evidence).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
