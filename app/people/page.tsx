import type { Metadata } from "next";
import { Users } from "lucide-react";
import { getAllPeople } from "@/lib/db/queries";
import { PersonSearch } from "@/components/people/PersonSearch";
import {
  generatePageMetadata,
  buildBreadcrumbJsonLd,
  jsonLdScriptProps,
} from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "People of the Bible",
  description:
    "Explore over 100 biblical figures — patriarchs, prophets, kings, apostles, and more. Search and filter the complete directory of people in the KJV.",
  path: "/people",
});

export default async function PeoplePage() {
  const people = await getAllPeople();

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "People", path: "/people" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumb)} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[var(--accent-gold)]">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="heading text-3xl sm:text-4xl text-gold">
              People of the Bible
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Discover the men and women whose stories shape the scriptures — from Adam to
            the Apostle Paul. Search by name or filter by role and testament.
          </p>
        </header>

        {/* Search + Directory */}
        <PersonSearch people={people} />
      </div>
    </>
  );
}
