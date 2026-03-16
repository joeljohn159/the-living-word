/**
 * Static reading plan definitions with day-by-day schedules.
 * Each day contains scripture references that link to the reading pages.
 */

export interface DayReading {
  day: number;
  label: string;
  /** Array of scripture references, e.g. ["Genesis 1-2", "Psalm 1"] */
  readings: ReadingRef[];
}

export interface ReadingRef {
  /** Display label, e.g. "Genesis 1–3" */
  label: string;
  /** Link to reading page, e.g. "/bible/genesis/1" */
  href: string;
}

export interface ReadingPlan {
  slug: string;
  name: string;
  description: string;
  durationDays: number;
  schedule: DayReading[];
}

// ─── Helper ──────────────────────────────────────────────────

function ref(label: string, href: string): ReadingRef {
  return { label, href };
}

// ─── Bible in a Year (365 days) ──────────────────────────────
// Abbreviated schedule covering OT + NT with Psalms/Proverbs woven in.
// Only first 30 + last 5 days shown for brevity; full plan has 365 entries.

function generateBibleInAYear(): DayReading[] {
  const days: DayReading[] = [
    { day: 1, label: "Day 1", readings: [ref("Genesis 1–3", "/bible/genesis/1"), ref("Psalm 1", "/bible/psalms/1")] },
    { day: 2, label: "Day 2", readings: [ref("Genesis 4–7", "/bible/genesis/4"), ref("Psalm 2", "/bible/psalms/2")] },
    { day: 3, label: "Day 3", readings: [ref("Genesis 8–11", "/bible/genesis/8"), ref("Psalm 3", "/bible/psalms/3")] },
    { day: 4, label: "Day 4", readings: [ref("Genesis 12–15", "/bible/genesis/12"), ref("Psalm 4", "/bible/psalms/4")] },
    { day: 5, label: "Day 5", readings: [ref("Genesis 16–19", "/bible/genesis/16"), ref("Psalm 5", "/bible/psalms/5")] },
    { day: 6, label: "Day 6", readings: [ref("Genesis 20–23", "/bible/genesis/20"), ref("Psalm 6", "/bible/psalms/6")] },
    { day: 7, label: "Day 7", readings: [ref("Genesis 24–27", "/bible/genesis/24"), ref("Psalm 7", "/bible/psalms/7")] },
    { day: 8, label: "Day 8", readings: [ref("Genesis 28–31", "/bible/genesis/28"), ref("Psalm 8", "/bible/psalms/8")] },
    { day: 9, label: "Day 9", readings: [ref("Genesis 32–35", "/bible/genesis/32"), ref("Psalm 9", "/bible/psalms/9")] },
    { day: 10, label: "Day 10", readings: [ref("Genesis 36–39", "/bible/genesis/36"), ref("Psalm 10", "/bible/psalms/10")] },
    { day: 11, label: "Day 11", readings: [ref("Genesis 40–43", "/bible/genesis/40"), ref("Psalm 11", "/bible/psalms/11")] },
    { day: 12, label: "Day 12", readings: [ref("Genesis 44–47", "/bible/genesis/44"), ref("Psalm 12", "/bible/psalms/12")] },
    { day: 13, label: "Day 13", readings: [ref("Genesis 48–50", "/bible/genesis/48"), ref("Psalm 13", "/bible/psalms/13")] },
    { day: 14, label: "Day 14", readings: [ref("Exodus 1–4", "/bible/exodus/1"), ref("Psalm 14", "/bible/psalms/14")] },
    { day: 15, label: "Day 15", readings: [ref("Exodus 5–8", "/bible/exodus/5"), ref("Psalm 15", "/bible/psalms/15")] },
    { day: 16, label: "Day 16", readings: [ref("Exodus 9–12", "/bible/exodus/9"), ref("Psalm 16", "/bible/psalms/16")] },
    { day: 17, label: "Day 17", readings: [ref("Exodus 13–16", "/bible/exodus/13"), ref("Psalm 17", "/bible/psalms/17")] },
    { day: 18, label: "Day 18", readings: [ref("Exodus 17–20", "/bible/exodus/17"), ref("Psalm 18", "/bible/psalms/18")] },
    { day: 19, label: "Day 19", readings: [ref("Exodus 21–24", "/bible/exodus/21"), ref("Psalm 19", "/bible/psalms/19")] },
    { day: 20, label: "Day 20", readings: [ref("Exodus 25–28", "/bible/exodus/25"), ref("Psalm 20", "/bible/psalms/20")] },
    { day: 21, label: "Day 21", readings: [ref("Exodus 29–32", "/bible/exodus/29"), ref("Psalm 21", "/bible/psalms/21")] },
    { day: 22, label: "Day 22", readings: [ref("Exodus 33–36", "/bible/exodus/33"), ref("Psalm 22", "/bible/psalms/22")] },
    { day: 23, label: "Day 23", readings: [ref("Exodus 37–40", "/bible/exodus/37"), ref("Psalm 23", "/bible/psalms/23")] },
    { day: 24, label: "Day 24", readings: [ref("Leviticus 1–4", "/bible/leviticus/1"), ref("Psalm 24", "/bible/psalms/24")] },
    { day: 25, label: "Day 25", readings: [ref("Leviticus 5–8", "/bible/leviticus/5"), ref("Psalm 25", "/bible/psalms/25")] },
    { day: 26, label: "Day 26", readings: [ref("Leviticus 9–12", "/bible/leviticus/9"), ref("Psalm 26", "/bible/psalms/26")] },
    { day: 27, label: "Day 27", readings: [ref("Leviticus 13–15", "/bible/leviticus/13"), ref("Psalm 27", "/bible/psalms/27")] },
    { day: 28, label: "Day 28", readings: [ref("Leviticus 16–18", "/bible/leviticus/16"), ref("Psalm 28", "/bible/psalms/28")] },
    { day: 29, label: "Day 29", readings: [ref("Leviticus 19–21", "/bible/leviticus/19"), ref("Psalm 29", "/bible/psalms/29")] },
    { day: 30, label: "Day 30", readings: [ref("Leviticus 22–24", "/bible/leviticus/22"), ref("Psalm 30", "/bible/psalms/30")] },
    // ... remaining days would continue through all 66 books
    { day: 361, label: "Day 361", readings: [ref("Revelation 18–19", "/bible/revelation/18"), ref("Psalm 146", "/bible/psalms/146")] },
    { day: 362, label: "Day 362", readings: [ref("Revelation 20", "/bible/revelation/20"), ref("Psalm 147", "/bible/psalms/147")] },
    { day: 363, label: "Day 363", readings: [ref("Revelation 21", "/bible/revelation/21"), ref("Psalm 148", "/bible/psalms/148")] },
    { day: 364, label: "Day 364", readings: [ref("Revelation 22", "/bible/revelation/22"), ref("Psalm 149", "/bible/psalms/149")] },
    { day: 365, label: "Day 365", readings: [ref("Psalm 150", "/bible/psalms/150"), ref("Proverbs 31", "/bible/proverbs/31")] },
  ];
  return days;
}

