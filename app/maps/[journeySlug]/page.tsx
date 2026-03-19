import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getJourneyWithStops,
  getAllJourneySlugs,
} from "@/lib/db/queries";
import { JourneyView } from "@/components/maps/JourneyView";

import {
  generatePageMetadata,
  buildBreadcrumbJsonLd,
  jsonLdScriptProps,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ journeySlug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllJourneySlugs();
    return slugs.map(({ slug }) => ({ journeySlug: slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { journeySlug } = await params;
  const journey = await getJourneyWithStops(journeySlug);

  if (!journey) {
    return generatePageMetadata({
      title: "Journey Not Found",
      description: "The requested journey could not be found.",
      path: `/maps/${journeySlug}`,
    });
  }

  return generatePageMetadata({
    title: `${journey.name} — Journey Map`,
    description:
      journey.description ||
      `Trace the journey of ${journey.personName || "biblical figures"} through ${journey.stops.length} stops with interactive maps and scripture references.`,
    path: `/maps/${journeySlug}`,
  });
}

export default async function JourneyPage({ params }: PageProps) {
  const { journeySlug } = await params;
  const journey = await getJourneyWithStops(journeySlug);

  if (!journey) {
    notFound();
  }

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Maps", path: "/maps" },
    { name: journey.name, path: `/maps/${journeySlug}` },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumb)} />
      <JourneyView journey={journey} />
    </>
  );
}
