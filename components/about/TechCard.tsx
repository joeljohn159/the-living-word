interface TechCardProps {
  name: string;
  role: string;
}

/**
 * Compact card showing a technology name and its role in the project.
 * Used on the About page in the "Built With" section.
 */
export function TechCard({ name, role }: TechCardProps) {
  return (
    <div
      className="rounded-lg border border-border bg-card p-3 text-center"
      role="listitem"
    >
      <p className="font-source-sans font-semibold text-foreground text-sm">
        {name}
      </p>
      <p className="font-source-sans text-xs text-muted-foreground mt-0.5">
        {role}
      </p>
    </div>
  );
}
