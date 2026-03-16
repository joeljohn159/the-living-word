import type { LucideIcon } from "lucide-react";

interface DataSourceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  attribution: string;
}

/**
 * Card displaying a data source with icon, description, and license info.
 * Used on the About page to credit content origins.
 */
export function DataSourceCard({
  icon: Icon,
  title,
  description,
  attribution,
}: DataSourceCardProps) {
  return (
    <div
      className="rounded-lg border border-border bg-card p-5"
      role="listitem"
    >
      <div className="flex items-start gap-3">
        <Icon
          className="h-5 w-5 text-gold mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <div>
          <h3 className="font-source-sans font-semibold text-foreground text-sm">
            {title}
          </h3>
          <p className="font-source-sans text-sm text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
          <p className="font-source-sans text-xs text-gold/80 mt-2">
            {attribution}
          </p>
        </div>
      </div>
    </div>
  );
}
