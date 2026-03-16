import Link from "next/link";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChapterPerson {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  alsoKnownAs: string | null;
  tribeOrGroup: string | null;
  fatherName: string | null;
  motherName: string | null;
  spouseName: string | null;
}

interface PeopleTabCardProps {
  person: ChapterPerson;
}

/**
 * Mini person card for the context panel People tab.
 * Shows name, description snippet, role/tribe, and family connections.
 * Clicks through to the full profile page.
 */
export function PeopleTabCard({ person }: PeopleTabCardProps) {
  const familyParts = buildFamilyLine(person);

  return (
    <Link
      href={`/people/${person.slug}`}
      className={cn(
        "group block rounded-lg border border-[var(--border)] p-3",
        "bg-[var(--bg-card)] hover:border-[var(--accent-gold)]",
        "transition-all duration-200 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]",
      )}
      aria-label={`View profile of ${person.name}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            "bg-[var(--bg-tertiary)] text-[var(--accent-gold)]",
            "group-hover:bg-[var(--accent-gold)] group-hover:text-[var(--bg-primary)]",
            "transition-colors duration-200",
          )}
          aria-hidden="true"
        >
          <User className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          {/* Name */}
          <h4 className="heading text-base text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors leading-tight">
            {person.name}
          </h4>

          {/* Tribe/Group badge */}
          {person.tribeOrGroup && (
            <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--accent-gold)]">
              {person.tribeOrGroup}
            </span>
          )}

          {/* Description snippet */}
          {person.description && (
            <p className="mt-1.5 text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {person.description}
            </p>
          )}

          {/* Family connections */}
          {familyParts.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {familyParts.map(({ label, value }) => (
                <span
                  key={label}
                  className="text-[10px] text-[var(--text-muted)]"
                >
                  <span className="font-medium text-[var(--text-secondary)]">
                    {label}:
                  </span>{" "}
                  {value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function buildFamilyLine(
  person: ChapterPerson,
): { label: string; value: string }[] {
  const parts: { label: string; value: string }[] = [];

  if (person.fatherName) {
    parts.push({ label: "Father", value: person.fatherName });
  }
  if (person.motherName) {
    parts.push({ label: "Mother", value: person.motherName });
  }
  if (person.spouseName) {
    parts.push({ label: "Spouse", value: person.spouseName });
  }

  return parts;
}
