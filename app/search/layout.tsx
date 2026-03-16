import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Search the Bible",
  description:
    "Search across all 31,102 KJV verses, dictionary words, biblical figures, and locations. Find any passage or topic instantly.",
  path: "/search",
  noIndex: true,
});

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
