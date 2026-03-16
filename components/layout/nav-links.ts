import {
  BookOpen,
  Map,
  Clock,
  Search,
  Users,
  BookA,
  ShieldCheck,
} from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
  icon: typeof BookOpen;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Bible", href: "/bible", icon: BookOpen },
  { label: "Maps", href: "/maps", icon: Map },
  { label: "Timeline", href: "/timeline", icon: Clock },
  { label: "Evidence", href: "/evidence", icon: ShieldCheck },
  { label: "People", href: "/people", icon: Users },
  { label: "Dictionary", href: "/dictionary", icon: BookA },
  { label: "Search", href: "/search", icon: Search },
];
