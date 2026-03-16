import { SITE_URL, SITE_NAME } from "@/lib/seo";

/** Curated daily verses — one per day, cycling through the year. */
const DAILY_VERSES = [
  { text: "In the beginning God created the heaven and the earth.", ref: "Genesis 1:1", slug: "genesis/1/1" },
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1", slug: "psalms/23/1" },
  { text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", ref: "John 3:16", slug: "john/3/16" },
  { text: "I can do all things through Christ which strengtheneth me.", ref: "Philippians 4:13", slug: "philippians/4/13" },
  { text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.", ref: "Proverbs 3:5", slug: "proverbs/3/5" },
  { text: "The Lord is my light and my salvation; whom shall I fear?", ref: "Psalm 27:1", slug: "psalms/27/1" },
  { text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.", ref: "Joshua 1:9", slug: "joshua/1/9" },
  { text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", ref: "Romans 8:28", slug: "romans/8/28" },
  { text: "The Lord bless thee, and keep thee.", ref: "Numbers 6:24", slug: "numbers/6/24" },
  { text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles.", ref: "Isaiah 40:31", slug: "isaiah/40/31" },
  { text: "Thy word is a lamp unto my feet, and a light unto my path.", ref: "Psalm 119:105", slug: "psalms/119/105" },
  { text: "The earth is the Lord's, and the fulness thereof; the world, and they that dwell therein.", ref: "Psalm 24:1", slug: "psalms/24/1" },
  { text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.", ref: "Matthew 11:28", slug: "matthew/11/28" },
  { text: "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.", ref: "Jeremiah 29:11", slug: "jeremiah/29/11" },
  { text: "He hath made every thing beautiful in his time.", ref: "Ecclesiastes 3:11", slug: "ecclesiastes/3/11" },
  { text: "The heavens declare the glory of God; and the firmament sheweth his handywork.", ref: "Psalm 19:1", slug: "psalms/19/1" },
  { text: "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you.", ref: "John 14:27", slug: "john/14/27" },
  { text: "A soft answer turneth away wrath: but grievous words stir up anger.", ref: "Proverbs 15:1", slug: "proverbs/15/1" },
  { text: "This is the day which the Lord hath made; we will rejoice and be glad in it.", ref: "Psalm 118:24", slug: "psalms/118/24" },
  { text: "Create in me a clean heart, O God; and renew a right spirit within me.", ref: "Psalm 51:10", slug: "psalms/51/10" },
  { text: "Delight thyself also in the Lord; and he shall give thee the desires of thine heart.", ref: "Psalm 37:4", slug: "psalms/37/4" },
  { text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God.", ref: "Isaiah 41:10", slug: "isaiah/41/10" },
  { text: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith.", ref: "Galatians 5:22", slug: "galatians/5/22" },
  { text: "The Lord is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.", ref: "Psalm 34:18", slug: "psalms/34/18" },
  { text: "And now abideth faith, hope, charity, these three; but the greatest of these is charity.", ref: "1 Corinthians 13:13", slug: "1-corinthians/13/13" },
  { text: "Let every thing that hath breath praise the Lord.", ref: "Psalm 150:6", slug: "psalms/150/6" },
  { text: "He healeth the broken in heart, and bindeth up their wounds.", ref: "Psalm 147:3", slug: "psalms/147/3" },
  { text: "For where two or three are gathered together in my name, there am I in the midst of them.", ref: "Matthew 18:20", slug: "matthew/18/20" },
  { text: "Blessed are the peacemakers: for they shall be called the children of God.", ref: "Matthew 5:9", slug: "matthew/5/9" },
  { text: "The Lord is gracious, and full of compassion; slow to anger, and of great mercy.", ref: "Psalm 145:8", slug: "psalms/145/8" },
  { text: "So teach us to number our days, that we may apply our hearts unto wisdom.", ref: "Psalm 90:12", slug: "psalms/90/12" },
];

/** Escape special XML characters. */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Generate RSS feed items for the last 30 days. */
function generateItems(): string {
  const items: string[] = [];
  const today = new Date();

  for (let i = 0; i < DAILY_VERSES.length; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const verse = DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
    const pubDate = date.toUTCString();
    const link = `${SITE_URL}/bible/${verse.slug}`;

    items.push(`    <item>
      <title>${escapeXml(verse.ref)} KJV — Daily Verse</title>
      <link>${link}</link>
      <guid isPermaLink="false">${SITE_URL}/daily/${date.toISOString().slice(0, 10)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(verse.text)} — ${escapeXml(verse.ref)} KJV</description>
    </item>`);
  }

  return items.join("\n");
}

/**
 * RSS 2.0 feed for the Daily Verse.
 * Statically generated at build time, revalidated daily.
 */
export async function GET() {
  const now = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} — Daily Verse</title>
    <link>${SITE_URL}</link>
    <description>A daily verse from the King James Bible, curated from The Living Word.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/og-image.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
    </image>
${generateItems()}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
