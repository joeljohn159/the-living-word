import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../route";

const mockGetPeopleByChapterWithFamily = vi.fn();

vi.mock("@/lib/db/queries", () => ({
  getPeopleByChapterWithFamily: (...args: unknown[]) =>
    mockGetPeopleByChapterWithFamily(...args),
}));

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/people/chapter");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

describe("GET /api/people/chapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Validation ---

  it("returns 400 when book param is missing", async () => {
    const res = await GET(makeRequest({ chapter: "1" }));
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toMatch(/missing/i);
    expect(body.people).toEqual([]);
  });

  it("returns 400 when chapter param is missing", async () => {
    const res = await GET(makeRequest({ book: "genesis" }));
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toMatch(/missing/i);
  });

  it("returns 400 when chapter is not a number", async () => {
    const res = await GET(makeRequest({ book: "genesis", chapter: "abc" }));
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  it("returns 400 when chapter is zero", async () => {
    const res = await GET(makeRequest({ book: "genesis", chapter: "0" }));
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  it("returns 400 when chapter is negative", async () => {
    const res = await GET(makeRequest({ book: "genesis", chapter: "-1" }));
    expect(res.status).toBe(400);
  });

  // --- Happy path ---

  it("returns people for a valid book and chapter", async () => {
    const mockPeople = [
      { id: 1, name: "Adam", slug: "adam" },
      { id: 2, name: "Eve", slug: "eve" },
    ];
    mockGetPeopleByChapterWithFamily.mockResolvedValue(mockPeople);

    const res = await GET(makeRequest({ book: "genesis", chapter: "1" }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.people).toEqual(mockPeople);
    expect(mockGetPeopleByChapterWithFamily).toHaveBeenCalledWith("genesis", 1);
  });

  it("returns an empty array when no people are found", async () => {
    mockGetPeopleByChapterWithFamily.mockResolvedValue([]);

    const res = await GET(makeRequest({ book: "psalms", chapter: "119" }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.people).toEqual([]);
  });

  // --- Error handling ---

  it("returns 500 when the database query throws", async () => {
    mockGetPeopleByChapterWithFamily.mockRejectedValue(
      new Error("DB connection failed")
    );

    const res = await GET(makeRequest({ book: "genesis", chapter: "1" }));
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toMatch(/failed/i);
    expect(body.people).toEqual([]);
  });
});
