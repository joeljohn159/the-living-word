import {
  buildDictionaryLookup,
  findHotwords,
  segmentVerseText,
  type DictionaryEntry,
} from "../dictionary";

const entries: DictionaryEntry[] = [
  {
    word: "Thee",
    slug: "thee",
    definition: "Archaic form of 'you'.",
    modernEquivalent: "You",
    partOfSpeech: "pronoun",
  },
  {
    word: "Hath",
    slug: "hath",
    definition: "Archaic third person singular of 'have'.",
    modernEquivalent: "Has",
    partOfSpeech: "verb",
  },
  {
    word: "Verily",
    slug: "verily",
    definition: "In truth; certainly.",
    modernEquivalent: "Truly",
    partOfSpeech: "adverb",
  },
  {
    word: "Begat",
    slug: "begat",
    definition: "Past tense of beget.",
    modernEquivalent: "Fathered",
    partOfSpeech: "verb",
  },
  {
    word: "Thy",
    slug: "thy",
    definition: "Possessive form of thou.",
    modernEquivalent: "Your",
    partOfSpeech: "pronoun",
  },
];

describe("buildDictionaryLookup", () => {
  it("creates a lowercase map from entries", () => {
    const lookup = buildDictionaryLookup(entries);
    expect(lookup.size).toBe(5);
    expect(lookup.has("thee")).toBe(true);
    expect(lookup.has("Thee")).toBe(false); // case-sensitive keys
    expect(lookup.get("hath")?.word).toBe("Hath");
  });

  it("returns empty map for empty entries", () => {
    const lookup = buildDictionaryLookup([]);
    expect(lookup.size).toBe(0);
  });
});

describe("findHotwords", () => {
  const lookup = buildDictionaryLookup(entries);

  it("finds matches in simple text", () => {
    const matches = findHotwords("He hath spoken unto thee.", lookup);
    expect(matches).toHaveLength(2);
    expect(matches[0].entry.word).toBe("Hath");
    expect(matches[0].original).toBe("hath");
    expect(matches[1].entry.word).toBe("Thee");
    expect(matches[1].original).toBe("thee");
  });

  it("matches case-insensitively", () => {
    const matches = findHotwords("HATH THEE", lookup);
    expect(matches).toHaveLength(2);
    expect(matches[0].entry.word).toBe("Hath");
    expect(matches[1].entry.word).toBe("Thee");
  });

  it("handles punctuation around words", () => {
    const matches = findHotwords("Verily, verily!", lookup);
    expect(matches).toHaveLength(2);
    expect(matches[0].original).toBe("Verily");
    expect(matches[1].original).toBe("verily");
  });

  it("does not match partial words", () => {
    const matches = findHotwords("theorem pathetic", lookup);
    expect(matches).toHaveLength(0);
  });

  it("returns empty for empty text", () => {
    expect(findHotwords("", lookup)).toHaveLength(0);
  });

  it("returns empty for empty lookup", () => {
    const emptyLookup = buildDictionaryLookup([]);
    expect(findHotwords("He hath spoken.", emptyLookup)).toHaveLength(0);
  });

  it("records correct start and end positions", () => {
    const text = "Abraham begat Isaac";
    const matches = findHotwords(text, lookup);
    expect(matches).toHaveLength(1);
    expect(matches[0].start).toBe(8);
    expect(matches[0].end).toBe(13);
    expect(text.slice(matches[0].start, matches[0].end)).toBe("begat");
  });
});

describe("segmentVerseText", () => {
  const lookup = buildDictionaryLookup(entries);

  it("returns single text segment when no matches", () => {
    const segments = segmentVerseText("No archaic words here.", lookup);
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("text");
    if (segments[0].type === "text") {
      expect(segments[0].content).toBe("No archaic words here.");
    }
  });

  it("splits text around hotwords correctly", () => {
    const segments = segmentVerseText("He hath spoken.", lookup);
    expect(segments).toHaveLength(3);
    expect(segments[0]).toEqual({ type: "text", content: "He " });
    expect(segments[1].type).toBe("hotword");
    if (segments[1].type === "hotword") {
      expect(segments[1].match.original).toBe("hath");
    }
    expect(segments[2]).toEqual({ type: "text", content: " spoken." });
  });

  it("handles hotword at start of text", () => {
    const segments = segmentVerseText("Verily I say", lookup);
    expect(segments[0].type).toBe("hotword");
    expect(segments[1]).toEqual({ type: "text", content: " I say" });
  });

  it("handles hotword at end of text", () => {
    const segments = segmentVerseText("I say unto thee", lookup);
    const last = segments[segments.length - 1];
    expect(last.type).toBe("hotword");
    if (last.type === "hotword") {
      expect(last.match.original).toBe("thee");
    }
  });

  it("handles multiple adjacent hotwords", () => {
    const segments = segmentVerseText("thy begat", lookup);
    // "thy" hotword, " " text, "begat" hotword
    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("hotword");
    expect(segments[1]).toEqual({ type: "text", content: " " });
    expect(segments[2].type).toBe("hotword");
  });
});
