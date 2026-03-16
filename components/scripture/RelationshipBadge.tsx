import {
  GitBranch,
  Sparkles,
  Quote,
  Eye,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RELATIONSHIP_CONFIG: Record<
  string,
  { label: string; icon: typeof GitBranch; color: string }
> = {
  parallel: {
    label: "Parallel",
    icon: GitBranch,
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  },
  "prophecy-fulfillment": {
    label: "Prophecy",
    icon: Sparkles,
    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
  quotation: {
    label: "Quotation",
    icon: Quote,
    color: "text-green-400 bg-green-400/10 border-green-400/20",
  },
  allusion: {
    label: "Allusion",
    icon: Eye,
    color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  },
  contrast: {
    label: "Contrast",
    icon: ArrowLeftRight,
    color: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  },
};

interface RelationshipBadgeProps {
  relationship: string;
}

/** Colored pill badge showing the cross-reference relationship type. */
export function RelationshipBadge({ relationship }: RelationshipBadgeProps) {
  const config = RELATIONSHIP_CONFIG[relationship];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full",
        "text-[10px] font-medium uppercase tracking-wider border",
        config.color,
      )}
    >
      <Icon className="w-2.5 h-2.5" />
      {config.label}
    </span>
  );
}
