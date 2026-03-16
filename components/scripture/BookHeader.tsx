import { CategoryBadge } from "@/components/scripture/CategoryBadge";
import { toDisplayCategory } from "@/lib/data/books";
import { Calendar, Feather, Sparkles } from "lucide-react";

interface BookHeaderProps {
  name: string;
  category: string;
  testament: "OT" | "NT";
  author: string | null;
  dateWritten: string | null;
  keyThemes: string | null;
  description: string | null;
}

/**
 * Large heading + metadata panel for a book overview page.
 * Displays the book name, category badge, author, date, themes, and description.
 */
export function BookHeader({
  name,
  category,
  testament,
  author,
  dateWritten,
  keyThemes,
  description,
}: BookHeaderProps) {
  const displayCategory = toDisplayCategory(category);
  const testamentLabel = testament === "OT" ? "Old Testament" : "New Testament";
  const themes = keyThemes?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];

  return (
    <header className="mb-10">
      {/* Category badge + testament */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <CategoryBadge category={displayCategory} />
        <span className="text-xs font-source-sans text-muted-foreground uppercase tracking-wider">
          {testamentLabel}
        </span>
      </div>

      {/* Book name */}
      <h1 className="heading text-4xl sm:text-5xl lg:text-6xl text-gold mb-6">
        {name}
      </h1>

      {/* Description */}
      {description && (
        <p className="font-source-sans text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mb-8">
          {description}
        </p>
      )}

      {/* Metadata grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {author && (
          <MetaItem icon={<Feather className="h-4 w-4" />} label="Author" value={author} />
        )}
        {dateWritten && (
          <MetaItem icon={<Calendar className="h-4 w-4" />} label="Date Written" value={dateWritten} />
        )}
        {themes.length > 0 && (
          <div className="sm:col-span-2 lg:col-span-1 flex items-start gap-3 rounded-lg border border-border bg-card p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gold/10 text-gold">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-source-sans font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Key Themes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {themes.map((theme) => (
                  <span
                    key={theme}
                    className="inline-block rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-xs font-source-sans text-[var(--text-secondary)]"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/** Small metadata item with icon, label, and value. */
function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gold/10 text-gold">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-source-sans font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-sm font-source-sans text-foreground">{value}</p>
      </div>
    </div>
  );
}