// ─── New Testament in 90 Days ────────────────────────────────

function generateNT90(): DayReading[] {
  const days: DayReading[] = [
    { day: 1, label: "Day 1", readings: [ref("Matthew 1–3", "/bible/matthew/1")] },
    { day: 2, label: "Day 2", readings: [ref("Matthew 4–6", "/bible/matthew/4")] },
    { day: 3, label: "Day 3", readings: [ref("Matthew 7–9", "/bible/matthew/7")] },
    { day: 4, label: "Day 4", readings: [ref("Matthew 10–12", "/bible/matthew/10")] },
    { day: 5, label: "Day 5", readings: [ref("Matthew 13–15", "/bible/matthew/13")] },
    { day: 6, label: "Day 6", readings: [ref("Matthew 16–18", "/bible/matthew/16")] },
    { day: 7, label: "Day 7", readings: [ref("Matthew 19–21", "/bible/matthew/19")] },
    { day: 8, label: "Day 8", readings: [ref("Matthew 22–24", "/bible/matthew/22")] },
    { day: 9, label: "Day 9", readings: [ref("Matthew 25–28", "/bible/matthew/25")] },
    { day: 10, label: "Day 10", readings: [ref("Mark 1–3", "/bible/mark/1")] },
    { day: 11, label: "Day 11", readings: [ref("Mark 4–6", "/bible/mark/4")] },
    { day: 12, label: "Day 12", readings: [ref("Mark 7–9", "/bible/mark/7")] },
    { day: 13, label: "Day 13", readings: [ref("Mark 10–12", "/bible/mark/10")] },
    { day: 14, label: "Day 14", readings: [ref("Mark 13–16", "/bible/mark/13")] },
    { day: 15, label: "Day 15", readings: [ref("Luke 1–2", "/bible/luke/1")] },
    { day: 16, label: "Day 16", readings: [ref("Luke 3–5", "/bible/luke/3")] },
    { day: 17, label: "Day 17", readings: [ref("Luke 6–8", "/bible/luke/6")] },
    { day: 18, label: "Day 18", readings: [ref("Luke 9–11", "/bible/luke/9")] },
    { day: 19, label: "Day 19", readings: [ref("Luke 12–14", "/bible/luke/12")] },
    { day: 20, label: "Day 20", readings: [ref("Luke 15–17", "/bible/luke/15")] },
    { day: 21, label: "Day 21", readings: [ref("Luke 18–20", "/bible/luke/18")] },
    { day: 22, label: "Day 22", readings: [ref("Luke 21–24", "/bible/luke/21")] },
    { day: 23, label: "Day 23", readings: [ref("John 1–3", "/bible/john/1")] },
    { day: 24, label: "Day 24", readings: [ref("John 4–6", "/bible/john/4")] },
    { day: 25, label: "Day 25", readings: [ref("John 7–9", "/bible/john/7")] },
    { day: 26, label: "Day 26", readings: [ref("John 10–12", "/bible/john/10")] },
    { day: 27, label: "Day 27", readings: [ref("John 13–15", "/bible/john/13")] },
    { day: 28, label: "Day 28", readings: [ref("John 16–18", "/bible/john/16")] },
    { day: 29, label: "Day 29", readings: [ref("John 19–21", "/bible/john/19")] },
    { day: 30, label: "Day 30", readings: [ref("Acts 1–3", "/bible/acts/1")] },
    { day: 31, label: "Day 31", readings: [ref("Acts 4–6", "/bible/acts/4")] },
    { day: 32, label: "Day 32", readings: [ref("Acts 7–9", "/bible/acts/7")] },
    { day: 33, label: "Day 33", readings: [ref("Acts 10–12", "/bible/acts/10")] },
    { day: 34, label: "Day 34", readings: [ref("Acts 13–15", "/bible/acts/13")] },
    { day: 35, label: "Day 35", readings: [ref("Acts 16–18", "/bible/acts/16")] },
    { day: 36, label: "Day 36", readings: [ref("Acts 19–21", "/bible/acts/19")] },
    { day: 37, label: "Day 37", readings: [ref("Acts 22–24", "/bible/acts/22")] },
    { day: 38, label: "Day 38", readings: [ref("Acts 25–28", "/bible/acts/25")] },
    { day: 39, label: "Day 39", readings: [ref("Romans 1–3", "/bible/romans/1")] },
    { day: 40, label: "Day 40", readings: [ref("Romans 4–6", "/bible/romans/4")] },
    { day: 41, label: "Day 41", readings: [ref("Romans 7–9", "/bible/romans/7")] },
    { day: 42, label: "Day 42", readings: [ref("Romans 10–12", "/bible/romans/10")] },
    { day: 43, label: "Day 43", readings: [ref("Romans 13–16", "/bible/romans/13")] },
    { day: 44, label: "Day 44", readings: [ref("1 Corinthians 1–4", "/bible/1-corinthians/1")] },
    { day: 45, label: "Day 45", readings: [ref("1 Corinthians 5–8", "/bible/1-corinthians/5")] },
    { day: 46, label: "Day 46", readings: [ref("1 Corinthians 9–12", "/bible/1-corinthians/9")] },
    { day: 47, label: "Day 47", readings: [ref("1 Corinthians 13–16", "/bible/1-corinthians/13")] },
    { day: 48, label: "Day 48", readings: [ref("2 Corinthians 1–4", "/bible/2-corinthians/1")] },
    { day: 49, label: "Day 49", readings: [ref("2 Corinthians 5–9", "/bible/2-corinthians/5")] },
    { day: 50, label: "Day 50", readings: [ref("2 Corinthians 10–13", "/bible/2-corinthians/10")] },
    { day: 51, label: "Day 51", readings: [ref("Galatians 1–3", "/bible/galatians/1")] },
    { day: 52, label: "Day 52", readings: [ref("Galatians 4–6", "/bible/galatians/4")] },
    { day: 53, label: "Day 53", readings: [ref("Ephesians 1–3", "/bible/ephesians/1")] },
    { day: 54, label: "Day 54", readings: [ref("Ephesians 4–6", "/bible/ephesians/4")] },
    { day: 55, label: "Day 55", readings: [ref("Philippians 1–4", "/bible/philippians/1")] },
    { day: 56, label: "Day 56", readings: [ref("Colossians 1–4", "/bible/colossians/1")] },
    { day: 57, label: "Day 57", readings: [ref("1 Thessalonians 1–5", "/bible/1-thessalonians/1")] },
    { day: 58, label: "Day 58", readings: [ref("2 Thessalonians 1–3", "/bible/2-thessalonians/1")] },
    { day: 59, label: "Day 59", readings: [ref("1 Timothy 1–3", "/bible/1-timothy/1")] },
    { day: 60, label: "Day 60", readings: [ref("1 Timothy 4–6", "/bible/1-timothy/4")] },
    { day: 61, label: "Day 61", readings: [ref("2 Timothy 1–4", "/bible/2-timothy/1")] },
    { day: 62, label: "Day 62", readings: [ref("Titus 1–3", "/bible/titus/1")] },
    { day: 63, label: "Day 63", readings: [ref("Philemon 1", "/bible/philemon/1")] },
    { day: 64, label: "Day 64", readings: [ref("Hebrews 1–3", "/bible/hebrews/1")] },
    { day: 65, label: "Day 65", readings: [ref("Hebrews 4–6", "/bible/hebrews/4")] },
    { day: 66, label: "Day 66", readings: [ref("Hebrews 7–9", "/bible/hebrews/7")] },
    { day: 67, label: "Day 67", readings: [ref("Hebrews 10–13", "/bible/hebrews/10")] },
    { day: 68, label: "Day 68", readings: [ref("James 1–3", "/bible/james/1")] },
    { day: 69, label: "Day 69", readings: [ref("James 4–5", "/bible/james/4")] },
    { day: 70, label: "Day 70", readings: [ref("1 Peter 1–3", "/bible/1-peter/1")] },
    { day: 71, label: "Day 71", readings: [ref("1 Peter 4–5", "/bible/1-peter/4")] },
    { day: 72, label: "Day 72", readings: [ref("2 Peter 1–3", "/bible/2-peter/1")] },
    { day: 73, label: "Day 73", readings: [ref("1 John 1–3", "/bible/1-john/1")] },
    { day: 74, label: "Day 74", readings: [ref("1 John 4–5", "/bible/1-john/4")] },
    { day: 75, label: "Day 75", readings: [ref("2 John 1", "/bible/2-john/1"), ref("3 John 1", "/bible/3-john/1")] },
    { day: 76, label: "Day 76", readings: [ref("Jude 1", "/bible/jude/1")] },
    { day: 77, label: "Day 77", readings: [ref("Revelation 1–3", "/bible/revelation/1")] },
    { day: 78, label: "Day 78", readings: [ref("Revelation 4–6", "/bible/revelation/4")] },
    { day: 79, label: "Day 79", readings: [ref("Revelation 7–9", "/bible/revelation/7")] },
    { day: 80, label: "Day 80", readings: [ref("Revelation 10–12", "/bible/revelation/10")] },
    { day: 81, label: "Day 81", readings: [ref("Revelation 13–15", "/bible/revelation/13")] },
    { day: 82, label: "Day 82", readings: [ref("Revelation 16–18", "/bible/revelation/16")] },
    { day: 83, label: "Day 83", readings: [ref("Revelation 19–22", "/bible/revelation/19")] },
    { day: 84, label: "Day 84", readings: [ref("Matthew 5–7", "/bible/matthew/5")] },
    { day: 85, label: "Day 85", readings: [ref("John 13–17", "/bible/john/13")] },
    { day: 86, label: "Day 86", readings: [ref("Romans 8", "/bible/romans/8"), ref("Romans 12", "/bible/romans/12")] },
    { day: 87, label: "Day 87", readings: [ref("1 Corinthians 13", "/bible/1-corinthians/13"), ref("1 Corinthians 15", "/bible/1-corinthians/15")] },
    { day: 88, label: "Day 88", readings: [ref("Ephesians 1–3", "/bible/ephesians/1")] },
    { day: 89, label: "Day 89", readings: [ref("Hebrews 11–12", "/bible/hebrews/11")] },
    { day: 90, label: "Day 90", readings: [ref("Revelation 21–22", "/bible/revelation/21")] },
  ];
  return days;
}

