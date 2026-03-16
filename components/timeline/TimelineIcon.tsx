"use client";

import {
  Sparkles,
  Apple,
  Waves,
  Building,
  MapPin,
  Mountain,
  Users,
  Crown,
  Flame,
  Zap,
  Scroll,
  Scale,
  Shield,
  Dumbbell,
  Heart,
  Target,
  Landmark,
  Star,
  Droplets,
  Sunrise,
  Ship,
  BookOpen,
  Cross,
  VolumeX,
  Hammer,
  Cat,
  Swords,
  type LucideProps,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Sparkles,
  Apple,
  Waves,
  Building,
  MapPin,
  Mountain,
  Users,
  Crown,
  Flame,
  Zap,
  Scroll,
  Scale,
  Shield,
  Dumbbell,
  Heart,
  Target,
  Landmark,
  Star,
  Droplets,
  Sunrise,
  Ship,
  BookOpen,
  Cross,
  VolumeX,
  Hammer,
  Cat,
  Swords,
};

interface TimelineIconProps extends LucideProps {
  name: string;
}

/**
 * Renders a Lucide icon by string name.
 * Falls back to Sparkles if name not found.
 */
export function TimelineIcon({ name, ...props }: TimelineIconProps) {
  const Icon = iconMap[name] ?? Sparkles;
  return <Icon {...props} />;
}
