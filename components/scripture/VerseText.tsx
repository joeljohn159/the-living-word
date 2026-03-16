"use client";

import { useMemo } from "react";
import {
  segmentVerseText,
  buildDictionaryLookup,
  type DictionaryEntry,
} from "@/lib/dictionary";
import { DictionaryTooltip } from "@/components/dictionary/DictionaryTooltip";

interface VerseTextProps {
  /** The raw verse text to render. */
  text: string;
  /** Dictionary entries to match against (pre-fetched from DB). */
  dictionaryEntries: DictionaryEntry[];
}

/**
 * Renders verse text with archaic/biblical words highlighted as
 * interactive hotwords. Each matched word is wrapped in a
 * DictionaryTooltip for hover (desktop) or tap (mobile) definitions.
 */
export function VerseText({ text, dictionaryEntries }: VerseTextProps) {
  const lookup = useMemo(
    () => buildDictionaryLookup(dictionaryEntries),
    [dictionaryEntries],
  );

  const segments = useMemo(
    () => segmentVerseText(text, lookup),
    [text, lookup],
  );

  return (
    <>
      {segments.map((segment, i) => {
        if (segment.type === "text") {
          return <span key={i}>{segment.content}</span>;
        }

        return (
          <DictionaryTooltip key={i} entry={segment.match.entry}>
            {segment.match.original}
          </DictionaryTooltip>
        );
      })}
    </>
  );
}
