"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface FamilyMember {
  name: string;
  slug: string;
}

interface FamilyTreeProps {
  person: { name: string; slug: string };
  father: FamilyMember | null;
  mother: FamilyMember | null;
  offspring: FamilyMember[];
  siblings: FamilyMember[];
}

function MemberNode({
  member,
  isCurrent = false,
  label,
}: {
  member: FamilyMember;
  isCurrent?: boolean;
  label: string;
}) {
  const nodeClasses = cn(
    "rounded-lg border px-3 py-2 text-center text-sm transition-colors",
    isCurrent
      ? "border-[var(--accent-gold)] bg-[var(--accent-gold)] text-[var(--bg-primary)] font-semibold"
      : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]"
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </span>
      {isCurrent ? (
        <div className={nodeClasses} aria-current="page">
          {member.name}
        </div>
      ) : (
        <Link href={`/people/${member.slug}`} className={nodeClasses}>
          {member.name}
        </Link>
      )}
    </div>
  );
}

export function FamilyTree({
  person,
  father,
  mother,
  offspring,
  siblings,
}: FamilyTreeProps) {
  const hasParents = father || mother;
  const hasChildren = offspring.length > 0;
  const hasSiblings = siblings.length > 0;

  if (!hasParents && !hasChildren && !hasSiblings) {
    return (
      <p className="text-sm text-[var(--text-muted)] italic">
        No family relationships recorded.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto" role="img" aria-label={`Family tree of ${person.name}`}>
      <svg
        className="mx-auto"
        width="100%"
        viewBox="0 0 600 320"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Connector lines */}
        <g stroke="var(--border)" strokeWidth="1.5" fill="none">
          {/* Parent to person lines */}
          {hasParents && (
            <>
              {father && (
                <line x1="200" y1="50" x2="300" y2="110" />
              )}
              {mother && (
                <line x1="400" y1="50" x2="300" y2="110" />
              )}
              {father && mother && (
                <line x1="200" y1="38" x2="400" y2="38" strokeDasharray="4 4" />
              )}
            </>
          )}
          {/* Person to children lines */}
          {hasChildren && offspring.map((_, i) => {
            const childX = getChildX(i, offspring.length);
            return (
              <line key={i} x1="300" y1="155" x2={childX} y2="215" />
            );
          })}
        </g>
      </svg>

      {/* HTML overlay nodes */}
      <div className="relative -mt-[320px] h-[320px]" style={{ minWidth: 600 }}>
        {/* Parents Row */}
        {hasParents && (
          <div className="absolute top-0 left-0 right-0 flex justify-center gap-24">
            {father && (
              <div className="w-[120px]">
                <MemberNode member={father} label="Father" />
              </div>
            )}
            {mother && (
              <div className="w-[120px]">
                <MemberNode member={mother} label="Mother" />
              </div>
            )}
          </div>
        )}

        {/* Current Person */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: hasParents ? 90 : 20 }}
        >
          <div className="w-[140px]">
            <MemberNode member={person} isCurrent label="" />
          </div>
        </div>

        {/* Children Row */}
        {hasChildren && (
          <div
            className="absolute left-1/2 -translate-x-1/2 flex gap-3"
            style={{ top: hasParents ? 200 : 130, width: "fit-content" }}
          >
            {offspring.slice(0, 5).map((child) => (
              <div key={child.slug} className="w-[100px]">
                <MemberNode member={child} label="Child" />
              </div>
            ))}
            {offspring.length > 5 && (
              <div className="flex items-end pb-2 text-xs text-[var(--text-muted)]">
                +{offspring.length - 5} more
              </div>
            )}
          </div>
        )}

        {/* Siblings */}
        {hasSiblings && (
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1"
            style={{ right: 10 }}
          >
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] text-center">
              Siblings
            </span>
            {siblings.slice(0, 4).map((sib) => (
              <Link
                key={sib.slug}
                href={`/people/${sib.slug}`}
                className="rounded border border-[var(--border)] bg-[var(--bg-card)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--text-primary)] transition-colors text-center"
              >
                {sib.name}
              </Link>
            ))}
            {siblings.length > 4 && (
              <span className="text-[10px] text-[var(--text-muted)] text-center">
                +{siblings.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getChildX(index: number, total: number): number {
  const maxVisible = Math.min(total, 5);
  const spacing = 110;
  const startX = 300 - ((maxVisible - 1) * spacing) / 2;
  return startX + index * spacing;
}
