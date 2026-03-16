import { cn } from "@/lib/utils";
import { BookOpen, Pickaxe, FileText, Gem } from "lucide-react";

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof BookOpen; className: string }> = {
  manuscript: {
    label: "Manuscript",
    icon: BookOpen,
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  archaeology: {
    label: "Archaeology",
    icon: Pickaxe,
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  inscription: {
    label: "Inscription",
    icon: FileText,
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  artifact: {
    label: "Artifact",
    icon: Gem,
    className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
};

interface CategoryBadgeProps {
  category: string;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, size = "sm" }: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.artifact;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-source-sans font-medium",
        config.className,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export const CATEGORIES = Object.entries(CATEGORY_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));
