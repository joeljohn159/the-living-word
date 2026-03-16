"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * A small badge showing the current translation (KJV) with a tooltip
 * indicating more translations are coming soon.
 */
export function KjvBadge({ className }: { className?: string }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5",
              "text-xs font-semibold font-source-sans tracking-wide uppercase",
              "bg-gold/15 text-gold border border-gold/30",
              "cursor-default select-none",
              className
            )}
            aria-label="King James Version — more translations coming soon"
          >
            KJV
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>More translations coming soon</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
