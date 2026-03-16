import Link from "next/link";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonCardProps {
  name: string;
  slug: string;
  description: string | null;
  tribeOrGroup: string | null;
  alsoKnownAs: string | null;
}

export function PersonCard({
  name,
  slug,
  description,
  tribeOrGroup,
  alsoKnownAs,
}: PersonCardProps) {
  return (
    <Link
      href={`/people/${slug}`}
      className={cn(
        "group block rounded-lg border border-[var(--border)] p-4",
        "bg-[var(--bg-card)] hover:border-[var(--accent-gold)]",
        "transition-all duration-200 hover:shadow-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]"
      )}
      aria-label={`View profile of ${name}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            "bg-[var(--bg-tertiary)] text-[var(--accent-gold)]",
            "group-hover:bg-[var(--accent-gold)] group-hover:text-[var(--bg-primary)]",
            "transition-colors duration-200"
          )}
          aria-hidden="true"
        >
          <Users className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="heading text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
            {name}
          </h3>
          {alsoKnownAs && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Also known as: {alsoKnownAs}
            </p>
          )}
          {tribeOrGroup && (
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--accent-gold)]">
              {tribeOrGroup}
            </span>
          )}
          {description && (
            <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
