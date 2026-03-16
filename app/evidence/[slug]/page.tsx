import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { getEvidenceBySlug, getAllEvidence } from "@/lib/db/queries";
import { CategoryBadge } from "@/components/evidence/CategoryBadge";
import { SignificanceStars } from "@/components/evidence/SignificanceStars";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getEvidenceBySlug(slug);
  if (!item) return { title: "Not Found" };

  return {
    title: item.title,
    description: item.description,
    openGraph: {
      title: `${item.title} | The Living Word`,
      description: item.description,
      images: item.imageUrl ? [{ url: item.imageUrl, alt: item.title }] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const items = await getAllEvidence();
  return items.map((item) => ({ slug: item.slug }));
}

export default async function EvidenceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getEvidenceBySlug(slug);
  if (!item) notFound();

  const details = [
    { icon: Calendar, label: "Discovered", value: item.dateDiscovered },
    { icon: MapPin, label: "Found at", value: item.locationFound },
    { icon: Building2, label: "Current location", value: item.currentLocation },
  ].filter((d) => d.value);

  return (
    <div className="min-h-screen">
      {/* Back Navigation */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <Link
          href="/evidence"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Evidence Gallery
        </Link>
      </div>

      <article className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="mb-8">
          <CategoryBadge category={item.category} size="md" />
          <h1 className="heading text-3xl md:text-5xl text-[var(--foreground)] mt-4 mb-4">
            {item.title}
          </h1>
          <SignificanceStars significance={item.significance} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Image */}
            {item.imageUrl && (
              <figure className="rounded-lg overflow-hidden border border-[var(--border)]">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                    unoptimized
                    priority
                  />
                </div>
                {item.sourceUrl && (
                  <figcaption className="px-4 py-2 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-gold transition-colors"
                    >
                      Image source
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </figcaption>
                )}
              </figure>
            )}

            {/* Description */}
            <section>
              <h2 className="heading text-xl text-gold mb-3">Description</h2>
              <p className="font-source-sans text-[var(--text-secondary)] leading-relaxed">
                {item.description}
              </p>
            </section>

            {/* Significance */}
            {item.significance && (
              <section>
                <h2 className="heading text-xl text-gold mb-3">Biblical Significance</h2>
                <p className="font-source-sans text-[var(--text-secondary)] leading-relaxed">
                  {item.significance}
                </p>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-2 space-y-6">
            {/* Details Card */}
            {details.length > 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 space-y-4">
                <h2 className="heading text-lg text-[var(--foreground)]">Details</h2>
                <dl className="space-y-3">
                  {details.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="w-4 h-4 text-gold mt-0.5 shrink-0" aria-hidden="true" />
                      <div>
                        <dt className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                          {label}
                        </dt>
                        <dd className="text-sm text-[var(--text-secondary)] font-source-sans">
                          {value}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Related Scriptures */}
            {item.references.length > 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 space-y-4">
                <h2 className="heading text-lg text-[var(--foreground)] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gold" aria-hidden="true" />
                  Related Scriptures
                </h2>
                <ul className="space-y-2">
                  {item.references.map((ref) => {
                    const label = formatReference(ref);
                    const href = buildRefHref(ref);
                    return (
                      <li key={ref.id}>
                        <Link
                          href={href}
                          className="text-sm font-source-sans text-[var(--text-secondary)] hover:text-gold transition-colors inline-flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gold/50 shrink-0" aria-hidden="true" />
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Source Link */}
            {item.sourceUrl && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
                <h2 className="heading text-lg text-[var(--foreground)] mb-3">Attribution</h2>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-source-sans text-gold hover:text-gold-light transition-colors"
                >
                  View original source
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Images used under fair use / public domain for educational purposes.
                </p>
              </div>
            )}
          </aside>
        </div>
      </article>
    </div>
  );
}

function formatReference(ref: {
  bookName: string | null;
  chapterNumber: number | null;
  verseNumber: number | null;
}): string {
  if (!ref.bookName) return "Unknown Reference";
  let label = ref.bookName;
  if (ref.chapterNumber) {
    label += ` ${ref.chapterNumber}`;
    if (ref.verseNumber) {
      label += `:${ref.verseNumber}`;
    }
  }
  return label;
}

function buildRefHref(ref: {
  bookSlug: string | null;
  chapterNumber: number | null;
  verseNumber: number | null;
}): string {
  if (!ref.bookSlug) return "/bible";
  let href = `/bible/${ref.bookSlug}`;
  if (ref.chapterNumber) {
    href += `/${ref.chapterNumber}`;
    if (ref.verseNumber) {
      href += `/${ref.verseNumber}`;
    }
  }
  return href;
}
