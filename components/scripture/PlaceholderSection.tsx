import { cn } from "@/lib/utils";

interface PlaceholderSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

/**
 * Placeholder card for upcoming features (evidence, people, maps).
 * Shows a muted icon, title, and description.
 */
export function PlaceholderSection({
  title,
  description,
  icon,
  className,
}: PlaceholderSectionProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border bg-card/50 p-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gold/10 text-gold/60">
          {icon}
        </div>
        <h3 className="heading text-lg text-foreground">{title}</h3>
      </div>
      <p className="font-source-sans text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
