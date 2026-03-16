import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignificanceStarsProps {
  significance: string | null;
  showLabel?: boolean;
}

export function SignificanceStars({ significance, showLabel = true }: SignificanceStarsProps) {
  const rating = getSignificanceRating(significance);
  if (rating === 0) return null;

  const labels = ["", "Minor", "Moderate", "Significant", "Major", "Exceptional"];

  return (
    <div className="flex items-center gap-2" aria-label={`Significance: ${labels[rating]}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-4 h-4",
              i < rating ? "text-gold fill-gold" : "text-[var(--text-muted)]"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-sm text-[var(--text-muted)] font-source-sans">
          {labels[rating]}
        </span>
      )}
    </div>
  );
}

function getSignificanceRating(significance: string | null): number {
  if (!significance) return 0;
  const text = significance.toLowerCase();
  let score = 3;
  if (text.includes("earliest") || text.includes("oldest") || text.includes("only known")) score += 1;
  if (text.includes("directly confirms") || text.includes("first")) score += 1;
  if (text.length < 80) score -= 1;
  return Math.max(1, Math.min(5, score));
}