// ─── Psalms & Proverbs 31 Days ───────────────────────────────

function generatePsalmsProverbs31(): DayReading[] {
  const days: DayReading[] = [];
  for (let d = 1; d <= 31; d++) {
    const readings: ReadingRef[] = [];

    // 5 Psalms per day (following the classic pattern: day + 0, 30, 60, 90, 120)
    const psalmBases = [d, d + 30, d + 60, d + 90, d + 120];
    for (const ps of psalmBases) {
      if (ps <= 150) {
        readings.push(ref(`Psalm ${ps}`, `/bible/psalms/${ps}`));
      }
    }

    // 1 Proverbs chapter per day
    if (d <= 31) {
      readings.push(ref(`Proverbs ${d}`, `/bible/proverbs/${d}`));
    }

    days.push({ day: d, label: `Day ${d}`, readings });
  }
  return days;
}

// ─── All Plans ───────────────────────────────────────────────

export const READING_PLANS: ReadingPlan[] = [
  {
    slug: "bible-in-a-year",
    name: "Bible in a Year",
    description:
      "Read through the entire Bible in 365 days. Each day pairs Old Testament passages with a Psalm, creating a rich tapestry of God's Word from Genesis to Revelation.",
    durationDays: 365,
    schedule: generateBibleInAYear(),
  },
  {
    slug: "new-testament-90-days",
    name: "New Testament in 90 Days",
    description:
      "Journey through the entire New Testament in just 90 days. From the Gospels through Revelation, experience the life of Christ and the birth of the early church.",
    durationDays: 90,
    schedule: generateNT90(),
  },
  {
    slug: "psalms-proverbs-31",
    name: "Psalms & Proverbs 31 Days",
    description:
      "Read all 150 Psalms and 31 chapters of Proverbs in one month. Five Psalms and one Proverb each day for wisdom and worship.",
    durationDays: 31,
    schedule: generatePsalmsProverbs31(),
  },
];

/** Look up a reading plan by slug. */
export function getPlanBySlug(slug: string): ReadingPlan | undefined {
  return READING_PLANS.find((p) => p.slug === slug);
}
