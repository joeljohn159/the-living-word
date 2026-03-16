import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Crown } from "lucide-react";
import {
  getPerson,
  getPersonChildren,
  getPersonSiblings,
  getPersonMedia,
  getAllPeopleSlugs,
} from "@/lib/db/queries";
import { FamilyTree } from "@/components/people/FamilyTree";
import { KeyEvents } from "@/components/people/KeyEvents";
import { VerseReferences } from "@/components/people/VerseReferences";
import { RelatedArtwork } from "@/components/people/RelatedArtwork";
import {
  generatePageMetadata,
  buildBreadcrumbJsonLd,
  buildArticleJsonLd,
  jsonLdScriptProps,
} from "@/lib/seo";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getAllPeopleSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const person = await getPerson(params.slug);
  if (!person) {
    return { title: "Person Not Found" };
  }

  const title = person.alsoKnownAs
    ? `${person.name} (${person.alsoKnownAs}) — Biblical Figure`
    : `${person.name} — Biblical Figure`;

  const description =
    person.description ??
    `Learn about ${person.name} in the King James Bible. Explore their family tree, key events, and scripture references.`;

  return generatePageMetadata({
    title,
    description,
    path: `/people/${person.slug}`,
    ogType: "article",
  });
}

export default async function PersonProfilePage({ params }: PageProps) {
  const person = await getPerson(params.slug);
  if (!person) notFound();

  const [children, siblings, artwork] = await Promise.all([
    getPersonChildren(person.id),
    getPersonSiblings(person.id, person.fatherId),
    getPersonMedia(person.id),
  ]);

  const father = person.father
    ? { name: person.father.name, slug: person.father.slug }
    : null;
  const mother = person.mother
    ? { name: person.mother.name, slug: person.mother.slug }
    : null;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "People", path: "/people" },
    { name: person.name, path: `/people/${person.slug}` },
  ]);

  const article = buildArticleJsonLd({
    title: `${person.name} — Biblical Figure`,
    description:
      person.description ??
      `Explore the life and story of ${person.name} in scripture.`,
    path: `/people/${person.slug}`,
  });

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumb)} />
      <script {...jsonLdScriptProps(article)} />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/people"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All People
        </Link>

        {/* Profile Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[var(--accent-gold)]">
              <Crown className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <h1 className="heading text-3xl sm:text-4xl text-gold">
                {person.name}
              </h1>
              {person.alsoKnownAs && (
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Also known as: {person.alsoKnownAs}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {person.tribeOrGroup && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-tertiary)] px-3 py-1 text-xs font-medium text-[var(--accent-gold)]">
                    {person.tribeOrGroup}
                  </span>
                )}
                {person.birthRef && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                    <BookOpen className="h-3 w-3" aria-hidden="true" />
                    {person.birthRef}
                  </span>
                )}
                {person.deathRef && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                    {person.deathRef}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Description */}
        {person.description && (
          <section className="mb-10" aria-labelledby="description-heading">
            <h2 id="description-heading" className="sr-only">
              Description
            </h2>
            <p className="scripture text-lg leading-relaxed text-[var(--scripture-text)]">
              {person.description}
            </p>
          </section>
        )}

        {/* Family Tree */}
        <section className="mb-10" aria-labelledby="family-heading">
          <h2
            id="family-heading"
            className="heading mb-4 text-xl text-[var(--text-primary)] border-b border-[var(--border)] pb-2"
          >
            Family Tree
          </h2>
          <FamilyTree
            person={{ name: person.name, slug: person.slug }}
            father={father}
            mother={mother}
            offspring={children}
            siblings={siblings}
          />
        </section>

        {/* Key Events */}
        <section className="mb-10" aria-labelledby="events-heading">
          <h2
            id="events-heading"
            className="heading mb-4 text-xl text-[var(--text-primary)] border-b border-[var(--border)] pb-2"
          >
            Key Events
          </h2>
          <KeyEvents
            birthRef={person.birthRef}
            deathRef={person.deathRef}
            description={person.description}
            personName={person.name}
          />
        </section>

        {/* Verse References */}
        <section className="mb-10" aria-labelledby="verses-heading">
          <h2
            id="verses-heading"
            className="heading mb-4 text-xl text-[var(--text-primary)] border-b border-[var(--border)] pb-2"
          >
            Scripture References
          </h2>
          <VerseReferences
            references={person.peopleReferences}
            personName={person.name}
          />
        </section>

        {/* Related Artwork */}
        <section className="mb-10" aria-labelledby="artwork-heading">
          <h2
            id="artwork-heading"
            className="heading mb-4 text-xl text-[var(--text-primary)] border-b border-[var(--border)] pb-2"
          >
            Related Artwork
          </h2>
          <RelatedArtwork artwork={artwork} personName={person.name} />
        </section>
      </div>
    </>
  );
}
