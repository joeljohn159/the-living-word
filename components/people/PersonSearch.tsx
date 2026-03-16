"use client";

import { useState, useMemo } from "react";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PersonCard } from "./PersonCard";

interface Person {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  alsoKnownAs: string | null;
  tribeOrGroup: string | null;
  birthRef: string | null;
  deathRef: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
}

const ROLES = [
  "Patriarch",
  "Matriarch",
  "King",
  "Prophet",
  "Judge",
  "Priest",
  "Apostle",
  "Disciple",
  "Tribe of Israel",
] as const;

const TESTAMENTS = [
  { label: "All", value: "" },
  { label: "Old Testament", value: "OT" },
  { label: "New Testament", value: "NT" },
] as const;

function getTestamentFromRef(ref: string | null): "OT" | "NT" | null {
  if (!ref) return null;
  const ntBooks = [
    "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
    "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
    "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
    "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
    "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
    "Jude", "Revelation",
  ];
  for (const book of ntBooks) {
    if (ref.startsWith(book)) return "NT";
  }
  return "OT";
}

interface PersonSearchProps {
  people: Person[];
}

export function PersonSearch({ people }: PersonSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedTestament, setSelectedTestament] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    for (const p of people) {
      if (p.tribeOrGroup) roles.add(p.tribeOrGroup);
    }
    return ROLES.filter((r) => roles.has(r));
  }, [people]);

  const filtered = useMemo(() => {
    let result = people;

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.alsoKnownAs?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (selectedRole) {
      result = result.filter((p) => p.tribeOrGroup === selectedRole);
    }

    if (selectedTestament) {
      result = result.filter((p) => {
        const t = getTestamentFromRef(p.birthRef);
        return t === selectedTestament;
      });
    }

    return result;
  }, [people, query, selectedRole, selectedTestament]);

  const alphabetGroups = useMemo(() => {
    const groups: Record<string, Person[]> = {};
    for (const person of filtered) {
      const letter = person.name.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(person);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const hasActiveFilters = selectedRole || selectedTestament;

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                "w-full rounded-lg border border-[var(--border)] py-2.5 pl-10 pr-4",
                "bg-[var(--bg-secondary)] text-[var(--text-primary)]",
                "placeholder:text-[var(--text-muted)]",
                "focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]",
                "font-source-sans text-sm"
              )}
              aria-label="Search people by name"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm",
              "transition-colors duration-200",
              hasActiveFilters
                ? "border-[var(--accent-gold)] bg-[var(--accent-gold)] text-[var(--bg-primary)]"
                : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)]"
            )}
            aria-label="Toggle filters"
            aria-expanded={showFilters}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 animate-fade-in">
            <div className="flex flex-wrap gap-4">
              {/* Testament Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Testament
                </label>
                <div className="flex gap-1.5">
                  {TESTAMENTS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setSelectedTestament(t.value)}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        selectedTestament === t.value
                          ? "bg-[var(--accent-gold)] text-[var(--bg-primary)]"
                          : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Role
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedRole("")}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      !selectedRole
                        ? "bg-[var(--accent-gold)] text-[var(--bg-primary)]"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    All
                  </button>
                  {availableRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        selectedRole === role
                          ? "bg-[var(--accent-gold)] text-[var(--bg-primary)]"
                          : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSelectedRole("");
                  setSelectedTestament("");
                }}
                className="mt-3 flex items-center gap-1 text-xs text-[var(--accent-gold)] hover:underline"
              >
                <X className="h-3 w-3" />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        {filtered.length} {filtered.length === 1 ? "person" : "people"} found
      </p>

      {/* Alphabetical Groups */}
      {alphabetGroups.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[var(--text-muted)]">No people match your search.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {alphabetGroups.map(([letter, group]) => (
            <section key={letter} id={`letter-${letter}`}>
              <h2 className="heading mb-3 text-2xl text-[var(--accent-gold)] border-b border-[var(--border)] pb-1">
                {letter}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((person) => (
                  <PersonCard
                    key={person.id}
                    name={person.name}
                    slug={person.slug}
                    description={person.description}
                    tribeOrGroup={person.tribeOrGroup}
                    alsoKnownAs={person.alsoKnownAs}
                    imageUrl={person.imageUrl}
                    sourceUrl={person.sourceUrl}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
