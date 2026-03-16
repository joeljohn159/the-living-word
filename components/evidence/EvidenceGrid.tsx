import { EvidenceCard } from "./EvidenceCard";

interface EvidenceItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  dateDiscovered: string | null;
  locationFound: string | null;
  currentLocation: string | null;
  significance: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
}

interface EvidenceGridProps {
  items: EvidenceItem[];
}

export function EvidenceGrid({ items }: EvidenceGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--text-muted)] text-lg">
          No evidence items found for this category.
        </p>
      </div>
    );
  }

  return (
    <div
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
      role="list"
      aria-label="Evidence items"
    >
      {items.map((item) => (
        <div key={item.id} className="break-inside-avoid" role="listitem">
          <EvidenceCard
            title={item.title}
            slug={item.slug}
            description={item.description}
            category={item.category}
            dateDiscovered={item.dateDiscovered}
            locationFound={item.locationFound}
            imageUrl={item.imageUrl}
            significance={item.significance}
          />
        </div>
      ))}
    </div>
  );
}
