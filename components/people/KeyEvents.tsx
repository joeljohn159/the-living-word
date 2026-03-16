import { cn } from "@/lib/utils";

interface KeyEventsProps {
  birthRef: string | null;
  deathRef: string | null;
  description: string | null;
  personName: string;
}

/** Extract key life events from the person's description and references. */
function extractEvents(
  description: string | null,
  birthRef: string | null,
  deathRef: string | null,
): { label: string; detail: string }[] {
  const events: { label: string; detail: string }[] = [];

  if (birthRef) {
    events.push({ label: "Birth", detail: birthRef });
  }

  if (description) {
    // Extract key phrases as events from the description
    const sentences = description
      .split(/\.\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    for (const sentence of sentences.slice(0, 4)) {
      const cleanSentence = sentence.endsWith(".") ? sentence : `${sentence}.`;
      events.push({ label: "Life Event", detail: cleanSentence });
    }
  }

  if (deathRef) {
    events.push({ label: "Death", detail: deathRef });
  }

  return events;
}

export function KeyEvents({
  birthRef,
  deathRef,
  description,
  personName,
}: KeyEventsProps) {
  const events = extractEvents(description, birthRef, deathRef);

  if (events.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] italic">
        No key events recorded for {personName}.
      </p>
    );
  }

  return (
    <div className="relative pl-6" role="list" aria-label={`Key events in ${personName}'s life`}>
      {/* Timeline line */}
      <div
        className="absolute left-[9px] top-2 bottom-2 w-px bg-[var(--border)]"
        aria-hidden="true"
      />

      {events.map((event, i) => (
        <div key={i} className="relative mb-4 last:mb-0" role="listitem">
          {/* Timeline dot */}
          <div
            className={cn(
              "absolute -left-6 top-1.5 h-[10px] w-[10px] rounded-full border-2",
              i === 0 || i === events.length - 1
                ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]"
                : "border-[var(--accent-gold)] bg-[var(--bg-primary)]"
            )}
            aria-hidden="true"
          />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-gold)]">
              {event.label}
            </span>
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
              {event.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
