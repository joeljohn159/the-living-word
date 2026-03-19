import type { Metadata } from "next";
import { getLocationsWithBookRefs, getJourneys } from "@/lib/db/queries";
import { MapsHub } from "@/components/maps/MapsHub";

export const dynamic = "force-dynamic";
import {
  generatePageMetadata,
  buildBreadcrumbJsonLd,
  jsonLdScriptProps,
} from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Interactive Maps",
  description:
    "Explore 100+ biblical locations on an interactive map. Trace journeys of Abraham, Moses, Paul, and more through the Holy Land with detailed descriptions and scripture references.",
  path: "/maps",
});

export default async function MapsPage() {
  const [locations, journeys] = await Promise.all([
    getLocationsWithBookRefs(),
    getJourneys(),
  ]);

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Maps", path: "/maps" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumb)} />
      <MapsHub locations={locations} journeys={journeys} />
    </>
  );
}
